import React, { useState, useEffect } from 'react';
import { Activity, Database, Cpu, Globe, CheckCircle2, Loader2, Gauge } from 'lucide-react';

const LiveFlowMonitor = () => {
  const [status, setStatus] = useState({ stage: 'Idle', detail: 'Waiting for procurement cycle...', progress: 0 });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/status.json');
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        // Silent fail if file doesn't exist yet
      }
    };

    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const stages = [
    { name: 'Data Ingestion', icon: <Database size={18} /> },
    { name: 'Data Processing', icon: <Cpu size={18} /> },
    { name: 'Risk Engine', icon: <Gauge size={18} /> },
    { name: 'Frontend Sync', icon: <Globe size={18} /> }
  ];

  return (
    <div className="card" style={{ padding: '1.25rem', border: '1px solid #e2e8f0', background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#2563eb', padding: '0.4rem', borderRadius: '8px', animation: status.progress > 0 ? 'pulse 2s infinite' : 'none' }}>
            <Activity size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>Live Architecture Pipeline</h3>
            <p style={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>Real-time Audit Heartbeat</p>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: status.progress > 0 ? '#2563eb' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {status.progress > 0 ? <Loader2 size={14} className="animate-spin" /> : <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981'}}></div>}
          {status.stage.toUpperCase()}
        </div>
      </div>

      <div style={{ position: 'relative', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', 
          height: '100%', 
          width: `${status.progress}%`, 
          backgroundColor: '#2563eb', 
          transition: 'width 0.5s ease-in-out',
          boxShadow: '0 0 8px rgba(37, 99, 235, 0.4)'
        }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        {stages.map((s, idx) => {
          const isActive = status.stage === s.name;
          const isDone = stages.findIndex(st => st.name === status.stage) > idx;

          return (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ 
                margin: '0 auto 0.5rem',
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: isDone ? '#dcfce7' : (isActive ? '#eff6ff' : '#f1f5f9'),
                color: isDone ? '#10b981' : (isActive ? '#2563eb' : '#94a3b8'),
                transition: 'all 0.3s ease'
              }}>
                {isDone ? <CheckCircle2 size={18} /> : s.icon}
              </div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: isActive ? '#0f172a' : '#94a3b8' }}>{s.name}</p>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
        <p style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>
          {status.detail}
        </p>
      </div>
    </div>
  );
};

export default LiveFlowMonitor;
