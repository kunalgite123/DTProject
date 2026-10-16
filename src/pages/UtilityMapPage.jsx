import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useUtilities } from '../context/UtilityContext';
import L from 'leaflet';
import { UTILITY_TYPE_COLORS } from '../hooks/useDashboardStats';

const NASHIK_CENTER = [19.1750, 73.1787];

export const UtilityMapPage = () => {
  const {
    utilities,
    selectedUtility,
    setSelectedUtilityId
  } = useUtilities();

  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState([]);

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
  const waterPipelineLayerRef = useRef(null);
  const demoWaterLayerRef = useRef(null);
  const demoGasLayerRef = useRef(null);
  const demoElectricityLayerRef = useRef(null);

  const currentSelected = selectedUtility || utilities[0];

  const toggleLayer = (type) => {
    setLayers((prev) => ({
      ...prev,
      [type]: !prev[type]
    }));
  };
  const searchLocations = async () => {
    const query = locationSearch.trim();

    if (!query) return;

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&q=${encodeURIComponent(query)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Location search failed');
      }

      const results = await response.json();
      setLocationResults(results);

      if (results.length === 0) {
        alert('No locations found. Try another search.');
      }
    } catch (error) {
      console.error('Location search error:', error);
      alert('Unable to search for this location. Please try again.');
    }
  };
  const goToLocation = (location) => {
    const map = mapInstanceRef.current;

    if (!map) {
      alert('Map is not ready yet.');
      return;
    }

    const latitude = Number(location.lat);
    const longitude = Number(location.lon);

    map.setView([latitude, longitude], 15);

    setLocationSearch(location.display_name);
    setLocationResults([]);
  };


  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: NASHIK_CENTER,
        zoom: 14,
        zoomControl: true,
        attributionControl: true
      });

      // OpenStreetMap background
      L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }
      ).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // Load real water pipeline geometries from public/data/water_pipeline.geojson
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let cancelled = false;

    fetch('/data/water_pipeline.geojson')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`GeoJSON request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((geojson) => {
        if (cancelled || !mapInstanceRef.current) return;

        const pipelineLayer = L.geoJSON(geojson, {
          style: {
            color: UTILITY_TYPE_COLORS.Water || '#0284C7',
            weight: 4,
            opacity: 0.9
          },
          onEachFeature: (feature, layer) => {
            const properties = feature.properties || {};
            const popup = document.createElement('div');
            const heading = document.createElement('strong');
            heading.textContent = 'Water Pipeline';
            popup.appendChild(heading);

            const details = [
              ['Pipeline Code', properties.WPLINE_CODE],
              ['Pipe Material', properties.TYPE_OF_PIPE],
              ['Diameter', properties.DIAMETER],
              ['Length', properties.LENGTH],
              ['Water Supply Scheme', properties.Water_Supply_Scheme],
              ['Source of Water', properties.Source_of_Water],
              ['Asset Condition', properties.ASSET_CONDITION],
              ['Year of Data', properties.Statistical_Data_Year]
            ];

            details.forEach(([label, value]) => {
              if (value === undefined || value === null || value === '') return;
              const row = document.createElement('div');
              row.textContent = `${label}: ${value}`;
              popup.appendChild(row);
            });

            layer.bindPopup(popup);
          }
        });

        waterPipelineLayerRef.current = pipelineLayer;

        // Show the actual pipeline geometry only when the Water layer is enabled.
        if (layers.Water) {
          pipelineLayer.addTo(map);
        }

        const featureCount = pipelineLayer.getLayers().length;
        console.info(`Water pipeline features loaded: ${featureCount}`);

        // Keep the map focused on Nashik instead of zooming out to the entire dataset.
        if (featureCount > 0) {
          map.fitBounds(pipelineLayer.getBounds(), {
            padding: [30, 30],
            maxZoom: 16
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Water pipeline loading error:', error);
        }
      });

    return () => {
      cancelled = true;
      const pipelineLayer = waterPipelineLayerRef.current;
      if (pipelineLayer && map.hasLayer(pipelineLayer)) {
        map.removeLayer(pipelineLayer);
      }
      waterPipelineLayerRef.current = null;
    };
  }, []);
  // Load simulated Nashik MIDC demo utility lines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let cancelled = false;

    fetch('/data/nashik_midc_demo.geojson')
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Demo GeoJSON request failed: ${response.status}`
          );
        }

        return response.json();
      })
      .then((geojson) => {
        if (cancelled || !mapInstanceRef.current) return;

        const demoLayers = {
          Water: demoWaterLayerRef,
          Gas: demoGasLayerRef,
          Electricity: demoElectricityLayerRef
        };

        Object.entries(demoLayers).forEach(([type, layerRef]) => {
          const features = geojson.features.filter(
            (feature) => feature.properties?.utility === type
          );

          const featureCollection = {
            type: 'FeatureCollection',
            features
          };

          const demoLayer = L.geoJSON(featureCollection, {
            style: {
              color:
                type === 'Water'
                  ? '#0284C7'
                  : type === 'Gas'
                    ? '#F59E0B'
                    : '#EF4444',
              weight: 5,
              opacity: 0.9,
              dashArray: '8, 6'
            },
            onEachFeature: (feature, layer) => {
              const properties = feature.properties || {};

              const popup = document.createElement('div');

              const heading = document.createElement('strong');
              heading.textContent = `${type} Pipeline/Cable (DEMO)`;
              popup.appendChild(heading);

              const details = [
                ['ID', properties.id],
                ['Utility Type', properties.utility_type],
                ['Status', 'Simulated Demo Data']
              ];

              details.forEach(([label, value]) => {
                if (value === undefined || value === null) return;

                const row = document.createElement('div');
                row.textContent = `${label}: ${value}`;
                popup.appendChild(row);
              });

              layer.bindPopup(popup);
            }
          });

          layerRef.current = demoLayer;

          const isEnabled =
            type === 'Water'
              ? layers.Water
              : type === 'Gas'
                ? layers.Gas
                : layers.Electricity;

          if (isEnabled) {
            demoLayer.addTo(map);
          }
        });

        console.info(
          'Simulated Nashik MIDC demo utility lines loaded.'
        );
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Demo utility loading error:', error);
        }
      });

    return () => {
      cancelled = true;

      [
        demoWaterLayerRef,
        demoGasLayerRef,
        demoElectricityLayerRef
      ].forEach((layerRef) => {
        if (layerRef.current && map.hasLayer(layerRef.current)) {
          map.removeLayer(layerRef.current);
        }

        layerRef.current = null;
      });
    };
  }, []);

  // Show/hide the real pipeline geometry when the Water checkbox changes.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const pipelineLayer = waterPipelineLayerRef.current;
    if (!map || !pipelineLayer) return;

    if (layers.Water && !map.hasLayer(pipelineLayer)) {
      pipelineLayer.addTo(map);
    } else if (!layers.Water && map.hasLayer(pipelineLayer)) {
      map.removeLayer(pipelineLayer);
    }
  }, [layers.Water]);
  // Show/hide simulated demo lines when utility checkboxes change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const demoLayers = [
      { ref: demoWaterLayerRef, enabled: layers.Water },
      { ref: demoGasLayerRef, enabled: layers.Gas },
      {
        ref: demoElectricityLayerRef,
        enabled: layers.Electricity
      }
    ];

    demoLayers.forEach(({ ref, enabled }) => {
      const layer = ref.current;

      if (!layer) return;

      if (enabled && !map.hasLayer(layer)) {
        layer.addTo(map);
      } else if (!enabled && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
  }, [layers.Water, layers.Gas, layers.Electricity]);
  // Update utility markers when data, layers, or search changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map || !layerGroup) return;

    // Remove old markers before drawing updated ones
    layerGroup.clearLayers();

    const filtered = utilities.filter((item) => {
      const itemType = item.type || 'Water';

      const id = String(item.id || '');
      const name = String(item.name || '');
      const location = String(item.location || '');

      const matchesSearch =
        id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase());

      const isLayerActive =
        (itemType.includes('Water') && layers.Water) ||
        (itemType.includes('Gas') && layers.Gas) ||
        (
          (itemType.includes('Elec') ||
            itemType.includes('Power')) &&
          layers.Electricity
        ) ||
        (
          (itemType.includes('Fiber') ||
            itemType.includes('Tel')) &&
          layers.Fiber
        ) ||
        (
          (itemType.includes('Sew') ||
            itemType.includes('SWR')) &&
          layers.Sewer
        );

      return matchesSearch && isLayerActive;
    });

    const markerBounds = [];

    filtered.forEach((item, index) => {
      const latitude = Number(item.latitude);
      const longitude = Number(item.longitude);

      // Use existing coordinates when available.
      // Fallback coordinates are illustrative, not verified locations.
      const hasValidCoordinates =
        item.latitude !== null &&
        item.latitude !== undefined &&
        item.latitude !== '' &&
        item.longitude !== null &&
        item.longitude !== undefined &&
        item.longitude !== '' &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;

      const lat = hasValidCoordinates
        ? latitude
        : NASHIK_CENTER[0] + (index * 0.003 - 0.006);

      const lng = hasValidCoordinates
        ? longitude
        : NASHIK_CENTER[1] + (index * 0.004 - 0.008);

      const position = [lat, lng];

      markerBounds.push(position);

      const itemType = item.type || 'Water';

      let color = UTILITY_TYPE_COLORS.Water;

      if (itemType.includes('Gas')) {
        color = UTILITY_TYPE_COLORS.Gas;
      } else if (
        itemType.includes('Elec') ||
        itemType.includes('Power')
      ) {
        color = UTILITY_TYPE_COLORS.Electricity;
      } else if (
        itemType.includes('Fiber') ||
        itemType.includes('Tel')
      ) {
        color = UTILITY_TYPE_COLORS.Telecom;
      } else if (
        itemType.includes('Sew') ||
        itemType.includes('SWR')
      ) {
        color = UTILITY_TYPE_COLORS.Sewage;
      }

      const isSelected = item.id === currentSelected?.id;

      // Create an individual utility marker
      const marker = L.circleMarker(position, {
        radius: isSelected ? 9 : 7,
        fillColor: color,
        color: isSelected ? '#172D49' : '#ffffff',
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.95
      });

      // Utility information popup
      const popupContent = document.createElement('div');

      const title = document.createElement('strong');
      title.textContent = String(item.id || 'Unknown ID');

      const typeText = document.createElement('div');
      typeText.textContent = String(item.type || 'Unknown type');

      const locationText = document.createElement('div');
      locationText.textContent = String(
        item.location || 'Location unavailable'
      );

      popupContent.append(title, typeText, locationText);

      marker.bindPopup(popupContent);

      marker.bindTooltip(
        `${item.id || 'Unknown ID'} · ${item.type || 'Unknown type'}<br/>${item.location || 'Location unavailable'
        }`,
        {
          direction: 'top',
          offset: [0, -8],
          className: 'custom-leaflet-tooltip'
        }
      );

      // Select utility when its marker is clicked
      marker.on('click', () => {
        setSelectedUtilityId(item.id);
      });

      marker.addTo(layerGroup);
    });

    // IMPORTANT:
    // No polylines are drawn here.
    // Individual utility markers are displayed without
    // artificially connecting them into pipeline routes.

    // Zoom to search results
    if (searchTerm && markerBounds.length > 0) {
      map.fitBounds(markerBounds, {
        padding: [40, 40],
        maxZoom: 16
      });
    }
  }, [
    utilities,
    layers,
    searchTerm,
    currentSelected,
    setSelectedUtilityId
  ]);

  return (
    <AppLayout title="GIS Utility Map">
      <div
        style={{
          padding: '24px 32px 40px',
          width: '100%',
          maxWidth: '100%',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Search bar */}
        <div
          style={{
            marginBottom: '20px',
            background: '#ffffff',
            border: '1px solid #dde3eb',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8b96a5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
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
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                cursor: 'pointer',
                color: '#8b96a5',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                background: 'transparent'
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Location Search Results */}
        {locationResults.length > 0 && (
          <div
            style={{
              marginTop: '-12px',
              marginBottom: '20px',
              background: '#ffffff',
              border: '1px solid #dde3eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            {locationResults.map((location, index) => (
              <button
                key={`${location.place_id}-${index}`}
                type="button"
                onClick={() => goToLocation(location)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  textAlign: 'left',
                  background: '#ffffff',
                  border: 'none',
                  borderBottom: '1px solid #edf0f5',
                  cursor: 'pointer',
                  color: '#172d49',
                  fontSize: '13px'
                }}
              >
                {location.display_name}
              </button>
            ))}
          </div>
        )}

        {/* Three-column workspace */}
        {/* Location Search */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            position: 'relative'
          }}
        >
          <input
            type="text"
            value={locationSearch}
            onChange={(event) =>
              setLocationSearch(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                searchLocations();
              }
            }}
            placeholder="Search a location in Nashik or Maharashtra..."
            style={{
              flex: 1,
              padding: '12px 14px',
              border: '1px solid #dde3eb',
              borderRadius: '8px',
              outline: 'none',
              fontSize: '14px'
            }}
          />

          <button
            type="button"
            onClick={searchLocations}
            style={{
              padding: '12px 20px',
              background: '#172d49',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Search Location
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '220px minmax(0, 1fr) 340px',
            gap: '20px',
            height: 'calc(100vh - 200px)',
            minHeight: '560px'
          }}
        >
          {/* Utility layers */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #dde3eb',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#172d49',
                margin: '0 0 16px 0'
              }}
            >
              Utility layers
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {[
                { name: 'Water', color: '#0284C7' },
                { name: 'Gas', color: '#F59E0B' },
                { name: 'Electricity', color: '#EF4444' },
                { name: 'Fiber', color: '#8B5CF6' },
                { name: 'Sewer', color: '#10B981' }
              ].map((layer) => (
                <label
                  key={layer.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: layers[layer.name]
                      ? '#f8fafc'
                      : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={layers[layer.name]}
                    onChange={() => toggleLayer(layer.name)}
                    style={{
                      accentColor: layer.color,
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px'
                    }}
                  />

                  <div
                    style={{
                      width: '14px',
                      height: '3.5px',
                      backgroundColor: layer.color,
                      borderRadius: '2px'
                    }}
                  />

                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#172d49'
                    }}
                  >
                    {layer.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Map */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #dde3eb',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '100%'
              }}
            />

            <div
              style={{
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
              }}
            >
              Utility Network Map
            </div>
          </div>

          {/* Selected utility details */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #dde3eb',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#172d49',
                margin: '0 0 16px 0'
              }}
            >
              Utility Details
            </h3>

            {currentSelected ? (
              <>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#172d49',
                    margin: '0 0 10px 0'
                  }}
                >
                  {currentSelected.name || currentSelected.id}
                </h3>

                <span
                  style={{
                    display: 'inline-block',
                    alignSelf: 'flex-start',
                    background: '#edf7f1',
                    color: '#27805b',
                    borderRadius: '5px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  {currentSelected.status || 'Recorded'}
                </span>

                <hr
                  style={{
                    width: '100%',
                    border: 'none',
                    borderTop: '1px solid #e2e8f0',
                    margin: '18px 0'
                  }}
                />

                {[
                  ['UTILITY ID', currentSelected.id],
                  ['TYPE', currentSelected.type],
                  ['LOCATION', currentSelected.location],
                  ['DEPTH', currentSelected.depth],
                  ['OWNER / SOURCE', currentSelected.owner],
                  ['LAST UPDATED', currentSelected.lastUpdated]
                ]
                  .filter(([, value]) =>
                    value !== null &&
                    value !== undefined &&
                    value !== ''
                  )
                  .map(([label, value]) => (
                    <div
                      key={label}
                      style={{ marginBottom: '14px' }}
                    >
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          marginBottom: '3px'
                        }}
                      >
                        {label}
                      </div>

                      <div
                        style={{
                          color: '#172d49',
                          fontSize: '14px',
                          fontWeight: 600,
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {String(value)}
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                No utility records available.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};