import React from 'react';
import { ArrowLeft, Building2, Globe, History, ShieldAlert, Network, Share2, MapPin } from 'lucide-react';

const VendorProfile = ({ vendorId, alerts, onBack }) => {
  // Mock vendor details based on alerts data
  const vendorAlerts = alerts.filter(a => a.vendor === vendorId);
  const totalFlagged = vendorAlerts.reduce((sum, a) => sum + (a.amount || 0), 0);
  
  return (
    <div className="vendor-profile">
      <button 
        onClick={onBack}
        className="btn" 
        style={{ background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingLeft: 0 }}
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={32} color="var(--primary-color)" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{vendorId}</h1>
            <p className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} /> Registered Entity | Primary Category: Professional Services
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={18} /> Export Profile
          </button>
          <button className="btn btn-primary" style={{ backgroundColor: 'var(--risk-high)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} /> Flag Entity
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <p className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Risk Exposure</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{totalFlagged.toLocaleString()}</p>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <p className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Risk Flags</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--risk-high)' }}>{vendorAlerts.length}</p>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <p className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Dept. Exposure</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{new Set(vendorAlerts.map(a => a.department)).size}</p>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <p className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Reliability Rating</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--risk-medium)' }}>B-</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="left-column">
          {/* History Panel */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <History size={20} color="var(--primary-color)" />
              <h2 style={{ fontSize: '1.25rem' }}>Audit Flag History</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {vendorAlerts.map((alert, i) => (
                <div key={i} style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#ffffff03', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{alert.type}</p>
                    <p className="text-secondary" style={{ fontSize: '0.875rem' }}>{new Date(alert.timestamp).toLocaleDateString()} | Dept: {alert.department}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700 }}>₹{alert.amount?.toLocaleString()}</p>
                    <p style={{ fontSize: '0.75rem', color: alert.risk_score >= 0.8 ? 'var(--risk-high)' : 'var(--risk-medium)' }}>Risk: {Math.round(alert.risk_score * 100)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alias Intelligence */}
          <div className="card" style={{ border: '1px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Globe size={20} color="var(--primary-color)" />
              <h2 style={{ fontSize: '1.25rem' }}>Alias Intelligence</h2>
            </div>
            <p className="text-secondary" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              AuditAI has linked the following names to this entity based on 95% fuzzy match and shared Tax ID signatures.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', backgroundColor: '#3b82f620', border: '1px solid var(--primary-color)', fontSize: '0.875rem', color: 'var(--primary-color)' }}>
                {vendorId} (Primary)
              </span>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', backgroundColor: '#ffffff05', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                {vendorId}-Supplies
              </span>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', backgroundColor: '#ffffff05', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                {vendorId.substring(0, 10)}...
              </span>
            </div>
          </div>
        </div>

        <div className="right-column">
          {/* Risk Network */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Network size={20} color="var(--primary-color)" />
              <h3 style={{ fontSize: '1rem' }}>Risk Network</h3>
            </div>
            <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>
              Related entities identified in other government bureaus.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff03' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>VEN-TECH-05</p>
                <p className="text-secondary" style={{ fontSize: '0.75rem' }}>Reason: Shared Approver (ID: A-01)</p>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff03' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>VEN-MED-01</p>
                <p className="text-secondary" style={{ fontSize: '0.75rem' }}>Reason: Shared Mailing Hash</p>
              </div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Compliance Check</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-secondary">Tax ID Verified</span>
                <span style={{ color: 'var(--risk-low)' }}>Pass</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-secondary">Debarred List</span>
                <span style={{ color: 'var(--risk-low)' }}>Clear</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-secondary">Conflict of Interest</span>
                <span style={{ color: 'var(--risk-medium)' }}>Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
