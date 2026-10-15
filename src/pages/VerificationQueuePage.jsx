import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';

export const VerificationQueuePage = () => {
  const { utilities, setSelectedUtilityId } = useUtilities();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');

  const [searchTerm, setSearchTerm] = useState(idParam || '');

  useEffect(() => {
    if (idParam) {
      setSearchTerm(idParam);
    }
  }, [idParam]);

  const pendingRecords = utilities.filter(item => {
    const isPending = (item.status || '').toLowerCase() === 'pending';
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    return isPending && matchesSearch;
  });

  const handleReview = (id) => {
    setSelectedUtilityId(id);
    navigate(`/verifier/review/${id}`);
  };

  return (
    <AppLayout title="Verification Queue">
      <div style={{ padding: '32px 40px 60px', width: '100%', maxWidth: '100%' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#172d49', margin: 0 }}>
            Pending Verification Queue
          </h2>
        </div>

        {/* Search */}
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
              placeholder="Search pending queue by ID, type, or location..."
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
        </div>

        {/* Table */}
        <div style={{ background: '#ffffff', border: '1px solid #dde3eb', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #dde3eb' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>UTILITY ID</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>TYPE</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>LOCATION</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>DEPTH</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>SOURCE</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>SUBMITTED BY</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {pendingRecords.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#172d49' }}>
                    {item.id}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.typeColor || '#cc9b43' }}></span>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#475569' }}>
                    {item.location}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#475569' }}>
                    {item.depth}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#66758a', fontSize: '13px' }}>
                    {item.source}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#172d49', fontWeight: 600, fontSize: '13px' }}>
                    {item.submittedBy || 'A. Patel (Admin)'}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleReview(item.id)}
                      style={{
                        backgroundColor: '#3268ad',
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pendingRecords.length === 0 && (
            <div style={{ padding: '36px', textAlign: 'center', color: '#66758a', fontWeight: 600 }}>
              All records have been reviewed! No items in queue.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
