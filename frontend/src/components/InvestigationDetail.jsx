import React from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  TrendingUp, 
  Info, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  ShieldCheck, 
  Scale, 
  Calendar,
  Building2,
  Bell,
  MoreHorizontal,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  User,
  Activity,
  Zap
} from 'lucide-react';

const InvestigationDetail = ({ alert, onBack, onStatusUpdate }) => {
  const [feedbackStatus, setFeedbackStatus] = React.useState(null);
  const [reason, setReason] = React.useState('');

  const handleAction = (action) => {
    setFeedbackStatus('loading');
    setTimeout(() => {
        setFeedbackStatus(action);
        if (onStatusUpdate && alert) {
            onStatusUpdate(alert.transaction_id, action);
        }
    }, 1000);
  };

  if (!alert) return null;

  // Dynamic Logic Generation
  const generateRiskExplanation = (alert) => {
      const amount = alert.amount || 0;
      const score = alert.risk_score || 0;
      const dept = alert.department || 'General';

      let explanation = `Analysis indicates a significant deviation in ${dept} procurement. `;
      
      if (score > 0.8) {
          explanation += `Specifically, the transaction value of ₹${(amount/100000).toFixed(2)} Lakhs is ${(score*60).toFixed(0)}% higher than the sector benchmark. `;
          explanation += `This creates a high probability of artificial inflation or misclassification.`;
      } else if (score > 0.6) {
          explanation += `The provider has triggered multiple velocity checks within a 30-day window. `;
          explanation += `Cross-referencing with peer vendors suggests a lower unit cost is standard for this category.`;
      } else {
          explanation += `While the amount is within bounds, the timing (weekend/holiday) is irregular for this department.`;
      }

      return explanation;
  };

  return (
    <div className="investigation-detail" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumbs & Layout Header */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        <span>Investigations</span>
        <ChevronRight size={14} />
        <span style={{ cursor: 'pointer' }} onClick={onBack}>Active Alerts</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>#{alert.transaction_id.replace('RT-', 'INV-2025-')}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        {/* Main Content Area */}
        <div>
          <header style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span className="badge badge-high" style={{ padding: '0.4rem 1rem' }}>HIGH PRIORITY</span>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Last updated: Just now</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '0.5rem' }}>{alert.vendor}</h1>
            <p className="text-secondary" style={{ fontSize: '1.25rem' }}>
              Detailed analysis of procurement anomaly in {alert.department || 'Sector 4'}
            </p>
          </header>

          {/* Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
            <MetricCard 
              icon={<Building2 size={24} color="#3b82f6" />} 
              label="ENTITY TYPE"
              value="Vendor (Contractor)"
              info="Verified Entity"
            />
            <MetricCard 
              icon={<ShieldAlert size={24} color="#ef4444" />} 
              label="RISK SCORE"
              value={`${(alert.risk_score * 100).toFixed(0)}/100`}
              info="Critical"
              color="#ef4444"
            />
            <MetricCard 
              icon={<TrendingUp size={24} color="#f59e0b" />} 
              label="PRIMARY ANOMALY"
              value={alert.type === 'STAT_OUTLIER' ? 'Cost Spike' : 'Pattern Match'}
              info="Anomaly Detected"
            />
            <MetricCard 
              icon={<Activity size={24} color="#a855f7" />} 
              label="AI CONFIDENCE"
              value="94%"
              info="High Fidelity"
            />
          </div>

          {/* AI Analysis Box */}
          <div className="card" style={{ 
            border: '2px solid #3b82f6', 
            borderRadius: '16px', 
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '8px' }}>
                <Zap size={20} color="#3b82f6" fill="#3b82f6" />
              </div>
              <h3 style={{ fontSize: '1.125rem', color: '#1e293b' }}>AI Analysis Explanation</h3>
            </div>
            
            <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 600 }}>{generateRiskExplanation(alert)}</span>
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Tag label="Price Inflation" />
              <Tag label="Temporal Spiking" />
              <Tag label="Peer Outlier" />
            </div>
          </div>

          {/* Detailed Charts/Visuals Placeholders (matching image) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="card" style={{ minHeight: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem' }}>Cost Per Unit vs. Peer Average</h3>
                <MoreHorizontal size={18} color="var(--text-secondary)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', padding: '0 1rem' }}>
                <div style={{ flex: 1, height: '60%', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                <div style={{ flex: 1, height: '95%', backgroundColor: '#ef4444', borderRadius: '4px' }}></div>
                <div style={{ flex: 1, height: '40%', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                <div style={{ flex: 1, height: '55%', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Peer A</span>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>THIS Vendor</span>
                <span>Peer B</span>
                <span>Peer C</span>
              </div>
            </div>
            <div className="card" style={{ minHeight: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem' }}>Transaction Frequency (Last 30 Days)</h3>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#94a3b8' }}></div> Normal</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f97316' }}></div> Anomaly</span>
                </div>
              </div>
              <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: '80%', height: '2px', backgroundColor: '#f1f5f9' }}></div>
                 <div style={{ position: 'absolute', left: '20%', top: '40%', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f97316' }}></div>
                 <div style={{ position: 'absolute', left: '25%', top: '60%', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f97316' }}></div>
                 <div style={{ position: 'absolute', left: '70%', top: '20%', width: 10, height: 10, borderRadius: '50%', backgroundColor: '#94a3b8' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div>
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => handleAction('review')} 
                disabled={feedbackStatus === 'review' || feedbackStatus === 'loading'}
                style={{ 
                  width: '100%', 
                  backgroundColor: feedbackStatus === 'review' ? '#16a34a' : '#2563eb', 
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)',
                  padding: '0.875rem',
                  fontSize: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
              }}>
                {feedbackStatus === 'loading' ? (
                    <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                ) : feedbackStatus === 'review' ? (
                    <><CheckCircle size={20} /> Marked Under Review</>
                ) : (
                    <><CheckCircle size={20} /> Mark Under Review</>
                )}
              </button>
              
              <button 
                className="btn btn-outline" 
                onClick={() => handleAction('escalate')}
                disabled={feedbackStatus === 'escalate'}
                style={{ width: '100%', padding: '0.75rem', borderColor: feedbackStatus === 'escalate' ? '#f59e0b' : '#e2e8f0', color: feedbackStatus === 'escalate' ? '#f59e0b' : 'inherit' }}
              >
                {feedbackStatus === 'escalate' ? <><ShieldAlert size={18} /> Escalated</> : <><ExternalLink size={18} /> Escalate to Supervisor</>}
              </button>
              
              <button 
                className="btn btn-outline" 
                onClick={() => handleAction('export')}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <Download size={18} /> Export Report
              </button>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Internal Notes</h3>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} color="#475569" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>M. Thompson</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Just now</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.4 }}>
                    Initial review confirms the spike. Awaiting invoices for the materials.
                  </p>
                </div>
              </div>
              <textarea 
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', minHeight: '80px', marginBottom: '0.5rem' }}
                placeholder="Type a note here..."
              />
              <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Add Note</button>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>LINKED ENTITIES</h3>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} color="#2563eb" />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>John Doe (CEO)</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Director of {alert.vendor}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} color="#475569" />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{alert.department}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Contract Issuer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, info, color }) => (
  <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
    <div style={{ marginBottom: '1rem' }}>{icon}</div>
    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</p>
    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: color || '#0f172a', marginBottom: '0.25rem' }}>{value}</p>
    <p style={{ fontSize: '0.75rem', color: color || 'var(--text-secondary)', fontWeight: 500 }}>{info}</p>
  </div>
);

const Tag = ({ label }) => (
  <span style={{ 
    padding: '0.4rem 0.8rem', 
    backgroundColor: '#eff6ff', 
    color: '#2563eb', 
    borderRadius: '20px', 
    fontSize: '0.75rem', 
    fontWeight: 600,
    border: '1px solid #dbeafe',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  }}>
    <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#2563eb' }}></div>
    {label}
  </span>
);

export default InvestigationDetail;
