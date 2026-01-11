import React, { useState, useEffect } from 'react';
import { Database, Cpu, Activity, Globe, CheckCircle2, Server, Zap, ArrowRight } from 'lucide-react';
import { checkHealth } from '../api';

const LiveFlowMonitor = () => {
    const [status, setStatus] = useState({ stage: 'Checking', detail: 'Initializing System Core...', progress: 0 });
    const [activeStage, setActiveStage] = useState(0);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const health = await checkHealth();
                if (health.status === 'healthy') {
                    if (status.stage === 'Checking' || status.stage === 'Offline') {
                        setStatus(prev => ({ ...prev, stage: 'System Online', detail: 'pipeline_active: true' }));
                    }
                } else {
                    setStatus({ stage: 'Offline', detail: 'ERR_CONNECTION_REFUSED', progress: 0 });
                }
            } catch (err) {
                setStatus({ stage: 'Offline', detail: 'ERR_BACKEND_UNREACHABLE', progress: 0 });
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    // Animation Cycle
    useEffect(() => {
        if (status.stage === 'Offline') return;

        const interval = setInterval(() => {
            setActiveStage(prev => (prev + 1) % 4);

            const stages = ['Ingesting Data Streams', 'Processing Anomalies', 'Risk Scoring Engine', 'Dashboard Sync'];
            const details = [
                'recv_bytes: ' + Math.floor(Math.random() * 5000) + 'KB',
                'analyzing_batch_id: #' + Math.floor(Math.random() * 99999),
                'calculating_risk_vectors...',
                'refreshing_ui_state...'
            ];

            setStatus(prev => ({
                ...prev,
                stage: stages[activeStage],
                detail: details[activeStage]
            }));

        }, 2000);

        return () => clearInterval(interval);
    }, [status.stage]);

    const stages = [
        { label: 'Ingest', icon: <Database size={16} /> },
        { label: 'Process', icon: <Cpu size={16} /> },
        { label: 'Analyze', icon: <Activity size={16} /> },
        { label: 'Sync', icon: <Globe size={16} /> }
    ];

    return (
        <div className="card" style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe' }}>
                        <Server size={18} color="#2563eb" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', letterSpacing: '0.5px' }}>LIVE PIPELINE</h3>
                        <p style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>STATUS: {status.stage === 'Offline' ? 'DISCONNECTED' : 'OPERATIONAL'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: status.stage === 'Offline' ? '#ef4444' : '#10b981', boxShadow: status.stage !== 'Offline' ? '0 0 8px #86efac' : 'none' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: status.stage === 'Offline' ? '#ef4444' : '#16a34a' }}>
                        {status.stage === 'Offline' ? 'OFFLINE' : 'LIVE'}
                    </span>
                </div>
            </div>

            {/* Pipeline Visualization */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 1rem', marginBottom: '2rem' }}>

                {/* Connection Line Background */}
                <div style={{ position: 'absolute', top: '50%', left: '2rem', right: '2rem', height: '2px', backgroundColor: '#f1f5f9', zIndex: 0 }}></div>

                {/* Animated Connection Line */}
                {status.stage !== 'Offline' && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '2rem', right: '2rem', height: '2px',
                        background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                        zIndex: 0,
                        opacity: 1,
                        width: '24%', // Distance between nodes roughly
                        transform: `translateX(${activeStage * 100}%)`, // Move by one full segment width
                        left: '13%', // Starting offset (center of first node roughly)
                        transition: 'transform 0.5s ease-in-out'
                    }}></div>
                )}

                {stages.map((stage, idx) => {
                    const isActive = activeStage === idx;
                    const isPassed = idx < activeStage || (activeStage === 0 && idx === 3);

                    return (
                        <div key={idx} style={{ position: 'relative', zIndex: 1, backgroundColor: '#ffffff', padding: '0 0.5rem' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                backgroundColor: isActive ? '#eff6ff' : (isPassed ? '#f0fdf4' : '#f8fafc'),
                                border: `1px solid ${isActive ? '#3b82f6' : (isPassed ? '#86efac' : '#e2e8f0')}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isActive ? '#2563eb' : (isPassed ? '#16a34a' : '#94a3b8'),
                                boxShadow: isActive ? '0 0 0 4px #eff6ff' : 'none',
                                transition: 'all 0.3s ease',
                                margin: '0 auto 0.5rem'
                            }}>
                                {isPassed ? <CheckCircle2 size={18} /> : stage.icon}
                            </div>
                            <p style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: isActive ? '#0f172a' : '#64748b',
                                textAlign: 'center',
                                transition: 'color 0.3s ease'
                            }}>{stage.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Terminal Log Footer */}
            <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0.75rem',
                fontFamily: 'monospace',
                fontSize: '0.7rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={10} color="#eab308" />
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>system@audit-ai:~$</span>
                    <span style={{ color: '#475569' }}>{status.detail}</span>
                    <span className="cursor-blink" style={{ width: 6, height: 12, backgroundColor: '#cbd5e1' }}></span>
                </div>
            </div>

            <style>
                {`
                .cursor-blink {
                    animation: blink 1s step-end infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}
            </style>
        </div>
    );
};

export default LiveFlowMonitor;
