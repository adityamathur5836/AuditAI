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
import { fetchAlerts, fetchStats, checkHealth } from '../api';

const Analytics = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const health = await checkHealth();
    if (health.status === 'healthy') {
      const alertsData = await fetchAlerts(1000, 0.0);
      setAlerts(alertsData);
    }
    setLoading(false);
  };


  // derived metrics
  // derived metrics
  const totalFraud = alerts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const highRiskVendors = [...new Set(alerts.filter(a => a.risk_score > 0.6).map(a => a.vendor))].length;
  const openInvestigations = alerts.filter(a => a.risk_score > 0.8).length;

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
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  // Graph Data Calculation
  const getGraphPath = () => {
    if (!alerts.length) return "";
    
    // Bucket by month (simulated for now since data might be recent)
    // In a real app, use timestamps. Here we distribute alerts to simulate trend.
    const buckets = new Array(12).fill(0);
    alerts.forEach(a => {
        const month = new Date(a.timestamp || new Date()).getMonth();
        buckets[month] += (a.amount || 0); // or count
    });
    
    // Normalize to height of 300px
    const maxVal = Math.max(...buckets, 1);
    const points = buckets.map((val, idx) => {
        const x = (idx / 11) * 800;
        const y = 300 - ((val / maxVal) * 200) - 50; // Keep some padding
        return `${x},${y}`;
    });

    // Create smooth path (simple curve)
    return `M0,300 L${points.join(' L')} L800,300 Z`; 
    // Ideally use a curve function, but L is safer for rapid fix. 
    // Let's use a simple bezier approx if needed, but linear is fine for "Real Data" proof.
    
    // Better: Construct a path string with C (curved) commands manually or use a lib. 
    // For manual simple smoothing:
    let d = `M${points[0]}`;
    for (let i = 0; i < points.length - 1; i++) {
        const [x0, y0] = points[i].split(',').map(Number);
        const [x1, y1] = points[i+1].split(',').map(Number);
        const cp1x = x0 + (x1 - x0) / 2;
        const cp1y = y0;
        const cp2x = x0 + (x1 - x0) / 2;
        const cp2y = y1;
        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${x1},${y1}`;
    }
    return { path: d, area: `${d} L800,300 L0,300 Z` };
  };

  const graphData = getGraphPath();

  return (
    <div className="analytics-view">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
            <span>Analytics</span> <ChevronRight size={12} /> <span>Spending Trends</span>
          </nav>
          <h1 style={{ fontSize: '1.875rem', color: '#0f172a' }}>Analytics & Trends</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', color: '#64748b' }}>
                    Department: All Departments
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Fiscal Year 2024 <Calendar size={14} />
                </div>
                 <button className="btn btn-outline" style={{ border: 'none', color: '#2563eb' }}>
                    <Filter size={16} /> Advanced Filters
                </button>
            </div>
          <button className="btn btn-outline">
            <Download size={16} /> Export Report
          </button>
          <button className="btn btn-primary">
            New Analysis
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

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Time-based Fraud Patterns */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
                 <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Time-based Fraud Patterns</h3>
                 <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Suspicious activity volume over current fiscal year</p>
            </div>
            <MoreVertical size={18} color="#94a3b8" />
          </div>
          
          <div style={{ height: '300px', position: 'relative', display: 'flex', alignItems: 'flex-end', paddingBottom: '2rem' }}>
             <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
                 <defs>
                   <linearGradient id="gradientArea" x1="0" x2="0" y1="0" y2="1">
                     <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                     <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                   </linearGradient>
                   <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                     <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                     <feMerge>
                       <feMergeNode in="coloredBlur" />
                       <feMergeNode in="SourceGraphic" />
                     </feMerge>
                   </filter>
                 </defs>
                 
                 {/* Grid Lines */}
                 <line x1="0" y1="50" x2="800" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                 <line x1="0" y1="150" x2="800" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                 <line x1="0" y1="250" x2="800" y2="250" stroke="#f1f5f9" strokeWidth="1" />

                 {/* Area Fill */}
                 <path d={graphData.area || "M0,300 L800,300 Z"} fill="url(#gradientArea)" />

                 {/* Main Line with Glow */}
                 <path d={graphData.path || "M0,300 L800,300"} 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="3" 
                    filter="url(#glow)"
                    strokeLinecap="round"
                 />
                 
                 {/* Data Points - Simplified to start/end/peak for now or remove if too complex to dynamic positon */}
                 {/* <circle cx="240" cy="150" r="5" fill="#white" stroke="#2563eb" strokeWidth="2" /> */}

                  {/* Tooltip Enhanced */}
                 <g transform="translate(480, 50)">
                    <rect x="-60" y="-35" width="120" height="30" rx="4" fill="#1e293b" />
                    <text x="0" y="-15" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Peak Risk: 89%</text>
                    <polygon points="0,0 -5,-5 5,-5" fill="#1e293b" transform="translate(0, 0)" />
                 </g>
             </svg>
             
             {/* X-Axis */}
             <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', padding: '0 1rem' }}>
                 <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
             </div>
          </div>
        </div>

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
                     color={v.avgScore >= 80 ? '#dc2626' : v.avgScore >= 60 ? '#f97316' : '#eab308'} 
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
             <a href="#" style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>View All Cases</a>
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
                                  backgroundColor: v.avgScore > 80 ? '#fee2e2' : '#fef3c7', 
                                  color: v.avgScore > 80 ? '#7f1d1d' : '#92400e', 
                                  padding: '0.2rem 0.6rem', 
                                  borderRadius: '12px', 
                                  fontSize: '0.7rem' 
                              }}>
                                  {v.avgScore > 80 ? 'Critical' : 'Under Review'}
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
