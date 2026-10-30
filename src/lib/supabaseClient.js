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

// Retrieve raw environment variables
let rawUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
  '';

let rawKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY)) ||
  '';

// Sanitize URL and key: strip quotes, whitespace, trailing slash
const cleanUrl = String(rawUrl)
  .trim()
  .replace(/^["']|["']$/g, '')
  .trim()
  .replace(/\/+$/, '');

const cleanKey = String(rawKey)
  .trim()
  .replace(/^["']|["']$/g, '')
  .trim();

// Ensure https protocol if user omitted it
let formattedUrl = cleanUrl;
if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.includes('placeholder')) {
  formattedUrl = `https://${formattedUrl}`;
}

export const isSupabaseConfigured = Boolean(
  formattedUrl &&
  cleanKey &&
  !formattedUrl.includes('placeholder.supabase.co') &&
  !formattedUrl.includes('your-project-ref') &&
  cleanKey !== 'placeholder'
);

if (!isSupabaseConfigured) {
  console.info(
    '[InfraTrace] Supabase is running in local/demo fallback mode. ' +
    'To connect a live cloud database, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(
  formattedUrl || 'https://placeholder.supabase.co',
  cleanKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
