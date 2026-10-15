import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUtilities } from '../context/UtilityContext';

export const Topbar = ({ title }) => {
  const { currentRole, userProfile } = useUtilities();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Derive dynamic page title if not explicitly passed
  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path.includes('/dashboard')) return `${currentRole} Dashboard`;
    if (path.includes('/map')) return 'GIS Utility Map';
    if (path.includes('/records') || path.includes('/admin/records') || path.includes('/user/records')) return 'Utility Records';
    if (path.includes('/reports')) return 'Reports & Analytics';
    if (path.includes('/users') || path.includes('/admin/users')) return 'User Management';
    if (path.includes('/profile')) return 'User Profile';
    if (path.includes('/queue') || path.includes('/verifier/queue')) return 'Verification Queue';
    if (path.includes('/review')) return 'Verification Review';
    if (path.includes('/add-utility')) return 'Add New Utility';
    return `${currentRole} Portal`;
  };

  const getRoleDisplay = () => {
    if (currentRole === 'User') {
      return userProfile?.profession || 'Civil Engineer';
    }
    return currentRole;
  };

  const getRoleColors = () => {
    if (currentRole === 'Admin') return { bg: '#fcf6e9', text: '#cc9b43', dot: '#cc9b43' };
    if (currentRole === 'Verifier') return { bg: '#eff7f2', text: '#397d62', dot: '#397d62' };
    return { bg: '#f2f6fc', text: '#3268ad', dot: '#3268ad' };
  };

  const roleColors = getRoleColors();
  const userName = userProfile?.fullName || (currentRole === 'Admin' ? 'Anil Patel' : currentRole === 'Verifier' ? 'Suresh Sharma' : 'Field User');
  const userInitial = userName.charAt(0).toUpperCase() || currentRole.charAt(0);

  return (
    <header className="app-topbar" style={{
      height: '70px',
      borderBottom: '1px solid #dde3eb',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      gap: '24px'
    }}>
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#172d49', margin: 0, letterSpacing: '-0.3px' }}>
          {getPageTitle()}
        </h1>
      </div>

      {/* Center Search Input */}
      <div style={{ flex: 1, maxWidth: '440px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '8px 14px'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b96a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search records, assets, or coordinates..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '14px',
              color: '#172d49'
            }}
          />
        </div>
      </div>

      {/* Right Side: Notification Icon, User Name, Role/Profession Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Notification Icon */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              position: 'relative'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: '#e11d48',
              borderRadius: '50%',
              border: '2px solid #ffffff'
            }}></span>
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: '0',
              width: '280px',
              background: '#ffffff',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              padding: '12px',
              zIndex: 100
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#172d49', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                System Notifications
              </div>
              <div style={{ fontSize: '12px', color: '#475569', padding: '6px 0' }}>
                ✓ Database sync active via Supabase
              </div>
              <div style={{ fontSize: '12px', color: '#475569', padding: '6px 0' }}>
                ℹ Current session authenticated as {currentRole}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: roleColors.dot,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '15px'
          }}>
            {userInitial}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#172d49', lineHeight: 1.2 }}>
              {userName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
              <div style={{
                background: roleColors.bg,
                color: roleColors.text,
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: roleColors.dot }}></span>
                {getRoleDisplay()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
