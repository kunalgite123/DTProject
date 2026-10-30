import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

export const DEMO_ACCOUNTS = {
  'admin@infratrace.com': {
    password: 'Admin@123456',
    role: 'Admin',
    profile: {
      id: 'demo-admin-id',
      fullName: 'Anil Patel',
      email: 'admin@infratrace.com',
      role: 'Admin',
      department: 'Infrastructure Management'
    }
  },
  'verifier@infratrace.com': {
    password: 'Verify@123456',
    role: 'Verifier',
    profile: {
      id: 'demo-verifier-id',
      fullName: 'Suresh Sharma',
      email: 'verifier@infratrace.com',
      role: 'Verifier',
      department: 'Inspection & Verification'
    }
  },
  'user@infratrace.com': {
    password: 'User@123456',
    role: 'User',
    profile: {
      id: 'demo-user-id',
      fullName: 'Ramesh Deshmukh',
      email: 'user@infratrace.com',
      role: 'User',
      profession: 'Civil Engineer'
    }
  }
};

const LOCAL_USERS_KEY = 'infratrace_registered_users';
const ACTIVE_LOCAL_USER_KEY = 'infratrace_local_user';

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalUser(userRecord) {
  try {
    const users = getLocalUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === userRecord.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = userRecord;
    } else {
      users.push(userRecord);
    }
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('[InfraTrace Auth] Local storage save error:', e);
  }
}

/**
 * Maps raw Supabase authentication errors to user-friendly messages.
 */
export function mapAuthError(error) {
  if (!error) return 'An unknown error occurred';
  console.error('[InfraTrace Auth Error]', error);

  const message = (error.message || '').toLowerCase();
  const status = error.status || error.statusCode;

  if (
    message.includes('rate limit') ||
    message.includes('over_email_send_rate_limit') ||
    status === 429
  ) {
    return 'Too many sign-up emails were sent. Wait about an hour, or ask the admin to create your account.';
  }

  if (
    message.includes('user already registered') ||
    message.includes('already registered') ||
    message.includes('already exists')
  ) {
    return 'This email is already registered. Please log in.';
  }

  if (
    message.includes('least 6') ||
    message.includes('weak password') ||
    message.includes('password should be at least')
  ) {
    return 'Password must be at least 6 characters.';
  }

  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials') ||
    (status === 400 && message.includes('invalid'))
  ) {
    return 'Invalid email or password';
  }

  if (
    message.includes('email not confirmed') ||
    message.includes('not confirmed') ||
    message.includes('unconfirmed')
  ) {
    return 'Please confirm your email or ask the admin to confirm it';
  }

  if (
    message.includes('database error saving new user') ||
    message.includes('database error')
  ) {
    return 'Database trigger error: Please run the updated supabase/auth_trigger.sql in your Supabase SQL Editor.';
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('timeout')
  ) {
    if (!isSupabaseConfigured) {
      return 'Missing Supabase credentials: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting platform settings and redeploy.';
    }
    return 'Unable to connect to Supabase: Please ensure your internet is connected and your Supabase project is active (not paused).';
  }

  return error.message || 'Authentication failed. Please try again.';
}

/**
 * Detects user role by querying admins, verifiers, users_profile in order.
 * If no table row is found, auto-creates a users_profile row and defaults to User.
 */
export async function detectUserRoleAndProfile(user) {
  if (!user || !user.id) {
    return {
      role: 'User',
      profile: {
        fullName: 'Guest User',
        email: '',
        role: 'User',
        profession: 'Civil Engineer'
      }
    };
  }

  const email = (user.email || '').toLowerCase().trim();
  const metaName = user.user_metadata?.full_name || email.split('@')[0] || 'User';

  // 0. Guaranteed mapping for default system accounts
  if (email === 'admin@infratrace.com') {
    return {
      role: 'Admin',
      profile: {
        id: user.id,
        fullName: 'Anil Patel',
        email: email,
        role: 'Admin',
        department: 'Infrastructure Management'
      }
    };
  }
  if (email === 'verifier@infratrace.com') {
    return {
      role: 'Verifier',
      profile: {
        id: user.id,
        fullName: 'Suresh Sharma',
        email: email,
        role: 'Verifier',
        department: 'Inspection & Verification'
      }
    };
  }
  if (email === 'user@infratrace.com') {
    return {
      role: 'User',
      profile: {
        id: user.id,
        fullName: 'Ramesh Deshmukh',
        email: email,
        role: 'User',
        profession: 'Civil Engineer'
      }
    };
  }

  if (!isSupabaseConfigured) {
    return {
      role: 'User',
      profile: {
        id: user.id,
        fullName: metaName,
        email: email,
        role: 'User',
        profession: user.user_metadata?.profession || 'Civil Engineer'
      }
    };
  }

  try {
    // 1. Check admins table
    const { data: adminData, error: adminErr } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (adminData && !adminErr) {
      return {
        role: 'Admin',
        profile: {
          id: user.id,
          fullName: adminData.full_name || metaName,
          email: adminData.email || email,
          role: 'Admin',
          department: adminData.department || 'Infrastructure Management'
        }
      };
    }

    // 2. Check verifiers table
    const { data: verifierData, error: verifierErr } = await supabase
      .from('verifiers')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (verifierData && !verifierErr) {
      return {
        role: 'Verifier',
        profile: {
          id: user.id,
          fullName: verifierData.full_name || metaName,
          email: verifierData.email || email,
          role: 'Verifier',
          department: verifierData.department || 'Inspection & Verification'
        }
      };
    }

    // 3. Check users_profile table
    const { data: userProfileData, error: userProfileErr } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (userProfileData && !userProfileErr) {
      return {
        role: 'User',
        profile: {
          id: user.id,
          fullName: userProfileData.full_name || metaName,
          email: userProfileData.email || email,
          role: 'User',
          profession: userProfileData.profession || 'Civil Engineer'
        }
      };
    }

    // 4. Default to User
    return {
      role: 'User',
      profile: {
        id: user.id,
        fullName: metaName,
        email: email,
        role: 'User',
        profession: user.user_metadata?.profession || 'Civil Engineer'
      }
    };
  } catch (err) {
    console.error('[InfraTrace Auth] Role detection exception:', err);
    return {
      role: 'User',
      profile: {
        id: user.id,
        fullName: metaName,
        email: email,
        role: 'User',
        profession: 'Civil Engineer'
      }
    };
  }
}

/**
 * Sign In with Supabase Auth or Local Demo/Registered Accounts.
 * Guaranteed to never lock users out with cryptic network errors.
 */
export async function signIn({ email, password, selectedRole }) {
  const cleanEmail = (email || '').trim().toLowerCase();

  const makeLocalSuccess = (userObj, role, profile, infoMsg) => {
    try {
      localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(userObj));
      localStorage.setItem('infratrace_role', role);
      localStorage.setItem('infratrace_user_profile', JSON.stringify(profile));
    } catch {}

    return {
      success: true,
      user: userObj,
      session: { access_token: 'local-token-' + Date.now(), user: userObj },
      role,
      profile,
      infoMessage: infoMsg,
      isLocalFallback: true
    };
  };

  // 1. If Supabase is configured, attempt Supabase Auth first
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (!error && data?.user) {
        const { role: detectedRole, profile, isAutoCreated } = await detectUserRoleAndProfile(data.user);

        // Strict role portal check
        if (selectedRole && selectedRole !== detectedRole) {
          try { await supabase.auth.signOut(); } catch {}
          const roleLabels = { Admin: 'Admin Officer', Verifier: 'Verifier Officer', User: 'Civil Engineer (User)' };
          return {
            success: false,
            error: `Access Denied: This account is registered as ${roleLabels[detectedRole] || detectedRole}. Please select the ${roleLabels[detectedRole] || detectedRole} card.`
          };
        }

        try { localStorage.removeItem(ACTIVE_LOCAL_USER_KEY); } catch {}
        return {
          success: true,
          user: data.user,
          session: data.session,
          role: detectedRole,
          profile,
          isAutoCreated
        };
      }
    } catch (sbErr) {
      console.warn('[InfraTrace Auth] Supabase cloud connection failed, checking local credentials:', sbErr);
    }
  }

  // 2. Demo Account Check (Admin, Verifier, User)
  const demoAccount = DEMO_ACCOUNTS[cleanEmail];
  if (demoAccount) {
    if (demoAccount.password === password) {
      if (selectedRole && selectedRole !== demoAccount.role) {
        return {
          success: false,
          error: `Access Denied: ${demoAccount.profile.fullName} is an ${demoAccount.role}. Please click the ${demoAccount.role} card to sign in.`
        };
      }
      const userObj = {
        id: demoAccount.profile.id,
        email: cleanEmail,
        user_metadata: { full_name: demoAccount.profile.fullName }
      };
      return makeLocalSuccess(userObj, demoAccount.role, demoAccount.profile, 'Signed in with demo account');
    } else {
      return { success: false, error: 'Invalid email or password' };
    }
  }

  // 3. Locally Registered User Check
  const localUsers = getLocalUsers();
  const matchedUser = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (matchedUser) {
    if (matchedUser.password === password) {
      if (selectedRole && selectedRole !== 'User') {
        return {
          success: false,
          error: 'Access Denied: Newly created accounts are User accounts. Please select the User card.'
        };
      }
      const userObj = {
        id: matchedUser.id,
        email: cleanEmail,
        user_metadata: {
          full_name: matchedUser.fullName,
          profession: matchedUser.profession
        }
      };
      const userProfile = {
        id: matchedUser.id,
        email: cleanEmail,
        fullName: matchedUser.fullName,
        role: 'User',
        profession: matchedUser.profession
      };
      return makeLocalSuccess(userObj, 'User', userProfile);
    } else {
      return { success: false, error: 'Invalid email or password' };
    }
  }

  return {
    success: false,
    error: 'Invalid email or password. If you do not have an account yet, click "Create New Account".'
  };
}

/**
 * Public Sign Up: Attempts Supabase first; if Supabase is offline/unreachable/rate-limited,
 * automatically registers the user locally so they are never blocked.
 */
export async function signUp({ email, password, fullName, profession = 'Civil Engineer' }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const validProfessions = ['Civil Engineer', 'Site Engineer', 'Contractor', 'Surveyor'];
  const resolvedProfession = validProfessions.includes(profession) ? profession : 'Civil Engineer';

  const registerLocally = () => {
    const localId = 'user-' + Date.now();
    const userRecord = {
      id: localId,
      email: cleanEmail,
      password: password,
      fullName: fullName.trim(),
      profession: resolvedProfession,
      createdAt: new Date().toISOString()
    };
    saveLocalUser(userRecord);

    const userObj = {
      id: localId,
      email: cleanEmail,
      user_metadata: {
        full_name: fullName.trim(),
        profession: resolvedProfession
      }
    };
    const userProfile = {
      id: localId,
      email: cleanEmail,
      fullName: fullName.trim(),
      profession: resolvedProfession,
      role: 'User'
    };

    try {
      localStorage.setItem(ACTIVE_LOCAL_USER_KEY, JSON.stringify(userObj));
      localStorage.setItem('infratrace_role', 'User');
      localStorage.setItem('infratrace_user_profile', JSON.stringify(userProfile));
    } catch {}

    return {
      success: true,
      session: { access_token: 'local-token-' + Date.now(), user: userObj },
      user: userObj,
      role: 'User',
      profile: userProfile,
      isLocalFallback: true
    };
  };

  // 1. If Supabase is configured, try Supabase Auth first
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            profession: resolvedProfession
          }
        }
      });

      if (!error && data?.user) {
        if (data.session) {
          try {
            await supabase.from('users_profile').upsert({
              id: data.user.id,
              email: cleanEmail,
              full_name: fullName.trim(),
              profession: resolvedProfession
            });
          } catch {}

          try { localStorage.removeItem(ACTIVE_LOCAL_USER_KEY); } catch {}

          return {
            success: true,
            session: data.session,
            user: data.user,
            role: 'User',
            profile: {
              id: data.user.id,
              email: cleanEmail,
              fullName: fullName.trim(),
              profession: resolvedProfession,
              role: 'User'
            }
          };
        }

        // Email confirmation required in Supabase project
        return {
          success: true,
          needsConfirmation: true,
          message: 'Account created! Please check your email to confirm, then log in.'
        };
      }

      // Check if user is already registered in Supabase
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists')) {
        return {
          success: false,
          error: 'This email is already registered. Please sign in.'
        };
      }

      console.warn('[InfraTrace Auth] Supabase cloud sign-up failed (' + (error?.message || '') + '), using local registration fallback.');
      return registerLocally();
    } catch (err) {
      console.warn('[InfraTrace Auth] Supabase network exception during sign-up, activating local registration:', err);
      return registerLocally();
    }
  }

  // 2. Local registration fallback
  return registerLocally();
}

/**
 * Sign Out from Supabase Auth & Local Session
 */
export async function signOut() {
  try {
    localStorage.removeItem(ACTIVE_LOCAL_USER_KEY);
    localStorage.removeItem('infratrace_role');
    localStorage.removeItem('infratrace_user_profile');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.warn('[InfraTrace Auth] Sign out warning:', err);
  }
}

/**
 * Restore active session and detect user profile
 */
export async function getSessionAndProfile() {
  // Check active local user first
  try {
    const savedLocalUser = localStorage.getItem(ACTIVE_LOCAL_USER_KEY);
    if (savedLocalUser) {
      const user = JSON.parse(savedLocalUser);
      const savedProfile = localStorage.getItem('infratrace_user_profile');
      const profile = savedProfile ? JSON.parse(savedProfile) : {
        id: user.id,
        fullName: user.user_metadata?.full_name || 'User',
        email: user.email,
        role: localStorage.getItem('infratrace_role') || 'User',
        profession: user.user_metadata?.profession || 'Civil Engineer'
      };
      const role = localStorage.getItem('infratrace_role') || profile.role || 'User';
      return {
        session: { access_token: 'local-token', user },
        user,
        role,
        profile
      };
    }
  } catch {}

  // Check Supabase session if configured
  if (isSupabaseConfigured) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        const { role, profile } = await detectUserRoleAndProfile(session.user);
        return { session, user: session.user, role, profile };
      }
    } catch (err) {
      console.warn('[InfraTrace Auth] Session restore exception:', err);
    }
  }

  return { session: null, user: null, role: null, profile: null };
}
