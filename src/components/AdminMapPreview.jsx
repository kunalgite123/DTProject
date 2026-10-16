import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { UTILITY_TYPE_COLORS } from '../hooks/useDashboardStats';

const DEFAULT_LAT = 19.9975;
const DEFAULT_LNG = 73.7898;

export const AdminMapPreview = ({ utilities = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current) return;

    // Prevent re-initialization if map already exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [DEFAULT_LAT, DEFAULT_LNG],
        zoom: 13,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: false
      });

      L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing markers if any
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for utilities
    if (utilities.length > 0) {
      const bounds = [];
      utilities.forEach((u) => {
        const lat = parseFloat(u.latitude) || (DEFAULT_LAT + (Math.random() - 0.5) * 0.03);
        const lng = parseFloat(u.longitude) || (DEFAULT_LNG + (Math.random() - 0.5) * 0.03);

        const typeKey = (u.type || '').toLowerCase();
        let color = UTILITY_TYPE_COLORS.Water;
        if (typeKey.includes('elec') || typeKey.includes('power')) color = UTILITY_TYPE_COLORS.Electricity;
        else if (typeKey.includes('gas')) color = UTILITY_TYPE_COLORS.Gas;
        else if (typeKey.includes('sew') || typeKey.includes('swr')) color = UTILITY_TYPE_COLORS.Sewage;
        else if (typeKey.includes('tel') || typeKey.includes('fiber') || typeKey.includes('fbr')) color = UTILITY_TYPE_COLORS.Telecom;

        const marker = L.circleMarker([lat, lng], {
          radius: 6,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);

        bounds.push([lat, lng]);
      });

      if (bounds.length > 0) {
        try {
          map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
        } catch {
          // ignore if bounds single point
        }
      }
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [utilities]);

  return (
    <div
      onClick={() => navigate('/admin/map')}
      style={{
        position: 'relative',
        height: '220px',
        width: '100%',
        borderRadius: '6px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #E2E8F0'
      }}
      title="Click to open full GIS Utility Map"
    >
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Floating Click-to-Expand Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        background: 'rgba(15, 92, 102, 0.92)',
        color: '#ffffff',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(4px)'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
          <line x1="9" y1="3" x2="9" y2="18"></line>
          <line x1="15" y1="6" x2="15" y2="21"></line>
        </svg>
        <span>Open Full GIS Map →</span>
      </div>

      {/* Region Tag */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: '#ffffff',
        color: '#172d49',
        border: '1px solid #E2E8F0',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 700,
        zIndex: 500,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        MIDC Sector · Nashik
      </div>
    </div>
  );
};
