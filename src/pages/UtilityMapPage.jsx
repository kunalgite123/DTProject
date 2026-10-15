import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';
import L from 'leaflet';
import { UTILITY_TYPE_COLORS } from '../hooks/useDashboardStats';

const NASHIK_CENTER = [19.9975, 73.7898];

export const UtilityMapPage = () => {
  const { utilities, selectedUtility, setSelectedUtilityId } = useUtilities();
  const [searchTerm, setSearchTerm] = useState('');
  const [layers, setLayers] = useState({
    Water: true,
    Gas: true,
    Electricity: true,
    Fiber: true,
    Sewer: true
  });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  const currentSelected = selectedUtility || utilities[0];

  const toggleLayer = (type) => {
    setLayers(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: NASHIK_CENTER,
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when utilities, layers, or search changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const filtered = utilities.filter(item => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());

      const itemType = item.type || 'Water';
      const isLayerActive =
        (itemType.includes('Water') && layers.Water) ||
        (itemType.includes('Gas') && layers.Gas) ||
        ((itemType.includes('Elec') || itemType.includes('Power')) && layers.Electricity) ||
        ((itemType.includes('Fiber') || itemType.includes('Tel')) && layers.Fiber) ||
        ((itemType.includes('Sew') || itemType.includes('SWR')) && layers.Sewer);

      return matchesSearch && isLayerActive;
    });

    const bounds = [];
    const waterPoints = [];
    const gasPoints = [];
    const elecPoints = [];

    filtered.forEach((item, index) => {
      const lat = parseFloat(item.latitude) || (NASHIK_CENTER[0] + (index * 0.003 - 0.006));
      const lng = parseFloat(item.longitude) || (NASHIK_CENTER[1] + (index * 0.004 - 0.008));
      const pos = [lat, lng];
      bounds.push(pos);

      const itemType = item.type || 'Water';
      let color = UTILITY_TYPE_COLORS.Water;
      if (itemType.includes('Gas')) color = UTILITY_TYPE_COLORS.Gas;
      else if (itemType.includes('Elec') || itemType.includes('Power')) color = UTILITY_TYPE_COLORS.Electricity;
      else if (itemType.includes('Fiber') || itemType.includes('Tel')) color = UTILITY_TYPE_COLORS.Telecom;
      else if (itemType.includes('Sew') || itemType.includes('SWR')) color = UTILITY_TYPE_COLORS.Sewage;

      if (itemType.includes('Water')) waterPoints.push(pos);
      if (itemType.includes('Gas')) gasPoints.push(pos);
      if (itemType.includes('Elec')) elecPoints.push(pos);

      const isSelected = item.id === currentSelected?.id;

      // Circle Marker
      const marker = L.circleMarker(pos, {
        radius: isSelected ? 9 : 7,
        fillColor: color,
        color: isSelected ? '#172D49' : '#ffffff',
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.95
      });

      // Tooltip / Popup
      marker.bindTooltip(`<strong>${item.id}</strong> · ${item.type}<br/>${item.location}`, {
        direction: 'top',
        offset: [0, -8],
        className: 'custom-leaflet-tooltip'
      });

      marker.on('click', () => {
        setSelectedUtilityId(item.id);
      });

      marker.addTo(layerGroup);
    });

    // Draw connecting utility lines for active layers
    if (layers.Water && waterPoints.length > 1) {
      L.polyline(waterPoints, { color: UTILITY_TYPE_COLORS.Water, weight: 3.5, opacity: 0.8, dashArray: '4, 6' }).addTo(layerGroup);
    }
    if (layers.Gas && gasPoints.length > 1) {
      L.polyline(gasPoints, { color: UTILITY_TYPE_COLORS.Gas, weight: 3.5, opacity: 0.8 }).addTo(layerGroup);
    }
    if (layers.Electricity && elecPoints.length > 1) {
      L.polyline(elecPoints, { color: UTILITY_TYPE_COLORS.Electricity, weight: 3.5, opacity: 0.8, dashArray: '8, 4' }).addTo(layerGroup);
    }

    // Adjust bounds if searching
    if (searchTerm && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } catch {
        // ignore
      }
    }
  }, [utilities, layers, searchTerm, currentSelected, setSelectedUtilityId]);

  return (
    <AppLayout title="GIS Utility Map">
      <div style={{
        padding: '24px 32px 40px',
        width: '100%',
        maxWidth: '100%',
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Top Search Bar */}
        <div style={{
          marginBottom: '20px',
          background: '#ffffff',
          border: '1px solid #dde3eb',
          borderRadius: '8px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b96a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search utility ID, name, or location..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: '14.5px',
              color: '#172d49'
            }}
          />
          {searchTerm && (
            <span
              onClick={() => setSearchTerm('')}
              style={{ cursor: 'pointer', color: '#8b96a5', fontSize: '13px', fontWeight: 600 }}
            >
              Clear
            </span>
          )}
        </div>

        {/* 3-Column Workspace */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr 340px',
          gap: '20px',
          height: 'calc(100vh - 200px)',
          minHeight: '560px'
        }}>
          {/* 1. Left Column: Layer Controls */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #dde3eb',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#172d49',
              margin: '0 0 16px 0'
            }}>
              Utility layers
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Water */}
              <div
                onClick={() => toggleLayer('Water')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: layers.Water ? '#f8fafc' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={layers.Water}
                  onChange={() => {}}
                  style={{ accentColor: '#0284C7', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <div style={{ width: '14px', height: '3.5px', backgroundColor: '#0284C7', borderRadius: '2px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#172d49' }}>Water</span>
              </div>

              {/* Gas */}
              <div
                onClick={() => toggleLayer('Gas')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: layers.Gas ? '#f8fafc' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={layers.Gas}
                  onChange={() => {}}
                  style={{ accentColor: '#F59E0B', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <div style={{ width: '14px', height: '3.5px', backgroundColor: '#F59E0B', borderRadius: '2px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#172d49' }}>Gas</span>
              </div>

              {/* Electricity */}
              <div
                onClick={() => toggleLayer('Electricity')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: layers.Electricity ? '#f8fafc' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={layers.Electricity}
                  onChange={() => {}}
                  style={{ accentColor: '#EF4444', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <div style={{ width: '14px', height: '3.5px', backgroundColor: '#EF4444', borderRadius: '2px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#172d49' }}>Electricity</span>
              </div>

              {/* Fiber */}
              <div
                onClick={() => toggleLayer('Fiber')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: layers.Fiber ? '#f8fafc' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={layers.Fiber}
                  onChange={() => {}}
                  style={{ accentColor: '#8B5CF6', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <div style={{ width: '14px', height: '3.5px', backgroundColor: '#8B5CF6', borderRadius: '2px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#172d49' }}>Fiber</span>
              </div>

              {/* Sewer */}
              <div
                onClick={() => toggleLayer('Sewer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: layers.Sewer ? '#f8fafc' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={layers.Sewer}
                  onChange={() => {}}
                  style={{ accentColor: '#10B981', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <div style={{ width: '14px', height: '3.5px', backgroundColor: '#10B981', borderRadius: '2px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#172d49' }}>Sewer</span>
              </div>
            </div>
          </div>

          {/* 2. Center Column: Interactive Leaflet Map */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #dde3eb',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

            {/* Region Tag on Map */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '52px',
              background: '#ffffff',
              color: '#172d49',
              border: '1px solid #dde3eb',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              zIndex: 500,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}>
              MIDC Sector · Nashik
            </div>
          </div>

          {/* 3. Right Column: Utility Details */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #dde3eb',
            borderRadius: '10px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#172d49',
              margin: '0 0 16px 0'
            }}>
              Utility Details
            </h3>

            {currentSelected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Title & Status */}
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#172d49', marginBottom: '6px' }}>
                    {currentSelected.name}
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '4px',
                    background: currentSelected.status === 'Verified' ? '#eff7f2' : currentSelected.status === 'Pending' ? '#fcf6e9' : '#fdf2f0',
                    color: currentSelected.status === 'Verified' ? '#397d62' : currentSelected.status === 'Pending' ? '#a67b31' : '#aa6654'
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: currentSelected.status === 'Verified' ? '#397d62' : currentSelected.status === 'Pending' ? '#a67b31' : '#aa6654'
                    }} />
                    {currentSelected.status}
                  </span>
                </div>

                <div style={{ height: '1px', background: '#e2eaf4' }} />

                {/* Details List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#66758a', textTransform: 'uppercase' }}>Utility ID</div>
                    <div style={{ fontWeight: 700, color: '#172d49', marginTop: '2px' }}>{currentSelected.id}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#66758a', textTransform: 'uppercase' }}>Type</div>
                    <div style={{ fontWeight: 600, color: '#172d49', marginTop: '2px' }}>{currentSelected.type}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#66758a', textTransform: 'uppercase' }}>Location</div>
                    <div style={{ fontWeight: 600, color: '#172d49', marginTop: '2px' }}>{currentSelected.location}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#66758a', textTransform: 'uppercase' }}>Depth</div>
                    <div style={{ fontWeight: 600, color: '#172d49', marginTop: '2px' }}>{currentSelected.depth || '1.0 m'}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#66758a', textTransform: 'uppercase' }}>Owner / Source</div>
                    <div style={{ fontWeight: 600, color: '#172d49', marginTop: '2px' }}>{currentSelected.owner || currentSelected.source || 'Municipal Department'}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#66758a', textTransform: 'uppercase' }}>Last updated</div>
                    <div style={{ fontWeight: 600, color: '#66758a', marginTop: '2px' }}>{currentSelected.lastUpdated || 'Recent'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#66758a', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>
                Select a marker on the map to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
