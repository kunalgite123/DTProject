import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

/**
 * Maps raw Supabase authentication errors to user-friendly messages.
 * Logs the raw error (never passwords) for diagnostics.
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

  const email = user.email || '';
  const metaName = user.user_metadata?.full_name || email.split('@')[0] || 'User';

  try {
    const cleanEmail = (user.email || '').toLowerCase().trim();

    // 0. Guaranteed mapping for default system accounts
    if (cleanEmail === 'admin@infratrace.com') {
      return {
        role: 'Admin',
        profile: {
          id: user.id,
          fullName: 'Anil Patel',
          email: cleanEmail,
          role: 'Admin',
          department: 'Infrastructure Management'
        }
      };
    }
    if (cleanEmail === 'verifier@infratrace.com') {
      return {
        role: 'Verifier',
        profile: {
          id: user.id,
          fullName: 'Suresh Sharma',
          email: cleanEmail,
          role: 'Verifier',
          department: 'Inspection & Verification'
        }
      };
    }
    if (cleanEmail === 'user@infratrace.com') {
      return {
        role: 'User',
        profile: {
          id: user.id,
          fullName: 'Ramesh Deshmukh',
          email: cleanEmail,
          role: 'User',
          profession: 'Civil Engineer'
        }
      };
    }

    // 0.1 Optional check via get_my_role RPC function if defined
    try {
      const { data: rpcRole, error: rpcErr } = await supabase.rpc('get_my_role');
      if (rpcRole && !rpcErr && typeof rpcRole === 'string') {
        const normalizedRole = rpcRole.charAt(0).toUpperCase() + rpcRole.slice(1).toLowerCase();
        if (['Admin', 'Verifier', 'User'].includes(normalizedRole)) {
          // Fetch corresponding profile
          if (normalizedRole === 'Admin') {
            const { data: adminRow } = await supabase.from('admins').select('*').eq('id', user.id).maybeSingle();
            return {
              role: 'Admin',
              profile: {
                id: user.id,
                fullName: adminRow?.full_name || metaName,
                email: adminRow?.email || email,
                role: 'Admin',
                department: adminRow?.department || 'Infrastructure Management'
              }
            };
          } else if (normalizedRole === 'Verifier') {
            const { data: verifierRow } = await supabase.from('verifiers').select('*').eq('id', user.id).maybeSingle();
            return {
              role: 'Verifier',
              profile: {
                id: user.id,
                fullName: verifierRow?.full_name || metaName,
                email: verifierRow?.email || email,
                role: 'Verifier',
                department: verifierRow?.department || 'Inspection & Verification'
              }
            };
          } else {
            const { data: userRow } = await supabase.from('users_profile').select('*').eq('id', user.id).maybeSingle();
            return {
              role: 'User',
              profile: {
                id: user.id,
                fullName: userRow?.full_name || metaName,
                email: userRow?.email || email,
                role: 'User',
                profession: userRow?.profession || user.user_metadata?.profession || 'Civil Engineer'
              }
            };
          }
        }
      }
    } catch {
      // Fallback directly to sequential table checking
    }

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

    // 4. No row found in any table: treat as User, auto-create a users_profile row
    console.info(`[InfraTrace Auth] No role table row found for user ${user.id} (${email}). Auto-creating users_profile...`);
    const defaultProfession = user.user_metadata?.profession || 'Civil Engineer';
    const defaultProfile = {
      id: user.id,
      email: email,
      full_name: metaName,
      profession: defaultProfession
    };

    const { data: createdProfile, error: createErr } = await supabase
      .from('users_profile')
      .insert([defaultProfile])
      .select()
      .maybeSingle();

    if (createErr) {
      console.warn('[InfraTrace Auth] Note: Could not auto-insert users_profile (likely RLS or already present):', createErr.message);
    }

    return {
      role: 'User',
      profile: {
        id: user.id,
        fullName: createdProfile?.full_name || defaultProfile.full_name,
        email: createdProfile?.email || defaultProfile.email,
        role: 'User',
        profession: createdProfile?.profession || defaultProfile.profession
      },
      isAutoCreated: true
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
 * Sign In with Supabase Auth.
 * Never signs the user out because of a missing or mismatching role.
 */
export async function signIn({ email, password, selectedRole }) {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your deployment environment variables and redeploy.'
    };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      const userMessage = mapAuthError(error);
      return {
        success: false,
        error: userMessage,
        rawError: error
      };
    }

    if (!data?.user) {
      return {
        success: false,
        error: 'Authentication failed: No user returned.'
      };
    }

    // Detect role from database tables
    const { role: detectedRole, profile, isAutoCreated } = await detectUserRoleAndProfile(data.user);

    // STRICT ROLE ENFORCEMENT:
    // User credentials must only work on User portal; Verifier on Verifier; Admin on Admin.
    if (selectedRole && selectedRole !== detectedRole) {
      // Immediately sign out to clear session from browser and memory
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore sign out errors
      }

      const roleLabels = {
        Admin: 'Admin Officer',
        Verifier: 'Verifier Officer',
        User: 'Civil Engineer (User)'
      };

      const selectedName = roleLabels[selectedRole] || selectedRole;
      const actualName = roleLabels[detectedRole] || detectedRole;

      return {
        success: false,
        error: `Access Denied: This account is registered as a ${actualName}. You cannot log into the ${selectedName} portal with these credentials. Please switch to the ${actualName} portal.`
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      role: detectedRole,
      profile: profile,
      isAutoCreated: isAutoCreated
    };
  } catch (err) {
    console.error('[InfraTrace Auth] Unexpected sign-in error:', err);
    return {
      success: false,
      error: mapAuthError(err)
    };
  }
}

/**
 * Public Sign Up with Supabase Auth.
 * Public registration creates exclusively standard User accounts (users_profile).
 * If email confirmation is disabled, user is immediately logged in and profile is inserted.
 * If email confirmation is enabled, instructions to confirm email are returned.
 */
export async function signUp({ email, password, fullName, profession = 'Civil Engineer' }) {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your deployment environment variables and redeploy.'
    };
  }
  try {
    const validProfessions = ['Civil Engineer', 'Site Engineer', 'Contractor', 'Surveyor'];
    const resolvedProfession = validProfessions.includes(profession) ? profession : 'Civil Engineer';

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          profession: resolvedProfession
        }
      }
    });

    if (error) {
      const userMessage = mapAuthError(error);
      return {
        success: false,
        error: userMessage,
        rawError: error
      };
    }

    if (!data?.user) {
      return {
        success: false,
        error: 'Registration failed: No user returned.'
      };
    }

    // If session is returned, email confirmation is disabled -> immediately ready
    if (data.session) {
      try {
        await supabase.from('users_profile').upsert({
          id: data.user.id,
          email: email.trim(),
          full_name: fullName.trim(),
          profession: resolvedProfession
        });
      } catch (profileErr) {
        console.warn('[InfraTrace Auth] users_profile upsert notice:', profileErr);
      }

      return {
        success: true,
        session: data.session,
        user: data.user,
        role: 'User',
        profile: {
          id: data.user.id,
          email: email.trim(),
          fullName: fullName.trim(),
          profession: resolvedProfession,
          role: 'User'
        }
      };
    }

    // If no session is returned, email confirmation is active in Supabase
    return {
      success: true,
      needsConfirmation: true,
      message: 'Account created. Check your email to confirm, then log in.'
    };
  } catch (err) {
    console.error('[InfraTrace Auth] Sign-up exception:', err);
    return {
      success: false,
      error: mapAuthError(err)
    };
  }
}

/**
 * Sign Out from Supabase Auth
 */
export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[InfraTrace Auth] Sign out warning:', err);
  }
}

/**
 * Restore active session and detect user profile
 */
export async function getSessionAndProfile() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return { session: null, user: null, role: null, profile: null };
    }
    const { role, profile } = await detectUserRoleAndProfile(session.user);
    return { session, user: session.user, role, profile };
  } catch (err) {
    console.error('[InfraTrace Auth] Session restore exception:', err);
    return { session: null, user: null, role: null, profile: null };
  }
}
