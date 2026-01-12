import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertOctagon, AlertTriangle, ShieldCheck, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

const EntityRiskTable = ({ entities = [], onVendorView }) => {
    const [expandedGroups, setExpandedGroups] = useState({
        CRITICAL: true,
        HIGH: true,
        MEDIUM: false,
        LOW: false
    });

    const toggleGroup = (group) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    // Group entities
    const groups = {
        CRITICAL: entities.filter(e => e.verdict === 'CRITICAL'),
        HIGH: entities.filter(e => e.verdict === 'HIGH'),
        MEDIUM: entities.filter(e => e.verdict === 'MEDIUM'),
        LOW: entities.filter(e => e.verdict === 'LOW')
    };

    const getGroupColor = (level) => {
        switch (level) {
            case 'CRITICAL': return '#dc2626';
            case 'HIGH': return '#ea580c';
            case 'MEDIUM': return '#eab308';
            default: return '#10b981';
        }
    };

    const getGroupIcon = (level) => {
        switch (level) {
            case 'CRITICAL': return <AlertOctagon size={18} />;
            case 'HIGH': return <AlertTriangle size={18} />;
            case 'MEDIUM': return <Activity size={18} />;
            default: return <ShieldCheck size={18} />;
        }
    };

    const renderSparkline = (history) => {
        if (!history || history.length < 2) return <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Insufficient Data</span>;
        // Simple visual representation of trend
        const recent = history[0];
        const old = history[history.length - 1];
        const diff = recent - old;

        if (diff > 0.1) return <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}><TrendingUp size={14} /> Worsening</span>;
        if (diff < -0.1) return <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}><TrendingDown size={14} /> Improving</span>;
        return <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}><Minus size={14} /> Stable</span>;
    };

    const renderGroup = (level, label) => {
        const items = groups[level];
        if (items.length === 0) return null;
        const isExpanded = expandedGroups[level];
        const color = getGroupColor(level);

        return (
            <div key={level} style={{ marginBottom: '1rem', border: `1px solid ${color}30`, borderRadius: '8px', overflow: 'hidden' }}>
                <div
                    onClick={() => toggleGroup(level)}
                    style={{
                        backgroundColor: `${color}10`,
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderLeft: `4px solid ${color}`
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {isExpanded ? <ChevronDown size={16} color={color} /> : <ChevronRight size={16} color={color} />}
                        <div style={{ color: color, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                            {getGroupIcon(level)}
                            {label} ({items.length})
                        </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {isExpanded ? 'Click to collapse' : 'Click to expand details'}
                    </div>
                </div>

                {isExpanded && (
                    <div style={{ backgroundColor: 'white' }}>
                        <table style={{ width: '100%', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Entity Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'center' }}>Total Risk Exposure</th>
                                    <th style={{ padding: '1rem', textAlign: 'center' }}>Confidence</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Primary Anomaly</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Trend</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((entity) => (
                                    <tr key={entity.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>
                                            {entity.name}
                                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>
                                                {entity.flag_count} flags across {entity.departments.length} depts
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                                            ₹{entity.total_amount.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                backgroundColor: level === 'CRITICAL' ? '#fee2e2' : level === 'HIGH' ? '#ffedd5' : '#fef9c3',
                                                color: level === 'CRITICAL' ? '#dc2626' : level === 'HIGH' ? '#ea580c' : '#ca8a04',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '12px',
                                                fontSize: '0.7rem',
                                                fontWeight: 700
                                            }}>
                                                {(entity.risk_score * 100).toFixed(0)}% Match
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', maxWidth: '250px', fontSize: '0.8rem', color: '#475569' }}>
                                            {entity.top_reasons && entity.top_reasons[0] ? (
                                                entity.top_reasons[0]
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Multiple minor deviations</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {renderSparkline(entity.history)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => onVendorView(entity.id)}
                                                className="btn-outline"
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    fontSize: '0.75rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid #2563eb',
                                                    backgroundColor: 'transparent',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    color: '#2563eb'
                                                }}
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="entity-risk-registry">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Entity Risk Registry</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Live Real-Time Aggregation</span>
            </div>

            {renderGroup('CRITICAL', 'Critical Risk Entities')}
            {renderGroup('HIGH', 'High Risk Entities')}
            {renderGroup('MEDIUM', 'Medium Investigation Priority')}
            {renderGroup('LOW', 'Low Risk Monitor')}

            {Object.values(groups).flat().length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
                    <ShieldCheck size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No entity risks detected yet. System monitoring active.</p>
                </div>
            )}
        </div>
    );
};

export default EntityRiskTable;
