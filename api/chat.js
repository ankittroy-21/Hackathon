import { supabase, initializeDatabase, storeChatMessage } from '../utils/supabase.js';
import { processHealthQuery } from '../utils/health-processor.js';

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
            isVoiceInput = false, 
            requestVoiceResponse = false, 
            detectedLanguage = 'hinglish',
            browserLanguage = 'hi-IN',
            userId = 'anonymous' 
        } = req.body;

        if (!query || query.trim().length === 0) {
            res.status(400).json({ error: 'Query is required' });
            return;
        }

        // Generate session ID for tracking
        const sessionId = req.headers['x-session-id'] || 'session-' + Date.now();

        // Store user query in database with language context
        await storeChatMessage(userId, query, 'user', {
            isVoiceInput,
            sessionId,
            category: 'health',
            detectedLanguage,
            browserLanguage
        });

        // Process the health query with enhanced language support
        const response = await processHealthQuery(query, isVoiceInput, detectedLanguage);

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
            message: errorMessages[detectedLanguage] || errorMessages['hinglish']
        });
    }
}