import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUtilities } from '../context/UtilityContext';

export const LoginPage = () => {
  const { currentUser, currentRole, initialLoading, signInWithSupabase, signUpWithSupabase, loading } = useUtilities();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('admin@infratrace.com');
  const [password, setPassword] = useState('Admin@123456');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('Anil Patel');
  const [profession, setProfession] = useState('Civil Engineer');
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authInfo, setAuthInfo] = useState('');

  const navigateToRoleDashboard = (role) => {
    if (role === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'Verifier') {
      navigate('/verifier/dashboard', { replace: true });
    } else {
      navigate('/user/dashboard', { replace: true });
    }
  };

  // Logged-in users opening /login go to their own dashboard
  useEffect(() => {
    if (!initialLoading && currentUser) {
      navigateToRoleDashboard(currentRole);
    }
  }, [currentUser, currentRole, initialLoading]);

  // Handle One-Click Role Selector (Pre-fills credentials without auto-submitting)
  const handleRoleCardClick = (role) => {
    setSelectedRole(role);
    setAuthError('');
    setAuthSuccess('');
    setAuthInfo('');

    if (role === 'Admin') {
      setEmail('admin@infratrace.com');
      setPassword('Admin@123456');
      setFullName('Anil Patel');
    } else if (role === 'Verifier') {
      setEmail('verifier@infratrace.com');
      setPassword('Verify@123456');
      setFullName('Suresh Sharma');
    } else if (role === 'User') {
      setEmail('user@infratrace.com');
      setPassword('User@123456');
      setFullName('Ramesh Deshmukh');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setAuthError('');
    setAuthSuccess('');
    setAuthInfo('');

    if (isSignUp) {
      if (!password || password.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        return;
      }

      const res = await signUpWithSupabase(email, password, fullName, profession);
      if (res.success) {
        if (res.needsConfirmation) {
          setAuthSuccess(res.message || 'Account created! Please check your email to confirm, then log in.');
          setTimeout(() => {
            setIsSignUp(false);
          }, 3500);
        } else {
          setAuthSuccess('Account created successfully! Redirecting to user dashboard...');
          setTimeout(() => {
            navigate('/user/dashboard');
          }, 600);
        }
      } else {
        setAuthError(res.error || 'Registration failed');
      }
    } else {
      const res = await signInWithSupabase(email, password, selectedRole);
      if (res.success) {
        if (res.infoMessage) {
          setAuthInfo(res.infoMessage);
        }
        setTimeout(() => {
          navigateToRoleDashboard(res.role || selectedRole);
        }, res.infoMessage ? 500 : 100);
      } else {
        setAuthError(res.error || 'Invalid email or password');
      }
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setAuthError('');
    setAuthSuccess('');
    setAuthInfo('');
    setConfirmPassword('');
    if (!isSignUp) {
      setEmail('');
      setPassword('');
      setFullName('');
      setProfession('Civil Engineer');
    } else {
      setEmail('admin@infratrace.com');
      setPassword('Admin@123456');
      setFullName('Anil Patel');
      setSelectedRole('Admin');
    }
  };

  return (
    <div className="group-1" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', background: '#F8FAFC' }}>
      <div className="login-page" style={{ position: 'relative', width: '100%', maxWidth: '1440px', minHeight: '100vh', background: '#F8FAFC' }}>
        {/* Header */}
        <div className="brand-header">
          <div className="brand-mark" style={{ background: '#f2f6fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3268ad" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div className="project-identity">
            <div className="project-name" style={{ fontWeight: 700, fontSize: '18px', color: '#172d49' }}>InfraTrace</div>
          </div>
        </div>

        <div className="login-content">
          <div className="login">
            <div className="welcome">
              <div className="heading" style={{ fontWeight: 700 }}>
                {isSignUp ? 'Create User Account' : 'Welcome to InfraTrace'}
              </div>
              <p style={{ color: '#66758a', fontSize: '14px', marginTop: '6px' }}>
                {isSignUp
                  ? 'Sign up as a field engineer, contractor or surveyor'
                  : 'Sign in with your email and password'}
              </p>
            </div>

            {authError && (
              <div style={{ background: '#fdf2f0', color: '#aa6654', padding: '12px 14px', borderRadius: '6px', fontSize: '13.5px', fontWeight: 600 }}>
                {authError}
              </div>
            )}

            {authInfo && (
              <div style={{ background: '#eef4fd', color: '#2c5d9b', padding: '12px 14px', borderRadius: '6px', fontSize: '13.5px', fontWeight: 600 }}>
                ℹ️ {authInfo}
              </div>
            )}

            {authSuccess && (
              <div style={{ background: '#eff7f2', color: '#397d62', padding: '12px 14px', borderRadius: '6px', fontSize: '13.5px', fontWeight: 600 }}>
                {authSuccess}
              </div>
            )}

            <form className="sign-in-form" onSubmit={handleAuthSubmit}>
              {isSignUp && (
                <div className="form-field">
                  <div className="label" style={{ fontWeight: 700 }}>Full Name</div>
                  <div className="input">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      style={{ width: '100%', height: '100%', fontFamily: 'inherit', fontSize: '15px', color: '#172d49', outline: 'none', border: 'none', background: 'transparent' }}
                    />
                  </div>
                </div>
              )}

              <div className="form-field">
                <div className="label" style={{ fontWeight: 700 }}>Email Address</div>
                <div className="input">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    style={{ width: '100%', height: '100%', fontFamily: 'inherit', fontSize: '15px', color: '#172d49', outline: 'none', border: 'none', background: 'transparent' }}
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="label" style={{ fontWeight: 700 }}>
                  Password {isSignUp && <span style={{ fontSize: '12px', fontWeight: 500, color: '#66758a' }}>(min 6 chars)</span>}
                </div>
                <div className="input" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{ width: '100%', height: '100%', fontFamily: 'inherit', fontSize: '15px', color: '#172d49', outline: 'none', border: 'none', background: 'transparent', paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#8b96a5',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <>
                  <div className="form-field">
                    <div className="label" style={{ fontWeight: 700 }}>Confirm Password</div>
                    <div className="input" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                        style={{ width: '100%', height: '100%', fontFamily: 'inherit', fontSize: '15px', color: '#172d49', outline: 'none', border: 'none', background: 'transparent', paddingRight: '36px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#8b96a5',
                          padding: '4px'
                        }}
                      >
                        {showConfirmPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <div className="label" style={{ fontWeight: 700 }}>Profession</div>
                    <div className="input">
                      <select
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '15px', color: '#172d49', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <option value="Civil Engineer">Civil Engineer</option>
                        <option value="Site Engineer">Site Engineer</option>
                        <option value="Contractor">Contractor</option>
                        <option value="Surveyor">Surveyor</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#66758a', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', marginTop: '2px', lineHeight: '1.4' }}>
                    ℹ️ <strong>Note:</strong> Verifier and Admin accounts are assigned by the administrator.
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  backgroundColor: '#147A86',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '15px',
                  boxShadow: '0 2px 6px rgba(20, 122, 134, 0.25)',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background-color 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0F5C66')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#147A86')}
              >
                <div style={{ fontWeight: 700 }}>
                  {loading
                    ? 'Authenticating...'
                    : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
                </div>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span
                  onClick={toggleAuthMode}
                  style={{ color: '#147A86', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSignUp ? '← Already have an account? Sign In' : 'Create New Account'}
                </span>
                <div className="forgot-password" style={{ cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: '#64748B' }}>
                  Forgot Password?
                </div>
              </div>
            </form>
          </div>

          {/* 1-Click Role Switcher Cards (In Sign In mode) */}
          <div className="role-selection" style={{ marginTop: '24px', width: '100%', maxWidth: '440px' }}>
            <div className="available-roles" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {/* User Card */}
              <div
                className="role-card"
                onClick={() => handleRoleCardClick('User')}
                style={{
                  cursor: 'pointer',
                  border: selectedRole === 'User' ? '2px solid #0284C7' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: selectedRole === 'User' ? '#F0F9FF' : '#ffffff',
                  boxShadow: selectedRole === 'User' ? '0 2px 6px rgba(2, 132, 199, 0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedRole === 'User' ? '#0284C7' : '#64748B'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"></circle>
                  <path d="M20 21a8 8 0 1 0-16 0"></path>
                </svg>
                <div className="role-name" style={{ fontWeight: 700, fontSize: '15px', color: selectedRole === 'User' ? '#0284C7' : '#172D49' }}>User</div>
              </div>

              {/* Verifier Card */}
              <div
                className="role-card"
                onClick={() => handleRoleCardClick('Verifier')}
                style={{
                  cursor: 'pointer',
                  border: selectedRole === 'Verifier' ? '2px solid #16A34A' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: selectedRole === 'Verifier' ? '#F0FDF4' : '#ffffff',
                  boxShadow: selectedRole === 'Verifier' ? '0 2px 6px rgba(22, 163, 74, 0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedRole === 'Verifier' ? '#16A34A' : '#64748B'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                <div className="role-name" style={{ fontWeight: 700, fontSize: '15px', color: selectedRole === 'Verifier' ? '#16A34A' : '#172D49' }}>Verifier</div>
              </div>

              {/* Admin Card */}
              <div
                className="role-card"
                onClick={() => handleRoleCardClick('Admin')}
                style={{
                  cursor: 'pointer',
                  border: selectedRole === 'Admin' ? '2px solid #D97706' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: selectedRole === 'Admin' ? '#FFFBEB' : '#ffffff',
                  boxShadow: selectedRole === 'Admin' ? '0 2px 6px rgba(217, 119, 6, 0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedRole === 'Admin' ? '#D97706' : '#64748B'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <div className="role-name" style={{ fontWeight: 700, fontSize: '15px', color: selectedRole === 'Admin' ? '#D97706' : '#172D49' }}>Admin</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
