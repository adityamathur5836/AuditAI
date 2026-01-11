import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import BenfordChart from './BenfordChart';
import NetworkGraph from './NetworkGraph';
import { fetchAlerts, fetchStats, checkHealth, fetchNetworkGraph, fetchBenfordStats } from '../api';

const Analytics = ({ onViewChange }) => {
  const [alerts, setAlerts] = useState([]);
  const [networkData, setNetworkData] = useState(null);
  const [benfordData, setBenfordData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const health = await checkHealth();
    if (health.status === 'healthy') {
      const [alertsData, netData, benStats, statistics] = await Promise.all([
        fetchAlerts(1000, 0.0),
        fetchNetworkGraph(),
        fetchBenfordStats(),
        fetchStats()
      ]);
      setAlerts(alertsData);
      setNetworkData(netData);
      setBenfordData(benStats);
      setStats(statistics);
    }
    setLoading(false);
  };


  // derived metrics (fallback to local calculation if stats missing)
  const totalFraud = stats?.total_flagged_amount || alerts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const highRiskVendors = [...new Set(alerts.filter(a => a.risk_score > 0.6).map(a => a.vendor))].length;
  const openInvestigations = stats?.critical_alerts || alerts.filter(a => a.risk_score > 0.8).length;

  // Risk ranking by vendor
  const vendorRisk = {};
  alerts.forEach(a => {
    const vendor = a.vendor_id || a.vendor || 'Unknown';
    if (!vendorRisk[vendor]) vendorRisk[vendor] = { count: 0, totalScore: 0 };
    vendorRisk[vendor].count++;
    vendorRisk[vendor].totalScore += a.risk_score || 0;
  });

  const topVendors = Object.entries(vendorRisk)
    .map(([vendor, data]) => ({
      vendor,
      avgScore: Math.round((data.totalScore / data.count) * 100),
      count: data.count
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);


  return (
    <div className="analytics-view">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
            <span>Analytics</span> <ChevronRight size={12} /> <span>Visual Intelligence</span>
          </nav>
          <h1 style={{ fontSize: '1.875rem', color: '#0f172a' }}>Advanced Fraud Analytics</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Fiscal Year 2024 <Calendar size={14} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={loadData}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Intelligence
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <KPICard
          label="Potential Fraud Impact"
          value={`₹${(totalFraud / 100000).toFixed(1)}L`}
          change="+15%"
          isPositive={false}
          sub="Vs. ₹10.8L last period"
        />
        <KPICard
          label="High-Risk Vendors"
          value={highRiskVendors}
          badge={{ text: '+2', color: '#ef4444', bg: '#fee2e2' }}
          sub="Of 1,240 active vendors"
        />
        <KPICard
          label="Open Investigations"
          value={openInvestigations}
          change="-5%"
          isPositive={true}
          sub="3 pending review"
        />
        <KPICard
          label="Avg. Resolution Time"
          value="14 Days"
          badge={{ text: 'Stable', color: '#475569', bg: '#f1f5f9' }}
          sub="Target: 10 Days"
        />
      </div>

      {/* NEW: Network Graph Section */}
      <div style={{ marginBottom: '2rem' }}>
        <NetworkGraph data={networkData} />
      </div>

      {/* Detailed Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Benford's Law Analysis */}
        <BenfordChart data={benfordData} />

        {/* Vendor Risk Ranking */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Vendor Risk Ranking</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Top 5 entities by calculated risk score (0-100)</p>
            </div>
            <Filter size={18} color="#94a3b8" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {topVendors.length > 0 ? topVendors.map(v => (
              <RiskBar
                key={v.vendor}
                label={v.vendor}
                score={v.avgScore}
                color={v.avgScore >= 80 ? '#dc2626' : v.avgScore >= 60 ? '#ea580c' : v.avgScore >= 40 ? '#eab308' : '#10b981'}
              />
            )) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                No sufficient data for ranking
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Section: Repeat Offender Analysis */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Repeat Offender Analysis</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Entities flagged multiple times in current period</p>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onViewChange && onViewChange('alerts_queue'); }} style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>View All Cases</a>
        </div>

        <table style={{ width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Entity Name</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>Flag Count</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Avg Risk Score</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>Status</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {topVendors.map((v, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{v.vendor}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{
                    background: v.count > 5 ? '#fee2e2' : '#ffedd5',
                    color: v.count > 5 ? '#dc2626' : '#c2410c',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontWeight: 700
                  }}>
                    {v.count}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>{v.avgScore}/100</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{
                    backgroundColor: v.avgScore >= 80 ? '#fee2e2' : v.avgScore >= 60 ? '#ffedd5' : v.avgScore >= 40 ? '#fef9c3' : '#dcfce7',
                    color: v.avgScore >= 80 ? '#dc2626' : v.avgScore >= 60 ? '#ea580c' : v.avgScore >= 40 ? '#ca8a04' : '#16a34a',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.7rem'
                  }}>
                    {v.avgScore >= 80 ? 'Critical' : v.avgScore >= 60 ? 'High' : v.avgScore >= 40 ? 'Medium' : 'Low'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}><Download size={16} /></td>
              </tr>
            ))}
            {topVendors.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KPICard = ({ label, value, change, isPositive, sub, badge }) => (
  <div className="card" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>{label}</p>

      {badge && (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: badge.color, backgroundColor: badge.bg, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{badge.text}</span>
      )}

      {change && (
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: isPositive ? '#16a34a' : '#dc2626',
          backgroundColor: isPositive ? '#dcfce7' : '#fee2e2',
          padding: '0.1rem 0.4rem', borderRadius: '4px',
          display: 'flex', alignItems: 'center', gap: '2px'
        }}>
          {isPositive ? <TrendingDown size={10} /> : <TrendingUp size={10} />} {change}
        </span>
      )}
    </div>

    <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>{value}</p>
    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub}</p>
  </div>
);

const RiskBar = ({ label, score, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
      <span style={{ fontWeight: 600, color: '#334155' }}>{label}</span>
      <span style={{ fontWeight: 700, color: color }}>{score}/100</span>
    </div>
    <div style={{ height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${score}%`, backgroundColor: color, borderRadius: '5px' }}></div>
    </div>
  </div>
);

export default Analytics;
