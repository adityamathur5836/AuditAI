import React, { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Database, Save, RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const Configuration = () => {
  const [activeTab, setActiveTab] = useState('risk');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    criticalThreshold: 80,
    highThreshold: 60,
    zScoreMultiplier: 3,
    iqrMultiplier: 1.5,
    offHoursEnabled: true,
    offHoursStart: 22,
    offHoursEnd: 6,
    weekendFlagging: true,
    emailAlerts: true,
    smsAlerts: false,
    alertEmail: '',
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('auditai_config');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = () => {
    setSaving(true);
    // Save to localStorage
    localStorage.setItem('auditai_config', JSON.stringify(settings));
    
    setTimeout(() => {
      setSaving(false);
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }, 500);
  };

  const resetDefaults = () => {
    const defaults = {
      criticalThreshold: 80,
      highThreshold: 60,
      zScoreMultiplier: 3,
      iqrMultiplier: 1.5,
      offHoursEnabled: true,
      offHoursStart: 22,
      offHoursEnd: 6,
      weekendFlagging: true,
      emailAlerts: true,
      smsAlerts: false,
      alertEmail: '',
    };
    setSettings(defaults);
    localStorage.setItem('auditai_config', JSON.stringify(defaults));
    setMessage({ type: 'success', text: 'Settings reset to defaults' });
    setTimeout(() => setMessage(null), 3000);
  };

  const clearAllAlerts = async () => {
    if (!window.confirm('Are you sure you want to clear all alerts? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/alerts`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'All alerts cleared successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear alerts. Is the API running?' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const tabs = [
    { id: 'risk', label: 'Risk Parameters', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="configuration-page">

      {/* Message Banner */}
      {message && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1.5rem', 
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          border: `1px solid ${message.type === 'success' ? '#22c55e' : '#dc2626'}`
        }}>
          {message.type === 'success' ? <CheckCircle size={18} color="#22c55e" /> : <AlertCircle size={18} color="#dc2626" />}
          <span style={{ color: message.type === 'success' ? '#22c55e' : '#dc2626', fontWeight: 500 }}>{message.text}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem' }}>
        {/* Settings Sidebar */}
        <div className="card" style={{ padding: '0.5rem', height: 'fit-content' }}>
          {tabs.map((tab) => (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: '6px', 
                backgroundColor: activeTab === tab.id ? '#eff6ff' : 'transparent',
                color: activeTab === tab.id ? '#2563eb' : '#475569',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </div>
          ))}
        </div>

        {/* Main Settings Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {activeTab === 'risk' && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <Shield size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Risk Engine Parameters</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Critical Threshold */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                    Critical Risk Threshold (%)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={settings.criticalThreshold}
                      onChange={(e) => setSettings({...settings, criticalThreshold: parseInt(e.target.value)})}
                      style={{ flex: 1 }} 
                    />
                    <span style={{ fontWeight: 700, minWidth: 40 }}>{settings.criticalThreshold}%</span>
                  </div>
                  <p style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Transactions above this score are marked CRITICAL
                  </p>
                </div>
                
                {/* High Risk Threshold */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                    High Risk Threshold (%)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="range" 
                      min="30" 
                      max="80" 
                      value={settings.highThreshold}
                      onChange={(e) => setSettings({...settings, highThreshold: parseInt(e.target.value)})}
                      style={{ flex: 1 }} 
                    />
                    <span style={{ fontWeight: 700, minWidth: 40 }}>{settings.highThreshold}%</span>
                  </div>
                </div>

                {/* Z-Score Multiplier */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                    Z-Score Threshold
                  </label>
                  <select 
                    value={settings.zScoreMultiplier}
                    onChange={(e) => setSettings({...settings, zScoreMultiplier: parseFloat(e.target.value)})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    <option value="2">High Sensitivity (2.0)</option>
                    <option value="2.5">Medium-High (2.5)</option>
                    <option value="3">Standard (3.0)</option>
                    <option value="3.5">Low Sensitivity (3.5)</option>
                  </select>
                  <p style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Lower = more sensitive to deviations
                  </p>
                </div>

                {/* IQR Multiplier */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                    IQR Outlier Multiplier
                  </label>
                  <select 
                    value={settings.iqrMultiplier}
                    onChange={(e) => setSettings({...settings, iqrMultiplier: parseFloat(e.target.value)})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    <option value="1.0">Strict (1.0x IQR)</option>
                    <option value="1.5">Standard (1.5x IQR)</option>
                    <option value="2.0">Lenient (2.0x IQR)</option>
                    <option value="3.0">Very Lenient (3.0x IQR)</option>
                  </select>
                </div>
              </div>

              {/* Off-Hours Settings */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Off-Hours Detection</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <Toggle 
                    label="Enable Off-Hours Flagging" 
                    checked={settings.offHoursEnabled}
                    onChange={(v) => setSettings({...settings, offHoursEnabled: v})}
                  />
                  <Toggle 
                    label="Flag Weekend Transactions" 
                    checked={settings.weekendFlagging}
                    onChange={(v) => setSettings({...settings, weekendFlagging: v})}
                  />
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Off-Hours Window</label>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{settings.offHoursStart}:00 - {settings.offHoursEnd}:00</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <Bell size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notification Preferences</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Toggle 
                  label="Email Alerts" 
                  description="Receive daily summaries of critical anomalies"
                  checked={settings.emailAlerts}
                  onChange={(v) => setSettings({...settings, emailAlerts: v})}
                />
                
                {settings.emailAlerts && (
                  <div style={{ marginLeft: '3rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      Alert Email Address
                    </label>
                    <input 
                      type="email"
                      placeholder="auditor@example.gov.in"
                      value={settings.alertEmail}
                      onChange={(e) => setSettings({...settings, alertEmail: e.target.value})}
                      style={{ width: '100%', maxWidth: 300, padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                )}

                <Toggle 
                  label="SMS Interventions" 
                  description="Urgent alerts for high-risk transactions (requires setup)"
                  checked={settings.smsAlerts}
                  onChange={(v) => setSettings({...settings, smsAlerts: v})}
                />
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <Database size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Data Management</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#dc2626', marginBottom: '0.5rem' }}>⚠️ Danger Zone</h4>
                  <p style={{ fontSize: '0.75rem', color: '#7f1d1d', marginBottom: '1rem' }}>
                    Clear all fraud alerts from the system. This action cannot be undone.
                  </p>
                  <button 
                    className="btn"
                    onClick={clearAllAlerts}
                    style={{ backgroundColor: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Trash2 size={16} /> Clear All Alerts
                  </button>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>API Connection</h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Backend: {API_BASE}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Model: IsolationForest (trained_model.pkl)</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-outline" onClick={resetDefaults}>
              <RefreshCw size={16} /> Reset to Defaults
            </button>
            <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ label, description, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
      <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{label}</p>
      {description && <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{description}</p>}
    </div>
    <div 
      onClick={() => onChange(!checked)}
      style={{ 
        width: 44, 
        height: 24, 
        backgroundColor: checked ? '#2563eb' : '#e2e8f0', 
        borderRadius: '12px', 
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
    >
      <div style={{ 
        position: 'absolute', 
        left: checked ? 22 : 2, 
        top: 2, 
        width: 20, 
        height: 20, 
        backgroundColor: 'white', 
        borderRadius: '50%',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}></div>
    </div>
  </div>
);

export default Configuration;
