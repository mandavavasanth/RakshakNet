import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { History, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const FALLBACK_MISSIONS = [
  { id: 1, missionCode: 'MSN-001', teamName: 'Alpha Team', helpType: 'SOS', status: 'Active', startTime: new Date(Date.now() - 45 * 60000).toISOString(), endTime: null, responseTimeMinutes: null, notes: 'Active rescue operation at DEV001 location' },
  { id: 2, missionCode: 'MSN-002', teamName: 'Bravo Squad', helpType: 'Medical', status: 'Active', startTime: new Date(Date.now() - 30 * 60000).toISOString(), endTime: null, responseTimeMinutes: null, notes: 'Medical emergency response' },
  { id: 3, missionCode: 'MSN-003', teamName: 'Charlie Rescue', helpType: 'SOS', status: 'Completed', startTime: new Date(Date.now() - 120 * 60000).toISOString(), endTime: new Date().toISOString(), responseTimeMinutes: 15.5, notes: 'Successfully evacuated 3 people' },
  { id: 4, missionCode: 'MSN-004', teamName: 'Delta Support', helpType: 'Food', status: 'Completed', startTime: new Date(Date.now() - 180 * 60000).toISOString(), endTime: new Date(Date.now() - 60 * 60000).toISOString(), responseTimeMinutes: 22.0, notes: 'Food supplies delivered to shelter' },
  { id: 5, missionCode: 'MSN-005', teamName: 'Alpha Team', helpType: 'Water', status: 'Completed', startTime: new Date(Date.now() - 300 * 60000).toISOString(), endTime: new Date(Date.now() - 240 * 60000).toISOString(), responseTimeMinutes: 18.3, notes: 'Water purification deployed' },
];

const MissionHistory = () => {
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await api.fetchMissions();
      if (data) setMissions(data);
    })();
  }, []);

  const formatDate = (ts) => {
    if (!ts) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    try {
      const d = new Date(ts);
      return (
        <div className="flex-col">
          <span style={{ color: 'var(--text-primary)' }}>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        </div>
      );
    } catch { return '—'; }
  };

  const getBadgeClass = (s) => {
    switch (s) {
      case 'Active': return 'badge-orange';
      case 'Completed': return 'badge-green';
      case 'Aborted': return 'badge-red';
      default: return '';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SOS': return 'var(--accent-red)';
      case 'Medical': return 'var(--accent-blue)';
      case 'Food': return 'var(--accent-green)';
      case 'Water': return 'var(--accent-cyan)';
      default: return 'var(--accent-amber)';
    }
  };

  const exportToCSV = () => {
    if (missions.length === 0) return;
    const headers = ['Mission ID', 'Team Assigned', 'Type', 'Status', 'Deployed', 'Concluded', 'Resp Time (m)', 'Field Notes'];
    const rows = missions.map(m => [
      m.missionCode || '',
      m.teamName || '',
      m.helpType || '',
      m.status || '',
      m.startTime ? new Date(m.startTime).toISOString() : '',
      m.endTime ? new Date(m.endTime).toISOString() : '',
      m.responseTimeMinutes || '',
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Mission_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-col animate-fade-in" style={{ gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 className="page-title flex-row" style={{ gap: '0.75rem', margin: 0 }}>
          <History size={28} className="text-accent-blue" /> Mission Log Archive
        </h2>
        <div className="flex-row" style={{ gap: '1rem', alignItems: 'center' }}>
          <div className="flex-row" style={{ gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-primary)' }}>
            <span className="flex-row" style={{ gap: '0.375rem' }}><Clock size={16} className="text-muted"/> Total: <strong style={{ color: 'var(--text-primary)' }}>{missions.length}</strong></span>
            <span className="flex-row" style={{ gap: '0.375rem' }}><AlertCircle size={16} className="text-accent-amber"/> Active: <strong style={{ color: 'var(--accent-amber)' }}>{missions.filter(m => m.status === 'Active').length}</strong></span>
            <span className="flex-row" style={{ gap: '0.375rem' }}><CheckCircle2 size={16} className="text-accent-green"/> Completed: <strong style={{ color: 'var(--accent-green)' }}>{missions.filter(m => m.status === 'Completed').length}</strong></span>
          </div>
          <button 
            className="btn btn-primary flex-row" 
            style={{ gap: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}
            onClick={exportToCSV}
          >
            Download CSV Report
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-primary)' }}>
                {['Mission ID', 'Team Assigned', 'Type', 'Status', 'Deployed', 'Concluded', 'Resp Time', 'Field Notes'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {missions.map((m, i) => (
                <tr key={m.id} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.03)', 
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  transition: 'var(--transition)'
                }}>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--text-primary)' }}>{m.missionCode}</td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{m.teamName}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ color: getTypeColor(m.helpType), fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getTypeColor(m.helpType) }}></span>
                      {m.helpType}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}><span className={`stat-badge ${getBadgeClass(m.status)}`}>{m.status}</span></td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{formatDate(m.startTime)}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{formatDate(m.endTime)}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', color: m.responseTimeMinutes ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {m.responseTimeMinutes ? `${m.responseTimeMinutes}m` : '—'}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MissionHistory;
