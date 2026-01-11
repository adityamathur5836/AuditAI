import React from 'react';
import { Building2, ShieldAlert, ArrowRight, ShieldCheck, Activity, TrendingUp, Calendar } from 'lucide-react';

const VendorsPage = ({ entities = [], onVendorClick, dateFilter, onFilterChange }) => {
  return (
    <div className="vendors-page">

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {entities.map(vendor => (
          <div
            key={vendor.id}
            className="card"
            style={{
              marginBottom: 0,
              cursor: 'pointer',
              borderTop: `4px solid ${vendor.risk_score > 0.7 ? '#dc2626' : vendor.risk_score > 0.4 ? '#f97316' : '#22c55e'}`,
              transition: 'transform 0.2s',
            }}
            onClick={() => onVendorClick(vendor.id)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '12px',
                  backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <Building2 size={24} color="#64748b" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{vendor.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{vendor.departments?.length || 1} Active Contract(s)</p>
                </div>
              </div>
              <div style={{
                padding: '0.25rem 0.75rem', borderRadius: '20px',
                backgroundColor: vendor.risk_score > 0.7 ? '#fee2e2' : vendor.risk_score > 0.4 ? '#ffedd5' : '#dcfce7',
                color: vendor.risk_score > 0.7 ? '#dc2626' : vendor.risk_score > 0.4 ? '#c2410c' : '#15803d',
                fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem'
              }}>
                {vendor.risk_score > 0.7 ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                {vendor.risk_score > 0.7 ? 'CRITICAL' : vendor.risk_score > 0.4 ? 'HIGH' : 'LOW'}
              </div>
            </div>

            {/* Sparkline / Trend Placeholder */}
            <div style={{ marginBottom: '1rem', height: '40px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
              {(vendor.history || [0.2, 0.3, 0.5, 0.4, 0.6]).map((score, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: `${score * 100}%`,
                  backgroundColor: score > 0.7 ? '#dc2626' : '#cbd5e1',
                  borderRadius: '2px'
                }}></div>
              ))}
            </div>

            {/* Anomaly Categories / Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {(vendor.top_reasons || []).slice(0, 3).map((reason, idx) => {
                // Extract concise tag from reason string
                let tag = 'Anomaly';
                if (reason.includes('DUPLICATE')) tag = 'Duplicate Payment';
                else if (reason.includes('Round')) tag = 'Round Amount';
                else if (reason.includes('deviation')) tag = 'Statistical Deviation';
                else if (reason.includes('Rare')) tag = 'Pattern Anomaly';
                else if (reason.includes('Weekend')) tag = 'Off-Hours';
                else if (reason.includes('Rapid')) tag = 'Velocity Risk';

                return (
                  <span key={idx} style={{
                    fontSize: '0.65rem', fontWeight: 600,
                    padding: '0.125rem 0.5rem', borderRadius: '4px',
                    backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3'
                  }}>
                    {tag}
                  </span>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Volume</p>
                <p style={{ fontWeight: 700, color: '#334155' }}>₹{(vendor.total_amount / 100000).toFixed(1)} L</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Flags</p>
                <p style={{ fontWeight: 700, color: vendor.flag_count > 0 ? '#dc2626' : '#64748b' }}>{vendor.flag_count} Alerts</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <span style={{ color: '#64748b' }}>Last active: {new Date(vendor.last_active).toLocaleDateString()}</span>
              <span style={{ color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View Full Profile <ArrowRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorsPage;
