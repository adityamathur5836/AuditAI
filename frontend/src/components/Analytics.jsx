import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  BarChart3, 
  PieChart, 
  Calendar,
  Download,
  Filter,
  Plus
} from 'lucide-react';

const Analytics = () => {
  return (
    <div className="analytics-view">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
            <span>Analytics</span> <ChevronRight size={12} /> <span>Spending Trends</span>
          </nav>
          <h1 style={{ fontSize: '1.875rem', color: '#0f172a' }}>Analytics & Trends</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ borderStyle: 'dashed' }}>
            <Download size={16} /> Export Report
          </button>
          <button className="btn btn-primary">
            <Plus size={16} /> New Analysis
          </button>
        </div>
      </header>

      {/* Filters Bar (Matching Image 2) */}
      <div className="card" style={{ display: 'flex', gap: '2rem', padding: '1rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Department</p>
          <select style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}>
            <option>All Departments</option>
            <option>Public Works</option>
            <option>Healthcare</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Audit Period</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}>
             <Calendar size={14} color="#64748b" />
             <span>Fiscal Year 2024</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
           <button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
             <Filter size={14} /> Advanced Filters
           </button>
        </div>
      </div>

      {/* Analytics KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <KPICard 
          label="Potential Fraud Impact" 
          value="₹112 Cr" 
          change="+15%" 
          isPositive={false} 
          sub="Vs. ₹103 Cr last period"
        />
        <KPICard 
          label="High-Risk Vendors" 
          value="45" 
          change="+2" 
          isPositive={false} 
          sub="Of 1,240 active vendors"
        />
        <KPICard 
          label="Open Investigations" 
          value="12" 
          change="-5%" 
          isPositive={true} 
          sub="3 pending review"
        />
        <KPICard 
          label="Avg. Resolution Time" 
          value="14 Days" 
          isStable 
          sub="Target: 10 Days"
        />
      </div>

      {/* Main Charts Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Time-based Fraud Patterns</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Suspicious activity volume over current fiscal year</p>
            </div>
            <button style={{ color: '#94a3b8' }}>•••</button>
          </div>
          {/* Mock Line Chart */}
          <div style={{ height: '250px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: '0 1rem' }}>
            <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%' }}>
              <path 
                d="M0,150 L100,140 L200,160 L300,100 L400,120 L500,60 L600,130 L700,50 L800,80" 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="3"
              />
              <path 
                d="M0,150 L100,140 L200,160 L300,100 L400,120 L500,60 L600,130 L700,50 L800,80 L800,200 L0,200 Z" 
                fill="url(#grad1)"
                opacity="0.1"
              />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#2563eb', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#2563eb', stopOpacity:0}} />
                </linearGradient>
              </defs>
              {/* Highlight Point */}
              <circle cx="500" cy="60" r="6" fill="#2563eb" />
              <rect x="470" y="20" width="80" height="24" rx="4" fill="#0f172a" />
              <text x="510" y="36" textAnchor="middle" fill="white" style={{ fontSize: 10, fontWeight: 700 }}>Q3 Spikes: 243</text>
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.625rem', color: '#94a3b8', padding: '0 0.5rem' }}>
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Vendor Risk Ranking</h3>
            <Filter size={16} color="#94a3b8" />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.5rem' }}>Top 5 entities by calculated risk score (0-100)</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <RiskBar label="Acme Construction Ltd." score={98} color="#dc2626" />
            <RiskBar label="Global Logistics Group" score={85} color="#dc2626" />
            <RiskBar label="TechServ Solutions" score={72} color="#f97316" />
            <RiskBar label="City Maintenance Co." score={65} color="#f97316" />
            <RiskBar label="PaperWorks Supplies" score={54} color="#eab308" />
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ label, value, change, isPositive, sub, isStable }) => (
  <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{label}</p>
      {change && (
        <span style={{ 
          fontSize: '0.625rem', 
          fontWeight: 700, 
          padding: '0.2rem 0.5rem', 
          borderRadius: '4px',
          backgroundColor: isPositive ? '#dcfce7' : '#fee2e2',
          color: isPositive ? '#16a34a' : '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem'
        }}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {change}
        </span>
      )}
      {isStable && (
         <span style={{ 
          fontSize: '0.625rem', 
          fontWeight: 700, 
          padding: '0.2rem 0.5rem', 
          borderRadius: '4px',
          backgroundColor: '#f1f5f9',
          color: '#64748b'
        }}>Stable</span>
      )}
    </div>
    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{value}</p>
    <p style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 600 }}>{sub}</p>
  </div>
);

const RiskBar = ({ label, score, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ fontWeight: 800, color }}>{score}/100</span>
    </div>
    <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${score}%`, backgroundColor: color }}></div>
    </div>
  </div>
);

export default Analytics;
