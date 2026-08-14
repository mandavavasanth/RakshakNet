import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ActiveAlerts from './pages/ActiveAlerts';
import LiveGPSMap from './pages/LiveGPSMap';
import RescueTeams from './pages/RescueTeams';
import AIIntelligence from './pages/AIIntelligence';
import DispatchChat from './pages/DispatchChat';
import MissionHistory from './pages/MissionHistory';
import Settings from './pages/Settings';
import useWebSocket from './hooks/useWebSocket';
import { api } from './utils/api';
import './App.css';

// Fallback data matching the screenshots exactly
const FALLBACK_ALERTS = [
  { id: 1, deviceId: 'DEV001', helpType: 'SOS', lat: 17.3850, lng: 78.4867, timestamp: new Date().toISOString(), status: 'Assigned', assignedTeam: 'Alpha Team' },
  { id: 2, deviceId: 'DEV002', helpType: 'Medical', lat: 17.3910, lng: 78.4900, timestamp: new Date().toISOString(), status: 'Assigned', assignedTeam: 'Bravo Squad' },
  { id: 3, deviceId: 'DEV003', helpType: 'Water', lat: 17.3880, lng: 78.4750, timestamp: new Date().toISOString(), status: 'Pending', assignedTeam: null },
  { id: 4, deviceId: 'DEV784', helpType: 'Food', lat: 17.3821, lng: 78.5108, timestamp: new Date().toISOString(), status: 'Pending', assignedTeam: null },
  { id: 5, deviceId: 'DEV005', helpType: 'Medical', lat: 17.3980, lng: 78.4950, timestamp: new Date().toISOString(), status: 'Pending', assignedTeam: null },
  { id: 6, deviceId: 'DEV006', helpType: 'SOS', lat: 17.4000, lng: 78.4700, timestamp: new Date().toISOString(), status: 'Completed', assignedTeam: 'Charlie Rescue' },
  { id: 7, deviceId: 'DEV007', helpType: 'Food', lat: 17.3820, lng: 78.4980, timestamp: new Date().toISOString(), status: 'Completed', assignedTeam: 'Delta Support' },
];

const FALLBACK_TEAMS = [
  { id: 1, name: 'Alpha Team', teamCode: 'TEAM-01', status: 'Assigned', vehicle: 'Heavy Rescue Truck', members: 5, mission: 'ALT-103', efficiency: 55 },
  { id: 2, name: 'Bravo Squad', teamCode: 'TEAM-02', status: 'Assigned', vehicle: 'EOC Ambulance', members: 4, mission: 'ALT-102', efficiency: 55 },
  { id: 3, name: 'Charlie Rescue', teamCode: 'TEAM-03', status: 'Available', vehicle: 'All-Terrain 4×4', members: 6, efficiency: 65 },
  { id: 4, name: 'Delta Support', teamCode: 'TEAM-04', status: 'Available', vehicle: 'Inflatable Boat Carrier', members: 4, efficiency: 50 },
];

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [alerts, setAlerts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { isConnected, lastMessage } = useWebSocket('ws://localhost:8000/ws/alerts');

  // Fetch data from backend API
  const loadData = useCallback(async () => {
    const [alertsData, teamsData, statsData] = await Promise.all([
      api.fetchAlerts(),
      api.fetchTeams(),
      api.fetchStats()
    ]);
    if (alertsData) setAlerts(alertsData);
    if (teamsData && teamsData.length > 0) setTeams(teamsData.map(t => ({
      ...t,
      mission: t.status === 'Assigned' ? `ALT-${100 + t.id}` : null,
      efficiency: [55, 55, 65, 50][t.id - 1] || 50
    })));
    if (statsData) setStats(statsData);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Handle real-time WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    const { type, data } = lastMessage;
    if (type === 'new_alert' && data) {
      setAlerts(prev => [data, ...prev.filter(a => a.id !== data.id)]);
    } else if (type === 'alert_updated' && data) {
      setAlerts(prev => prev.map(a => a.id === data.id ? { ...a, ...data } : a));
    } else if (type === 'team_status_changed' && data) {
      setTeams(prev => prev.map(t => t.id === data.teamId ? { ...t, status: data.status } : t));
    }
  }, [lastMessage]);

  const pendingCount = alerts.filter(a => a.status === 'Pending').length;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard alerts={alerts} teams={teams} stats={stats} />;
      case 'alerts': return <ActiveAlerts alerts={alerts} teams={teams} setAlerts={setAlerts} />;
      case 'map': return <LiveGPSMap alerts={alerts} teams={teams} />;
      case 'teams': return <RescueTeams teams={teams} />;
      case 'intelligence': return <AIIntelligence alerts={alerts} teams={teams} stats={stats} />;
      case 'chat': return <DispatchChat />;
      case 'history': return <MissionHistory />;
      case 'settings': return <Settings />;
      default: return <Dashboard alerts={alerts} teams={teams} stats={stats} />;
    }
  };

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} alertCount={pendingCount} isCollapsed={isSidebarCollapsed} />
      <div className="main-content">
        <Header isConnected={isConnected} alertCount={pendingCount} toggleSidebar={() => setIsSidebarCollapsed(p => !p)} />
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
