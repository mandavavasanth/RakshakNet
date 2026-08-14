import React, { useState } from 'react';
import { api } from '../utils/api';
import { MapPin, Clock, Users, AlertCircle, ShieldAlert, Crosshair, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const ActiveAlerts = ({ alerts, teams, setAlerts }) => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const filtered = alerts.filter(a => {
    if (filterStatus !== 'All' && a.status !== filterStatus) return false;
    if (filterType !== 'All' && a.helpType !== filterType) return false;
    return true;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'SOS': return 'var(--accent-red)';
      case 'Medical': return 'var(--accent-blue)';
      case 'Food': return 'var(--accent-green)';
      case 'Water': return 'var(--accent-yellow)';
      default: return 'var(--accent-amber)';
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-yellow';
      case 'Assigned': return 'badge-orange';
      case 'Completed': return 'badge-green';
      default: return '';
    }
  };

  const handleAssign = async (alertId, teamName) => {
    const result = await api.updateAlert(alertId, { status: 'Assigned', assignedTeam: teamName });
    if (result) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Assigned', assignedTeam: teamName } : a));
    }
  };

  const handleComplete = async (alertId) => {
    const result = await api.updateAlert(alertId, { status: 'Completed' });
    if (result) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Completed' } : a));
    }
  };

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    } catch { return '--:--'; }
  };

  const [expandedAlertId, setExpandedAlertId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedAlertId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex-col animate-fade-in" style={{ gap: '2rem' }}>
      <div className="page-header" style={{ margin: 0 }}>
        <div className="flex-row" style={{ gap: '1rem', alignItems: 'center' }}>
          <h2 className="page-title flex-row" style={{ gap: '0.75rem', margin: 0 }}>
            <ShieldAlert size={28} className="text-accent-red" /> Active Alerts
          </h2>
          <span className="badge" style={{ fontSize: '0.875rem', padding: '2px 10px' }}>{filtered.length}</span>
        </div>
        
        <div className="flex-row" style={{ gap: '1rem' }}>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="SOS">SOS</option>
            <option value="Medical">Medical</option>
            <option value="Food">Food</option>
            <option value="Water">Water</option>
          </select>
        </div>
      </div>

      <div className="flex-col" style={{ gap: '1.25rem' }}>
        {filtered.map(alert => (
          <div key={alert.id} className="card flex-col" style={{ 
              opacity: alert.status === 'Completed' ? 0.6 : 1,
              borderLeft: alert.status === 'Pending' ? `3px solid ${getTypeColor(alert.helpType)}` : '1px solid var(--border-primary)',
              transition: 'var(--transition)',
              padding: 0
            }}>
            
            {/* Clickable Header Row */}
            <div 
              className="flex-between" 
              style={{ padding: '1.5rem', cursor: 'pointer' }}
              onClick={() => toggleExpand(alert.id)}
            >
              <div className="flex-row" style={{ gap: '1.5rem', flex: 1 }}>
                <div style={{ 
                  width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  borderRadius: 'var(--radius-sm)', background: `${getTypeColor(alert.helpType)}15`, 
                  color: getTypeColor(alert.helpType),
                  border: `1px solid ${getTypeColor(alert.helpType)}40` 
                }}>
                  <AlertCircle size={24} />
                </div>
                <div className="flex-col" style={{ gap: '0.5rem' }}>
                  <div className="flex-row" style={{ gap: '1rem', alignItems: 'center' }}>
                    <strong style={{ color: getTypeColor(alert.helpType), fontSize: '1.125rem', letterSpacing: '0.5px' }}>{alert.helpType}</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>{alert.deviceId}</span>
                    <span className={`stat-badge ${getBadgeClass(alert.status)}`}>{alert.status}</span>
                  </div>
                  <div className="flex-row" style={{ gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span className="flex-row" style={{ gap: '0.375rem', fontFamily: 'var(--font-mono)' }}><Crosshair size={14} /> {alert.lat}°N, {alert.lng}°E</span>
                    <span className="flex-row" style={{ gap: '0.375rem', fontFamily: 'var(--font-mono)' }}><Clock size={14} /> {formatTime(alert.timestamp)}</span>
                    {alert.assignedTeam && <span className="flex-row" style={{ gap: '0.375rem', color: 'var(--text-secondary)' }}><Users size={14} /> {alert.assignedTeam}</span>}
                  </div>
                </div>
              </div>

              {alert.status === 'Pending' && teams && (
                <div onClick={e => e.stopPropagation()}>
                  <select
                    onChange={e => e.target.value && handleAssign(alert.id, e.target.value)}
                    defaultValue=""
                    style={{ 
                      background: 'rgba(34, 197, 94, 0.05)', 
                      borderColor: 'var(--border-focus)', 
                      color: 'var(--accent-green)',
                      fontWeight: '500',
                      minWidth: '160px',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <option value="" disabled>Assign Team...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.name}>
                        {t.name} {t.status === 'Deployed' ? '(Deployed)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {alert.status === 'Assigned' && (
                <div onClick={e => e.stopPropagation()}>
                  <button 
                    className="btn flex-row"
                    style={{ 
                      gap: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem', 
                      borderRadius: 'var(--radius-full)', background: 'var(--accent-green)', 
                      color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer'
                    }}
                    onClick={() => handleComplete(alert.id)}
                  >
                    <CheckCircle2 size={16} /> Complete
                  </button>
                </div>
              )}
              {alert.status === 'Completed' && (
                 <CheckCircle2 size={24} className="text-accent-green" style={{ opacity: 0.5 }} />
              )}
            </div>

            {/* Expandable Details & Map */}
            {expandedAlertId === alert.id && (
              <div style={{ borderTop: '1px solid var(--border-primary)', padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="flex-col" style={{ gap: '1rem' }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.5rem' }}>Alert Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Device ID:</span>
                      <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{alert.deviceId}</span>
                      
                      <span style={{ color: 'var(--text-muted)' }}>Time:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{new Date(alert.timestamp).toLocaleString()}</span>
                      
                      <span style={{ color: 'var(--text-muted)' }}>Coordinates:</span>
                      <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{alert.lat}, {alert.lng}</span>
                      
                      <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                      <span style={{ color: getTypeColor(alert.helpType), fontWeight: '600' }}>{alert.helpType}</span>
                      
                      <span style={{ color: 'var(--text-muted)' }}>Team:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{alert.assignedTeam || 'None assigned'}</span>
                    </div>
                  </div>
                  <div style={{ height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
                    <MapContainer center={[alert.lat || 17.3850, alert.lng || 78.4867]} zoom={15} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <Marker position={[alert.lat || 17.3850, alert.lng || 78.4867]}>
                        <Popup>{alert.deviceId} - {alert.helpType}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '1.125rem' }}>No active alerts</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Adjust your filters to see more results</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveAlerts;
