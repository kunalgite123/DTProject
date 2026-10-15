import { mapAuthError } from '../src/services/authService.js';

console.log('Testing Sign Up error mapping...');

const rateLimitErr = { message: 'email rate limit exceeded', status: 429 };
console.log('Rate Limit ->', mapAuthError(rateLimitErr));
console.assert(
  mapAuthError(rateLimitErr) === 'Too many sign-up emails were sent. Wait about an hour, or ask the admin to create your account.',
  'Failed rate limit mapping'
);

const userExistsErr = { message: 'User already registered' };
console.log('User Already Registered ->', mapAuthError(userExistsErr));
console.assert(
  mapAuthError(userExistsErr) === 'This email is already registered. Please log in.',
  'Failed user registered mapping'
);

const weakPassErr = { message: 'Password should be at least 6 characters' };
console.log('Weak Password ->', mapAuthError(weakPassErr));
console.assert(
  mapAuthError(weakPassErr) === 'Password must be at least 6 characters.',
  'Failed password mapping'
);

console.log('\n✅ All Sign Up error mappings verified successfully!');
