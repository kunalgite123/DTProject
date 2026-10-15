import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';

export const VerificationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { utilities, selectedUtility, updateVerificationStatus } = useUtilities();
  const [notes, setNotes] = useState('');

  const record = utilities.find(u => u.id === id) || selectedUtility || utilities[0];

  const handleDecision = (status) => {
    updateVerificationStatus(record.id, status, notes);
    navigate('/verifier');
  };

  return (
    <AppLayout>
      <div className="review-content" style={{ padding: '32px 40px 60px', width: '100%', maxWidth: '100%' }}>
        <div className="page-heading">
          <div className="introduction">
            <div className="review-utility-record" style={{ fontWeight: 700 }}>Review Utility Record</div>
          </div>
          <Link to="/verifier" className="action" style={{ textDecoration: 'none', cursor: 'pointer', fontWeight: 700, background: '#ffffff', color: '#3268ad', border: '1px solid #dde3eb' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3268ad" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <div className="back-to-pending-records" style={{ fontWeight: 700 }}>Back to Pending Records</div>
          </Link>
        </div>

        <div className="map-and-record-details">
          <div className="utility-map">
            <div className="map-heading">
              <div className="midc-gas-line" style={{ fontWeight: 700 }}>{record.name}</div>
              <div className="record-status">
                <div className="ellipse"></div>
                <div className="pending" style={{ fontWeight: 700 }}>{record.status}</div>
              </div>
            </div>

            <div className="map-area" style={{ position: 'relative' }}>
              <div className="road"></div>
              <div className="road2"></div>
              <div className="road3"></div>
              <div className="road4"></div>
              <div className="road5"></div>
              <div className="road6"></div>
              <div className="road7"></div>

              <div className="building"></div>
              <div className="building2"></div>
              <div className="building3"></div>
              <div className="building4"></div>
              <div className="building5"></div>
              <div className="building6"></div>
              <div className="building7"></div>
              <div className="building8"></div>
              <div className="building9"></div>
              <div className="building10"></div>
              <div className="building11"></div>
              <div className="building12"></div>
              <div className="building13"></div>
              <div className="building14"></div>
              <div className="building15"></div>
              <div className="building16"></div>

              <div className="park"></div>
              <div className="water-line"></div>

              <div className="main-road">MAIN ROAD</div>
              <div className="industrial-avenue">INDUSTRIAL AVENUE</div>
              <div className="service-road">SERVICE ROAD</div>
              <div className="open-space">OPEN SPACE</div>
              <div className="midc">MIDC</div>

              <div className="selection-halo" style={{ position: 'absolute', left: '218px', top: '250px' }}></div>
              <div className="selected-marker" style={{ position: 'absolute', left: '226px', top: '258px', backgroundColor: record.typeColor || '#cc9b43' }}></div>

              <div className="selected-utility-label" style={{ position: 'absolute', left: '148px', top: '215px' }}>
                <div className="gas-001-gas" style={{ fontWeight: 700 }}>{record.id} · {record.type}</div>
              </div>

              <div className="map-area2">
                <div className="midc-nashik" style={{ fontWeight: 600 }}>{record.location}</div>
              </div>

              <div className="zoom-controls">
                <div className="frame" style={{ cursor: 'pointer' }}>
                  <div className="div">+</div>
                </div>
                <div className="frame" style={{ cursor: 'pointer' }}>
                  <div className="div">−</div>
                </div>
              </div>

              <div className="map-note">
                <div className="sample-map-midc-nashik" style={{ fontWeight: 600 }}>Sample map · MIDC, Nashik</div>
              </div>
            </div>

            <div className="map-legend">
              <div className="frame2">
                <div className="rectangle"></div>
                <div className="gas" style={{ fontWeight: 600 }}>Gas</div>
              </div>
              <div className="frame2">
                <div className="rectangle2"></div>
                <div className="water" style={{ fontWeight: 600 }}>Water</div>
              </div>
              <div className="frame2">
                <div className="rectangle3"></div>
                <div className="electricity" style={{ fontWeight: 600 }}>Electricity</div>
              </div>
              <div className="frame2">
                <div className="rectangle4"></div>
                <div className="fiber" style={{ fontWeight: 600 }}>Fiber</div>
              </div>
              <div className="frame2">
                <div className="rectangle5"></div>
                <div className="sewer" style={{ fontWeight: 600 }}>Sewer</div>
              </div>
            </div>
          </div>

          <div className="utility-details">
            <div className="record-details" style={{ fontWeight: 700 }}>Record details</div>
            <div className="rectangle6"></div>

            <div className="frame3">
              <div className="frame4">
                <div className="id" style={{ fontWeight: 600 }}>ID</div>
                <div className="gas-001" style={{ color: '#172d49', fontWeight: 700 }}>{record.id}</div>
              </div>
              <div className="frame4">
                <div className="type" style={{ fontWeight: 600 }}>Type</div>
                <div className="gas2" style={{ fontWeight: 600 }}>{record.type}</div>
              </div>
              <div className="frame4">
                <div className="location" style={{ fontWeight: 600 }}>Location</div>
                <div className="midc-nashik2" style={{ fontWeight: 600 }}>{record.location}</div>
              </div>
              <div className="frame4">
                <div className="depth" style={{ fontWeight: 600 }}>Depth</div>
                <div className="_0-9-m" style={{ fontWeight: 600 }}>{record.depth}</div>
              </div>
              <div className="frame4">
                <div className="owner" style={{ fontWeight: 600 }}>Owner</div>
                <div className="gas-department" style={{ fontWeight: 600 }}>{record.owner}</div>
              </div>
              <div className="frame4">
                <div className="physical-status" style={{ fontWeight: 600 }}>Physical Status</div>
                <div className="active" style={{ fontWeight: 600 }}>{record.physicalStatus}</div>
              </div>
              <div className="frame4">
                <div className="source" style={{ fontWeight: 600 }}>Source</div>
                <div className="department-plan" style={{ fontWeight: 600 }}>{record.source}</div>
              </div>
              <div className="frame4">
                <div className="last-updated" style={{ fontWeight: 600 }}>Last Updated</div>
                <div className="_03-oct-2026" style={{ fontWeight: 600 }}>{record.lastUpdated}</div>
              </div>
              <div className="frame5">
                <div className="verification-status" style={{ fontWeight: 600 }}>Verification Status</div>
                <div className="frame6">
                  <div className="ellipse"></div>
                  <div className="pending" style={{ fontWeight: 700 }}>{record.status}</div>
                </div>
              </div>
            </div>

            <div className="rectangle6"></div>

            <div className="frame7">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3268ad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <div className="frame8">
                <div className="midc-gas-plan-pdf" style={{ fontWeight: 700 }}>{record.document || 'MIDC_Gas_Plan.pdf'}</div>
                <div className="submitted-by-a-patel-admin-03-oct-2026" style={{ fontWeight: 600 }}>
                  Submitted by {record.submittedBy || 'A. Patel (Admin)'} · {record.lastUpdated}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="verification-decision">
          <div className="verification-notes">
            <div className="verification-notes2" style={{ fontWeight: 700 }}>Verification Notes</div>
            <div className="frame9">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your findings, source checks or corrections needed…"
                style={{ width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent', resize: 'none', fontFamily: 'inherit', fontSize: '15.6px', color: '#172d49' }}
              />
            </div>
          </div>

          <div className="decision-actions">
            <div className="frame10">
              <button
                type="button"
                className="frame11"
                onClick={() => handleDecision('Verified')}
                style={{ border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <div className="verify-record" style={{ fontWeight: 700 }}>Verify Record</div>
              </button>

              <button
                type="button"
                className="frame12"
                onClick={() => handleDecision('Needs Correction')}
                style={{ border: '1px solid #dde3eb', cursor: 'pointer', fontWeight: 700 }}
              >
                <div className="needs-correction" style={{ fontWeight: 700 }}>Needs Correction</div>
              </button>

              <button
                type="button"
                className="frame12"
                onClick={() => handleDecision('Rejected')}
                style={{ border: '1px solid #dde3eb', cursor: 'pointer', fontWeight: 700 }}
              >
                <div className="reject-record" style={{ fontWeight: 700 }}>Reject Record</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
