import React from 'react';
import { AlertCircle, Users, AlertTriangle, Check, MapPin, Wifi } from 'lucide-react';

const Dashboard = ({ alerts = [], teams = [], stats }) => {
  const sosAlerts = alerts.filter(a => a.helpType === 'SOS').length;
  const medicalAlerts = alerts.filter(a => a.helpType === 'Medical').length;
  const foodAlerts = alerts.filter(a => a.helpType === 'Food').length;
  const waterAlerts = alerts.filter(a => a.helpType === 'Water').length;
  const completedAlerts = alerts.filter(a => a.status === 'Completed').length;
  const availableTeams = teams.filter(t => t.status === 'Available').length;

  const cards = [
    {
      title: 'SOS ALERTS',
      value: sosAlerts,
      subtext: 'Critical emergencies',
      icon: <AlertTriangle size={24} color="#ef4444" />,
      iconBg: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    },
    {
      title: 'MEDICAL ALERTS',
      value: medicalAlerts,
      subtext: 'Health crises',
      icon: <AlertCircle size={24} color="#3b82f6" />,
      iconBg: 'rgba(59, 130, 246, 0.1)',
      border: 'transparent'
    },
    {
      title: 'FOOD ALERTS',
      value: foodAlerts,
      subtext: 'Ration requests',
      icon: <Check size={24} color="#22c55e" />,
      iconBg: 'rgba(34, 197, 94, 0.1)',
      border: 'transparent'
    },
    {
      title: 'WATER ALERTS',
      value: waterAlerts,
      subtext: 'Hydration needs',
      icon: <Wifi size={24} color="#eab308" />,
      iconBg: 'rgba(234, 179, 8, 0.1)',
      border: 'transparent'
    },
    {
      title: 'COMPLETED ALERTS',
      value: completedAlerts,
      subtext: 'Total resolved issues',
      icon: <Check size={24} color="#a855f7" />,
      iconBg: 'rgba(168, 85, 247, 0.1)',
      border: 'transparent'
    },
    {
      title: 'AVAILABLE TEAMS',
      value: availableTeams,
      subtext: 'Ready for deployment',
      icon: <Users size={24} color="#22c55e" />,
      iconBg: 'rgba(34, 197, 94, 0.1)',
      border: 'transparent'
    }
  ];

  return (
    <div className="flex-col animate-fade-in" style={{ gap: '1.5rem', padding: '1rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {cards.map((card, idx) => (
          <div key={idx} className="card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
            border: card.border !== 'transparent' ? card.border : '1px solid var(--border-primary)',
            boxShadow: card.border !== 'transparent' ? '0 0 15px rgba(59, 130, 246, 0.15)' : 'var(--shadow-card)',
            background: 'var(--bg-card)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: card.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {card.icon}
            </div>
            <div className="flex-col">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '1px' }}>
                {card.title}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: card.title === 'TOTAL ALERTS' ? '#ef4444' : card.title === 'AVAILABLE TEAMS' ? '#22c55e' : card.title === 'CRITICAL ALERTS' ? '#f59e0b' : card.title === 'DRONES READY' ? '#a855f7' : card.title === 'LORA ALERTS' ? '#06b6d4' : '#3b82f6', lineHeight: 1.2 }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {card.subtext}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
