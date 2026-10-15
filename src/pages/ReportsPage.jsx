import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';
import { UTILITY_TYPE_COLORS } from '../hooks/useDashboardStats';

export const ReportsPage = () => {
  const { utilities, currentRole } = useUtilities();

  const totalUtilities = utilities.length;
  const verifiedCount = utilities.filter(u => (u.status || '').toLowerCase() === 'verified').length;
  const pendingCount = utilities.filter(u => (u.status || '').toLowerCase() === 'pending').length;
  const correctionCount = utilities.filter(u => (u.status || '').toLowerCase() === 'rejected' || (u.status || '').toLowerCase().includes('correction')).length;

  const typeCounts = {
    Water: utilities.filter(u => (u.type || '').toLowerCase().includes('water')).length,
    Gas: utilities.filter(u => (u.type || '').toLowerCase().includes('gas')).length,
    Electricity: utilities.filter(u => (u.type || '').toLowerCase().includes('elec') || (u.type || '').toLowerCase().includes('power')).length,
    Fiber: utilities.filter(u => (u.type || '').toLowerCase().includes('fiber') || (u.type || '').toLowerCase().includes('tel')).length,
    Sewer: utilities.filter(u => (u.type || '').toLowerCase().includes('sew') || (u.type || '').toLowerCase().includes('swr')).length
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Type,Location,Depth,Status,Last Updated\n';
    const rows = utilities.map(u => `"${u.id}","${u.name}","${u.type}","${u.location}","${u.depth}","${u.status}","${u.lastUpdated}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infratrace_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout title="Reports & Analytics">
      <div style={{ padding: '28px 36px 60px', width: '100%', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#172d49', margin: 0 }}>
              Infrastructure Analytics & Compliance
            </h2>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0F5C66',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(15, 92, 102, 0.2)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Compliance Report (CSV)
          </button>
        </div>

        {/* Metric Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #dde3eb', borderRadius: '6px', padding: '20px' }}>
            <div style={{ color: '#66758a', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>TOTAL ASSETS</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#172d49' }}>{totalUtilities}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #dde3eb', borderRadius: '6px', padding: '20px' }}>
            <div style={{ color: '#397d62', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>VERIFIED & SAFE</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#397d62' }}>{verifiedCount}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #dde3eb', borderRadius: '6px', padding: '20px' }}>
            <div style={{ color: '#a67b31', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>PENDING VERIFICATION</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#a67b31' }}>{pendingCount}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #dde3eb', borderRadius: '6px', padding: '20px' }}>
            <div style={{ color: '#aa6654', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>CORRECTIONS REQUIRED</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#aa6654' }}>{correctionCount}</div>
          </div>
        </div>

        {/* Grid of details */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
          {/* Utility Distribution Breakdown */}
          <div style={{ background: '#ffffff', border: '1px solid #dde3eb', borderRadius: '6px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172d49', margin: '0 0 20px 0' }}>
              Asset Type Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {Object.entries(typeCounts).map(([type, count]) => {
                const pct = Math.round((count / (totalUtilities || 1)) * 100);
                const color = UTILITY_TYPE_COLORS[type] || '#0F5C66';
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>
                      <span style={{ color: '#172d49' }}>{type}</span>
                      <span style={{ color: '#66758a' }}>{count} assets ({pct}%)</span>
                    </div>
                    <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit & Compliance Health */}
          <div style={{ background: '#ffffff', border: '1px solid #dde3eb', borderRadius: '6px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172d49', margin: '0 0 20px 0' }}>
              Integrity Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#172d49' }}>Supabase RLS Active</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#172d49' }}>GIS Coordinate Precision Verified</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F5C66' }}>Active Viewer Role: {currentRole}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
