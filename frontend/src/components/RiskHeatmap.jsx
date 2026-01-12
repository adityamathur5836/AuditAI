import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Building2, MapPin } from 'lucide-react';

const RiskHeatmap = ({ data, type = 'district' }) => {
    const [selectedItem, setSelectedItem] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                No {type} data available
            </div>
        );
    }

    const getRiskColor = (level) => {
        switch (level) {
            case 'HIGH': return '#dc2626';
            case 'MEDIUM': return '#f97316';
            default: return '#16a34a';
        }
    };

    const getRiskBg = (level) => {
        switch (level) {
            case 'HIGH': return '#fee2e2';
            case 'MEDIUM': return '#ffedd5';
            default: return '#dcfce7';
        }
    };

    const getRiskIcon = (level) => {
        switch (level) {
            case 'HIGH': return <AlertTriangle size={16} />;
            case 'MEDIUM': return <TrendingUp size={16} />;
            default: return <CheckCircle size={16} />;
        }
    };

    // Sort by risk level priority
    const sortedData = [...data].sort((a, b) => {
        const priority = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priority[b.risk_level] - priority[a.risk_level];
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Grid View */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem'
            }}>
                {sortedData.map((item, idx) => {
                    const name = item.district || item.department;
                    const riskColor = getRiskColor(item.risk_level);
                    const riskBg = getRiskBg(item.risk_level);

                    return (
                        <div
                            key={idx}
                            onClick={() => setSelectedItem(item)}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                border: `2px solid ${selectedItem === item ? riskColor : '#e2e8f0'}`,
                                borderLeft: `4px solid ${riskColor}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: selectedItem === item ? `0 4px 12px ${riskColor}30` : '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 4px 12px ${riskColor}30`;
                            }}
                            onMouseLeave={(e) => {
                                if (selectedItem !== item) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                }
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {type === 'district' ? <MapPin size={18} color="#64748b" /> : <Building2 size={18} color="#64748b" />}
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                        {name}
                                    </h4>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '12px',
                                    backgroundColor: riskBg,
                                    color: riskColor,
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                }}>
                                    {getRiskIcon(item.risk_level)}
                                    {item.risk_level}
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>Transactions</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                                        {item.total_transactions}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Value</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                                        ₹{(item.total_value / 100000).toFixed(1)}L
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>High Risk</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: riskColor }}>
                                        {item.high_risk_count}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>Avg Score</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                                        {(item.avg_risk_score * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </div>

                            {/* Risk Density Bar */}
                            <div style={{ marginTop: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Risk Density</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: riskColor }}>
                                        {(item.risk_density * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '6px',
                                    backgroundColor: '#e2e8f0',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${item.risk_density * 100}%`,
                                        height: '100%',
                                        backgroundColor: riskColor,
                                        transition: 'width 0.3s'
                                    }} />
                                </div>
                            </div>

                            {/* Recommendation */}
                            {item.risk_level === 'HIGH' && (
                                <div style={{
                                    marginTop: '0.75rem',
                                    padding: '0.5rem',
                                    backgroundColor: '#fef2f2',
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    color: '#991b1b'
                                }}>
                                    ⚠️ Higher audit attention recommended
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Table View for Selected */}
            {selectedItem && (
                <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                            {selectedItem.district || selectedItem.department} - Risk Detail
                        </h3>
                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.8rem',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Risk Concentration Observed</p>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                                {selectedItem.high_risk_count} out of {selectedItem.total_transactions} transactions flagged as high-risk.
                                Risk density of {(selectedItem.risk_density * 100).toFixed(1)}% indicates{' '}
                                {selectedItem.risk_level === 'HIGH' ? 'significant' : selectedItem.risk_level === 'MEDIUM' ? 'moderate' : 'minimal'}
                                {' '}concentration requiring {selectedItem.risk_level === 'HIGH' ? 'immediate' : 'standard'} audit attention.
                            </p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Financial Exposure</p>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                                Total transaction value of ₹{(selectedItem.total_value / 100000).toFixed(2)} Lakhs with average risk score of{' '}
                                {(selectedItem.avg_risk_score * 100).toFixed(1)}%.
                            </p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Recommended Action</p>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                                {selectedItem.risk_level === 'HIGH'
                                    ? 'Priority audit recommended. Review all flagged transactions and vendor relationships.'
                                    : selectedItem.risk_level === 'MEDIUM'
                                        ? 'Standard audit procedures. Monitor for pattern changes.'
                                        : 'Routine monitoring sufficient. No immediate action required.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskHeatmap;
