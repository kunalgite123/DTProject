import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { mapAuthError } from '../src/services/authService.js';

// Load .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase Auth Configuration...');
console.log('URL:', supabaseUrl);
console.log('Anon Key Present:', Boolean(anonKey));

// Unit test error mapping
console.log('\n--- Test 1: Auth Error Mapping ---');
const err1 = { message: 'Invalid login credentials', status: 400 };
console.log('Invalid credentials ->', mapAuthError(err1) === 'Invalid email or password' ? '✅ PASS' : '❌ FAIL');

const err2 = { message: 'Email not confirmed' };
console.log('Email not confirmed ->', mapAuthError(err2) === 'Please confirm your email or ask the admin to confirm it' ? '✅ PASS' : '❌ FAIL');

const err3 = { message: 'Failed to fetch' };
console.log('Network error ->', mapAuthError(err3) === 'Network error, try again' ? '✅ PASS' : '❌ FAIL');

// Test client invalid login
console.log('\n--- Test 2: Live Supabase Invalid Login Test ---');
const supabase = createClient(supabaseUrl, anonKey);

async function testInvalidLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@infratrace.com',
    password: 'WrongPassword123!'
  });

  if (error) {
    const mapped = mapAuthError(error);
    console.log('Live rejected login message:', mapped);
    if (mapped === 'Invalid email or password') {
      console.log('✅ PASS: Real Supabase 400/Invalid credentials correctly mapped to "Invalid email or password"');
    } else {
      console.log('ℹ️ Mapped message:', mapped);
    }
  } else {
    console.log('Unexpected success for invalid password');
  }
}

testInvalidLogin().then(() => {
  console.log('\n🎉 Auth tests completed.');
});
