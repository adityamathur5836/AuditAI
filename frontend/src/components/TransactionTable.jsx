import React from 'react';
import { ExternalLink, AlertTriangle, Clock, Layers, AlertCircle, ChevronRight } from 'lucide-react';

const TransactionTable = ({ alerts, onInvestigate, onVendorView }) => {
  const getRiskColor = (score) => {
    if (score >= 0.8) return '#dc2626';
    if (score >= 0.6) return '#d97706';
    return '#059669';
  };

  const getIcon = (type) => {
    switch (type) {
      case 'DUPLICATE': return <Layers size={16} />;
      case 'OFF_HOURS': return <Clock size={16} />;
      case 'STAT_OUTLIER': return <AlertTriangle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
      <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>System Flagged Transactions</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Filter: All Events</span>
        </div>
      </div>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Vendor / Entity</th>
            <th>Risk Score</th>
            <th>Digital Narrative</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, index) => {
            const isLive = alert.transaction_id.startsWith('RT-');
            return (
              <tr key={index} style={{ backgroundColor: isLive ? '#eff6ff' : 'white' }}>
                <td style={{ paddingLeft: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: getRiskColor(alert.risk_score) }}>
                    <div style={{ backgroundColor: `${getRiskColor(alert.risk_score)}15`, padding: '0.4rem', borderRadius: '6px' }}>
                      {getIcon(alert.type)}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>{alert.type}</span>
                    {isLive && (
                      <span style={{ 
                        backgroundColor: '#2563eb', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.625rem', 
                        fontWeight: 800,
                        animation: 'pulse 1.5s infinite'
                      }}>NEW</span>
                    )}
                  </div>
                </td>
                <td>
                  <button 
                    onClick={() => onVendorView(alert.vendor)}
                    style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    {alert.vendor}
                  </button>
                  <p style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.25rem' }}>ID: {alert.transaction_id.slice(-8)}</p>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '4px', 
                      backgroundColor: '#f1f5f9', 
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${alert.risk_score * 100}%`, 
                        backgroundColor: getRiskColor(alert.risk_score) 
                      }}></div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', minWidth: '24px' }}>{(alert.risk_score * 100).toFixed(0)}</span>
                  </div>
                </td>
                <td style={{ color: '#475569', maxWidth: '350px', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                  {alert.explanation.length > 80 ? alert.explanation.substring(0, 80) + '...' : alert.explanation}
                </td>
                <td style={{ paddingRight: '1.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => onInvestigate(alert)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', border: '1px solid #cbd5e1' }}
                  >
                    Investigate <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
