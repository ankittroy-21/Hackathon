// Simplified Health Assistant API - Working Version
module.exports = async function handler(req, res) {
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

        console.log('Processing query:', userMessage);

        // Process the health query
        const response = await processHealthQueryWithAI(userMessage, detectedLanguage);

        if (!response) {
            throw new Error('Failed to process health query');
        }

        res.status(200).json({
            success: true,
            message: response.message || response,
            confidence: response.confidence || 0.75,
            language: response.language || detectedLanguage,
            timestamp: new Date().toISOString(),
            isVoiceOutput: requestVoiceResponse
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'क्षमा करें, कुछ तकनीकी समस्या हुई है। कृपया बाद में कोशिश करें।',
            details: error.message 
        });
    }
};

// Multi-provider AI function with enhanced fallbacks
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
        if (!response && process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_api_key_here_free_tier') {
            console.log('🤗 Using Hugging Face API...');
            try {
                response = await getHuggingFaceResponse(message, language);
                aiProvider = 'huggingface';
            } catch (error) {
                console.log('⚠️ Hugging Face API failed, trying next option...');
                response = null;
            }
        }

        // Priority 3: OpenAI API (Paid - OPTIONAL)
        if (!response && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here_paid_optional') {
            console.log('🧠 Using OpenAI API...');
            try {
                response = await getOpenAIResponse(message, language);
                aiProvider = 'openai';
            } catch (error) {
                console.log('⚠️ OpenAI API failed, using fallback...');
                response = null;
            }
        }

        // Enhanced Fallback: Comprehensive health assistant without external APIs
        if (!response) {
            console.log('🏥 Using enhanced fallback health assistant...');
            response = getEnhancedFallbackResponse(message, language);
            aiProvider = 'enhanced_fallback';
        }

        // Log successful response
        console.log(`✅ Response generated using: ${aiProvider}`);
        
        return {
            message: response,
            confidence: aiProvider === 'fallback' ? 0.6 : 0.8,
            language: language,
            provider: aiProvider
        };

    } catch (error) {
        console.error('❌ Error in processHealthQueryWithAI:', error);
        
        // Emergency fallback
        const emergencyResponse = language === 'english' ? 
            "I apologize, but I'm experiencing technical difficulties. Please try again later or consult a healthcare professional for immediate assistance." :
            "क्षमा करें, मुझे तकनीकी समस्या का सामना कर रहा हूँ। कृपया बाद में कोशिश करें या तत्काल सहायता के लिए किसी डॉक्टर से सलाह लें।";
            
        return {
            message: emergencyResponse,
            confidence: 0.5,
            language: language,
            provider: 'emergency_fallback'
        };
    }
}

// Enhanced fallback responses without external APIs
function getEnhancedFallbackResponse(message, language = 'hinglish') {
    const query = message.toLowerCase();
    
    // Common health queries with comprehensive responses
    const healthResponses = {
        // Diabetes related
        diabetes: {
            english: "Diabetes is a condition where blood sugar levels are too high. Type 1 diabetes occurs when the body doesn't produce insulin, while Type 2 diabetes occurs when the body doesn't use insulin properly. Symptoms include increased thirst, frequent urination, fatigue, and blurred vision. Management includes medication, diet control, regular exercise, and blood sugar monitoring. Please consult a doctor for proper diagnosis and treatment.",
            hindi: "डायबिटीज एक बीमारी है जिसमें खून में शुगर का स्तर बढ़ जाता है। टाइप 1 डायबिटीज में शरीर इंसुलिन नहीं बनाता, टाइप 2 में शरीर इंसुलिन का सही इस्तेमाल नहीं कर पाता। लक्षण: ज्यादा प्यास, बार-बार पेशाब, थकान, धुंधला दिखना। इलाज: दवा, डाइट कंट्रोल, व्यायाम, शुगर चेक करना। डॉक्टर से सलाह जरूर लें।",
            hinglish: "Diabetes ek condition hai jisme blood sugar level high ho jata hai. Type 1 mein body insulin nahi banata, Type 2 mein body insulin ko properly use nahi kar pata. Symptoms: zyada pyaas, bar-bar urination, fatigue, blurred vision. Management: medication, diet control, exercise, regular blood sugar monitoring. Doctor se proper diagnosis aur treatment ke liye consult kariye."
        },
        
        // Blood pressure
        pressure: {
            english: "High blood pressure (hypertension) is when blood flows through arteries with too much force. Normal BP is below 120/80 mmHg. Causes include stress, salt intake, obesity, smoking, lack of exercise. Symptoms may include headaches, shortness of breath, nosebleeds. Prevention: healthy diet, regular exercise, limit salt, manage stress, avoid smoking. Regular checkups are important.",
            hindi: "हाई ब्लड प्रेशर यानी हाइपरटेंशन में खून की नसों में बहुत तेज़ी से खून बहता है। सामान्य BP 120/80 से कम होता है। कारण: तनाव, नमक, मोटापा, धूम्रपान, व्यायाम न करना। लक्षण: सिरदर्द, सांस फूलना, नाक से खून। बचाव: स्वस्थ खुराक, व्यायाम, नमक कम करें, तनाव न लें। नियमित जांच कराएं।",
            hinglish: "High blood pressure ya hypertension mein blood arteries mein zyada force se flow karta hai. Normal BP 120/80 se kam hota hai. Causes: stress, salt, obesity, smoking, exercise na karna. Symptoms: headache, shortness of breath, nosebleeds. Prevention: healthy diet, exercise, salt limit kariye, stress manage kariye."
        },
        
        // Heart disease
        heart: {
            english: "Heart disease includes various conditions affecting the heart like coronary artery disease, heart attacks, heart failure. Risk factors: high cholesterol, high blood pressure, diabetes, smoking, obesity, family history. Symptoms: chest pain, shortness of breath, fatigue, irregular heartbeat. Prevention: healthy diet, exercise, no smoking, limit alcohol, manage stress.",
            hindi: "हृदय रोग में दिल से जुड़ी कई बीमारियां आती हैं जैसे कोरोनरी आर्टरी डिज़ीज़, हार्ट अटैक, हार्ट फेलियर। जोखिम: हाई कोलेस्ट्रॉल, हाई BP, डायबिटीज, धूम्रपान, मोटापा, पारिवारिक इतिहास। लक्षण: छाती में दर्द, सांस फूलना, थकान, दिल की अनियमित धड़कन। बचाव: स्वस्थ भोजन, व्यायाम, धूम्रपान न करें।",
            hinglish: "Heart disease mein dil ke various conditions hain jaise coronary artery disease, heart attack, heart failure. Risk factors: high cholesterol, high BP, diabetes, smoking, obesity, family history. Symptoms: chest pain, breathlessness, fatigue, irregular heartbeat. Prevention: healthy diet, exercise, smoking avoid kariye."
        }
    };
    
    // Check for specific health conditions
    for (const [condition, responses] of Object.entries(healthResponses)) {
        if (query.includes(condition) || query.includes(condition.slice(0, 4))) {
            if (language === 'english') return responses.english;
            if (language === 'hindi') return responses.hindi;
            return responses.hinglish;
        }
    }
    
    // General health advice based on language
    if (language === 'english') {
        return "I understand you have a health question. While I can provide general information, I recommend consulting with a qualified healthcare professional for personalized medical advice. Some general health tips: maintain a balanced diet, exercise regularly, get adequate sleep, manage stress, and have regular health checkups.";
    } else if (language === 'hindi') {
        return "मैं समझता हूँ कि आपका कोई स्वास्थ्य सवाल है। हालांकि मैं सामान्य जानकारी दे सकता हूँ, व्यक्तिगत सलाह के लिए किसी योग्य डॉक्टर से मिलें। कुछ सामान्य स्वास्थ्य सुझाव: संतुलित आहार लें, नियमित व्यायाम करें, पर्याप्त नींद लें, तनाव कम करें, और नियमित जांच कराते रहें।";
    } else {
        return "Main samajh gaya ki aapka health question hai. General information provide kar sakta hun, lekin personalized advice ke liye qualified doctor se miliye. Health tips: balanced diet lein, regular exercise kariye, proper sleep lein, stress manage kariye, aur regular checkups karvate rahiye.";
    }
}

// Gemini API function
async function getGeminiResponse(message, language) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const languageInstruction = language === 'english' ? 
        "Respond in English" : 
        language === 'hindi' ? 
        "Respond in Hindi" : 
        "Respond in Hinglish (Hindi-English mix)";
    
    const prompt = `You are a helpful health assistant for rural Indian communities. ${languageInstruction}. 
    
    Question: ${message}
    
    Provide accurate, helpful health information. If it's a serious condition, advise consulting a doctor.`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });
    
    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Hugging Face API function  
async function getHuggingFaceResponse(message, language) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
        {
            headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
            method: "POST",
            body: JSON.stringify({ inputs: message }),
        }
    );
    
    if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.generated_text || result[0]?.generated_text || "I'm here to help with your health questions.";
}

// OpenAI API function
async function getOpenAIResponse(message, language) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'system',
                content: `You are a helpful health assistant. Respond in ${language}.`
            }, {
                role: 'user',
                content: message
            }],
            max_tokens: 500
        })
    });
    
    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}