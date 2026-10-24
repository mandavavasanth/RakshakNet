import React from 'react';
import { Truck, Users, Target, Package } from 'lucide-react';

const TeamCard = ({ team }) => {
  const getBadgeClass = (status) => status === 'Available' ? 'badge-green' : 'badge-orange';
  
  const getEfficiencyColor = (eff) => {
    if (eff < 55) return 'var(--accent-amber)';
    if (eff < 65) return 'var(--accent-blue)';
    return 'var(--accent-green)';
  };

  const [showInventory, setShowInventory] = React.useState(false);

  return (
    <div className="card flex-col" style={{ gap: '1.25rem' }}>
      <div className="flex-between">
        <div className="flex-col">
          <div className="flex-row" style={{ gap: '0.75rem', fontSize: '1.125rem', fontWeight: '600' }}>
            <span style={{ fontSize: '1.25rem' }}>🇮🇳</span> {team.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
            {team.code}
          </div>
        </div>
        <span className={`stat-badge ${getBadgeClass(team.status)}`}>
          {team.status}
        </span>
      </div>

      <div className="flex-col" style={{ gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        <div className="flex-row" style={{ gap: '0.75rem' }}>
          <Truck size={16} className="text-muted" /> {team.vehicle}
        </div>
        <div className="flex-row" style={{ gap: '0.75rem' }}>
          <Users size={16} className="text-muted" /> {team.members} Personnel
        </div>
        {team.mission && (
          <div className="flex-row" style={{ gap: '0.75rem' }}>
            <Target size={16} className="text-accent-amber" /> Mission: {team.mission}
          </div>
        )}
      </div>

      <div className="flex-col" style={{ gap: '0.5rem' }}>
        <button 
          className="btn btn-ghost" 
          style={{ width: '100%', marginTop: '0.5rem', borderStyle: 'dashed' }}
          onClick={() => setShowInventory(!showInventory)}
        >
          <Package size={16} /> {showInventory ? 'Hide Inventory' : 'View Inventory'}
        </button>

        {showInventory && (
          <div className="animate-fade-in" style={{ 
            background: 'rgba(0,0,0,0.2)', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-primary)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
              <span>Medical Kits:</span>
              <span style={{ color: 'var(--text-primary)' }}>12</span>
            </div>
            <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
              <span>Food Rations:</span>
              <span style={{ color: 'var(--text-primary)' }}>24</span>
            </div>
            <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
              <span>Water Bottles:</span>
              <span style={{ color: 'var(--text-primary)' }}>48</span>
            </div>
            <div className="flex-between">
              <span>Sat Phones:</span>
              <span style={{ color: 'var(--text-primary)' }}>2</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-col" style={{ marginTop: '0.5rem' }}>
        <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Efficiency</span>
          <span style={{ color: getEfficiencyColor(team.efficiency), fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{team.efficiency}%</span>
        </div>
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${team.efficiency}%`, 
              background: getEfficiencyColor(team.efficiency),
              boxShadow: `0 0 10px ${getEfficiencyColor(team.efficiency)}40`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
