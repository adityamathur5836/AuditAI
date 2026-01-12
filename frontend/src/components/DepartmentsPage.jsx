import React, { useState, useEffect } from 'react';
import { fetchDepartments } from '../api';
import { Building2, AlertTriangle, IndianRupee, PieChart, TrendingUp, AlertOctagon } from 'lucide-react';

const DepartmentsPage = ({ onDepartmentClick }) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchDepartments();
        setDepartments(data);
        setLoading(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Critical': return '#dc2626';
            case 'Warning': return '#f97316';
            default: return '#16a34a';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'Critical': return '#fee2e2';
            case 'Warning': return '#ffedd5';
            default: return '#dcfce7';
        }
    };

    return (
        <div className="departments-view">
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading departmental data...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {departments.map((dept) => (
                        <div
                            key={dept.id}
                            className="card"
                            onClick={() => onDepartmentClick && onDepartmentClick(dept.id)}
                            style={{
                                padding: '1.5rem',
                                borderTop: `4px solid ${getStatusColor(dept.status)}`,
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Building2 size={18} color="#64748b" />
                                        {dept.name}
                                    </h3>
                                    <div style={{
                                        display: 'inline-block',
                                        marginTop: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        backgroundColor: getStatusBg(dept.status),
                                        color: getStatusColor(dept.status),
                                        fontSize: '0.75rem',
                                        fontWeight: 700
                                    }}>
                                        {dept.status.toUpperCase()} STATUS
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getStatusColor(dept.status) }}>
                                        {dept.flag_count}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Flags</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                        <IndianRupee size={14} /> At Risk
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>₹{(dept.total_amount / 100000).toFixed(1)}L</div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                        <PieChart size={14} /> Avg Score
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{(dept.avg_score * 100).toFixed(0)}%</div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                        <AlertTriangle size={14} /> Vendors
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{dept.vendor_count} Active</div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                        <AlertOctagon size={14} /> Risk Index
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{dept.risk_index.toFixed(1)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DepartmentsPage;
