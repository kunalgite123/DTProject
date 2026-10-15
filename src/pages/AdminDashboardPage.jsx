import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';
import { useDashboardStats, UTILITY_TYPE_COLORS } from '../hooks/useDashboardStats';
import { useRecentActivity } from '../hooks/useRecentActivity';
import { AdminMapPreview } from '../components/AdminMapPreview';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const AdminDashboardPage = () => {
  const { userProfile, currentRole } = useUtilities();
  const navigate = useNavigate();

  const {
    stats,
    typeData,
    monthlyData,
    userCounts,
    utilities,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useDashboardStats();

  const {
    activities,
    loading: activityLoading,
    error: activityError,
    refetch: refetchActivity
  } = useRecentActivity();

  const adminName = userProfile?.fullName || 'Anil Patel';
  const isLoading = statsLoading || activityLoading;
  const isError = statsError || activityError;

  const handleRetry = () => {
    refetchStats();
    refetchActivity();
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'verified') {
      return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7' };
    }
    if (s === 'pending') {
      return { bg: '#FFFBEB', text: '#D97706', border: '#FEF3C7' };
    }
    if (s === 'rejected' || s.includes('correction')) {
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FEE2E2' };
    }
    return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
  };

  return (
    <AppLayout title="Admin Dashboard">
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
              Admin Dashboard
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#66758A',
              margin: 0
            }}>
              Welcome back, <strong style={{ color: '#0F5C66' }}>{adminName}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/records/new')}
            style={{
              backgroundColor: '#0F5C66',
              color: '#ffffff',
              border: '1px solid #0F5C66',
              borderRadius: '6px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
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
            <span>Add Utility Data</span>
          </button>
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
              <span>{statsError || activityError || 'An error occurred while loading dashboard metrics.'}</span>
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
          marginBottom: '24px'
        }}>
          {/* Total Records */}
          <div
            onClick={() => navigate('/admin/records')}
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
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
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#66758A' }}>Total Records</span>
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
              <span style={{ fontSize: '12px', color: '#66758A', marginTop: '6px', display: 'inline-block' }}>
                All registered underground utilities
              </span>
            </div>
          </div>

          {/* Verified Records */}
          <div
            onClick={() => navigate('/admin/records?status=Verified')}
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
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
              <span style={{ fontSize: '12px', color: '#66758A', marginTop: '6px', display: 'inline-block' }}>
                Approved by municipal verifiers
              </span>
            </div>
          </div>

          {/* Pending Records */}
          <div
            onClick={() => navigate('/admin/records?status=Pending')}
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
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
              <span style={{ fontSize: '12px', color: '#66758A', marginTop: '6px', display: 'inline-block' }}>
                Awaiting verifier review & sign-off
              </span>
            </div>
          </div>

          {/* Rejected Records */}
          <div
            onClick={() => navigate('/admin/records?status=Rejected')}
            style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
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
              <span style={{ fontSize: '12px', color: '#66758A', marginTop: '6px', display: 'inline-block' }}>
                Requires correction or field resurvey
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. MODULE CARDS (3) ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* GIS Map */}
          <Link
            to="/admin/map"
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

          {/* Record Management */}
          <Link
            to="/admin/records"
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
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#172D49' }}>Record Management</div>
            </div>
          </Link>

          {/* Reports */}
          <Link
            to="/admin/reports"
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
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#172D49' }}>Reports</div>
            </div>
          </Link>
        </div>

        {/* ================= 4. TWO CHARTS SIDE BY SIDE (RECHARTS) ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          marginBottom: '28px'
        }}>
          {/* Donut Chart: Records by Utility Type */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172D49', margin: 0 }}>
                  Records by Utility Type
                </h3>
              </div>
            </div>

            {isLoading ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748B', fontSize: '13px' }}>Loading chart data...</div>
              </div>
            ) : typeData.every(t => t.value === 0) ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '13px' }}>
                No utility records available.
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', height: '220px' }}>
                <div style={{ flex: 1, height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {typeData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#ffffff',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
                  {typeData.map((item) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.color }} />
                        <span style={{ fontWeight: 600, color: '#172D49' }}>{item.name}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#66758A' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bar Chart: Records per Month */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172D49', margin: 0 }}>
                  Records Registered per Month
                </h3>
              </div>
            </div>

            {isLoading ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748B', fontSize: '13px' }}>Loading chart data...</div>
              </div>
            ) : (
              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    />
                    <Bar dataKey="records" fill="#0F5C66" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ================= 5. RECENT ACTIVITY TABLE ================= */}
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
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172D49', margin: 0 }}>
                Recent Activity
              </h3>
            </div>
            <Link
              to="/admin/records"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#0F5C66',
                textDecoration: 'none'
              }}
            >
              View All Records →
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>RECORD ID</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>ACTION</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>BY</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>TIME</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textAlign: 'right' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      Loading recent activity log...
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      No recent activities recorded yet.
                    </td>
                  </tr>
                ) : (
                  activities.map((item) => {
                    const badge = getStatusBadgeStyle(item.status);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => navigate(`/admin/records?id=${encodeURIComponent(item.recordId)}`)}
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
                        <td style={{ padding: '14px 24px', fontSize: '13.5px', color: '#172D49', fontWeight: 500 }}>
                          {item.action}
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748B' }}>
                          {item.by}
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748B' }}>
                          {item.time}
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

        {/* ================= 6. MAP PREVIEW & 7. USERS OVERVIEW ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {/* 6. Map Preview (Small Leaflet Map) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172D49', margin: 0 }}>
                  GIS Map Overview
                </h3>
              </div>
              <Link
                to="/admin/map"
                style={{ fontSize: '13px', fontWeight: 600, color: '#0F5C66', textDecoration: 'none' }}
              >
                Open Map →
              </Link>
            </div>

            <AdminMapPreview utilities={utilities} />
          </div>

          {/* 7. Users Overview Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172D49', margin: 0 }}>
                    Users Directory
                  </h3>
                </div>
                <Link
                  to="/admin/users"
                  style={{ fontSize: '13px', fontWeight: 600, color: '#0F5C66', textDecoration: 'none' }}
                >
                  Manage Users →
                </Link>
              </div>

              {/* Grid of User Roles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {/* Users Count */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Field Users
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F5C66', margin: '4px 0 0 0' }}>
                    {isLoading ? '-' : userCounts.users}
                  </div>
                </div>

                {/* Verifiers Count */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Verifiers
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F5C66', margin: '4px 0 0 0' }}>
                    {isLoading ? '-' : userCounts.verifiers}
                  </div>
                </div>

                {/* Admins Count */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Admins
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F5C66', margin: '4px 0 0 0' }}>
                    {isLoading ? '-' : userCounts.admins}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link Button */}
            <Link
              to="/admin/users"
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '10px 14px',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#172D49',
                fontSize: '13px',
                fontWeight: 600,
                display: 'block',
                transition: 'background-color 0.15s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            >
              Open Full User Directory ({userCounts.total || '5'} Total Accounts) →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
