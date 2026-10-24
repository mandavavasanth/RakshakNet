import React, { useState } from 'react';
import { Settings as SettingsIcon, Monitor, Bell, Server, Key, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';

const Settings = ({ theme, setTheme }) => {
  const [acoustic, setAcoustic] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAlerts = async () => {
    if (window.confirm("Are you sure you want to clear all alerts? This cannot be undone.")) {
      setIsClearing(true);
      await api.clearAllAlerts();
      setIsClearing(false);
      alert("All alerts have been cleared.");
    }
  };

  const toggleStyle = (active) => ({
    position: 'relative', width: '44px', height: '24px', 
    background: active ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)', 
    borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition)'
  });
  
  const knobStyle = (active) => ({
    position: 'absolute', top: '2px', 
    left: active ? '22px' : '2px', 
    width: '20px', height: '20px', 
    background: '#fff', borderRadius: '50%', 
    transition: 'var(--transition)'
  });

  return (
    <div className="flex-col animate-fade-in" style={{ gap: '2rem', maxWidth: '800px' }}>
      <div className="page-header" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="page-title flex-row" style={{ gap: '0.75rem', margin: 0, alignItems: 'center' }}>
          <SettingsIcon size={28} className="text-text-primary" /> System Configuration
        </h2>
        <button className="btn btn-primary" onClick={() => alert("Settings saved successfully.")}>Save Changes</button>
      </div>
      
      <div className="card flex-col" style={{ gap: '1.5rem' }}>
        <h3 className="flex-row" style={{ gap: '0.5rem', margin: 0, fontSize: '1.125rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.75rem' }}>
          <Monitor size={18} className="text-accent-blue" /> Appearance
        </h3>
        <div className="flex-between">
          <div className="flex-col">
            <span style={{ fontWeight: '500' }}>Theme Preference</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select your interface color scheme</span>
          </div>
          <select 
            style={{ minWidth: '200px' }} 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="Military">Dark (Military Tactical)</option>
            <option value="High Contrast">High Contrast</option>
            <option value="Light">Light (Daylight Ops)</option>
          </select>
        </div>
      </div>

      <div className="card flex-col" style={{ gap: '1.5rem' }}>
        <h3 className="flex-row" style={{ gap: '0.5rem', margin: 0, fontSize: '1.125rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.75rem' }}>
          <Bell size={18} className="text-accent-amber" /> Notifications
        </h3>
        <div className="flex-between" style={{ padding: '0.5rem 0', alignItems: 'center' }}>
          <div className="flex-col">
            <span style={{ fontWeight: '500' }}>Acoustic Alerts</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Play sound on critical events</span>
          </div>
          <div style={toggleStyle(acoustic)} onClick={() => setAcoustic(!acoustic)}>
            <div style={knobStyle(acoustic)}></div>
          </div>
        </div>
        <div className="flex-between" style={{ padding: '0.5rem 0', alignItems: 'center' }}>
          <div className="flex-col">
            <span style={{ fontWeight: '500' }}>Desktop Push Notifications</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Show OS-level alerts</span>
          </div>
          <div style={toggleStyle(pushNotif)} onClick={() => setPushNotif(!pushNotif)}>
            <div style={knobStyle(pushNotif)}></div>
          </div>
        </div>
      </div>

      <div className="card flex-col" style={{ gap: '1.5rem' }}>
        <h3 className="flex-row" style={{ gap: '0.5rem', margin: 0, fontSize: '1.125rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.75rem' }}>
          <Server size={18} className="text-accent-green" /> Network & API
        </h3>
        <div className="flex-col" style={{ gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Primary API Endpoint</label>
          <input type="text" value="https://api.rakshaknet.mil/v1" readOnly style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }} />
        </div>
        <div className="flex-col" style={{ gap: '0.5rem' }}>
          <label className="flex-row" style={{ gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
             Authorization Key
          </label>
          <div style={{ position: 'relative' }}>
            <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="password" value="************************" readOnly style={{ width: '100%', paddingLeft: '2.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }} />
          </div>
        </div>
      </div>

      <div className="card flex-col" style={{ gap: '1.5rem' }}>
        <h3 className="flex-row" style={{ gap: '0.5rem', margin: 0, fontSize: '1.125rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.75rem' }}>
          <AlertTriangle size={18} className="text-accent-red" /> Data Management
        </h3>
        <div className="flex-between" style={{ padding: '0.5rem 0', alignItems: 'center' }}>
          <div className="flex-col">
            <span style={{ fontWeight: '500' }}>Clear Database</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Permanently remove all alerts from the system</span>
          </div>
          <button 
            className="btn btn-danger" 
            onClick={handleClearAlerts}
            disabled={isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear All Alerts'}
          </button>
        </div>
      </div>

      <div className="card flex-col" style={{ gap: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
        <h3 className="flex-row" style={{ gap: '0.5rem', margin: 0, fontSize: '1.125rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.75rem' }}>
          <Info size={18} className="text-text-secondary" /> System Information
        </h3>
        <div className="flex-between" style={{ fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Core Version</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>v1.4.2-STABLE</span>
        </div>
        <div className="flex-between" style={{ fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Environment</span>
          <span className="stat-badge badge-green flex-row" style={{ gap: '0.375rem' }}><CheckCircle2 size={12}/> Production</span>
        </div>
      </div>
    </div>
  );
};

export default Settings;
