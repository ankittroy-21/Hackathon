// Simple test endpoint to diagnose issues
module.exports = async function handler(req, res) {
    try {
        console.log('Test endpoint called');
        
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        res.status(200).json({
            success: true,
            message: "Test endpoint working!",
            method: req.method,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};