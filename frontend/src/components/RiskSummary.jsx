import React from 'react';
import { TrendingUp, Users, AlertCircle, DollarSign } from 'lucide-react';

const RiskSummary = ({ alerts }) => {
  const highRiskCount = alerts.filter(a => a.risk_score >= 0.8).length;
  const totalRiskScore = alerts.reduce((acc, curr) => acc + curr.risk_score, 0);
  const avgRisk = alerts.length > 0 ? (totalRiskScore / alerts.length) : 0;

  const stats = [
    { label: 'High Risk Alerts', value: highRiskCount, icon: AlertCircle, color: 'var(--risk-high)' },
    { label: 'Avg Risk Score', value: (avgRisk * 100).toFixed(1), icon: TrendingUp, color: 'var(--risk-medium)' },
    { label: 'Active Vendors', value: '12', icon: Users, color: 'var(--primary-color)' },
    { label: 'Flagged Amount', value: '₹1.1 Cr', icon: DollarSign, color: 'var(--text-secondary)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
      {stats.map((stat) => (
        <div key={stat.label} className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</p>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: `${stat.color}1a` }}>
              <stat.icon size={20} color={stat.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RiskSummary;
