import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';
import { useMyStats } from '../hooks/useMyStats';
import { useMyRecords } from '../hooks/useMyRecords';
import { useMyRejections } from '../hooks/useMyRejections';
import { UTILITY_TYPE_COLORS } from '../hooks/useDashboardStats';

export const UserDashboardPage = () => {
  const { userProfile, currentUser, setSelectedUtilityId } = useUtilities();
  const navigate = useNavigate();

  const userId = currentUser?.id;
  const userName = userProfile?.fullName || 'Field User';
  const profession = userProfile?.profession || 'Civil Engineer';

  // 1. Supabase Custom Hooks
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useMyStats(userId);

  const {
    records,
    loading: recordsLoading,
    error: recordsError,
    refetch: refetchRecords
  } = useMyRecords(userId);

  const {
    rejections,
    loading: rejectionsLoading,
    error: rejectionsError,
    refetch: refetchRejections
  } = useMyRejections(userId);

  const isLoading = statsLoading || recordsLoading || rejectionsLoading;
  const isError = statsError || recordsError || rejectionsError;

  const handleRetry = () => {
    refetchStats();
    refetchRecords();
    refetchRejections();
  };

  const handleRowClick = (record) => {
    setSelectedUtilityId(record.recordId || record.id);
    navigate(`/user/records/${encodeURIComponent(record.recordId || record.id)}`);
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'verified') {
      return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7' };
    }
    if (s === 'pending') {
      return { bg: '#FFFBEB', text: '#D97706', border: '#FEF3C7' };
    }
    if (s === 'rejected') {
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FEE2E2' };
    }
    return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
  };

  return (
    <AppLayout title="My Dashboard">
      <div style={{
        padding: '28px 36px 60px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
        color: '#172D49'
      }}>
        {/* ================= 1. HEADER ================= */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#172D49',
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                My Dashboard
              </h1>
              <span style={{
                background: '#F0FDFA',
                color: '#0F5C66',
                border: '1px solid #CCFBF1',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0F5C66' }} />
                {profession}
              </span>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#66758A',
              margin: '4px 0 0 0'
            }}>
              Welcome back, <strong style={{ color: '#0F5C66' }}>{userName}</strong>.
            </p>
          </div>

          {/* ================= 2. QUICK ACTIONS ================= */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              to="/user/map"
              style={{
                background: '#ffffff',
                color: '#172D49',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'border-color 0.15s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = '#0F5C66')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5C66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                <line x1="9" y1="3" x2="9" y2="18"></line>
                <line x1="15" y1="6" x2="15" y2="21"></line>
              </svg>
              <span>Open Map</span>
            </Link>

            <Link
              to="/user/records/new"
              style={{
                backgroundColor: '#0F5C66',
                color: '#ffffff',
                border: '1px solid #0F5C66',
                borderRadius: '6px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(15, 92, 102, 0.2)',
                transition: 'background-color 0.15s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0c4951')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0F5C66')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Record</span>
            </Link>
          </div>
        </div>

        {/* ERROR STATE WITH RETRY */}
        {isError && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '6px',
            padding: '14px 20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', fontSize: '13.5px', fontWeight: 600 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{statsError || recordsError || rejectionsError || 'Failed to sync your records from Supabase.'}</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              style={{
                background: '#ffffff',
                border: '1px solid #DC2626',
                color: '#DC2626',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= 3. REJECTED ALERTS (ONLY WHEN PRESENT) ================= */}
        {rejections && rejections.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {rejections.map((rej) => (
              <div
                key={rej.id}
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  borderRadius: '6px',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#991B1B' }}>
                      Correction Needed on Record: <span style={{ color: '#172D49' }}>{rej.recordId}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#B91C1C', marginTop: '2px' }}>
                      <strong>Verifier Note:</strong> {rej.rejectionReason}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/user/records/new?resubmit=${encodeURIComponent(rej.recordId)}`}
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 2px rgba(220, 38, 38, 0.2)'
                  }}
                >
                  <span>Resubmit Record →</span>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ================= 4. STAT CARDS (4) ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* My Submissions */}
          <div
            onClick={() => navigate('/user/records')}
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#0F5C66';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 92, 102, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#66758A' }}>My Submissions</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5C66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <div>
              {isLoading ? (
                <div style={{ height: '32px', width: '60px', background: '#F1F5F9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#172D49', lineHeight: 1.1 }}>
                  {stats.total}
                </div>
              )}
            </div>
          </div>

          {/* Verified */}
          <div
            onClick={() => navigate('/user/records?status=Verified')}
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#16A34A';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(22, 163, 74, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#66758A' }}>Verified</span>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
            </div>
            <div>
              {isLoading ? (
                <div style={{ height: '32px', width: '60px', background: '#F1F5F9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#16A34A', lineHeight: 1.1 }}>
                  {stats.verified}
                </div>
              )}
            </div>
          </div>

          {/* Pending */}
          <div
            onClick={() => navigate('/user/records?status=Pending')}
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(217, 119, 6, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#66758A' }}>Pending</span>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
            </div>
            <div>
              {isLoading ? (
                <div style={{ height: '32px', width: '60px', background: '#F1F5F9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#D97706', lineHeight: 1.1 }}>
                  {stats.pending}
                </div>
              )}
            </div>
          </div>

          {/* Rejected */}
          <div
            onClick={() => navigate('/user/records?status=Rejected')}
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#DC2626';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#66758A' }}>Rejected</span>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
            </div>
            <div>
              {isLoading ? (
                <div style={{ height: '32px', width: '60px', background: '#F1F5F9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#DC2626', lineHeight: 1.1 }}>
                  {stats.rejected}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= 5. MY RECENT SUBMISSIONS TABLE ================= */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          marginBottom: '28px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#172D49', margin: 0 }}>
              My Recent Submissions
            </h2>
            <Link
              to="/user/records"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#0F5C66',
                textDecoration: 'none'
              }}
            >
              View All My Records →
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>RECORD ID</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>UTILITY TYPE</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>LOCATION</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>DATE</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textAlign: 'right' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      Loading your submissions...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ color: '#172D49', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
                        No records submitted yet
                      </div>
                      <Link
                        to="/user/records/new"
                        style={{
                          backgroundColor: '#0F5C66',
                          color: '#ffffff',
                          padding: '9px 20px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        + Add Your First Record
                      </Link>
                    </td>
                  </tr>
                ) : (
                  records.map((item) => {
                    const typeColor = UTILITY_TYPE_COLORS[item.type] || '#0F5C66';
                    const badge = getStatusBadgeStyle(item.status);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          transition: 'background-color 0.12s ease'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '14px 24px', fontWeight: 700, color: '#172D49', fontSize: '13.5px' }}>
                          {item.recordId}
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#172D49' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: typeColor }} />
                            {item.type}
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#475569' }}>
                          {item.location}
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748B' }}>
                          {item.date}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '11.5px',
                            fontWeight: 700
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: badge.text }} />
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= 6. MODULE CARDS & 7. VERIFIED UTILITIES NEAR NASHIK ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {/* GIS Map */}
          <Link
            to="/user/map"
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '18px 20px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'border-color 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#0F5C66')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '6px',
              background: '#F0FDF4',
              color: '#0F5C66',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                <line x1="9" y1="3" x2="9" y2="18"></line>
                <line x1="15" y1="6" x2="15" y2="21"></line>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#172D49' }}>GIS Map</div>
            </div>
          </Link>

          {/* My Records */}
          <Link
            to="/user/records"
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '18px 20px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'border-color 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#0F5C66')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '6px',
              background: '#F8FAFC',
              color: '#0F5C66',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#172D49' }}>My Records</div>
            </div>
          </Link>

          {/* My Reports */}
          <Link
            to="/user/reports"
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '18px 20px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'border-color 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#0F5C66')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '6px',
              background: '#FFFBEB',
              color: '#0F5C66',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#172D49' }}>My Reports</div>
            </div>
          </Link>

          {/* 7. Small Card: Verified utilities near Nashik */}
          <Link
            to="/user/map"
            style={{
              background: 'linear-gradient(135deg, #0F5C66 0%, #157380 100%)',
              borderRadius: '6px',
              padding: '18px 20px',
              textDecoration: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(15, 92, 102, 0.25)',
              transition: 'transform 0.15s ease'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#CCFBF1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Nashik Utility Layer
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 0 0' }}>
                {stats.nashikVerifiedCount} Verified Assets
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                <line x1="9" y1="3" x2="9" y2="18"></line>
                <line x1="15" y1="6" x2="15" y2="21"></line>
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};
