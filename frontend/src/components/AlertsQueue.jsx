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
  const [filterReview, setFilterReview] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filteredAlerts = filterReview
    ? alerts.filter(a => a.status === 'review' || a.status === 'escalate') // Assuming mock status or future implementation
    : alerts;

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageAlerts = filteredAlerts.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="alerts-queue-view">
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
          <button
            className={`btn ${filterReview ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterReview(!filterReview)}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderColor: filterReview ? 'transparent' : '#e2e8f0' }}
          >
            <CheckCircle2 size={16} /> Marked Under Review
          </button>
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
            {currentPageAlerts.length > 0 ? (
              currentPageAlerts.map((alert, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      backgroundColor: alert.risk_score >= 0.8 ? '#fee2e2' : alert.risk_score >= 0.6 ? '#ffedd5' : alert.risk_score >= 0.4 ? '#fef9c3' : '#dcfce7',
                      color: alert.risk_score >= 0.8 ? '#dc2626' : alert.risk_score >= 0.6 ? '#ea580c' : alert.risk_score >= 0.4 ? '#ca8a04' : '#16a34a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                      {alert.risk_score >= 0.8 ? 'Critical' : alert.risk_score >= 0.6 ? 'High' : alert.risk_score >= 0.4 ? 'Medium' : 'Low'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Vendor</span>
                  </td>
                  <td>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{alert.vendor}</p>
                      <p style={{ fontSize: '0.625rem', color: '#94a3b8' }}>ID: #{alert.transaction_id.slice(-4)}-{idx + 100}</p>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{(alert.risk_score * 100).toFixed(0)}</span>
                      <div style={{ width: 32, height: 4, backgroundColor: '#f1f5f9', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${alert.risk_score * 100}%`, backgroundColor: alert.risk_score >= 0.8 ? '#dc2626' : alert.risk_score >= 0.6 ? '#ea580c' : alert.risk_score >= 0.4 ? '#eab308' : '#10b981', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p style={{ fontSize: '0.75rem', color: '#475569', maxWidth: '300px', lineHeight: 1.4 }}>
                      {alert.explanation || (alert.type === 'OFF_HOURS' ? 'Unusual weekend procurement activity detected.' : 'Transaction exceeds standard threshold for department.')}
                    </p>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Just now'}</span>
                  </td>
                  <td style={{ paddingRight: '1.5rem' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => onInvestigate(alert)}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.75rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px'
                      }}
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  {filterReview ? 'No items marked under review.' : 'No active alerts.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Showing {filteredAlerts.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredAlerts.length)} of {filteredAlerts.length} alerts
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              onClick={handlePrev}
              disabled={currentPage === 1}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <button
              className="btn btn-outline"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsQueue;
