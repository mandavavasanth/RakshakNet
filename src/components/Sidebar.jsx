import React from 'react';
import { 
  LayoutGrid, Bell, Map, Users, Radio, 
  Brain, MessageSquare, Clock, Settings, Satellite
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, alertCount, isCollapsed }) => {
  const navItems = [
    { section: 'OPERATIONS' },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
    { id: 'alerts', label: 'Active Alerts', icon: <Bell size={18} />, badge: alertCount },
    { id: 'map', label: 'Live GPS Map', icon: <Map size={18} /> },
    { id: 'teams', label: 'Rescue Teams', icon: <Users size={18} /> },
    { section: 'INTELLIGENCE' },
    { id: 'intelligence', label: 'AI Intelligence', icon: <Brain size={18} /> },
    { id: 'chat', label: 'Dispatch Chat', icon: <MessageSquare size={18} /> },
    { id: 'history', label: 'Mission History', icon: <Clock size={18} /> },
    { section: 'SYSTEM' },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ padding: '2rem 0' }}>
      <div className="sidebar-header" style={{ padding: '0 1.5rem 2.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{
          width: isCollapsed ? '48px' : '60px',
          height: isCollapsed ? '48px' : '60px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
          transition: 'all 0.3s ease',
          flexShrink: 0
        }}>
          <Satellite size={isCollapsed ? 24 : 32} />
        </div>
        <div className="flex-col">
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
            RakshakNet
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '2px', fontWeight: '600' }}>
            DISASTER COMMAND
          </div>
        </div>
      </div>

      <div className="nav-container">
        {navItems.map((item, index) => {
          if (item.section) {
            return (
              <div key={index} className="nav-section-title" style={{ marginTop: index > 0 ? '1rem' : '0' }}>
                {item.section}
              </div>
            );
          }
          return (
            <div
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <div className="nav-item-content">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && <span className="badge" style={{ background: 'var(--accent-red)' }}>{item.badge}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
