// Enhanced health query processor with language detection for rural areas
export async function processHealthQuery(query, isVoiceInput = false, detectedLanguage = 'hinglish') {
    try {
        // First, validate if query is health/education related
        const queryValidation = validateHealthQuery(query);
        
        if (!queryValidation.isValid) {
            return {
                message: getLocalizedRedirectMessage(detectedLanguage),
                confidence: 0.95,
                category: 'redirect'
            };
        }

        // Enhanced call to Python health processor with language context
        const response = await fetch(`${process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'}/process-health-query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.HEALTH_API_KEY || ''}`
            },
            body: JSON.stringify({
                query: query,
                detected_language: detectedLanguage,
                is_voice_input: isVoiceInput,
                country: 'india',
                target_audience: 'rural',
                response_language: detectedLanguage
            })
        });

        if (!response.ok) {
            throw new Error(`Python backend error: ${response.status}`);
        }

        const data = await response.json();
        return {
            message: data.response || data.message,
            confidence: data.confidence || 0.75,
            category: 'health',
            language: detectedLanguage
        };

    } catch (error) {
        console.error('Health processor error:', error);
        
        // Enhanced fallback response system for rural areas
        return generateRuralFallbackResponse(query, detectedLanguage);
    }
}

function validateHealthQuery(query) {
    const queryLower = query.toLowerCase();
    
    // Health-related keywords in Hindi and English
    const healthKeywords = [
        // Hindi health terms
        'स्वास्थ्य', 'बीमारी', 'दवा', 'डॉक्टर', 'इलाज', 'बुखार', 'दर्द', 'सिरदर्द', 
        'पेट', 'खांसी', 'जुकाम', 'मधुमेह', 'रक्तचाप', 'हृदय', 'दिल', 'सांस', 'गर्भावस्था',
        'बच्चे', 'टीका', 'वैक्सीन', 'पोषण', 'भोजन', 'विटामिन', 'कैल्शियम', 'आयरन',
        
        // English health terms
        'health', 'disease', 'medicine', 'doctor', 'treatment', 'fever', 'pain', 'headache',
        'stomach', 'cough', 'cold', 'diabetes', 'pressure', 'heart', 'breathing', 'pregnancy',
        'child', 'vaccine', 'nutrition', 'food', 'vitamin', 'calcium', 'iron',
        
        // Education terms
        'शिक्षा', 'पढ़ाई', 'स्कूल', 'कॉलेज', 'विश्वविद्यालय', 'परीक्षा', 'किताब',
        'education', 'study', 'school', 'college', 'university', 'exam', 'book'
    ];
    
    // Non-health topics to redirect
    const nonHealthKeywords = [
        'movie', 'film', 'सिनेमा', 'फिल्म', 'गाना', 'song', 'music', 'संगीत',
        'cricket', 'football', 'sports', 'खेल', 'politics', 'राजनीति', 'election',
        'weather', 'मौसम', 'joke', 'comedy', 'मजाक', 'entertainment', 'मनोरंजन'
    ];
    
    // Check for non-health topics first
    const hasNonHealthKeywords = nonHealthKeywords.some(keyword => 
        queryLower.includes(keyword)
    );
    
    if (hasNonHealthKeywords) {
        return {
            isValid: false,
            redirectMessage: "मैं एक स्वास्थ्य सहायक हूं और केवल स्वास्थ्य और शिक्षा संबंधी प्रश्नों का उत्तर देता हूं। 🏥\n\nकृपया अपनी स्वास्थ्य समस्या, बीमारी, दवाई, या शिक्षा के बारे में पूछें। मैं ग्रामीण क्षेत्रों के लोगों की मदद के लिए बनाया गया हूं।\n\n📝 आप पूछ सकते हैं:\n• बुखार, सर्दी-जुकाम का इलाज\n• मधुमेह, रक्तचाप की जानकारी\n• गर्भावस्था की देखभाल\n• बच्चों के टीकाकरण\n• पोषण और स्वस्थ भोजन\n• शिक्षा संबंधी सलाह"
        };
    }
    
    // Check for health keywords
    const hasHealthKeywords = healthKeywords.some(keyword => 
        queryLower.includes(keyword)
    );
    
    // If query seems to be a greeting or general question, guide towards health
    const greetings = ['hello', 'hi', 'नमस्ते', 'हैलो', 'कैसे हैं', 'how are you'];
    const isGreeting = greetings.some(greeting => queryLower.includes(greeting));
    
    if (isGreeting) {
        return {
            isValid: true // Allow greetings
        };
    }
    
    if (!hasHealthKeywords && queryLower.length > 10) {
        return {
            isValid: false,
            redirectMessage: "कृपया स्वास्थ्य या शिक्षा से संबंधित प्रश्न पूछें। 🏥📚\n\nमैं ग्रामीण क्षेत्रों के लोगों के लिए स्वास्थ्य सहायक हूं। आप मुझसे बीमारियों, इलाज, दवाइयों, पोषण, या शिक्षा के बारे में पूछ सकते हैं।"
        };
    }
    
    return { isValid: true };
}

function generateRuralFallbackResponse(query) {
    const queryLower = query.toLowerCase();
    
    // Rural-focused health responses in simple Hindi
    const ruralHealthResponses = {
        'बुखार': 'बुखार में:\n• पर्याप्त आराम करें\n• तरल पदार्थ पिएं (पानी, दाल का पानी)\n• गीली पट्टी माथे पर रखें\n• 3 दिन से ज्यादा बुखार हो तो डॉक्टर को दिखाएं\n• तुलसी और अदरक का काढ़ा पिएं',
        
        'दस्त': 'दस्त का इलाज:\n• ORS का घोल पिएं (चीनी-नमक का पानी)\n• केला, दही, चावल खाएं\n• तली-भुनी चीजें न खाएं\n• साफ पानी पिएं\n• ज्यादा दस्त हो तो डॉक्टर से मिलें',
        
        'खांसी': 'खांसी के लिए:\n• शहद और अदरक का मिश्रण लें\n• गर्म पानी से गरारे करें\n• तुलसी की चाय पिएं\n• धूम्रपान से बचें\n• 2 सप्ताह से ज्यादा खांसी हो तो डॉक्टर को दिखाएं',
        
        'मधुमेह': 'मधुमेह (शुगर) में:\n• समय पर खाना खाएं\n• मिठाई कम खाएं\n• रोज टहलें\n• करेला, मेथी का सेवन करें\n• नियमित जांच कराएं\n• डॉक्टर की दवा समय पर लें',
        
        'गर्भावस्था': 'गर्भावस्था में:\n• पौष्टिक भोजन लें (दाल, सब्जी, फल)\n• आयरन की गोली लें\n• नियमित जांच कराएं\n• भारी काम न करें\n• तंबाकू-शराब से बचें\n• ANM या डॉक्टर से सलाह लें',
        
        'टीका': 'बच्चों के टीके:\n• जन्म के समय: BCG, OPV\n• 6 सप्ताह: DPT, OPV, Hepatitis B\n• सभी टीके समय पर लगवाएं\n• टीकाकरण कार्ड संभाल कर रखें\n• ANM से संपर्क करें'
    };
    
    // Check for specific conditions
    for (const [condition, response] of Object.entries(ruralHealthResponses)) {
        if (queryLower.includes(condition)) {
            return {
                message: response + "\n\n⚠️ गंभीर समस्या में तुरंत डॉक्टर या स्वास्थ्य केंद्र जाएं।",
                confidence: 0.70,
                category: 'health',
                language: language
            };
        }
    }
    
    // Return default message in detected language
    const defaultMessages = {
        'hindi': "ग्रामीण स्वास्थ्य सहायक 🏥\n\nमैं आपकी स्वास्थ्य संबंधी समस्याओं में मदद कर सकता हूं। कृपया बताएं:\n\n• आपको कौन सी समस्या है?\n• कितने दिन से है?\n• क्या लक्षण हैं?\n\n📞 आपातकाल में: 108 डायल करें\n🏥 नजदीकी स्वास्थ्य केंद्र या ANM से संपर्क करें\n\n⚠️ यह सलाह डॉक्टर की जगह नहीं है।",
        'english': "Rural Health Assistant 🏥\n\nI can help with your health concerns. Please tell me:\n\n• What problem do you have?\n• Since how many days?\n• What are the symptoms?\n\n📞 Emergency: Dial 108\n🏥 Contact nearest health center or ANM\n\n⚠️ This advice doesn't replace a doctor.",
        'hinglish': "ग्रामीण स्वास्थ्य सहायक 🏥 / Rural Health Assistant\n\nमैं आपकी health problems में help कर सकता हूं। Please बताएं:\n\n• आपको कौन सी problem है?\n• कितने days से है?\n• क्या symptoms हैं?\n\n📞 Emergency में: 108 dial करें\n🏥 Nearest health center या ANM से contact करें\n\n⚠️ यह advice doctor की जगह नहीं है।"
    };
    
    return {
        message: defaultMessages[language] || defaultMessages['hinglish'],
        confidence: 0.60,
        category: 'health',
        language: language
    };
}

// Enhanced language-aware redirect messages
function getLocalizedRedirectMessage(language = 'hinglish') {
    const redirectMessages = {
        'hindi': "माफ़ कीजिए, मैं केवल स्वास्थ्य संबंधी प्रश्नों का उत्तर दे सकता हूँ। 🏥\n\nकृपया कोई स्वास्थ्य संबंधी समस्या या बीमारी के बारे में पूछें।",
        'english': "Sorry, I can only answer health-related questions. 🏥\n\nPlease ask about any health problem or medical condition.",
        'hinglish': "माफ़ कीजिए, मैं केवल health related questions का answer दे सकता हूँ। 🏥\n\nPlease कोई health problem या medical condition के बारे में पूछें।"
    };
    
    return redirectMessages[language] || redirectMessages['hinglish'];
}