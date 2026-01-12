import React, { useState } from 'react';
import { Search, Filter, Download, CheckCircle, XCircle, AlertTriangle, Calendar, Building2, DollarSign, User, FileText, ChevronRight } from 'lucide-react';

const AuditPage = ({ alerts = [], onUpdateStatus }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, reviewed, cleared
    const [severityFilter, setSeverityFilter] = useState('all'); // all, critical, high, medium
    const [selectedAlert, setSelectedAlert] = useState(null);

    // Filter alerts based on search and filters
    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = !searchTerm ||
            alert.vendor_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.department_id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

        const matchesSeverity = severityFilter === 'all' ||
            (severityFilter === 'critical' && alert.risk_score > 0.7) ||
            (severityFilter === 'high' && alert.risk_score > 0.4 && alert.risk_score <= 0.7) ||
            (severityFilter === 'medium' && alert.risk_score <= 0.4);

        return matchesSearch && matchesStatus && matchesSeverity;
    });

    // Stats
    const pendingCount = alerts.filter(a => a.status === 'pending').length;
    const reviewedCount = alerts.filter(a => a.status === 'reviewed').length;
    const clearedCount = alerts.filter(a => a.status === 'cleared').length;

    const handleMarkAsReviewed = (alertId) => {
        onUpdateStatus?.(alertId, 'reviewed');
    };

    const handleMarkAsCleared = (alertId) => {
        onUpdateStatus?.(alertId, 'cleared');
    };

    const handleExport = () => {
        const csvContent = [
            ['Transaction ID', 'Vendor', 'Amount', 'Risk Score', 'Status', 'Date'].join(','),
            ...filteredAlerts.map(a => [
                a.transaction_id,
                a.vendor_id,
                a.amount,
                a.risk_score,
                a.status,
                a.created_at
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="audit-page">
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={24} color="#dc2626" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Pending Review</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{pendingCount}</p>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={24} color="#2563eb" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Under Review</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{reviewedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={24} color="#16a34a" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Cleared</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{clearedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#fef9f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={24} color="#f97316" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Exposure</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                                ₹{(filteredAlerts.reduce((sum, a) => sum + (a.amount || 0), 0) / 10000000).toFixed(1)}Cr
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card" style={{ padding: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="Search by vendor, transaction ID, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="cleared">Cleared</option>
                    </select>

                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Severity</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                    </select>
                </div>
            </div>

            {/* Results */}
            <div className="card" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Transaction</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Vendor</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Risk Score</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAlerts.map((alert, idx) => (
                                <tr
                                    key={idx}
                                    style={{
                                        borderBottom: '1px solid #e2e8f0',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    onClick={() => setSelectedAlert(alert)}
                                >
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{alert.transaction_id}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Building2 size={14} color="#64748b" />
                                            <span style={{ fontSize: '0.875rem', color: '#475569' }}>{alert.vendor_id}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>₹{alert.amount?.toLocaleString()}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '6px',
                                                backgroundColor: '#e2e8f0',
                                                borderRadius: '3px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${alert.risk_score * 100}%`,
                                                    height: '100%',
                                                    backgroundColor: alert.risk_score > 0.7 ? '#dc2626' : alert.risk_score > 0.4 ? '#f97316' : '#22c55e'
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{(alert.risk_score * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor: alert.status === 'cleared' ? '#dcfce7' : alert.status === 'reviewed' ? '#dbeafe' : '#fef3c7',
                                            color: alert.status === 'cleared' ? '#15803d' : alert.status === 'reviewed' ? '#1e40af' : '#a16207'
                                        }}>
                                            {alert.status || 'pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            {new Date(alert.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {alert.status !== 'reviewed' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsReviewed(alert.transaction_id);
                                                    }}
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        fontSize: '0.75rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #2563eb',
                                                        backgroundColor: 'white',
                                                        color: '#2563eb',
                                                        cursor: 'pointer',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Review
                                                </button>
                                            )}
                                            {alert.status !== 'cleared' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsCleared(alert.transaction_id);
                                                    }}
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        fontSize: '0.75rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #16a34a',
                                                        backgroundColor: 'white',
                                                        color: '#16a34a',
                                                        cursor: 'pointer',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Selected Alert Detail Modal */}
            {selectedAlert && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedAlert(null)}
                >
                    <div
                        className="card"
                        style={{
                            width: '90%',
                            maxWidth: '800px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            padding: '2rem'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                            Transaction Details
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Transaction ID</p>
                                <p style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedAlert.transaction_id}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Vendor</p>
                                <p style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedAlert.vendor_id}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Amount</p>
                                <p style={{ fontSize: '1rem', fontWeight: 600 }}>₹{selectedAlert.amount?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Risk Score</p>
                                <p style={{ fontSize: '1rem', fontWeight: 600 }}>{(selectedAlert.risk_score * 100).toFixed(0)}%</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Explanation</p>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#475569' }}>{selectedAlert.explanation}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedAlert(null)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.875rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleMarkAsReviewed(selectedAlert.transaction_id);
                                    setSelectedAlert(null);
                                }}
                                className="btn btn-primary"
                            >
                                Mark as Reviewed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditPage;
