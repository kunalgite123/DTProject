import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUtilities } from '../context/UtilityContext';

export const Navigation = () => {
  const { currentRole, signOutSupabase } = useUtilities();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const handleLogout = async () => {
    await signOutSupabase();
    navigate('/login');
  };

  return (
    <div className="navigation">
      <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
        <div className="brand-mark" style={{ background: '#f2f6fc', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '8px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3268ad" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
            <circle cx="12" cy="10" r="3" fill="#3268ad"></circle>
          </svg>
        </div>
        <div className="project-identity">
          <div className="infra-trace">InfraTrace</div>
          <div className="shadow-infrastructure-mapping-system">
            Shadow Infrastructure Mapping System
          </div>
        </div>
      </Link>

      {/* Admin Nav */}
      {currentRole === 'Admin' && (
        <div className="admin-navigation" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link
            to="/admin"
            className="project-description2"
            style={{
              color: path === '/admin' ? '#3268ad' : '#66758a',
              fontWeight: path === '/admin' ? '600' : '400',
              textDecoration: 'none'
            }}
          >
            Utility Records
          </Link>
          <Link
            to="/admin/add-utility"
            className="project-description2"
            style={{
              color: path === '/admin/add-utility' ? '#3268ad' : '#66758a',
              fontWeight: path === '/admin/add-utility' ? '600' : '400',
              textDecoration: 'none'
            }}
          >
            Add Utility
          </Link>
          <Link
            to="/dashboard"
            className="project-description2"
            style={{
              color: path === '/dashboard' ? '#3268ad' : '#66758a',
              fontWeight: path === '/dashboard' ? '600' : '400',
              textDecoration: 'none'
            }}
          >
            How It Works
          </Link>
        </div>
      )}

      {/* Verifier Nav */}
      {currentRole === 'Verifier' && (
        <div className="navigation-links">
          <Link
            to="/verifier"
            className="navigation-item"
            style={{
              background: path.startsWith('/verifier') ? '#ffffff' : 'transparent',
              textDecoration: 'none'
            }}
          >
            <div
              className="pending-records"
              style={{
                color: path.startsWith('/verifier') ? '#3268ad' : '#66758a',
                fontWeight: path.startsWith('/verifier') ? '600' : '400'
              }}
            >
              Pending Records
            </div>
          </Link>
          <Link
            to="/dashboard"
            className="navigation-item"
            style={{ textDecoration: 'none' }}
          >
            <div className="how-it-works">How It Works</div>
          </Link>
        </div>
      )}

      {/* User Nav */}
      {currentRole === 'User' && (
        <div className="navigation-links">
          <Link
            to="/dashboard"
            className="navigation-item"
            style={{
              background: path === '/dashboard' ? '#f2f6fc' : '#ffffff',
              textDecoration: 'none'
            }}
          >
            <div
              className="dashboard"
              style={{
                color: path === '/dashboard' ? '#3268ad' : '#66758a',
                fontWeight: path === '/dashboard' ? '600' : '400'
              }}
            >
              Dashboard
            </div>
          </Link>
          <Link
            to="/map"
            className="navigation-item"
            style={{
              background: path === '/map' ? '#f2f6fc' : '#ffffff',
              textDecoration: 'none'
            }}
          >
            <div
              className="utility-map2"
              style={{
                color: path === '/map' ? '#3268ad' : '#66758a',
                fontWeight: path === '/map' ? '600' : '400'
              }}
            >
              Utility Map
            </div>
          </Link>
          <Link
            to="/dashboard"
            className="navigation-item"
            style={{ textDecoration: 'none' }}
          >
            <div className="how-it-works">How It Works</div>
          </Link>
        </div>
      )}

      <div className="account">
        <div className="role">
          <div className="role-name" style={{ color: '#3268ad', fontSize: '14.5px' }}>
            {currentRole}
          </div>
        </div>
        <div
          onClick={handleLogout}
          className="logout"
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          Logout
        </div>
      </div>
    </div>
  );
};
