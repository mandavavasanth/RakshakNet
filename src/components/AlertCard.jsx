import React from 'react';
import { AlertCircle, Clock, MapPin, Users, Send } from 'lucide-react';

const getBadgeClass = (status) => {
  switch(status) {
    case 'Pending': return 'badge-yellow';
    case 'Assigned': return 'badge-orange';
    case 'Completed': return 'badge-green';
    default: return 'badge-green';
  }
};

const getTypeColor = (type) => {
  switch(type) {
    case 'SOS': return 'var(--accent-red)';
    case 'Medical': return 'var(--accent-blue)';
    case 'Food': return 'var(--accent-green)';
    case 'Water': return 'var(--accent-cyan)';
    default: return 'var(--text-primary)';
  }
};

const AlertCard = ({ alert }) => {
  return (
    <div className="card flex-col" style={{ 
      opacity: alert.status === 'Completed' ? 0.6 : 1, 
      gap: '1.25rem',
      borderLeft: alert.status === 'Pending' ? `3px solid ${getTypeColor(alert.type)}` : '1px solid var(--border-primary)' 
    }}>
      <div className="flex-between">
        <div className="flex-row" style={{ gap: '1rem' }}>
          <div style={{ 
            width: '40px', height: '40px', 
            borderRadius: 'var(--radius-sm)', 
            background: `${getTypeColor(alert.type)}15`,
            color: getTypeColor(alert.type),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${getTypeColor(alert.type)}40`
          }}>
            <AlertCircle size={20} />
          </div>
          <div className="flex-col" style={{ gap: '0.25rem' }}>
            <span style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-primary)' }}>{alert.deviceId}</span>
            <span className="flex-row" style={{ gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Clock size={12} /> {new Date(alert.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
            </span>
          </div>
        </div>
        <span className={`stat-badge ${getBadgeClass(alert.status)}`}>
          {alert.status}
        </span>
      </div>
      
      <div className="flex-row" style={{ gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        <MapPin size={16} className="text-muted" /> {alert.lat.toFixed(4)}°N, {alert.lng.toFixed(4)}°E
      </div>

      {alert.status === 'Pending' && (
        <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
          <Send size={16} /> Dispatch Unit
        </button>
      )}
      {alert.status === 'Assigned' && (
        <div className="flex-row" style={{ gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
          <Users size={16} className="text-accent-amber" /> Assigned: <strong style={{ color: 'var(--accent-amber)' }}>{alert.team}</strong>
        </div>
      )}
    </div>
  );
};

export default AlertCard;
