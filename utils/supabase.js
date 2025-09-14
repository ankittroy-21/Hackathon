const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found. Database features will be disabled.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Automated database setup function
async function initializeDatabase() {
    if (!supabase) {
        console.warn('Supabase not initialized. Skipping database setup.');
        return false;
    }

    try {
        console.log('🔧 Initializing database schema...');

        // Check if chat_history table exists
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'chat_history');

        if (tablesError && !tablesError.message.includes('relation "information_schema.tables" does not exist')) {
            console.error('Error checking tables:', tablesError);
        }

        // Create chat_history table if it doesn't exist
        if (!tables || tables.length === 0) {
            console.log('📊 Creating chat_history table...');
            
            const { error: createError } = await supabase.rpc('create_chat_history_table');
            
            if (createError) {
                // Fallback: try to create table using direct SQL
                console.log('⚡ Using fallback table creation...');
                await createChatHistoryTable();
            }
        }

        // Create or update stored procedures
        await createStoredProcedures();

        console.log('✅ Database initialization completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
}

async function createChatHistoryTable() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS chat_history (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL DEFAULT 'anonymous',
            message TEXT NOT NULL,
            message_type VARCHAR(10) NOT NULL CHECK (message_type IN ('user', 'bot')),
            is_voice_input BOOLEAN DEFAULT FALSE,
            is_voice_output BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            session_id UUID DEFAULT gen_random_uuid(),
            query_category VARCHAR(50) DEFAULT 'health',
            response_confidence DECIMAL(3,2) DEFAULT 0.50
        );

        CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
        CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
        CREATE INDEX IF NOT EXISTS idx_chat_history_category ON chat_history(query_category);
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    if (error) {
        console.error('Error creating table:', error);
        throw error;
    }
}

async function createStoredProcedures() {
    const procedures = [
        {
            name: 'create_chat_history_table',
            sql: `
                CREATE OR REPLACE FUNCTION create_chat_history_table()
                RETURNS void AS $$
                BEGIN
                    CREATE TABLE IF NOT EXISTS chat_history (
                        id SERIAL PRIMARY KEY,
                        user_id VARCHAR(255) NOT NULL DEFAULT 'anonymous',
                        message TEXT NOT NULL,
                        message_type VARCHAR(10) NOT NULL CHECK (message_type IN ('user', 'bot')),
                        is_voice_input BOOLEAN DEFAULT FALSE,
                        is_voice_output BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        session_id UUID DEFAULT gen_random_uuid(),
                        query_category VARCHAR(50) DEFAULT 'health',
                        response_confidence DECIMAL(3,2) DEFAULT 0.50
                    );

                    CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
                    CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
                    CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
                    CREATE INDEX IF NOT EXISTS idx_chat_history_category ON chat_history(query_category);
                END;
                $$ LANGUAGE plpgsql;
            `
        },
        {
            name: 'exec_sql',
            sql: `
                CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
                RETURNS void AS $$
                BEGIN
                    EXECUTE sql;
                END;
                $$ LANGUAGE plpgsql;
            `
        }
    ];

    for (const proc of procedures) {
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: proc.sql });
            if (error) {
                console.warn(`Warning creating procedure ${proc.name}:`, error);
            }
        } catch (err) {
            console.warn(`Could not create procedure ${proc.name}:`, err);
        }
    }
}

// Health-focused chat storage function
async function storeChatMessage(userId, message, messageType, options = {}) {
    if (!supabase) {
        console.warn('Supabase not available. Message not stored.');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('chat_history')
            .insert([
                {
                    user_id: userId,
                    message: message,
                    message_type: messageType,
                    is_voice_input: options.isVoiceInput || false,
                    is_voice_output: options.isVoiceOutput || false,
                    session_id: options.sessionId || null,
                    query_category: options.category || 'health',
                    response_confidence: options.confidence || 0.50,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('Error storing chat message:', error);
            return null;
        }

        return data[0];
    } catch (error) {
        console.error('Database storage error:', error);
        return null;
    }
}

// Get chat history for analytics
async function getChatHistory(userId, limit = 50) {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
}

module.exports = {
    supabase,
    initializeDatabase,
    storeChatMessage,
    getChatHistory
};