import React, { useState } from 'react';
import { Plane, Battery, Gauge, SignalHigh, Play, BatteryCharging, CheckSquare } from 'lucide-react';

const DroneOps = () => {
  const [drones, setDrones] = useState([
    { name: 'Eagle Eye Alpha', model: 'DJI Matrice 300 RTK', status: 'Standby', battery: 94, speed: 65, range: 15 },
    { name: 'Storm Hawk Beta', model: 'DJI Mavic 3 Enterprise', status: 'Standby', battery: 78, speed: 55, range: 10 },
    { name: 'Shadow Scout Gamma', model: 'Parrot ANAFI USA', status: 'Charging', battery: 23, speed: 45, range: 8 },
    { name: 'Viper Delta', model: 'Autel EVO II Pro', status: 'Standby', battery: 100, speed: 60, range: 12 }
  ]);

  const getBatColor = (lvl) => lvl > 60 ? 'var(--accent-green)' : lvl > 30 ? 'var(--accent-amber)' : 'var(--accent-red)';
  
  const toggleDeploy = (index) => {
    const newDrones = [...drones];
    if (newDrones[index].status === 'Standby') {
      newDrones[index].status = 'Deployed';
    } else if (newDrones[index].status === 'Deployed') {
      newDrones[index].status = 'Standby';
    }
    setDrones(newDrones);
  };

  const standbyCount = drones.filter(d => d.status === 'Standby').length;
  const deployedCount = drones.filter(d => d.status === 'Deployed').length;

  return (
    <div className="flex-col animate-fade-in" style={{ gap: '2.5rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="flex-col">
          <h2 className="page-title flex-row" style={{ gap: '0.75rem', margin: 0, alignItems: 'center' }}>
            <Plane size={28} className="text-accent-blue" /> Autonomous Drone Operations
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Fleet Status: {standbyCount} standby · {deployedCount} deployed</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {drones.map((d, i) => (
          <div key={i} className="card flex-col" style={{ gap: '1.25rem', borderTop: `3px solid ${d.status === 'Deployed' ? 'var(--accent-blue)' : d.status === 'Standby' ? 'var(--accent-green)' : 'var(--accent-amber)'}` }}>
            <div className="flex-between">
              <div className="flex-col">
                <strong className="flex-row" style={{ fontSize: '1.125rem', gap: '0.5rem', alignItems: 'center' }}>
                   {d.name}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>{d.model}</span>
              </div>
              <span className={`stat-badge ${d.status === 'Deployed' ? 'badge-blue' : d.status === 'Standby' ? 'badge-green' : 'badge-orange'}`} style={d.status === 'Deployed' ? {background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)'} : {}}>{d.status}</span>
            </div>

            <div className="flex-col" style={{ gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div className="flex-between" style={{ fontSize: '0.875rem' }}>
                <span className="flex-row" style={{ gap: '0.375rem', color: 'var(--text-secondary)' }}><Battery size={16} /> Power</span>
                <span style={{ color: getBatColor(d.battery), fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{d.battery}%</span>
              </div>
              <div className="progress-container" style={{ height: '4px' }}>
                <div className="progress-bar" style={{ width: `${d.battery}%`, background: getBatColor(d.battery), boxShadow: `0 0 8px ${getBatColor(d.battery)}40` }}></div>
              </div>
            </div>

            <div className="flex-between" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span className="flex-row" style={{ gap: '0.375rem' }}><Gauge size={16} /> {d.speed} km/h</span>
              <span className="flex-row" style={{ gap: '0.375rem' }}><SignalHigh size={16} /> {d.range} km</span>
            </div>

            <button 
              className={`btn ${d.status === 'Standby' ? 'btn-primary' : d.status === 'Deployed' ? 'btn-danger' : 'btn-ghost'}`} 
              style={{ width: '100%', opacity: d.status === 'Charging' ? 0.6 : 1 }}
              disabled={d.status === 'Charging'}
              onClick={() => toggleDeploy(i)}
            >
              {d.status === 'Charging' ? <><BatteryCharging size={16} /> Charging...</> : 
               d.status === 'Deployed' ? <><CheckSquare size={16} /> Return to Base</> : 
               <><Play size={16} fill="currentColor" /> Deploy Unit</>}
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="flex-row" style={{ gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
          <span style={{ color: 'var(--accent-red)' }}>●</span> Live Video Feeds <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-primary)' }}>Secure WebRTC</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ 
              aspectRatio: '16/9', 
              background: '#04070a', 
              border: '1px solid var(--border-primary)', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              gap: '0.75rem', color: 'var(--text-muted)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                DRONE-0{i} // LOS
              </div>
              <SignalHigh size={32} style={{ opacity: 0.2 }} />
              <span style={{ fontSize: '0.875rem', letterSpacing: '1px' }}>FEED OFFLINE</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DroneOps;
