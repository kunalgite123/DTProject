import { createClient } from '@supabase/supabase-js';

// Auto-load .env in Node.js if not already populated
if (typeof process !== 'undefined' && process.env && !process.env.VITE_SUPABASE_URL) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile('.env');
    }
  } catch {
    // ignore if running in browser or .env not present
  }
}

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL));

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY));

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[InfraTrace] Missing Supabase environment variables! ' +
    'Please verify that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are properly defined in your .env file.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
