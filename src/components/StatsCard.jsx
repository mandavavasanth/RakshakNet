import React from 'react';

const StatsCard = ({ icon, label, value, color = 'var(--text-primary)' }) => {
  return (
    <div className="card flex-col" style={{ gap: '1rem', position: 'relative', overflow: 'hidden' }}>
      <div className="flex-row" style={{ gap: '0.75rem', alignItems: 'center' }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
          fontSize: '1rem'
        }}>
          {icon}
        </div>
        <span style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.75rem', 
          fontWeight: '600',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          {label}
        </span>
      </div>
      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: '700', 
        color,
        lineHeight: 1,
        fontFamily: 'var(--font-mono)'
      }}>
        {value}
      </div>
      
      {/* Decorative background glow */}
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        right: '-20px',
        width: '60px',
        height: '60px',
        background: color,
        opacity: 0.05,
        filter: 'blur(20px)',
        borderRadius: '50%'
      }} />
    </div>
  );
};

export default StatsCard;
