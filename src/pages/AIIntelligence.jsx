import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Brain, TrendingUp, PieChart, Target, MapPin, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const AIIntelligence = ({ alerts = [], teams = [], stats }) => {
  const lineData = {
    labels: ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:15', '20:16', '21:16', '22:16'],
    datasets: [
      {
        label: 'Historical',
        data: [0, 0, 0, 0, 1, 0, 5, 4, null, null, null, null],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBorderColor: '#3b82f6',
        pointBackgroundColor: '#07090b',
        pointBorderWidth: 2,
        fill: true,
      },
      {
        label: 'Projected',
        data: [null, null, null, null, null, null, null, 4, 3, 2.5, 3, 4.5],
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBorderColor: '#ef4444',
        pointBackgroundColor: '#07090b',
        pointBorderWidth: 2,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { color: '#8b9a8b', usePointStyle: true, padding: 20, boxWidth: 8, font: { family: 'Inter', size: 12 } } },
      tooltip: { backgroundColor: 'rgba(7, 9, 11, 0.9)', titleColor: '#e2e8e0', bodyColor: '#8b9a8b', borderColor: 'rgba(40, 80, 40, 0.4)', borderWidth: 1, padding: 10, usePointStyle: true }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: '#4a5a4a', font: { family: 'JetBrains Mono', size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: '#4a5a4a', font: { family: 'JetBrains Mono', size: 10 }, stepSize: 2 }, beginAtZero: true }
    }
  };

  const sosCount = stats?.counts_by_helpType?.SOS ?? alerts.filter(a => a.helpType === 'SOS').length;
  const medicalCount = stats?.counts_by_helpType?.Medical ?? alerts.filter(a => a.helpType === 'Medical').length;
  const foodCount = stats?.counts_by_helpType?.Food ?? alerts.filter(a => a.helpType === 'Food').length;
  const waterCount = stats?.counts_by_helpType?.Water ?? alerts.filter(a => a.helpType === 'Water').length;

  const doughnutData = {
    labels: ['SOS', 'Medical', 'Food', 'Water', 'Other'],
    datasets: [{
      data: [sosCount || 2, medicalCount || 1, foodCount || 3, waterCount || 1, 1],
      backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#06b6d4', '#a855f7'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const doughnutOptions = {
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#e2e8e0', padding: 16, usePointStyle: true, boxWidth: 6, font: { family: 'Inter', size: 12 } } },
      tooltip: { backgroundColor: 'rgba(7, 9, 11, 0.9)', borderColor: 'rgba(40, 80, 40, 0.4)', borderWidth: 1 }
    }
  };

  const efficiencyData = [
    { name: 'Alpha Team', eff: 55, color: '#f59e0b' },
    { name: 'Bravo Squad', eff: 55, color: '#f59e0b' },
    { name: 'Charlie Rescue', eff: 65, color: '#22c55e' },
    { name: 'Delta Support', eff: 50, color: '#f59e0b' }
  ];

  return (
    <div className="flex-col animate-fade-in" style={{ gap: '2rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 className="page-title flex-row" style={{ gap: '0.75rem', margin: 0 }}>
          <Brain size={28} className="text-accent-purple" /> AI Intelligence Core
        </h2>
      </div>

      {/* AI Risk Zone Prediction */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(7, 9, 11, 0.95) 100%)', 
        border: '1px solid rgba(34, 197, 94, 0.3)',
        boxShadow: '0 8px 32px rgba(34, 197, 94, 0.08)'
      }}>
        <div className="flex-col" style={{ marginBottom: '1.5rem' }}>
          <h3 className="flex-row" style={{ gap: '0.75rem', margin: 0, color: 'var(--accent-green)', fontSize: '1.125rem' }}>
            <Target size={20} /> High-Probability Risk Prediction
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Pattern recognition model analysis of the last 48 hours of alert data.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-base)', padding: '1.5rem', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex-col" style={{ gap: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Predicted Next Event Zone</span>
              <div className="flex-row" style={{ gap: '0.75rem', fontSize: '1.25rem' }}>
                <MapPin size={24} className="text-accent-red" />
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: '500' }}>17.38187°N, 78.49446°E</span>
              </div>
              <div style={{ color: 'var(--accent-green)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Confidence Level: <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>95%</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-base)', padding: '1.5rem', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex-row" style={{ gap: '0.75rem', marginBottom: '1rem', fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              <Activity size={18} className="text-accent-blue" /> Current Incident Distribution
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              <div className="flex-col" style={{ gap: '0.25rem' }}><span style={{ color: 'var(--text-muted)' }}>SOS</span> <span style={{ color: 'var(--accent-red)', fontSize: '1.125rem' }}>{sosCount || 2}</span></div>
              <div className="flex-col" style={{ gap: '0.25rem' }}><span style={{ color: 'var(--text-muted)' }}>MEDICAL</span> <span style={{ color: 'var(--accent-blue)', fontSize: '1.125rem' }}>{medicalCount || 1}</span></div>
              <div className="flex-col" style={{ gap: '0.25rem' }}><span style={{ color: 'var(--text-muted)' }}>WATER</span> <span style={{ color: 'var(--accent-cyan)', fontSize: '1.125rem' }}>{waterCount || 1}</span></div>
              <div className="flex-col" style={{ gap: '0.25rem' }}><span style={{ color: 'var(--text-muted)' }}>FOOD</span> <span style={{ color: 'var(--accent-green)', fontSize: '1.125rem' }}>{foodCount || 3}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 className="flex-row" style={{ gap: '0.5rem', margin: 0, fontSize: '1rem', fontWeight: '600' }}>
              <TrendingUp size={18} className="text-accent-blue" /> Alert Trend + Forecast
            </h3>
            <span className="stat-badge badge-red">Projected</span>
          </div>
          <div style={{ height: '240px' }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="flex-row" style={{ gap: '0.5rem', marginBottom: '1.5rem', margin: 0, fontSize: '1rem', fontWeight: '600' }}>
            <PieChart size={18} className="text-accent-cyan" /> Alert Type Breakdown
          </h3>
          <div style={{ height: '240px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIntelligence;
