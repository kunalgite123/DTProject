import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';

export const RecordsPage = () => {
  const { utilities, currentRole, setSelectedUtilityId, updateVerificationStatus } = useUtilities();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const statusParam = searchParams.get('status');
  const idParam = searchParams.get('id');

  const [searchTerm, setSearchTerm] = useState(idParam || '');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(statusParam || 'All');

  useEffect(() => {
    if (statusParam) {
      setSelectedStatus(statusParam);
    }
  }, [statusParam]);

  useEffect(() => {
    if (idParam) {
      setSearchTerm(idParam);
    }
  }, [idParam]);

  // Filter utilities
  const filteredUtilities = utilities.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleView = (id) => {
    setSelectedUtilityId(id);
    navigate('/map');
  };

  const handleSendForVerification = (id) => {
    updateVerificationStatus(id, 'Pending', 'Submitted for verifier review');
  };

  return (
    <AppLayout title={currentRole === 'User' ? 'My Utility Records' : 'All Utility Records'}>
      <div style={{ padding: '32px 40px 60px', width: '100%', maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#172d49', margin: 0 }}>
              {currentRole === 'User' ? 'My Infrastructure Records' : 'Infrastructure Asset Registry'}
            </h2>
          </div>

          {currentRole === 'Admin' && (
            <Link
              to="/admin/add-utility"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#3268ad',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Utility
            </Link>
          )}
        </div>

        {/* Filter controls */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          background: '#ffffff',
          border: '1px solid #dde3eb',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            flex: 1,
            minWidth: '240px',
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
              placeholder="Search by ID, name, or location..."
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

          <div style={{ minWidth: '160px' }}>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
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
              <option value="All">All Types</option>
              <option value="Water">Water</option>
              <option value="Gas">Gas</option>
              <option value="Electricity">Electricity</option>
              <option value="Fiber">Fiber</option>
              <option value="Sewer">Sewer</option>
            </select>
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Needs Correction">Needs Correction</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div style={{ background: '#ffffff', border: '1px solid #dde3eb', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #dde3eb' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>UTILITY ID</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>NAME</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>TYPE</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>LOCATION</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>STATUS</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a' }}>LAST UPDATED</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#66758a', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUtilities.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#172d49' }}>
                    {item.id}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#172d49' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.typeColor || '#3268ad' }}></span>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#475569' }}>
                    {item.location}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: item.status === 'Verified' ? '#eff7f2' : item.status === 'Pending' ? '#fcf6e9' : item.status === 'Needs Correction' ? '#fdf2f0' : '#f2f6fc',
                      color: item.status === 'Verified' ? '#397d62' : item.status === 'Pending' ? '#a67b31' : item.status === 'Needs Correction' ? '#aa6654' : '#66758a'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#66758a', fontSize: '13px' }}>
                    {item.lastUpdated}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleView(item.id)}
                        style={{ color: '#3268ad', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                      >
                        View on Map
                      </button>
                      {currentRole === 'Admin' && (item.status === 'Needs Correction' || item.status === 'Draft') && (
                        <button
                          type="button"
                          onClick={() => handleSendForVerification(item.id)}
                          style={{ color: '#a67b31', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUtilities.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#66758a' }}>
              No records found matching your filters.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
