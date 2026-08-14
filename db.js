require('dotenv').config();
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'public-anon-key';

const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

module.exports = { createClient: () => supabase };
