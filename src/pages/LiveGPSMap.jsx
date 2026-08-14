import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Map as MapIcon } from 'lucide-react';

const TEAM_POSITIONS = [
  { name: 'Alpha Team', lat: 17.3860, lng: 78.4890 },
  { name: 'Bravo Squad', lat: 17.3920, lng: 78.4870 },
  { name: 'Charlie Rescue', lat: 17.3840, lng: 78.4760 },
  { name: 'Delta Support', lat: 17.3950, lng: 78.4830 },
];

const GEOFENCES = [
  { name: 'Zone Alpha', lat: 17.3900, lng: 78.4850 },
  { name: 'Zone Bravo', lat: 17.3830, lng: 78.4950 },
];

const LiveGPSMap = ({ alerts = [], teams = [] }) => {
  const center = [17.385, 78.487];

  const getAlertColor = (type) => {
    switch (type) {
      case 'SOS': return '#ef4444';
      case 'Medical': return '#3b82f6';
      case 'Food': return '#22c55e';
      case 'Water': return '#06b6d4';
      default: return '#f59e0b';
    }
  };

  const alertCount = alerts.length;
  const teamCount = teams.length || TEAM_POSITIONS.length;

  return (
    <div className="flex-col animate-fade-in" style={{ height: 'calc(100vh - 120px)', gap: '1rem' }}>
      {/* Header bar */}
      <div className="card flex-between" style={{ padding: '1rem 1.5rem', marginBottom: 0 }}>
        <div className="flex-row" style={{ gap: '2rem' }}>
          <h2 className="flex-row" style={{ gap: '0.75rem', fontSize: '1.25rem', margin: 0, fontWeight: '600' }}>
            <MapIcon size={24} className="text-accent-blue" /> Live GPS Command Map
          </h2>
          <div className="flex-row" style={{ gap: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <div className="flex-row" style={{ gap: '0.375rem' }}><span style={{ color: '#ef4444' }}>●</span> Alert</div>
            <div className="flex-row" style={{ gap: '0.375rem' }}><span style={{ color: '#3b82f6' }}>●</span> Team</div>
            <div className="flex-row" style={{ gap: '0.375rem' }}><span style={{ color: '#22c55e' }}>●</span> Drone</div>
            <div className="flex-row" style={{ gap: '0.375rem' }}><span style={{ color: '#f59e0b', fontSize: '0.7rem' }}>▲</span> Geofence</div>
          </div>
        </div>
        <div className="flex-row" style={{ gap: '1rem' }}>
           <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
            {alertCount} ALERTS · {teamCount} TEAMS · {GEOFENCES.length} ZONES
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="card" style={{ flex: 1, padding: '2px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, borderRadius: 'calc(var(--radius-lg) - 2px)', overflow: 'hidden', position: 'relative' }}>
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', background: '#0a1118' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {/* Alert markers */}
            {alerts.map(a => (
              <CircleMarker
                key={`alert-${a.id}`}
                center={[a.lat, a.lng]}
                radius={8}
                pathOptions={{ 
                  color: getAlertColor(a.helpType), 
                  fillColor: getAlertColor(a.helpType), 
                  fillOpacity: 0.8, 
                  weight: 2 
                }}
              >
                <Popup className="custom-popup">
                  <div style={{ color: '#111', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    <strong style={{ fontSize: '1rem', color: getAlertColor(a.helpType) }}>{a.helpType} Alert</strong><br />
                    <span style={{color: '#666'}}>ID:</span> {a.deviceId}<br />
                    <span style={{color: '#666'}}>Status:</span> {a.status}<br />
                    {a.assignedTeam && <><span style={{color: '#666'}}>Team:</span> {a.assignedTeam}<br /></>}
                    <div style={{marginTop: '4px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#666'}}>
                      {a.lat?.toFixed(4)}°N, {a.lng?.toFixed(4)}°E
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Team markers */}
            {TEAM_POSITIONS.map((t, i) => (
              <CircleMarker
                key={`team-${i}`}
                center={[t.lat, t.lng]}
                radius={6}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 2 }}
              >
                <Popup>
                  <div style={{ color: '#111', fontSize: '0.875rem' }}>
                    <strong style={{fontSize: '1rem'}}>{t.name}</strong><br />
                    <span style={{color: '#666'}}>Type: Rescue Unit</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Geofence markers */}
            {GEOFENCES.map((g, i) => (
              <CircleMarker
                key={`geo-${i}`}
                center={[g.lat, g.lng]}
                radius={30}
                pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.15, weight: 2, dashArray: '4,4' }}
              >
                <Popup>
                  <div style={{ color: '#111', fontSize: '0.875rem' }}>
                    <strong style={{fontSize: '1rem'}}>{g.name}</strong><br />
                    <span style={{color: '#666'}}>Restricted Zone</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LiveGPSMap;
