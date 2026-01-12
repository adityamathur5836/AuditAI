import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, Users, AlertTriangle, Calendar, Package, BarChart3 } from 'lucide-react';

const DepartmentDetail = ({ departmentId, alerts, onBack }) => {
    const [stats, setStats] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);

    useEffect(() => {
        if (departmentId && alerts) {
            analyzeData();
        }
    }, [departmentId, alerts]);

    const analyzeData = () => {
        // Filter alerts for this department
        const deptAlerts = alerts.filter(a => a.department_id === departmentId);

        // Calculate statistics
        const totalAmount = deptAlerts.reduce((sum, a) => sum + (a.amount || 0), 0);
        const highRiskCount = deptAlerts.filter(a => a.risk_score > 0.7).length;
        const avgRiskScore = deptAlerts.reduce((sum, a) => sum + a.risk_score, 0) / deptAlerts.length || 0;

        // Vendor breakdown
        const vendorMap = {};
        deptAlerts.forEach(alert => {
            const vId = alert.vendor_id;
            if (!vendorMap[vId]) {
                vendorMap[vId] = {
                    id: vId,
                    totalAmount: 0,
                    transactionCount: 0,
                    highRiskCount: 0,
                    avgRisk: 0,
                    riskScores: []
                };
            }
            vendorMap[vId].totalAmount += alert.amount || 0;
            vendorMap[vId].transactionCount += 1;
            vendorMap[vId].riskScores.push(alert.risk_score);
            if (alert.risk_score > 0.7) vendorMap[vId].highRiskCount += 1;
        });

        // Calculate average risk per vendor
        const vendorList = Object.values(vendorMap).map(v => ({
            ...v,
            avgRisk: v.riskScores.reduce((a, b) => a + b, 0) / v.riskScores.length
        })).sort((a, b) => b.avgRisk - a.avgRisk);

        // Recent transactions (last 10)
        const recent = [...deptAlerts]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

        setStats({
            totalTransactions: deptAlerts.length,
            totalAmount,
            highRiskCount,
            avgRiskScore,
            vendorCount: vendorList.length
        });
        setVendors(vendorList);
        setRecentTransactions(recent);
    };

    if (!stats) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading department details...</div>;
    }

    const getRiskColor = (score) => {
        if (score > 0.7) return '#dc2626';
        if (score > 0.4) return '#f97316';
        return '#16a34a';
    };

    return (
        <div className="department-detail">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
            >
                <ArrowLeft size={16} /> Back to Departments
            </button>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Package size={20} color="#3b82f6" />
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Transactions</span>
                    </div>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalTransactions}</p>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <DollarSign size={20} color="#10b981" />
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Spend</span>
                    </div>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                        ₹{(stats.totalAmount / 100000).toFixed(1)}L
                    </p>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Users size={20} color="#8b5cf6" />
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Vendors</span>
                    </div>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats.vendorCount}</p>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <AlertTriangle size={20} color="#dc2626" />
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>High Risk</span>
                    </div>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626' }}>{stats.highRiskCount}</p>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <BarChart3 size={20} color="#f59e0b" />
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Avg Risk</span>
                    </div>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: getRiskColor(stats.avgRiskScore) }}>
                        {(stats.avgRiskScore * 100).toFixed(0)}%
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Vendor Breakdown */}
                <div className="card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        Vendor Breakdown by Risk
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {vendors.map((vendor, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '1rem',
                                    borderBottom: idx < vendors.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    borderLeft: `4px solid ${getRiskColor(vendor.avgRisk)}`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                            {vendor.id}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {vendor.transactionCount} transactions • ₹{(vendor.totalAmount / 1000).toFixed(0)}K
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            fontWeight: 700,
                                            color: getRiskColor(vendor.avgRisk)
                                        }}>
                                            {(vendor.avgRisk * 100).toFixed(0)}%
                                        </p>
                                        {vendor.highRiskCount > 0 && (
                                            <p style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '0.25rem' }}>
                                                {vendor.highRiskCount} high-risk
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        Recent Transactions
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {recentTransactions.map((tx, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '1rem',
                                    borderBottom: idx < recentTransactions.length - 1 ? '1px solid #f1f5f9' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                            {tx.vendor_id}
                                        </p>
                                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                            ₹{tx.amount?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '12px',
                                            backgroundColor: getRiskColor(tx.risk_score) + '20',
                                            color: getRiskColor(tx.risk_score),
                                            fontSize: '0.7rem',
                                            fontWeight: 700
                                        }}>
                                            {(tx.risk_score * 100).toFixed(0)}%
                                        </div>
                                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                            {new Date(tx.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {tx.explanation && (
                                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                        {tx.explanation.substring(0, 80)}...
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Anomaly Patterns */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Common Anomaly Patterns
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {['Z-Score Deviation', 'Off-Hours Transaction', 'Round Number'].map((pattern, idx) => {
                        const count = recentTransactions.filter(t =>
                            t.explanation?.toLowerCase().includes(pattern.toLowerCase())
                        ).length;
                        return (
                            <div key={idx} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{pattern}</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{count}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DepartmentDetail;
