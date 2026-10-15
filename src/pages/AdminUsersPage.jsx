import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';

export const AdminUsersPage = () => {
  const { showToast } = useUtilities();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  const [usersList, setUsersList] = useState([
    {
      id: 'USR-001',
      fullName: 'Anil Patel',
      email: 'admin@infratrace.com',
      role: 'Admin',
      profession: 'System Administrator',
      department: 'Infrastructure IT',
      status: 'Active',
      joinedAt: '01 Jan 2026'
    },
    {
      id: 'USR-002',
      fullName: 'Suresh Sharma',
      email: 'verifier@infratrace.com',
      role: 'Verifier',
      profession: 'Chief Verification Officer',
      department: 'Municipal Compliance',
      status: 'Active',
      joinedAt: '15 Jan 2026'
    },
    {
      id: 'USR-003',
      fullName: 'Rahul Deshmukh',
      email: 'user@infratrace.com',
      role: 'User',
      profession: 'Civil Engineer',
      department: 'Field Construction',
      status: 'Active',
      joinedAt: '02 Feb 2026'
    },
    {
      id: 'USR-004',
      fullName: 'Pooja Kulkarni',
      email: 'pooja.k@infratrace.com',
      role: 'User',
      profession: 'Surveyor',
      department: 'Topographical Survey',
      status: 'Active',
      joinedAt: '12 Feb 2026'
    },
    {
      id: 'USR-005',
      fullName: 'Vikram Mehta',
      email: 'vikram.m@infratrace.com',
      role: 'User',
      profession: 'Contractor',
      department: 'Pipeline Works',
      status: 'Active',
      joinedAt: '20 Feb 2026'
    }
  ]);

  const filteredUsers = usersList.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.profession.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (id) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        showToast(`User status updated to ${newStatus}`, 'info');
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  return (
    <AppLayout title="User Management">
      <div style={{ padding: '32px 40px 60px', width: '100%', maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#172d49', margin: 0 }}>
              Registered Users & Role Directory
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          background: '#ffffff',
          border: '1px solid #dde3eb',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            flex: 1,
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or profession..."
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

          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #dde3eb',
                fontSize: '14px',
                color: '#172d49',
                outline: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Verifier">Verifier</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ background: '#ffffff', border: '1px solid #dde3eb', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #dde3eb' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>USER</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>ROLE</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>PROFESSION / DEPT</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>STATUS</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>JOINED</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isUserAdmin = user.role === 'Admin';
                const isUserVerifier = user.role === 'Verifier';
                const badgeColor = isUserAdmin
                  ? { bg: '#fcf6e9', text: '#cc9b43' }
                  : isUserVerifier
                  ? { bg: '#eff7f2', text: '#397d62' }
                  : { bg: '#f2f6fc', text: '#3268ad' };

                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: badgeColor.bg,
                          color: badgeColor.text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px'
                        }}>
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#172d49' }}>{user.fullName}</div>
                          <div style={{ fontSize: '12px', color: '#66758a' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: badgeColor.bg,
                        color: badgeColor.text,
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#172d49' }}>{user.profession}</div>
                      <div style={{ fontSize: '11px', color: '#66758a' }}>{user.department}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: user.status === 'Active' ? '#397d62' : '#aa6654'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: user.status === 'Active' ? '#397d62' : '#aa6654'
                        }}></span>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#66758a' }}>
                      {user.joinedAt}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user.id)}
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: user.status === 'Active' ? '#aa6654' : '#3268ad',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #dde3eb',
                          cursor: 'pointer'
                        }}
                      >
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};
