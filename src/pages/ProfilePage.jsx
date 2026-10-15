import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';

export const ProfilePage = () => {
  const { currentRole, userProfile, currentUser, showToast } = useUtilities();
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [department, setDepartment] = useState(userProfile?.department || 'Infrastructure Planning');
  const [profession, setProfession] = useState(userProfile?.profession || 'Civil Engineer');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Profile information updated successfully', 'success');
    }, 600);
  };

  const getRoleBadgeStyle = () => {
    if (currentRole === 'Admin') return { bg: '#fcf6e9', text: '#cc9b43', border: '#e8d4a7' };
    if (currentRole === 'Verifier') return { bg: '#eff7f2', text: '#397d62', border: '#b8dfcb' };
    return { bg: '#f2f6fc', text: '#3268ad', border: '#c3d8f3' };
  };

  const badgeStyle = getRoleBadgeStyle();

  return (
    <AppLayout title="Account Profile">
      <div style={{ padding: '32px 40px 60px', width: '100%', maxWidth: '800px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#172d49', margin: 0 }}>
            Profile
          </h2>
        </div>

        {/* Profile Header Box */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #dde3eb',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '28px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: badgeStyle.text,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            fontWeight: 800,
            flexShrink: 0
          }}>
            {(userProfile?.fullName || currentRole).charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172d49', margin: 0 }}>
                {userProfile?.fullName || (currentRole === 'Admin' ? 'Anil Patel' : currentRole === 'Verifier' ? 'Suresh Sharma' : 'Field User')}
              </h3>
              <div style={{
                background: badgeStyle.bg,
                color: badgeStyle.text,
                border: `1px solid ${badgeStyle.border}`,
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {currentRole === 'User' ? (userProfile?.profession || 'Civil Engineer') : currentRole}
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#66758a' }}>
              {currentUser?.email || userProfile?.email || `${currentRole.toLowerCase()}@infratrace.com`}
            </div>
          </div>
        </div>

        {/* Form Details */}
        <div style={{ background: '#ffffff', border: '1px solid #dde3eb', borderRadius: '12px', padding: '28px' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#172d49', marginBottom: '8px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #dde3eb',
                  fontSize: '14px',
                  outline: 'none',
                  color: '#172d49'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#172d49', marginBottom: '8px' }}>
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || userProfile?.email || `${currentRole.toLowerCase()}@infratrace.com`}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #dde3eb',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: '#66758a',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#172d49', marginBottom: '8px' }}>
                Assigned Role
              </label>
              <input
                type="text"
                disabled
                value={currentRole}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #dde3eb',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: '#66758a',
                  cursor: 'not-allowed',
                  fontWeight: 600
                }}
              />
            </div>

            {currentRole === 'User' ? (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#172d49', marginBottom: '8px' }}>
                  Profession
                </label>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #dde3eb',
                    fontSize: '14px',
                    color: '#172d49',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="Civil Engineer">Civil Engineer</option>
                  <option value="Site Engineer">Site Engineer</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Surveyor">Surveyor</option>
                </select>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#172d49', marginBottom: '8px' }}>
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Utility Verification Division"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #dde3eb',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#172d49'
                  }}
                />
              </div>
            )}

            <div style={{ paddingTop: '10px' }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  backgroundColor: '#3268ad',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};
