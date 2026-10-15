import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUtilities } from '../context/UtilityContext';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { currentUser, currentRole, initialLoading, showToast } = useUtilities();
  const location = useLocation();

  const getOwnDashboard = (role) => {
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Verifier') return '/verifier/dashboard';
    return '/user/dashboard';
  };

  const isUnauthorized =
    currentUser &&
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(currentRole);

  useEffect(() => {
    if (isUnauthorized) {
      showToast('You do not have access to that page', 'warning');
    }
  }, [isUnauthorized]);

  if (initialLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'inherit' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #3268ad', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#172d49', fontWeight: 700, fontSize: '16px' }}>InfraTrace</div>
          <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Verifying permissions...</div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to /login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in with wrong role -> redirect to own dashboard
  if (isUnauthorized) {
    return <Navigate to={getOwnDashboard(currentRole)} replace />;
  }

  return children;
};
