import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUtilities } from '../context/UtilityContext';

// Unified Navigation Configuration per Role
export const NAV_CONFIG = {
  Admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'GIS Map', path: '/map', icon: 'map' },
    { label: 'Records', path: '/admin/records', icon: 'records' },
    { label: 'Reports', path: '/reports', icon: 'reports' },
    { label: 'Users', path: '/admin/users', icon: 'users' },
    { label: 'Profile', path: '/profile', icon: 'profile' }
  ],
  Verifier: [
    { label: 'Dashboard', path: '/verifier/dashboard', icon: 'dashboard' },
    { label: 'Verification Queue', path: '/verifier/queue', icon: 'queue' },
    { label: 'GIS Map', path: '/map', icon: 'map' },
    { label: 'Records', path: '/records', icon: 'records' },
    { label: 'Reports', path: '/reports', icon: 'reports' },
    { label: 'Profile', path: '/profile', icon: 'profile' }
  ],
  User: [
    { label: 'Dashboard', path: '/user/dashboard', icon: 'dashboard' },
    { label: 'GIS Map', path: '/map', icon: 'map' },
    { label: 'My Records', path: '/user/records', icon: 'records' },
    { label: 'Reports', path: '/reports', icon: 'reports' },
    { label: 'Profile', path: '/profile', icon: 'profile' }
  ]
};

// Render Icon for each nav item
const renderNavIcon = (iconType) => {
  switch (iconType) {
    case 'dashboard':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1"></rect>
          <rect width="7" height="5" x="14" y="3" rx="1"></rect>
          <rect width="7" height="9" x="14" y="12" rx="1"></rect>
          <rect width="7" height="5" x="3" y="16" rx="1"></rect>
        </svg>
      );
    case 'map':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
          <line x1="9" y1="3" x2="9" y2="18"></line>
          <line x1="15" y1="6" x2="15" y2="21"></line>
        </svg>
      );
    case 'records':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      );
    case 'queue':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M9 14l2 2 4-4"></path>
        </svg>
      );
    case 'reports':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      );
    case 'users':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );
    case 'profile':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5"></circle>
          <path d="M20 21a8 8 0 1 0-16 0"></path>
        </svg>
      );
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      );
  }
};

export const Sidebar = () => {
  const { currentRole, userProfile, signOutSupabase } = useUtilities();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const handleLogout = async () => {
    await signOutSupabase();
    navigate('/login');
  };

  const getRoleBadgeColor = () => {
    if (currentRole === 'Admin') return { bg: '#fcf6e9', text: '#cc9b43', dot: '#cc9b43' };
    if (currentRole === 'Verifier') return { bg: '#eff7f2', text: '#397d62', dot: '#397d62' };
    return { bg: '#f2f6fc', text: '#3268ad', dot: '#3268ad' };
  };

  const roleColors = getRoleBadgeColor();
  const navItems = NAV_CONFIG[currentRole] || NAV_CONFIG['User'];

  // Check if a nav item is active (matching exact path or root alias)
  const isNavActive = (itemPath) => {
    if (path === itemPath) return true;
    if (itemPath === '/admin/dashboard' && (path === '/admin' || path === '/admin/dashboard')) return true;
    if (itemPath === '/verifier/dashboard' && (path === '/verifier' || path === '/verifier/dashboard')) return true;
    if (itemPath === '/user/dashboard' && (path === '/user/dashboard' || path === '/dashboard')) return true;
    if (itemPath === '/verifier/queue' && (path === '/verifier/queue' || path.startsWith('/verifier/review'))) return true;
    return false;
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <Link to="/" className="brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-mark" style={{ background: '#f2f6fc', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3268ad" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
              <circle cx="12" cy="10" r="3" fill="#3268ad"></circle>
            </svg>
          </div>
          <div className="project-identity">
            <div className="infra-trace" style={{ fontWeight: 700, fontSize: '19px', letterSpacing: '-0.3px', color: '#172d49' }}>
              InfraTrace
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links Generated from NAV_CONFIG */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">
          {currentRole.toUpperCase()} MENU
        </div>

        {navItems.map((item) => {
          const active = isNavActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: active ? '#3268ad' : '#475569',
                background: active ? '#f2f6fc' : 'transparent',
                fontWeight: active ? 700 : 600,
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ color: active ? '#3268ad' : '#8b96a5', display: 'flex', alignItems: 'center' }}>
                {renderNavIcon(item.icon)}
              </div>
              <span className="sidebar-nav-text" style={{ fontSize: '14.5px' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2eaf4' }}>
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-logout-btn"
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#c14e38', padding: '10px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '14.5px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
