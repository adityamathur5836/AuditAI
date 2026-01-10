import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RiskSummary from './components/RiskSummary';
import TransactionTable from './components/TransactionTable';
import InvestigationDetail from './components/InvestigationDetail';
import VendorProfile from './components/VendorProfile';
import LiveFlowMonitor from './components/LiveFlowMonitor';
import Analytics from './components/Analytics';
import AlertsQueue from './components/AlertsQueue';
import TransactionsPage from './components/TransactionsPage';
import Configuration from './components/Configuration';
import UploadAnalyze from './components/UploadAnalyze';
import VendorsPage from './components/VendorsPage';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { User, ChevronRight, Bell, Search, Filter, Calendar, AlertCircle, Activity, Settings, Database, Wifi, WifiOff, LogOut } from 'lucide-react';
import { fetchAlerts, fetchStats, checkHealth, updateAlertStatus as apiUpdateStatus } from './api';

// ... (in App component)

  const updateAlertStatus = async (transactionId, newStatus) => {
    // Optimistic update
    setAlerts(prevAlerts => prevAlerts.map(alert => 
      alert.transaction_id === transactionId ? { ...alert, status: newStatus } : alert
    ));
    
    // API Call
    try {
        await apiUpdateStatus(transactionId, newStatus);
    } catch (err) {
        console.error("Failed to persist status update", err);
        // Revert on failure could be added here
    }
  };

const AuditDashboard = () => {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [view, setView] = useState('list');

  useEffect(() => {
    const loadData = async () => {
      // Check API health
      const health = await checkHealth();
      setApiStatus(health.status === 'healthy' ? 'connected' : 'offline');
      
      if (health.status === 'healthy') {
        const alertsData = await fetchAlerts(1000, 0.0);
        setAlerts(alertsData);
        const statsData = await fetchStats();
        setStats(statsData);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return <Login />;
  }

  const handleInvestigate = (alert) => {
    setSelectedAlert(alert);
    setView('detail');
  };

  const handleVendorView = (vendor) => {
    setSelectedVendor(vendor);
    setView('vendor');
  };

  const handleBack = () => {
    setSelectedAlert(null);
    setSelectedVendor(null);
    setView('list');
  };

  const updateAlertStatus = async (transactionId, newStatus) => {
    // Optimistic update
    setAlerts(prevAlerts => prevAlerts.map(alert => 
      alert.transaction_id === transactionId ? { ...alert, status: newStatus } : alert
    ));
    
    // API Call
    try {
        await apiUpdateStatus(transactionId, newStatus);
    } catch (err) {
        console.error("Failed to persist status update", err);
    }
  };

  // Helper for chart data
  const getChartData = () => {
    if (stats?.monthly_counts) {
      const max = Math.max(...stats.monthly_counts, 1);
      return stats.monthly_counts.map(count => ({
        height: (count / max) * 100,
        val: count
      }));
    }
    return Array(12).fill({ height: 5, val: 0 }); // Default empty state
  };
  
  const chartBars = getChartData();

  return (
    <div className="dashboard-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar currentView={view} onViewChange={setView} />
      <main className="main-content" style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: '2rem' }}>
        
        {/* Global Action Header - Hidden for Detail, Vendor, and Analytics views */}
        {(view !== 'detail' && view !== 'vendor' && view !== 'analytics') && (
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                <span>Home</span> <ChevronRight size={12} /> <span>{view === 'list' ? 'Dashboard Overview' : view.replace('_', ' ')}</span>
              </nav>
              <h1 style={{ fontSize: '1.875rem', color: '#0f172a', fontWeight: 800 }}>
                {view === 'list' ? 'National Dashboard' 
                  : view === 'alerts_queue' ? 'Alerts & Risk Queue'
                  : view === 'transactions' ? 'Transaction Ledger'
                  : view === 'config' ? 'System Configuration'
                  : view === 'vendors' ? 'Vendor Risk Registry'
                  : view === 'upload' ? 'Upload & Analyze'
                  : 'Dashboard'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Monitoring fiscal irregularities across all zones.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginBottom: 0 }}>
                <Calendar size={16} color="#64748b" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Last 30 Days</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Bell size={20} color="#64748b" />
                  <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: '50%', border: '2px solid white' }}></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{user.full_name || 'Lead Auditor'}</p>
                  <p style={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>{user.email}</p>
                </div>
                <div 
                  onClick={logout}
                  style={{ 
                    width: 40, height: 40, borderRadius: '50%', backgroundColor: '#2563eb', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800,
                    cursor: 'pointer' 
                  }}
                  title="Click to Logout"
                >
                  <LogOut size={16} />
                </div>
              </div>
            </div>
          </header>
        )}

        {view === 'list' ? (
          <>
            {/* API Status Indicator */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem',
              padding: '0.5rem 1rem', borderRadius: 8, width: 'fit-content',
              backgroundColor: apiStatus === 'connected' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
            }}>
              {apiStatus === 'connected' ? (
                <><Wifi size={16} color="#22c55e" /><span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>Live API Connected</span></>
              ) : (
                <><WifiOff size={16} color="#dc2626" /><span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>API Offline - Start backend</span></>
              )}
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
               <KPICard label="Total Alerts" value={stats?.total_alerts || alerts.length} change={apiStatus === 'connected' ? 'Live' : ''} isPositive sub="from ML analysis" icon={<Database size={20} color="#2563eb" />} />
               <KPICard label="Critical Alerts" value={stats?.critical_alerts || alerts.filter(a => a.risk_score >= 0.8).length} change="" sub="immediate review" icon={<AlertCircle size={20} color="#dc2626" />} color="#dc2626" />
               <KPICard label="High-Risk Alerts" value={stats?.high_risk_alerts || alerts.filter(a => a.risk_score >= 0.6 && a.risk_score < 0.8).length} change="" sub="needs attention" icon={<AlertCircle size={20} color="#f97316" />} color="#f97316" />
               <KPICard label="Est. Flagged Amount" value={`₹ ${((stats?.total_flagged_amount || alerts.reduce((sum, a) => sum + (a.amount || 0), 0)) / 10000000).toFixed(1)} Cr`} change="" sub="under review" icon={<Activity size={20} color="#2563eb" />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
               <LiveFlowMonitor />
               <div className="card">
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem' }}>Monthly Anomaly Detection Trend</h3>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Frequency of flagged high-risk transactions (Live Data)</p>
                    </div>
                 </div>
                 
                 <div style={{ position: 'relative', height: '160px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '0 1rem 0 2rem' }}>
                   {/* Y-Axis Label */}
                   <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.625rem', color: '#94a3b8' }}>
                        <span>Max</span><span>Mid</span><span>0</span>
                   </div>
                   
                   {/* Dynamic Bar Chart */}
                   {chartBars.map((bar, i) => (
                     <div key={i} className="graph-bar" style={{ 
                        flex: 1, 
                        backgroundColor: bar.val > 0 ? (bar.val === Math.max(...chartBars.map(b=>b.val)) ? '#dc2626' : '#2563eb') : '#e2e8f0', 
                        height: `${Math.max(bar.height, 4)}%`, 
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        transition: 'height 0.5s ease'
                     }}>
                        {bar.val > 0 && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '-20px', 
                                left: '50%', 
                                transform: 'translateX(-50%)', 
                                fontSize: '0.625rem',
                                color: '#64748b',
                                fontWeight: 600
                            }}>
                                {bar.val}
                            </div>
                        )}
                     </div>
                   ))}
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.625rem', color: '#94a3b8', paddingLeft: '2rem' }}>
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                 </div>
               </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <TransactionTable 
                alerts={alerts} 
                onInvestigate={handleInvestigate} 
                onVendorView={handleVendorView} 
              />
            </div>
          </>
        ) : view === 'analytics' ? (
          <Analytics />
        ) : view === 'alerts_queue' ? (
          <AlertsQueue alerts={alerts} onInvestigate={handleInvestigate} />
        ) : view === 'transactions' ? (
          <TransactionsPage alerts={alerts} onInvestigate={handleInvestigate} onVendorView={handleVendorView} />
        ) : view === 'upload' ? (
          <UploadAnalyze />
        ) : view === 'vendors' ? (
          <VendorsPage alerts={alerts} onVendorClick={handleVendorView} />
        ) : view === 'config' ? (
          <Configuration />
        ) : view === 'detail' ? (
          <InvestigationDetail alert={selectedAlert} onBack={handleBack} onStatusUpdate={updateAlertStatus} />
        ) : view === 'vendor' ? (
          <VendorProfile vendorId={selectedVendor} alerts={alerts} onBack={handleBack} />
        ) : (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <Settings size={48} color="#94a3b8" style={{ marginBottom: '1.5rem' }} />
              <h2 style={{ marginBottom: '0.5rem' }}>Modular Update in Progress</h2>
              <button className="btn btn-primary" onClick={handleBack} style={{ marginTop: '1.5rem', width: '100%' }}>Return to Command Center</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const KPICard = ({ label, value, change, isPositive, sub, icon, color }) => (
  <div className="card" style={{ padding: '1.25rem', marginBottom: 0, position: 'relative' }}>
    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '1rem' }}>{label}</p>
    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: color || '#0f172a', marginBottom: '0.5rem' }}>{value}</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {change && (
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          color: isPositive ? '#16a34a' : '#dc2626',
          display: 'flex',
          alignItems: 'center'
        }}>
          {isPositive ? '↑' : '↓'} {change}
        </span>
      )}
      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{sub}</span>
    </div>
    <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '8px' }}>
      {icon}
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AuditDashboard />
    </AuthProvider>
  );
}

export default App;
