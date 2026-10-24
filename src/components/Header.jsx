import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, Volume2, LayoutGrid, CheckCircle2 } from 'lucide-react';

const Header = ({ isConnected, alertCount = 0, toggleSidebar, theme, setTheme }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <div className="header" style={{ padding: '0 2rem' }}>
      <div className="flex-row" style={{ gap: '1.5rem' }}>
        <button className="icon-btn" style={{ background: 'rgba(255,255,255,0.05)' }} onClick={toggleSidebar}>
          <LayoutGrid size={18} />
        </button>
        <div className="flex-col">
          <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
            {getGreeting()}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Emergency Operations Center — <span style={{color: 'var(--text-muted)'}}>Active</span>
          </div>
        </div>
      </div>

      <div className="flex-row" style={{ gap: '1.25rem' }}>
        <div className="status-pill" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
          <div className="status-dot"></div>
          Database <CheckCircle2 size={12} style={{marginLeft: '2px'}}/>
        </div>
        <div className="status-pill" style={{ 
            borderColor: isConnected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
            background: isConnected ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
            color: 'var(--text-primary)' 
          }}>
          <div className="status-dot" style={{ color: isConnected ? 'var(--status-available)' : 'var(--accent-red)' }}></div>
          {isConnected ? 'System Online' : 'Reconnecting...'}
        </div>
        <div className="clock" style={{ marginLeft: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
          {time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second:'2-digit' })}
        </div>
      </div>

      <div className="header-icons flex-row" style={{ gap: '0.75rem' }}>
        <select 
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{ marginRight: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '500' }}
        >
          <option value="Military">🌴 Military</option>
          <option value="High Contrast">High Contrast</option>
        </select>
        <button className="icon-btn" style={{ borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} onClick={() => alert('Refreshing data...')}><RefreshCw size={16} /></button>
        <button className="icon-btn" style={{ borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} onClick={() => alert('Audio alerts toggled')}><Volume2 size={16} /></button>
        <button className="icon-btn" style={{ position: 'relative', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} onClick={() => alert('Opening notifications panel...')}>
          <Bell size={16} />
          {alertCount > 0 && (
            <span className="badge" style={{ position: 'absolute', top: '-4px', right: '-4px', padding: '0', fontSize: '0.65rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {alertCount}
            </span>
          )}
        </button>
        <div className="avatar" style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', marginLeft: '0.5rem' }}>AD</div>
      </div>
    </div>
  );
};

export default Header;
