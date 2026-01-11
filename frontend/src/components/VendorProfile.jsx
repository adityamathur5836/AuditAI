import React from 'react';
import { ArrowLeft, Building2, Globe, History, ShieldAlert, ShieldCheck, MapPin, Share2, Activity } from 'lucide-react';

const VendorProfile = ({ vendorId, alerts, onBack }) => {
  // Mock vendor details based on alerts data
  const vendorAlerts = alerts.filter(a => a.vendor === vendorId);
  const totalFlagged = vendorAlerts.reduce((sum, a) => sum + (a.amount || 0), 0);
  const deptCount = new Set(vendorAlerts.map(a => a.department)).size;
  const avgRisk = vendorAlerts.reduce((sum, a) => sum + a.risk_score, 0) / (vendorAlerts.length || 1);
  console.log(vendorId)

  return (
    <div className="vendor-profile fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '12px',
            backgroundColor: '#fff', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <Building2 size={32} color="#2563eb" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{vendorId}</h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              <MapPin size={14} /> Registered Entity | ID: #VEN-{Math.floor(Math.random() * 10000)}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onBack} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to List
          </button>
          <button className="btn btn-primary" style={{ backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} /> Flag Entity
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Risk Exposure</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>₹{totalFlagged.toLocaleString()}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Risk Flags</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f97316' }}>{vendorAlerts.length}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Department Reach</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{deptCount}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Avg Risk Score</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: avgRisk >= 0.8 ? '#dc2626' : avgRisk >= 0.6 ? '#ea580c' : avgRisk >= 0.4 ? '#eab308' : '#10b981' }}>
              {(avgRisk * 100).toFixed(0)}
            </p>
            <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>/ 100</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="left-column">
          {/* History Panel */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <History size={20} color="#2563eb" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Audit Flag History</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {vendorAlerts.length > 0 ? vendorAlerts.map((alert, i) => (
                <div key={i} style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: alert.risk_score > 0.7 ? '#fee2e2' : '#ffedd5' }}>
                      <Activity size={16} color={alert.risk_score > 0.7 ? '#dc2626' : '#c2410c'} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{alert.invoice_id || 'INV-UNKNOWN'} - {alert.category || 'General'}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(alert.created_at || Date.now()).toLocaleDateString()} | {alert.department}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: '#0f172a' }}>₹{alert.amount?.toLocaleString()}</p>
                    <span style={{
                      fontSize: '0.625rem',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '4px',
                      fontWeight: 700,
                      backgroundColor: alert.risk_score > 0.7 ? '#fee2e2' : '#ffedd5',
                      color: alert.risk_score > 0.7 ? '#dc2626' : '#c2410c'
                    }}>
                      RISK: {(alert.risk_score * 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No alerts found for this vendor.</div>
              )}
            </div>
          </div>
        </div>

        <div className="right-column">
          {/* Alias Intelligence */}
          <div className="card" style={{ borderTop: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Globe size={20} color="#2563eb" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Alias Intelligence</h3>
            </div>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>
              AuditAI has linked the following names to this entity based on Tax ID signatures.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>
                {vendorId} (Primary)
              </span>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                {vendorId} Pvt Ltd
              </span>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                {(vendorId || 'Unknown').split(' ')[0]} Services
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default VendorProfile;
