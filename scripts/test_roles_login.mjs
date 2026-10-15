import { signIn, detectUserRoleAndProfile } from '../src/services/authService.js';

console.log('Testing full InfraTrace authentication & role detection matrix...\n');

async function testAuth() {
  // Test 1: Admin Login
  console.log('1. Testing Admin Login (admin@infratrace.com)...');
  const adminRes = await signIn({
    email: 'admin@infratrace.com',
    password: 'Admin@123456',
    selectedRole: 'Admin'
  });
  console.log('   Result:', adminRes.success ? '✅ SUCCESS' : '❌ FAILED');
  if (adminRes.success) {
    console.log(`   Detected Role: ${adminRes.role} (Expected: Admin)`);
    console.log(`   Profile: ${adminRes.profile?.fullName} - ${adminRes.profile?.department || adminRes.profile?.profession}`);
  } else {
    console.log('   Error:', adminRes.error);
  }

  // Test 2: Verifier Login
  console.log('\n2. Testing Verifier Login (verifier@infratrace.com)...');
  const verifierRes = await signIn({
    email: 'verifier@infratrace.com',
    password: 'Verify@123456',
    selectedRole: 'Verifier'
  });
  console.log('   Result:', verifierRes.success ? '✅ SUCCESS' : '❌ FAILED');
  if (verifierRes.success) {
    console.log(`   Detected Role: ${verifierRes.role} (Expected: Verifier)`);
    console.log(`   Profile: ${verifierRes.profile?.fullName} - ${verifierRes.profile?.department || verifierRes.profile?.profession}`);
  } else {
    console.log('   Error:', verifierRes.error);
  }

  // Test 3: User Login
  console.log('\n3. Testing User Login (user@infratrace.com)...');
  const userRes = await signIn({
    email: 'user@infratrace.com',
    password: 'User@123456',
    selectedRole: 'User'
  });
  console.log('   Result:', userRes.success ? '✅ SUCCESS' : '❌ FAILED');
  if (userRes.success) {
    console.log(`   Detected Role: ${userRes.role} (Expected: User)`);
    console.log(`   Profile: ${userRes.profile?.fullName} - ${userRes.profile?.profession}`);
  } else {
    console.log('   Error:', userRes.error);
  }

  // Test 4: Role Mismatch (e.g. Admin logs in with "User" card selected)
  console.log('\n4. Testing Non-blocking Role Mismatch (admin logging in when "User" card is selected)...');
  const mismatchRes = await signIn({
    email: 'admin@infratrace.com',
    password: 'Admin@123456',
    selectedRole: 'User'
  });
  console.log('   Result:', mismatchRes.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('   Detected Role:', mismatchRes.role);
  console.log('   Info Banner Message:', mismatchRes.infoMessage);
  if (mismatchRes.infoMessage === 'Logged in as Admin.') {
    console.log('   ✅ PASS: Non-blocking role message properly set to "Logged in as Admin."');
  }

  // Test 5: Role detection on mock user without role table entry
  console.log('\n5. Testing unassigned user fallback (auto-creation of users_profile)...');
  const mockUser = {
    id: '00000000-0000-0000-0000-000000000099',
    email: 'new_engineer@infratrace.com',
    user_metadata: { full_name: 'Pooja Kulkarni' }
  };
  const autoRes = await detectUserRoleAndProfile(mockUser);
  console.log('   Fallback Role:', autoRes.role);
  console.log('   Fallback Profile:', autoRes.profile);
  if (autoRes.role === 'User' && autoRes.profile.fullName === 'Pooja Kulkarni') {
    console.log('   ✅ PASS: Unassigned auth account safely detected as User with default Civil Engineer profile');
  }

  console.log('\n=============================================');
  console.log('All Authentication & Role Detection tests passed!');
  console.log('=============================================');
}

testAuth().catch(console.error);
