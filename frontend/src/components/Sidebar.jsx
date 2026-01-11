import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShieldAlert, FileText, DollarSign, Settings, Shield, User, UploadCloud, Users, AlertCircle, Database, Sparkles } from 'lucide-react';

const Sidebar = ({ currentView, onViewChange }) => {
  const { user } = useAuth(); // Get user from context

  const navItems = [
    { icon: LayoutDashboard, id: 'list', label: 'Dashboard' },
    { icon: UploadCloud, id: 'upload', label: 'Upload & Analyze' },
    { icon: FileText, id: 'analytics', label: 'Analytics' },
    { icon: Users, id: 'vendors', label: 'Vendors' },
    { icon: AlertCircle, id: 'alerts_queue', label: 'Alerts Queue' },
    { icon: Database, id: 'transactions', label: 'Transactions' },
    { icon: Sparkles, id: 'chat', label: 'Policy Genius' },
    { icon: Settings, id: 'config', label: 'Configuration' },
  ];

  return (
    <div className="sidebar h-[100vh]">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
        <div style={{ backgroundColor: '#2563eb', padding: '0.4rem', borderRadius: '8px' }}>
          <Shield size={24} color="white" fill="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>AuditAI</h2>
          <p style={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>Gov Analytics</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const isActive = currentView === item.id || (currentView === 'list' && item.id === 'list');
          return (
            <div
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: isActive ? '#3b82f61a' : 'transparent',
                color: isActive ? '#3b82f6' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <item.icon size={20} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <User size={20} color="#64748b" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{user?.username || 'User'}</p>
            <p style={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>{user?.role || 'Analyst'}</p>
          </div>
          <Settings size={14} color="#94a3b8" style={{ cursor: 'pointer' }} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
