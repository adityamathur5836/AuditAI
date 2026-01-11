import React, { useState, useEffect, useRef } from 'react';
import { Bell, ShieldAlert, CheckCircle, Activity, ArrowUpRight } from 'lucide-react';
import { fetchLatestAlerts } from '../api';

const LiveFlowMonitor = () => {
    const [feeds, setFeeds] = useState([]);
    const [lastId, setLastId] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const pollData = async () => {
            try {
                // Fetch latest alerts (cache-busted)
                const data = await fetchLatestAlerts(20);
                if (data && Array.isArray(data)) {
                    // API returns array directly or { alerts: [] }? 
                    // fetchLatestAlerts returns data.alerts || []
                    const alerts = data;

                    // Sort by created_at desc (frontend insurance)
                    const sorted = alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                    // Update feed if we have new items
                    if (sorted.length > 0) {
                        const newTop = sorted[0];
                        if (newTop.transaction_id !== lastId) {
                            setFeeds(sorted);
                            setLastId(newTop.transaction_id);
                        }
                    }
                }
            } catch (error) {
                console.error("Feed poll error:", error);
            }
        };

        pollData(); // Initial
        const interval = setInterval(pollData, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, [lastId]);

    // Auto-scroll effect or layout? User asked for "scrollable live notification system".
    // We'll leave it scrollable by user but maybe animate new items.

    return (
        <div className="card" style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '1',
            height: '320px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Bell size={18} color="#0f172a" />
                        <span style={{
                            position: 'absolute', top: -2, right: -1,
                            width: 8, height: 8, backgroundColor: '#ef4444',
                            borderRadius: '50%', border: '2px solid white'
                        }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Live Transaction Feed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ position: 'relative', display: 'flex', height: 8, width: 8 }}>
                        <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#22c55e', opacity: 0.75, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
                        <span style={{ position: 'relative', display: 'inline-flex', height: 8, width: 8, borderRadius: '50%', backgroundColor: '#15803d' }}></span>
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>RECEIVING DATA</span>
                </div>
            </div>

            {/* Scrollable List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.5rem 1rem'
            }} ref={scrollRef}>
                {feeds.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: '0.5rem' }}>
                        <Activity size={24} />
                        <span style={{ fontSize: '0.8rem' }}>Waiting for incoming stream...</span>
                    </div>
                ) : (
                    feeds.map((item, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            borderBottom: '1px solid #f8fafc',
                            animation: 'fadeIn 0.5s ease-in'
                        }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '8px',
                                    backgroundColor: item.risk_score > 0.6 ? '#fef2f2' : item.risk_score > 0.4 ? '#fffbeb' : '#f0fdf4',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {item.risk_score > 0.8 ? <ShieldAlert size={16} color="#dc2626" /> :
                                        item.risk_score > 0.6 ? <Activity size={16} color="#ea580c" /> :
                                            <CheckCircle size={16} color="#16a34a" />}
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{item.vendor_id || item.vendor}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        {item.risk_score > 0.6 ? 'Suspicious Activity Detected' : 'Routine Transaction'}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>₹{item.amount.toLocaleString()}</p>
                                <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(item.created_at).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>
                {`
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                /* Custom Scrollbar */
                div::-webkit-scrollbar {
                    width: 4px;
                }
                div::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                div::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                `}
            </style>
        </div>
    );
};

export default LiveFlowMonitor;
