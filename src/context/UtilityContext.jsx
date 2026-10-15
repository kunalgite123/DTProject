import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  detectUserRoleAndProfile,
  getSessionAndProfile
} from '../services/authService';

const initialUtilities = [
  {
    id: 'WTR-001',
    name: 'MIDC water main',
    type: 'Water',
    typeColor: '#4384c4',
    location: 'MIDC, Nashik',
    depth: '1.2 m',
    owner: 'Water Department',
    physicalStatus: 'Active',
    source: 'Department plan',
    submittedBy: 'Anil Patel (Admin)',
    status: 'Verified',
    statusClass: 'record-status',
    lastUpdated: '04 Oct 2026',
    document: 'MIDC_Water_Main_Plan.pdf',
    notes: 'Verified against municipal GIS layer.'
  },
  {
    id: 'GAS-001',
    name: 'MIDC gas line',
    type: 'Gas',
    typeColor: '#cc9b43',
    location: 'MIDC, Nashik',
    depth: '0.9 m',
    owner: 'Gas Department',
    physicalStatus: 'Active',
    source: 'Department plan',
    submittedBy: 'Anil Patel (Admin)',
    status: 'Pending',
    statusClass: 'record-status2',
    lastUpdated: '03 Oct 2026',
    document: 'MIDC_Gas_Plan.pdf',
    notes: ''
  },
  {
    id: 'WTR-002',
    name: 'MIDC water branch',
    type: 'Water',
    typeColor: '#4384c4',
    location: 'MIDC, Nashik',
    depth: '1.0 m',
    owner: 'Water Department',
    physicalStatus: 'Active',
    source: 'Field survey',
    submittedBy: 'Anil Patel (Admin)',
    status: 'Verified',
    statusClass: 'record-status',
    lastUpdated: '03 Oct 2026',
    document: 'MIDC_Water_Branch_Survey.pdf',
    notes: 'Field survey complete and confirmed.'
  },
  {
    id: 'ELE-001',
    name: 'MIDC power cable',
    type: 'Electricity',
    typeColor: '#c16b62',
    location: 'MIDC, Nashik',
    depth: '0.8 m',
    owner: 'Electricity Board',
    physicalStatus: 'Active',
    source: 'Field survey',
    submittedBy: 'Anil Patel (Admin)',
    status: 'Verified',
    statusClass: 'record-status',
    lastUpdated: '02 Oct 2026',
    document: 'MIDC_Power_Cable_Survey.pdf',
    notes: 'High voltage 11kV line verified.'
  },
  {
    id: 'ELE-003',
    name: 'MIDC feeder line',
    type: 'Electricity',
    typeColor: '#c16b62',
    location: 'MIDC, Nashik',
    depth: '0.8 m',
    owner: 'Electricity Board',
    physicalStatus: 'Active',
    source: 'Field survey',
    submittedBy: 'Anil Patel (Admin)',
    status: 'Pending',
    statusClass: 'record-status2',
    lastUpdated: '02 Oct 2026',
    document: 'MIDC_Feeder_Line.pdf',
    notes: ''
  },
  {
    id: 'FBR-001',
    name: 'MIDC fiber link',
    type: 'Fiber',
    typeColor: '#8974b4',
    location: 'MIDC, Nashik',
    depth: '0.6 m',
    owner: 'Telecom Authority',
    physicalStatus: 'Active',
    source: 'Contractor plan',
    submittedBy: 'Anil Patel (Admin)',
    status: 'Verified',
    statusClass: 'record-status',
    lastUpdated: '01 Oct 2026',
    document: 'MIDC_Fiber_Link_Doc.pdf',
    notes: 'OFC 48 Core conduit verified.'
  },
  {
    id: 'FBR-002',
    name: 'MIDC secondary fiber',
    type: 'Fiber',
    typeColor: '#8974b4',
    location: 'MIDC, Nashik',
    depth: '0.6 m',
    owner: 'Telecom Authority',
    physicalStatus: 'Active',
    source: 'Contractor plan',
    submittedBy: 'Anil Patel (Admin)',
    status: 'Pending',
    statusClass: 'record-status2',
    lastUpdated: '01 Oct 2026',
    document: 'MIDC_Fiber_Secondary.pdf',
    notes: ''
  },
  {
    id: 'SWR-001',
    name: 'MIDC sewer line',
    type: 'Sewer',
    typeColor: '#658e79',
    location: 'MIDC, Nashik',
    depth: '1.5 m',
    owner: 'Sanitation Board',
    physicalStatus: 'Active',
    source: 'Department plan',
    submittedBy: 'Anil Patel (Admin)',
    status: 'Needs Correction',
    statusClass: 'record-status3',
    lastUpdated: '30 Sep 2026',
    document: 'MIDC_Sewer_Plan.pdf',
    notes: 'Depth discrepancy found between contractor and dept plan.'
  },
  {
    id: 'WTR-003',
    name: 'MIDC water branch',
    type: 'Water',
    typeColor: '#4384c4',
    location: 'MIDC, Nashik',
    depth: '1.1 m',
    owner: 'Water Department',
    physicalStatus: 'Active',
    source: 'Department plan',
    submittedBy: 'Anil Patel (Admin)',
    status: 'Draft',
    statusClass: 'record-status4',
    lastUpdated: '29 Sep 2026',
    document: 'MIDC_Draft_Water.pdf',
    notes: ''
  }
];

const UtilityContext = createContext(null);

export const UtilityProvider = ({ children }) => {
  const [utilities, setUtilities] = useState(initialUtilities);

  // Initialize role and user profile from localStorage with fallback
  const [currentRole, setCurrentRoleState] = useState(() => {
    return localStorage.getItem('infratrace_role') || 'Admin';
  });

  const [userProfile, setUserProfileState] = useState(() => {
    const saved = localStorage.getItem('infratrace_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      fullName: 'Anil Patel',
      email: 'admin@infratrace.com',
      role: 'Admin',
      department: 'Municipal Infrastructure'
    };
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUtilityId, setSelectedUtilityId] = useState('WTR-2041');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'warning') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Helper to persist role
  const setCurrentRole = (role) => {
    setCurrentRoleState(role);
    localStorage.setItem('infratrace_role', role);
  };

  // Helper to persist user profile
  const setUserProfile = (profile) => {
    setUserProfileState(profile);
    localStorage.setItem('infratrace_user_profile', JSON.stringify(profile));
    if (profile?.role) {
      setCurrentRole(profile.role);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Verified') return 'record-status';
    if (status === 'Pending') return 'record-status2';
    if (status === 'Needs Correction') return 'record-status3';
    if (status === 'Rejected') return 'record-status3';
    if (status === 'Draft') return 'record-status4';
    return 'record-status2';
  };

  const getTypeColor = (type) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('water')) return '#4384c4';
    if (lower.includes('elec') || lower.includes('power')) return '#c16b62';
    if (lower.includes('gas')) return '#cc9b43';
    if (lower.includes('sew') || lower.includes('swr')) return '#658e79';
    if (lower.includes('tel') || lower.includes('fiber') || lower.includes('fbr')) return '#8974b4';
    return '#4384c4';
  };

  const formatType = (type) => {
    if (!type) return 'Water';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Fetch utilities from Supabase
  const fetchSupabaseUtilities = async () => {
    try {
      const { data, error } = await supabase.from('utilities').select('*');
      if (data && data.length > 0 && !error) {
        const mapped = data.map(item => ({
          id: item.record_id || item.id,
          dbId: item.id,
          record_id: item.record_id,
          name: item.description || item.name || `${formatType(item.type)} Asset`,
          description: item.description || item.name,
          type: formatType(item.type),
          rawType: item.type,
          typeColor: item.type_color || getTypeColor(item.type),
          location: item.location_text || item.location || 'Nashik, Maharashtra',
          locationText: item.location_text || item.location,
          latitude: item.latitude || (item.coordinates?.lat ?? 19.9975),
          longitude: item.longitude || (item.coordinates?.lng ?? 73.7898),
          depth: item.depth || '1.0 m',
          owner: item.owner || 'Municipal Department',
          physicalStatus: item.physical_status || 'Active',
          source: item.source || 'Field survey',
          submittedBy: item.submitted_by || 'Field Engineer',
          status: item.status || 'Pending',
          rejectionReason: item.rejection_reason || '',
          statusClass: getStatusClass(item.status),
          lastUpdated: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Recent',
          document: item.document_url || 'Nashik_Utility_Doc.pdf',
          notes: item.notes || item.rejection_reason || ''
        }));
        setUtilities(mapped);
      }
    } catch (err) {
      console.warn('Using local fallback data while Supabase table is being initialized:', err);
    }
  };

  // Session restoration on mount
  useEffect(() => {
    fetchSupabaseUtilities();

    let isMounted = true;
    const restoreSession = async () => {
      try {
        const { session, user, role, profile } = await getSessionAndProfile();
        if (isMounted) {
          if (session && user) {
            setCurrentUser(user);
            if (role) setCurrentRole(role);
            if (profile) setUserProfile(profile);
          }
        }
      } catch (e) {
        console.warn('[InfraTrace Context] Session restore notice:', e);
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const { role, profile } = await detectUserRoleAndProfile(session.user);
        if (role) setCurrentRole(role);
        if (profile) setUserProfile(profile);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch role-specific details from DB tables
  const loadUserProfile = async (user) => {
    const { role, profile } = await detectUserRoleAndProfile(user);
    if (role) setCurrentRole(role);
    if (profile) setUserProfile(profile);
    return profile;
  };

  // Sign In with Supabase using authService
  const signInWithSupabase = async (email, password, explicitRole) => {
    setLoading(true);
    try {
      const res = await authSignIn({ email, password, selectedRole: explicitRole });
      if (res.success && res.user) {
        setCurrentUser(res.user);
        if (res.role) setCurrentRole(res.role);
        if (res.profile) setUserProfile(res.profile);
        return {
          success: true,
          role: res.role,
          user: res.user,
          profile: res.profile,
          infoMessage: res.infoMessage
        };
      } else {
        return {
          success: false,
          error: res.error || 'Invalid email or password'
        };
      }
    } catch (err) {
      console.error('[InfraTrace] Sign in exception:', err);
      return {
        success: false,
        error: 'Network error, try again'
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign Up with Supabase using authService (Users only)
  const signUpWithSupabase = async (email, password, fullName, profession = 'Civil Engineer') => {
    setLoading(true);
    try {
      const res = await authSignUp({ email, password, fullName, profession });
      if (res.success) {
        if (res.session && res.user) {
          setCurrentUser(res.user);
          setCurrentRole('User');
          if (res.profile) setUserProfile(res.profile);
          return { success: true, role: 'User', user: res.user, profile: res.profile };
        } else if (res.needsConfirmation) {
          return { success: true, needsConfirmation: true, message: res.message };
        }
        return { success: true, role: 'User' };
      } else {
        return { success: false, error: res.error || 'Registration failed' };
      }
    } catch (err) {
      console.error('[InfraTrace] Sign up exception:', err);
      return { success: false, error: 'Network error or registration failure' };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOutSupabase = async () => {
    await authSignOut();
    setCurrentUser(null);
    localStorage.removeItem('infratrace_role');
    localStorage.removeItem('infratrace_user_profile');
    setCurrentRoleState('User');
    setUserProfileState({
      fullName: 'Guest',
      email: '',
      role: 'User'
    });
  };

  const addUtility = async (newUtility) => {
    const formatted = {
      ...newUtility,
      lastUpdated: 'Just now',
      status: 'Pending',
      statusClass: 'record-status2',
      submittedBy: userProfile.fullName || 'Field Engineer'
    };

    setUtilities(prev => [formatted, ...prev]);

    // Async persist to Supabase if table exists
    try {
      const typeLower = (newUtility.type || 'water').toLowerCase();
      const validTypes = ['water', 'electricity', 'gas', 'sewage', 'telecom'];
      const resolvedType = validTypes.includes(typeLower) ? typeLower : 
        typeLower.includes('elec') ? 'electricity' :
        typeLower.includes('sew') ? 'sewage' :
        typeLower.includes('tel') || typeLower.includes('fbr') || typeLower.includes('fiber') ? 'telecom' :
        typeLower.includes('gas') ? 'gas' : 'water';

      const insertPayload = {
        type: resolvedType,
        location_text: newUtility.location || 'Nashik, Maharashtra',
        latitude: parseFloat(newUtility.latitude) || 19.9975,
        longitude: parseFloat(newUtility.longitude) || 73.7898,
        installed_date: newUtility.installedDate || new Date().toISOString().split('T')[0],
        owner: newUtility.owner || 'Nashik Municipal Corporation',
        description: newUtility.name || newUtility.description || `${newUtility.type} utility line`,
        status: 'Pending',
        created_by: currentUser?.id || null
      };

      if (newUtility.id && !newUtility.id.startsWith('WTR-') && !newUtility.id.startsWith('ELC-') && !newUtility.id.startsWith('GAS-') && !newUtility.id.startsWith('SWR-') && !newUtility.id.startsWith('TEL-')) {
        // Let auto trigger generate record_id unless explicitly supplied
      } else if (newUtility.id) {
        insertPayload.record_id = newUtility.id;
      }

      const { data: inserted, error: insErr } = await supabase.from('utilities').insert([insertPayload]).select().single();
      if (!insErr && inserted?.id) {
        // Insert initial timeline event
        await supabase.from('record_events').insert([
          {
            utility_id: inserted.id,
            event: 'Submitted',
            note: 'Initial utility survey submitted for municipal verification.',
            by_user: currentUser?.id || null
          }
        ]);
      }
    } catch (err) {
      console.warn('Supabase persistence notice:', err);
    }
  };

  const updateVerificationStatus = async (id, newStatus, verificationNotes = '', rejectionReason = '') => {
    setUtilities(prev => prev.map(item => {
      if (item.id === id || item.dbId === id || item.record_id === id) {
        return {
          ...item,
          status: newStatus,
          statusClass: getStatusClass(newStatus),
          notes: verificationNotes || item.notes,
          rejectionReason: rejectionReason || item.rejectionReason,
          lastUpdated: 'Today'
        };
      }
      return item;
    }));

    // Async persist update to Supabase
    try {
      const updatePayload = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      if (rejectionReason) updatePayload.rejection_reason = rejectionReason;
      if (currentUser?.id) updatePayload.verified_by = currentUser.id;

      // Find db id first if necessary
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabase.from('utilities').update(updatePayload);
      if (isUUID) {
        query = query.eq('id', id);
      } else {
        query = query.eq('record_id', id);
      }
      const { data: updatedUtil } = await query.select('id').single();

      const utilDbId = updatedUtil?.id || (isUUID ? id : null);
      if (utilDbId) {
        await supabase.from('record_events').insert([
          {
            utility_id: utilDbId,
            event: newStatus,
            note: verificationNotes || rejectionReason || `Status updated to ${newStatus}`,
            by_user: currentUser?.id || null
          }
        ]);
      }
    } catch (err) {
      console.warn('Supabase update notice:', err);
    }
  };

  const selectedUtility = utilities.find(u => u.id === selectedUtilityId) || utilities[0];

  return (
    <UtilityContext.Provider
      value={{
        utilities,
        currentRole,
        setCurrentRole,
        currentUser,
        userProfile,
        setUserProfile,
        selectedUtility,
        selectedUtilityId,
        setSelectedUtilityId,
        addUtility,
        updateVerificationStatus,
        signInWithSupabase,
        signUpWithSupabase,
        signOutSupabase,
        determineRoleFromEmail: (email, explicitRole) => explicitRole || 'User',
        loading,
        initialLoading,
        toast,
        showToast,
        hideToast: () => setToast(null)
      }}
    >
      {children}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: toast.type === 'error' ? '#fdf2f0' : toast.type === 'success' ? '#eff7f2' : '#fcf6e9',
            color: toast.type === 'error' ? '#c14e38' : toast.type === 'success' ? '#2f6d4d' : '#a8751a',
            border: `1px solid ${toast.type === 'error' ? '#f5c6cb' : toast.type === 'success' ? '#c3e6cb' : '#ffeeba'}`,
            padding: '14px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(23, 45, 73, 0.12)',
            fontSize: '14px',
            fontWeight: 600,
            animation: 'slideInRight 0.3s ease'
          }}
        >
          <span>{toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✅' : '🔔'}</span>
          <span>{toast.message}</span>
          <span
            onClick={() => setToast(null)}
            style={{ marginLeft: '12px', cursor: 'pointer', opacity: 0.7, fontSize: '16px' }}
          >
            ✕
          </span>
        </div>
      )}
    </UtilityContext.Provider>
  );
};

export const useUtilities = () => useContext(UtilityContext);
