import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';

export const AddUtilityPage = () => {
  const { addUtility } = useUtilities();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'Water',
    id: 'WTR-004',
    name: 'MIDC water pipeline',
    location: 'MIDC, Nashik',
    depth: '1.2 m',
    owner: 'Water Department',
    status: 'Active',
    source: 'Department plan',
    document: 'MIDC_Water_Plan.pdf'
  });

  const [uploaded, setUploaded] = useState(false);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Water': return '#4384c4';
      case 'Gas': return '#cc9b43';
      case 'Electricity': return '#c16b62';
      case 'Fiber': return '#8974b4';
      case 'Sewer': return '#658e79';
      default: return '#3268ad';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addUtility({
      id: formData.id || 'WTR-004',
      name: formData.name || `${formData.location} ${formData.type} line`,
      type: formData.type,
      typeColor: getTypeColor(formData.type),
      location: formData.location || 'MIDC, Nashik',
      depth: formData.depth || '1.0 m',
      owner: formData.owner || 'City Infrastructure Board',
      physicalStatus: formData.status,
      source: formData.source,
      document: formData.document
    });
    navigate('/admin');
  };

  return (
    <AppLayout>
      <div className="add-utility-content" style={{ padding: '32px 40px 60px', width: '100%', maxWidth: '100%' }}>
        <div className="introduction">
          <div className="add-utility-record" style={{ fontWeight: 700 }}>Add Utility Record</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-and-map-preview">
            <div className="utility-record-form">
              <div className="form-introduction">
                <div className="utility-information" style={{ fontWeight: 700 }}>Utility information</div>
              </div>

              <div className="field-row">
                <div className="form-field">
                  <div className="utility-type" style={{ fontWeight: 700 }}>Utility Type</div>
                  <div className="input">
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '15.6px', color: '#172d49', fontWeight: 600 }}
                    >
                      <option value="Water">Water</option>
                      <option value="Gas">Gas</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Fiber">Fiber</option>
                      <option value="Sewer">Sewer</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <div className="utility-id" style={{ fontWeight: 700 }}>Utility ID</div>
                  <div className="input">
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      placeholder="Enter a new ID, e.g. WTR-004"
                      style={{ width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '15.6px', color: '#172d49' }}
                    />
                  </div>
                </div>
              </div>

              <div className="field-row">
                <div className="form-field">
                  <div className="location" style={{ fontWeight: 700 }}>Location</div>
                  <div className="input">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter street or area"
                      style={{ width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '15.6px', color: '#172d49' }}
                    />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b96a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                </div>

                <div className="form-field">
                  <div className="depth" style={{ fontWeight: 700 }}>Depth</div>
                  <div className="input">
                    <input
                      type="text"
                      value={formData.depth}
                      onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                      placeholder="Enter depth in metres, e.g. 1.2"
                      style={{ width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '15.6px', color: '#172d49' }}
                    />
                  </div>
                </div>
              </div>

              <div className="field-row">
                <div className="form-field">
                  <div className="owner-department" style={{ fontWeight: 700 }}>Owner/Department</div>
                  <div className="input">
                    <input
                      type="text"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      placeholder="Enter owner or department"
                      style={{ width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '15.6px', color: '#172d49' }}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <div className="status" style={{ fontWeight: 700 }}>Status</div>
                  <div className="input">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '15.6px', color: '#172d49', fontWeight: 600 }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="field-row">
                <div className="form-field">
                  <div className="source" style={{ fontWeight: 700 }}>Source</div>
                  <div className="input">
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '15.6px', color: '#172d49', fontWeight: 600 }}
                    >
                      <option value="Department plan">Department plan</option>
                      <option value="Field survey">Field survey</option>
                      <option value="Contractor plan">Contractor plan</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <div className="last-verified-date" style={{ fontWeight: 700 }}>Last Verified Date</div>
                  <div className="input">
                    <div className="not-verified-yet" style={{ color: '#8b96a5' }}>Not verified yet</div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b96a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              <div className="supporting-document">
                <div className="supporting-document2" style={{ fontWeight: 700 }}>Supporting document</div>
                <div
                  className="upload-area"
                  onClick={() => setUploaded(!uploaded)}
                  style={{ cursor: 'pointer', border: uploaded ? '1.5px dashed #3268ad' : '1px dashed #dde3eb' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3268ad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <div className="upload-instructions">
                    <div className="attach-a-survey-plan-or-department-record" style={{ fontWeight: 600 }}>
                      {uploaded ? 'MIDC_Utility_Document_Attached.pdf (3.4 MB)' : 'Attach a survey, plan or department record'}
                    </div>
                  </div>
                  <div className="action">
                    <div className="upload-document" style={{ fontWeight: 700 }}>{uploaded ? 'File Uploaded' : 'Upload Document'}</div>
                  </div>
                </div>
              </div>

              <div className="verification-note">
                <div className="next-step" style={{ fontWeight: 700 }}>Next step</div>
                <div className="a-verifier-checks-your-record-it-appears-on-the-user-map-only-after-approval">
                  A Verifier checks your record. It appears on the user map only after approval.
                </div>
              </div>
            </div>

            <div className="location-preview">
              <div className="map-preview">
                <div className="map-heading">
                  <div className="map-preview2" style={{ fontWeight: 700 }}>Map preview</div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#66758a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                    <line x1="9" y1="3" x2="9" y2="18"></line>
                    <line x1="15" y1="6" x2="15" y2="21"></line>
                  </svg>
                </div>

                <div className="westbrook-demo-map" style={{ position: 'relative' }}>
                  <div className="park"></div>
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
                  <div className="road"></div>
                  <div className="road2"></div>
                  <div className="road3"></div>
                  <div className="road4"></div>
                  <div className="road5"></div>
                  <div className="road6"></div>
                  <div className="road7"></div>

                  <div className="water-line"></div>
                  <div className="main-road">MAIN ROAD</div>
                  <div className="industrial-road">INDUSTRIAL ROAD</div>
                  <div className="service-road">SERVICE ROAD</div>
                  <div className="open-space">Open space</div>
                  <div className="midc">MIDC</div>

                  <div className="ellipse" style={{ position: 'absolute', left: '260px', top: '220px', width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #3268ad', background: 'rgba(50, 104, 173, 0.2)' }}></div>
                  <div className="ellipse2" style={{ position: 'absolute', left: '267px', top: '227px', width: '10px', height: '10px', borderRadius: '50%', background: '#3268ad' }}></div>

                  <div className="frame" style={{ position: 'absolute', left: '200px', top: '180px', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #dde3eb' }}>
                    <div className="new-location" style={{ fontSize: '13px', color: '#172d49', fontWeight: 700 }}>New location</div>
                  </div>

                  <div className="frame2">
                    <div className="midc-nashik" style={{ fontWeight: 600 }}>MIDC, Nashik</div>
                  </div>

                  <div className="frame3">
                    <div className="frame4" style={{ cursor: 'pointer' }}>
                      <div className="div">+</div>
                    </div>
                    <div className="frame4" style={{ cursor: 'pointer' }}>
                      <div className="div">−</div>
                    </div>
                  </div>
                </div>

                <div className="map-instructions">
                  <div className="choose-a-location" style={{ fontWeight: 600 }}>Click on the map to place utility coordinate</div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <div className="actions">
              <button
                type="submit"
                className="action2"
                style={{ border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                <div className="send-for-verification" style={{ fontWeight: 700 }}>Send for Verification</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
