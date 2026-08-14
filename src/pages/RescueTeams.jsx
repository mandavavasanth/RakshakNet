import React from 'react';
import StatsCard from '../components/StatsCard';
import TeamCard from '../components/TeamCard';
import { ShieldCheck, Users, Target, Activity, Mic } from 'lucide-react';

const RescueTeams = ({ teams }) => {
  return (
    <div className="flex-col animate-fade-in" style={{ gap: '2rem', position: 'relative', minHeight: '100%' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 className="page-title flex-row" style={{ gap: '0.75rem', margin: 0 }}>
          <ShieldCheck size={28} className="text-accent-blue" /> Ground Forces & Teams
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <StatsCard icon={<Activity size={20} />} label="AVAILABLE" value="2" color="var(--accent-green)" />
        <StatsCard icon={<Target size={20} />} label="DEPLOYED" value="2" color="var(--accent-amber)" />
        <StatsCard icon={<Users size={20} />} label="TOTAL PERSONNEL" value="19" color="var(--text-primary)" />
        <StatsCard icon={<ShieldCheck size={20} />} label="MISSIONS DONE" value="3" color="var(--accent-blue)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {teams.map(team => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      <div style={{ 
        position: 'fixed', 
        bottom: '2rem', 
        right: '2rem', 
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'center',
        zIndex: 50
      }}>
        <select style={{ 
          background: 'rgba(7, 9, 11, 0.9)', 
          backdropFilter: 'blur(8px)',
          padding: '0.5rem 1rem', 
          color: 'var(--text-primary)', 
          border: '1px solid var(--border-primary)', 
          borderRadius: 'var(--radius-full)',
          fontSize: '0.875rem',
          boxShadow: 'var(--shadow-md)'
        }}
        onChange={(e) => alert(`Language changed to ${e.target.value}`)}
        >
          <option>IN English (India)</option>
          <option>HI Hindi</option>
        </select>
        <button 
          style={{ 
            width: '56px', height: '56px', 
            borderRadius: '50%', 
            background: 'var(--accent-green)', 
            color: '#07090b',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition)'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          onClick={() => alert('Voice command activated. Listening...')}
        >
          <Mic size={24} />
        </button>
      </div>
    </div>
  );
};

export default RescueTeams;
