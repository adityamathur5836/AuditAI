import React from 'react';
import { Building2, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';

const VendorsPage = ({ alerts, onVendorClick }) => {
  // Aggregate data by vendor
  const vendorStats = alerts.reduce((acc, alert) => {
    if (!acc[alert.vendor]) {
      acc[alert.vendor] = {
        id: alert.vendor,
        totalAmount: 0,
        alertsCount: 0,
        departments: new Set(),
        riskScores: []
      };
    }
    acc[alert.vendor].totalAmount += (alert.amount || 0);
    acc[alert.vendor].alertsCount += 1;
    acc[alert.vendor].departments.add(alert.department);
    acc[alert.vendor].riskScores.push(alert.risk_score);
    return acc;
  }, {});

  const vendors = Object.values(vendorStats).map(v => ({
    ...v,
    avgRisk: v.riskScores.reduce((a, b) => a + b, 0) / v.riskScores.length,
    deptCount: v.departments.size
  })).sort((a, b) => b.avgRisk - a.avgRisk); // Sort by risk desc

  return (
    <div className="vendors-page">

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {vendors.map(vendor => (
          <div 
            key={vendor.id} 
            className="card" 
            style={{ 
              marginBottom: 0, 
              cursor: 'pointer',
              borderLeft: `4px solid ${vendor.avgRisk > 0.7 ? '#dc2626' : vendor.avgRisk > 0.4 ? '#f97316' : '#22c55e'}`,
              transition: 'transform 0.2s',
            }}
            onClick={() => onVendorClick(vendor.id)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: '8px', 
                  backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Building2 size={20} color="#64748b" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{vendor.id}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{vendor.deptCount} Active Contracts</p>
                </div>
              </div>
              {vendor.avgRisk > 0.7 && <ShieldAlert size={20} color="#dc2626" />}
              {vendor.avgRisk <= 0.4 && <ShieldCheck size={20} color="#22c55e" />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <p style={{ fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase' }}>Volume</p>
                <p style={{ fontWeight: 600 }}>₹{(vendor.totalAmount / 100000).toFixed(1)} Lakh</p>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <p style={{ fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase' }}>Alerts</p>
                <p style={{ fontWeight: 600, color: vendor.alertsCount > 0 ? '#f97316' : '#64748b' }}>{vendor.alertsCount}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
              <span style={{ 
                padding: '0.25rem 0.5rem', borderRadius: '4px', 
                backgroundColor: vendor.avgRisk > 0.7 ? '#fee2e2' : vendor.avgRisk > 0.4 ? '#ffedd5' : '#dcfce7',
                color: vendor.avgRisk > 0.7 ? '#dc2626' : vendor.avgRisk > 0.4 ? '#c2410c' : '#15803d',
                fontWeight: 600
              }}>
                Risk Score: {(vendor.avgRisk * 100).toFixed(0)}
              </span>
              <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View Profile <ArrowRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorsPage;
