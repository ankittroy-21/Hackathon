import { supabase, initializeDatabase, storeChatMessage } from '../utils/supabase.js';

// Initialize database on first deployment
let dbInitialized = false;

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // Initialize database if not done yet
    if (!dbInitialized && supabase) {
        console.log('🔧 Initializing database on first request...');
        dbInitialized = await initializeDatabase();
    }

    try {
        const { 
            query, 
            message,
            isVoiceInput = false, 
            requestVoiceResponse = false, 
            detectedLanguage = 'hinglish',
            browserLanguage = 'hi-IN',
            userId = 'anonymous' 
        } = req.body;

        const userMessage = query || message;

        if (!userMessage || userMessage.trim().length === 0) {
            res.status(400).json({ error: 'Query is required' });
            return;
        }

        // Generate session ID for tracking
        const sessionId = req.headers['x-session-id'] || 'session-' + Date.now();

        // Store user query in database with language context
        await storeChatMessage(userId, userMessage, 'user', {
            isVoiceInput,
            sessionId,
            category: 'health',
            detectedLanguage,
            browserLanguage
        });

        // Process the health query with multiple AI providers (Gemini prioritized)
        const response = await processHealthQueryWithAI(userMessage, detectedLanguage);

        if (!response) {
            throw new Error('Failed to process health query');
        }

        // Store bot response in database with language context
        await storeChatMessage(userId, response.message || response, 'bot', {
            isVoiceOutput: requestVoiceResponse,
            sessionId,
            category: 'health',
            confidence: response.confidence || 0.75,
            language: response.language || detectedLanguage
        });

        res.status(200).json({
            message: response.message || response,
            voiceResponse: requestVoiceResponse,
            timestamp: new Date().toISOString(),
            sessionId: sessionId,
            category: 'health',
            language: response.language || detectedLanguage,
            confidence: response.confidence || 0.75
        });

    } catch (error) {
        console.error('API Error:', error);
        
        // Enhanced error messages based on language preference
        const errorMessages = {
            'hindi': 'माफ़ कीजिए, एक तकनीकी समस्या हुई है। कृपया बाद में कोशिश करें।',
            'english': 'Sorry, a technical issue occurred. Please try again later.',
            'hinglish': 'माफ़ कीजिए, technical problem हुई है। Please बाद में try करें।'
        };
        
        res.status(500).json({
            error: 'Internal server error',
            message: errorMessages[req.body.detectedLanguage] || errorMessages['hinglish']
        });
    }
}

// Multi-provider AI function with Gemini prioritized first
async function processHealthQueryWithAI(message, language = 'hinglish') {
    try {
        let response;
        let aiProvider = 'fallback';

        // Priority 1: Gemini API (Free tier available - RECOMMENDED)
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here_free_tier_available') {
            console.log('🔮 Using Gemini API...');
            try {
                response = await getGeminiResponse(message, language);
                aiProvider = 'gemini';
            } catch (error) {
                console.log('⚠️ Gemini API failed, trying next option...');
                response = null;
            }
        }
        
        // Priority 2: Hugging Face API (Free tier - BACKUP)
        if (!response && process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_token_here_free_tier_available') {
            console.log('� Using Hugging Face API...');
            try {
                response = await getHuggingFaceResponse(message, language);
                aiProvider = 'huggingface';
            } catch (error) {
                console.log('⚠️ Hugging Face API failed, trying next option...');
                response = null;
            }
        }
        
        // Priority 3: OpenAI API (OPTIONAL - Requires billing)
        if (!response && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your_openai_api_key_here_requires_5_dollar_billing') {
            console.log('� Using OpenAI API...');
            try {
                response = await getOpenAIResponse(message, language);
                aiProvider = 'openai';
            } catch (error) {
                console.log('⚠️ OpenAI API failed, using fallback...');
                response = null;
            }
        }
        
        // Fallback: Enhanced local responses (ALWAYS WORKS)
        if (!response) {
            console.log('💬 Using enhanced fallback responses...');
            response = getEnhancedFallbackResponse(message, language);
            aiProvider = 'enhanced_fallback';
        }

        return {
            message: response,
            confidence: aiProvider === 'fallback' ? 0.7 : 0.85,
            language: language,
            category: 'health',
            provider: aiProvider
        };

    } catch (error) {
        console.error('AI Processing Error:', error);
        return {
            message: getEnhancedFallbackResponse(message, language),
            confidence: 0.7,
            language: language,
            category: 'health',
            provider: 'emergency_fallback'
        };
    }
}

// Gemini API function (Google - Free tier available)
async function getGeminiResponse(message, language) {
    try {
        const prompt = createHealthPrompt(message, language);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 300,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_MEDICAL",
                        threshold: "BLOCK_ONLY_HIGH"
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
        
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

// OpenAI API function (Requires billing - $5 minimum)
async function getOpenAIResponse(message, language) {
    try {
        const prompt = createHealthPrompt(message, language);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 300,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
    }
}

// Hugging Face API function (Free tier available)
async function getHuggingFaceResponse(message, language) {
    try {
        const prompt = createHealthPrompt(message, language);
        
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: { max_length: 200, temperature: 0.7 }
            })
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const data = await response.json();
        return data[0].generated_text;
        
    } catch (error) {
        console.error('Hugging Face API Error:', error);
        throw error;
    }
}

// Enhanced fallback responses for demo/offline mode
function getEnhancedFallbackResponse(message, language) {
    const msg = message.toLowerCase();
    
    // Comprehensive health responses database
    const healthResponses = {
        hindi: {
            // Common symptoms
            fever: "बुखार के लिए: 1) पर्याप्त आराम करें 2) खूब पानी पिएं 3) हल्का भोजन लें। 102°F से ज्यादा बुखार हो या 3 दिन से ज्यादा रहे तो तुरंत डॉक्टर से मिलें।",
            headache: "सिरदर्द के लिए: 1) पर्याप्त पानी पिएं 2) आंखों को आराम दें 3) माथे पर ठंडी पट्टी रखें। लगातार या तेज दर्द हो तो डॉक्टर की सलाह लें।",
            cough: "खांसी के लिए: 1) गर्म पानी में नमक डालकर गरारे करें 2) शहद और अदरक का सेवन करें 3) धूम्रपान से बचें। 2 सप्ताह से ज्यादा खांसी हो तो डॉक्टर को दिखाएं।",
            stomach: "पेट दर्द के लिए: 1) हल्का भोजन करें 2) तली हुई चीजों से बचें 3) पर्याप्त पानी पिएं। तेज दर्द या उल्टी हो तो तुरंत डॉक्टर के पास जाएं।",
            diabetes: "मधुमेह के लिए: 1) नियमित व्यायाम करें 2) मीठा कम करें 3) समय पर दवा लें 4) नियमित जांच कराएं। डॉक्टर की सलाह जरूरी है।",
            blood_pressure: "उच्च रक्तचाप के लिए: 1) नमक कम करें 2) नियमित टहलें 3) तनाव कम करें 4) धूम्रपान छोड़ें। डॉक्टर से नियमित जांच कराएं।",
            cold: "सर्दी-जुकाम के लिए: 1) गर्म पानी पिएं 2) भाप लें 3) आराम करें 4) विटामिन C लें। लक्षण बढ़ने पर डॉक्टर से मिलें।",
            general: "स्वास्थ्य के लिए सामान्य सलाह: 1) संतुलित आहार लें 2) नियमित व्यायाम करें 3) पर्याप्त नींद लें 4) तनाव कम करें। किसी भी गंभीर समस्या के लिए डॉक्टर से सलाह लें।"
        },
        english: {
            fever: "For fever: 1) Get adequate rest 2) Drink plenty of water 3) Eat light food. If fever exceeds 102°F or persists for more than 3 days, consult a doctor immediately.",
            headache: "For headaches: 1) Drink sufficient water 2) Rest your eyes 3) Apply cold compress on forehead. For persistent or severe pain, consult a doctor.",
            cough: "For cough: 1) Gargle with warm salt water 2) Take honey and ginger 3) Avoid smoking. If cough persists for more than 2 weeks, see a doctor.",
            stomach: "For stomach pain: 1) Eat light food 2) Avoid fried items 3) Drink sufficient water. For severe pain or vomiting, see a doctor immediately.",
            diabetes: "For diabetes: 1) Exercise regularly 2) Reduce sugar intake 3) Take medicines on time 4) Get regular checkups. Doctor's advice is essential.",
            blood_pressure: "For high blood pressure: 1) Reduce salt 2) Walk regularly 3) Manage stress 4) Quit smoking. Regular checkups with doctor are important.",
            cold: "For cold/flu: 1) Drink warm water 2) Take steam 3) Get rest 4) Take Vitamin C. If symptoms worsen, consult a doctor.",
            general: "General health advice: 1) Eat balanced diet 2) Exercise regularly 3) Get adequate sleep 4) Manage stress. For any serious issues, consult a doctor."
        },
        hinglish: {
            fever: "Fever के लिए: 1) Proper rest करें 2) पानी ज्यादा drink करें 3) Light food लें। 102°F से ज्यादा या 3 दिन से ज्यादा fever हो तो doctor को immediately दिखाएं।",
            headache: "Headache के लिए: 1) पानी ज्यादा पिएं 2) Eyes को rest दें 3) Forehead पर cold compress रखें। Continuous या severe pain हो तो doctor से मिलें।",
            cough: "Cough के लिए: 1) Warm salt water से gargle करें 2) Honey और ginger लें 3) Smoking avoid करें। 2 weeks से ज्यादा cough हो तो doctor को दिखाएं।",
            stomach: "Stomach pain के लिए: 1) Light food खाएं 2) Fried items avoid करें 3) पानी ज्यादा पिएं। Severe pain या vomiting हो तो doctor को immediately दिखाएं।",
            diabetes: "Diabetes के लिए: 1) Regular exercise करें 2) Sugar कम करें 3) Medicine time पर लें 4) Regular checkup कराएं। Doctor की advice जरूरी है।",
            blood_pressure: "High BP के लिए: 1) Salt कम करें 2) Daily walk करें 3) Stress manage करें 4) Smoking quit करें। Doctor से regular checkup कराएं।",
            cold: "Cold/flu के लिए: 1) Warm पानी पिएं 2) Steam लें 3) Rest करें 4) Vitamin C लें। Symptoms बढ़ें तो doctor को दिखाएं।",
            general: "Health के लिए general advice: 1) Balanced diet लें 2) Regular exercise करें 3) Proper sleep लें 4) Stress कम करें। कोई serious problem हो तो doctor से advice लें।"
        }
    };

    const langResponses = healthResponses[language] || healthResponses.hinglish;
    
    // Enhanced keyword matching for better responses
    if (msg.includes('fever') || msg.includes('बुखार') || msg.includes('तापमान')) 
        return langResponses.fever;
    if (msg.includes('headache') || msg.includes('सिरदर्द') || msg.includes('सिर में दर्द')) 
        return langResponses.headache;
    if (msg.includes('cough') || msg.includes('खांसी') || msg.includes('खाँसी')) 
        return langResponses.cough;
    if (msg.includes('stomach') || msg.includes('पेट') || msg.includes('pet dard')) 
        return langResponses.stomach;
    if (msg.includes('diabetes') || msg.includes('मधुमेह') || msg.includes('sugar') || msg.includes('शुगर')) 
        return langResponses.diabetes;
    if (msg.includes('blood pressure') || msg.includes('bp') || msg.includes('रक्तचाप') || msg.includes('हाई बीपी')) 
        return langResponses.blood_pressure;
    if (msg.includes('cold') || msg.includes('flu') || msg.includes('सर्दी') || msg.includes('जुकाम')) 
        return langResponses.cold;
    
    return langResponses.general;
}

// Keep the old function name for backward compatibility
function getFallbackResponse(message, language) {
    return getEnhancedFallbackResponse(message, language);
}

// Create health-focused prompts based on language
function createHealthPrompt(message, language) {
    const prompts = {
        hindi: `आप एक भारतीय स्वास्थ्य सहायक हैं। केवल स्वास्थ्य संबंधी प्रश्नों का उत्तर दें। यदि प्रश्न स्वास्थ्य से संबंधित नहीं है, तो विनम्रता से स्वास्थ्य प्रश्न पूछने के लिए कहें। हमेशा डॉक्टर से सलाह लेने की सिफारिश करें। प्रश्न: ${message}`,
        english: `You are an Indian health assistant. Only answer health-related questions. If the question is not health-related, politely ask for a health question. Always recommend consulting a doctor. Question: ${message}`,
        hinglish: `आप एक Indian health assistant हैं। Sirf health related questions का answer दें। अगर question health से related नहीं है, तो politely health question पूछने के लिए कहें। हमेशा doctor से consult करने की recommend करें। Question: ${message}`
    };
    
    return prompts[language] || prompts.hinglish;
}