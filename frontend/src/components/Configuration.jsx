import React from 'react';
import { Settings, Bell, Shield, Users, Lock, Database } from 'lucide-react';

const Configuration = () => {
    return (
        <div className="configuration-page">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', color: '#0f172a', fontWeight: 800 }}>System Configuration</h1>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Manage audit thresholds, risk parameters, and system notifications.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                {/* Settings Sidebar */}
                <div className="card" style={{ padding: '0.5rem' }}>
                    {['General Settings', 'Risk Parameters', 'Notification Rules', 'User Management', 'API & Integrations'].map((item, i) => (
                        <div key={item} style={{ 
                            padding: '0.75rem 1rem', 
                            borderRadius: '6px', 
                            backgroundColor: i === 1 ? '#eff6ff' : 'transparent',
                            color: i === 1 ? '#2563eb' : '#475569',
                            fontWeight: i === 1 ? 700 : 500,
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            {item}
                        </div>
                    ))}
                </div>

                {/* Main Settings Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Risk Thresholds */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                            <Shield className="text-primary" size={20} />
                            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Risk Engine Parameters</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                                    Critical Risk Score Threshold
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input type="range" min="0" max="100" defaultValue="80" style={{ flex: 1 }} />
                                    <span style={{ fontWeight: 700 }}>80</span>
                                </div>
                                <p style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.25rem' }}>Transactions above this score trigger immediate escalation.</p>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                                    Anomaly Sensitivity (Z-Score)
                                </label>
                                <select style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                                    <option>Standard (2.0)</option>
                                    <option>High (1.5)</option>
                                    <option>Low (3.0)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="card">
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                            <Bell className="text-primary" size={20} />
                            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notification Preferences</h3>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email Alerts</p>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Receive daily summaries of critical anomalies.</p>
                                </div>
                                <div style={{ width: 44, height: 24, backgroundColor: '#2563eb', borderRadius: '12px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: 2, top: 2, width: 20, height: 20, backgroundColor: 'white', borderRadius: '50%' }}></div>
                                </div>
                            </div>
                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>SMS Interventions</p>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Urgent alerts for potential fund leakage GT ₹1 Lakh.</p>
                                </div>
                                <div style={{ width: 44, height: 24, backgroundColor: '#e2e8f0', borderRadius: '12px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 2, top: 2, width: 20, height: 20, backgroundColor: 'white', borderRadius: '50%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Button */}
                    <div style={{ textAlign: 'right' }}>
                        <button className="btn btn-primary">Save Configuration</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Configuration;
