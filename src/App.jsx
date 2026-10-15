import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUtilities } from './context/UtilityContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AddUtilityPage } from './pages/AddUtilityPage';
import { VerifierDashboardPage } from './pages/VerifierDashboardPage';
import { VerificationDetailsPage } from './pages/VerificationDetailsPage';
import { VerificationQueuePage } from './pages/VerificationQueuePage';
import { UtilityMapPage } from './pages/UtilityMapPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { RecordsPage } from './pages/RecordsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { ProfilePage } from './pages/ProfilePage';

export const App = () => {
  const { currentUser, currentRole, initialLoading } = useUtilities();

  const getRoleDashboard = (role) => {
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Verifier') return '/verifier/dashboard';
    return '/user/dashboard';
  };

  // Helper redirect element for "/" and "/dashboard"
  const RoleHomeRedirect = () => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to={getRoleDashboard(currentRole)} replace />;
  };

  if (initialLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #3268ad',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ color: '#172d49', fontWeight: 700, fontSize: '17px' }}>InfraTrace</div>
          <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Restoring authenticated session...</div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root & Dynamic Routing */}
      <Route path="/" element={<RoleHomeRedirect />} />
      <Route path="/dashboard" element={<RoleHomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ================= ADMIN PROTECTED ROUTES ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-utility"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AddUtilityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/records/new"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AddUtilityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/records"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <RecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/map"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <UtilityMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />

      {/* ================= VERIFIER PROTECTED ROUTES ================= */}
      <Route
        path="/verifier"
        element={
          <ProtectedRoute allowedRoles={['Verifier']}>
            <VerifierDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verifier/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Verifier']}>
            <VerifierDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verifier/queue"
        element={
          <ProtectedRoute allowedRoles={['Verifier']}>
            <VerificationQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verifier/map"
        element={
          <ProtectedRoute allowedRoles={['Verifier']}>
            <UtilityMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verifier/reports"
        element={
          <ProtectedRoute allowedRoles={['Verifier']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verifier/review/:id"
        element={
          <ProtectedRoute allowedRoles={['Verifier']}>
            <VerificationDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verifier/review"
        element={
          <ProtectedRoute allowedRoles={['Verifier']}>
            <VerificationDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* ================= USER PROTECTED ROUTES ================= */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['User']}>
            <UserDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['User']}>
            <UserDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/records/new"
        element={
          <ProtectedRoute allowedRoles={['User']}>
            <AddUtilityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/records"
        element={
          <ProtectedRoute allowedRoles={['User']}>
            <RecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/records/:id"
        element={
          <ProtectedRoute allowedRoles={['User']}>
            <RecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/map"
        element={
          <ProtectedRoute allowedRoles={['User']}>
            <UtilityMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/reports"
        element={
          <ProtectedRoute allowedRoles={['User']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* ================= SHARED PROTECTED ROUTES ================= */}
      <Route
        path="/map"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Verifier', 'User']}>
            <UtilityMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/records"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Verifier', 'User']}>
            <RecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Verifier', 'User']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Verifier', 'User']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<RoleHomeRedirect />} />
    </Routes>
  );
};
