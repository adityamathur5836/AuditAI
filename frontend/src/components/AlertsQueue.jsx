import React from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  MoreHorizontal, 
  LayoutGrid, 
  List, 
  Eye,
  CheckCircle2,
  AlertTriangle,
  History,
  User,
  Building2,
  Users
} from 'lucide-react';

const AlertsQueue = ({ alerts, onInvestigate }) => {
  return (
    <div className="alerts-queue-view">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
            <span>Home</span> <ChevronRight size={12} /> <span>Risk Queue</span>
          </nav>
          <h1 style={{ fontSize: '1.875rem', color: '#0f172a' }}>Alerts & Risk Queue</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Monitor and investigate flagged irregularities across government departments.</p>
        </div>
      </header>

      {/* Toolbar (Matching Image 4) */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 1rem', maxWidth: '500px' }}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by Entity Name or ID..." 
            style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} /> Risk Type
          </button>
          <button className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Users size={16} /> Entity Type
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '1px solid #e2e8f0' }}>
            <div style={{ width: 36, height: 20, backgroundColor: '#e2e8f0', borderRadius: '10px', position: 'relative' }}>
              <div style={{ position: 'absolute', right: 2, top: 2, width: 16, height: 16, backgroundColor: 'white', borderRadius: '50%' }}></div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>High Risk Only</span>
          </div>
        </div>
      </div>

      {/* Dense Alerts Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={{ padding: '1rem 1.5rem' }}>RISK LEVEL</th>
              <th>ENTITY TYPE</th>
              <th>ENTITY NAME / ID</th>
              <th>RISK SCORE</th>
              <th>REASON FLAGGED</th>
              <th>LAST ACTIVITY</th>
              <th style={{ paddingRight: '1.5rem' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {alerts.slice(0, 10).map((alert, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    fontSize: '0.625rem', 
                    fontWeight: 800, 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '4px',
                    backgroundColor: alert.risk_score > 0.8 ? '#fee2e2' : (alert.risk_score > 0.6 ? '#fef3c7' : '#dcfce7'),
                    color: alert.risk_score > 0.8 ? '#dc2626' : (alert.risk_score > 0.6 ? '#d97706' : '#16a34a'),
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                    {alert.risk_score > 0.8 ? 'Critical' : (alert.risk_score > 0.6 ? 'Medium' : 'Warning')}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Vendor</span>
                </td>
                <td>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{alert.vendor}</p>
                    <p style={{ fontSize: '0.625rem', color: '#94a3b8' }}>ID: #{alert.transaction_id.slice(-4)}-{idx+100}</p>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{(alert.risk_score * 100).toFixed(0)}</span>
                    <div style={{ width: 32, height: 4, backgroundColor: '#f1f5f9', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${alert.risk_score * 100}%`, backgroundColor: alert.risk_score > 0.8 ? '#dc2626' : '#f97316', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <p style={{ fontSize: '0.75rem', color: '#475569', maxWidth: '300px', lineHeight: 1.4 }}>
                    {alert.type === 'OFF_HOURS' ? 'Unusual weekend procurement activity detected.' : 'Transaction exceeds standard threshold for department.'}
                  </p>
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Oct 24, 2023</span>
                </td>
                <td style={{ paddingRight: '1.5rem' }}>
                  <button 
                    onClick={() => onInvestigate(alert)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Showing 1-10 of {alerts.length} alerts</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Previous</button>
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsQueue;
