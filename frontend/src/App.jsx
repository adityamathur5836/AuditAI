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
import { User, ChevronRight, Bell, Search, Filter, Calendar, AlertCircle, Activity, Settings, Database } from 'lucide-react';
import alertsData from './alerts.json';

function App() {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'detail', 'vendor', 'analytics', 'alerts_queue'

  useEffect(() => {
    const fetchAlerts = () => {
      setAlerts(alertsData);
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="dashboard-container">
      <Sidebar currentView={view} onViewChange={setView} />
      <main className="main-content" style={{ position: 'relative' }}>
        
        {/* Global Action Header (Matching image styling) */}
        {/* Global Action Header (Matching image styling) */}
        {(view !== 'detail' && view !== 'vendor' && view !== 'transactions' && view !== 'config') && (
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                <span>Home</span> <ChevronRight size={12} /> <span>{view === 'list' ? 'Dashboard Overview' : view.replace('_', ' ')}</span>
              </nav>
              <h1 style={{ fontSize: '1.875rem', color: '#0f172a', fontWeight: 800 }}>
                {view === 'list' ? 'National Dashboard' : view === 'analytics' ? 'Analytics & Trends' : 'Alerts & Risk Queue'}
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
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>Lead Auditor</p>
                  <p style={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>Audit Dept.</p>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                  LA
                </div>
              </div>
            </div>
          </header>
        )}

        {view === 'list' ? (
          <>
            {/* Image 3 Style Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
               <KPICard label="Transactions Analyzed" value="2.4M" change="+12%" isPositive sub="vs last month" icon={<Database size={20} color="#2563eb" />} />
               <KPICard label="High-Risk Alerts" value={alerts.filter(a => a.risk_score > 0.8).length} change="+5%" sub="new criticals" icon={<AlertCircle size={20} color="#dc2626" />} color="#dc2626" />
               <KPICard label="Medium-Risk Alerts" value={alerts.filter(a => a.risk_score <= 0.8 && a.risk_score > 0.5).length} change="-2%" isPositive sub="vs last month" icon={<AlertCircle size={20} color="#f97316" />} color="#f97316" />
               <KPICard label="Est. Fund Leakage" value="₹ 45.2 Cr" change="+1.5%" sub="recovery initiated" icon={<Activity size={20} color="#2563eb" />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
               <LiveFlowMonitor />
               <div className="card">
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem' }}>Monthly Anomaly Detection Trend</h3>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Frequency of flagged high-risk transactions</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <div style={{ width: 8, height: 8, backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                            <span style={{ color: '#64748b' }}>Analyzed</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <div style={{ width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: '2px' }}></div>
                            <span style={{ color: '#64748b' }}>Critical</span>
                        </div>
                    </div>
                 </div>
                 
                 <div style={{ position: 'relative', height: '160px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '0 1rem 0 2rem' }}>
                   {/* Y-Axis Label */}
                   <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.625rem', color: '#94a3b8' }}>
                        <span>100</span><span>50</span><span>0</span>
                   </div>
                   
                   {/* Simple CSS-based bar chart */}
                   {[40, 60, 45, 90, 65, 80, 55, 70, 85, 95, 75, 60].map((h, i) => (
                     <div key={i} className="graph-bar" style={{ 
                        flex: 1, 
                        backgroundColor: i === 9 ? '#dc2626' : '#e2e8f0', 
                        height: `${h}%`, 
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        transition: 'height 0.5s ease'
                     }}>
                        {i === 9 && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '-24px', 
                                left: '50%', 
                                transform: 'translateX(-50%)', 
                                backgroundColor: '#1e293b', 
                                color: 'white', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                fontSize: '0.625rem',
                                whiteSpace: 'nowrap'
                            }}>
                                Peak: Oct
                            </div>
                        )}
                     </div>
                   ))}
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.625rem', color: '#94a3b8', paddingLeft: '2rem' }}>
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span style={{color: '#dc2626', fontWeight: 700}}>Oct</span><span>Nov</span><span>Dec</span>
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
        ) : view === 'config' ? (
          <Configuration />
        ) : view === 'detail' ? (
          <InvestigationDetail alert={selectedAlert} onBack={handleBack} />
        ) : view === 'vendor' ? (
          <VendorProfile vendorId={selectedVendor} alerts={alerts} onBack={handleBack} />
        ) : (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <Settings size={48} color="#94a3b8" style={{ marginBottom: '1.5rem' }} />
              <h2 style={{ marginBottom: '0.5rem' }}>Modular Update in Progress</h2>
              <p className="text-secondary">The {view.replace('_', ' ')} layer is currently syncing with the main audit kernel.</p>
              <button className="btn btn-primary" onClick={handleBack} style={{ marginTop: '1.5rem', width: '100%' }}>Return to Command Center</button>
            </div>
          </div>
        )}
      </main>
      
    </div>
  );
}

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

export default App;
