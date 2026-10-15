import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';
import { useVerifierStats } from '../hooks/useVerifierStats';
import { usePendingQueue } from '../hooks/usePendingQueue';
import { useMyDecisions } from '../hooks/useMyDecisions';
import { UTILITY_TYPE_COLORS } from '../hooks/useDashboardStats';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const VerifierDashboardPage = () => {
  const { userProfile, currentUser, setSelectedUtilityId } = useUtilities();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  // 1. Supabase Custom Hooks
  const {
    stats,
    trendData,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useVerifierStats(currentUser?.id);

  const {
    pendingQueue,
    loading: queueLoading,
    error: queueError,
    refetch: refetchQueue
  } = usePendingQueue();

  const {
    decisions,
    loading: decisionsLoading,
    error: decisionsError,
    refetch: refetchDecisions
  } = useMyDecisions();

  const verifierName = userProfile?.fullName || 'Suresh Sharma';
  const isLoading = statsLoading || queueLoading || decisionsLoading;
  const isError = statsError || queueError || decisionsError;

  const handleRetry = () => {
    refetchStats();
    refetchQueue();
    refetchDecisions();
  };

  const handleReviewRecord = (recordId) => {
    setSelectedUtilityId(recordId);
    navigate(`/verifier/queue?id=${encodeURIComponent(recordId)}`);
  };

  // Filter pending queue
  const filteredQueue = pendingQueue.filter((item) => {
    const matchesSearch =
      item.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'All' || item.type === selectedType || item.rawType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <AppLayout title="Verifier Dashboard">
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
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#172D49',
              margin: '0 0 4px 0',
              letterSpacing: '-0.3px'
            }}>
              Verifier Dashboard
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#66758A',
              margin: 0
            }}>
              Welcome back, <strong style={{ color: '#0F5C66' }}>{verifierName}</strong>.
            </p>
          </div>

          <Link
            to="/verifier/queue"
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
              boxShadow: '0 1px 3px rgba(15, 92, 102, 0.2)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M9 14l2 2 4-4"></path>
            </svg>
            <span>Open Verification Queue</span>
          </Link>
        </div>

        {/* ERROR STATE WITH RETRY */}
        {isError && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '6px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#DC2626', fontSize: '14px', fontWeight: 600 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{statsError || queueError || decisionsError || 'Failed to sync verification records.'}</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              style={{
                background: '#ffffff',
                border: '1px solid #DC2626',
                color: '#DC2626',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= 2. STAT CARDS (4) ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* Awaiting Verification (Clickable -> /verifier/queue) */}
          <div
            onClick={() => navigate('/verifier/queue')}
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
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#66758A' }}>Awaiting Verification</span>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
            </div>
            <div>
              {isLoading ? (
                <div style={{ height: '32px', width: '60px', background: '#F1F5F9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#D97706', lineHeight: 1.1 }}>
                  {stats.awaiting}
                </div>
              )}
            </div>
          </div>

          {/* Approved Today */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#66758A' }}>Approved Today</span>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
            </div>
            <div>
              {isLoading ? (
                <div style={{ height: '32px', width: '60px', background: '#F1F5F9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#16A34A', lineHeight: 1.1 }}>
                  {stats.approvedToday}
                </div>
              )}
            </div>
          </div>

          {/* Rejected Today */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#66758A' }}>Rejected Today</span>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
            </div>
            <div>
              {isLoading ? (
                <div style={{ height: '32px', width: '60px', background: '#F1F5F9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#DC2626', lineHeight: 1.1 }}>
                  {stats.rejectedToday}
                </div>
              )}
            </div>
          </div>

          {/* Total Verified */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#66758A' }}>Total Verified</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F5C66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div>
              {isLoading ? (
                <div style={{ height: '32px', width: '60px', background: '#F1F5F9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#172D49', lineHeight: 1.1 }}>
                  {stats.totalVerified}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= 3. PENDING VERIFICATION TABLE (MAIN SECTION) ================= */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          marginBottom: '28px',
          overflow: 'hidden'
        }}>
          {/* Table Header & Controls */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#172D49', margin: 0 }}>
                Pending Verification Queue
              </h2>
            </div>

            {/* Filter Controls */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '7px 12px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B96A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search ID, type, location..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '13px',
                    color: '#172D49',
                    width: '180px'
                  }}
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#172D49',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Types</option>
                <option value="Water">Water</option>
                <option value="Gas">Gas</option>
                <option value="Electricity">Electricity</option>
                <option value="Sewage">Sewage</option>
                <option value="Telecom">Telecom</option>
              </select>
            </div>
          </div>

          {/* Pending Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>RECORD ID</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>UTILITY TYPE</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>LOCATION</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>SUBMITTED BY</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>SUBMITTED DATE</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>AGE</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      Loading pending verification queue...
                    </td>
                  </tr>
                ) : filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ color: '#16A34A', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                        ✓ No records waiting for verification
                      </div>
                      <div style={{ color: '#66758A', fontSize: '13px' }}>
                        All incoming underground survey records have been reviewed.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map((item) => {
                    const typeColor = UTILITY_TYPE_COLORS[item.type] || '#0F5C66';
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
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
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#475569' }}>
                          {item.submittedBy}
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748B' }}>
                          {item.submittedDate}
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', color: '#172D49', fontWeight: 500 }}>{item.ageText}</span>
                            {item.isOverdue && (
                              <span style={{
                                background: '#FFFBEB',
                                color: '#D97706',
                                border: '1px solid #FEF3C7',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}>
                                Overdue
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleReviewRecord(item.recordId)}
                            style={{
                              backgroundColor: '#0F5C66',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'background-color 0.12s ease'
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0c4951')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0F5C66')}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= 4. MODULE CARDS (3) ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* Verification Queue */}
          <Link
            to="/verifier/queue"
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
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                <path d="M9 14l2 2 4-4"></path>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#172D49' }}>Verification Queue</div>
            </div>
          </Link>

          {/* GIS Map (View Only) */}
          <Link
            to="/verifier/map"
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
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#172D49' }}>GIS Map (View Only)</div>
            </div>
          </Link>

          {/* Reports */}
          <Link
            to="/verifier/reports"
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
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#172D49' }}>Reports & Audit</div>
            </div>
          </Link>
        </div>

        {/* ================= 5. MY RECENT DECISIONS & 6. SMALL CHART ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}>
          {/* 5. My Recent Decisions Table (Latest 8) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172D49', margin: 0 }}>
                  My Recent Decisions
                </h3>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 18px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>RECORD ID</th>
                    <th style={{ padding: '10px 18px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>DECISION</th>
                    <th style={{ padding: '10px 18px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>REASON / NOTE</th>
                    <th style={{ padding: '10px 18px', fontSize: '12px', fontWeight: 600, color: '#64748B', textAlign: 'right' }}>TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        Loading decisions...
                      </td>
                    </tr>
                  ) : decisions.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        No decisions made recently.
                      </td>
                    </tr>
                  ) : (
                    decisions.map((d) => {
                      const isApp = d.decision === 'Approved';
                      return (
                        <tr key={d.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 18px', fontWeight: 700, color: '#172D49', fontSize: '13px' }}>
                            {d.recordId}
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: isApp ? '#F0FDF4' : '#FEF2F2',
                              color: isApp ? '#16A34A' : '#DC2626',
                              border: `1px solid ${isApp ? '#DCFCE7' : '#FEE2E2'}`,
                              borderRadius: '4px',
                              padding: '2px 7px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isApp ? '#16A34A' : '#DC2626' }} />
                              {d.decision}
                            </span>
                          </td>
                          <td style={{ padding: '12px 18px', fontSize: '12.5px', color: '#475569', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {d.reason}
                          </td>
                          <td style={{ padding: '12px 18px', fontSize: '12px', color: '#64748B', textAlign: 'right' }}>
                            {d.time}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Small Chart: Approved vs Rejected over last 7 days */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172D49', margin: 0 }}>
                Verification Decisions (Last 7 Days)
              </h3>
            </div>

            {isLoading ? (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748B', fontSize: '13px' }}>Loading chart...</div>
              </div>
            ) : (
              <div style={{ height: '200px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Bar dataKey="Approved" fill="#16A34A" radius={[3, 3, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="Rejected" fill="#DC2626" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
