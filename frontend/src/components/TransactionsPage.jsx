import React, { useState } from 'react';
import TransactionTable from './TransactionTable';
import { Search, Filter, Download } from 'lucide-react';

const TransactionsPage = ({ alerts, onInvestigate, onVendorView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
      alert.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'All') return matchesSearch;
    if (filter === 'High Risk') return matchesSearch && alert.risk_score > 0.7;
    if (filter === 'Medium Risk') return matchesSearch && alert.risk_score > 0.4 && alert.risk_score <= 0.7;
    return matchesSearch;
  });

  return (
    <div className="transactions-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
           <h1 style={{ fontSize: '1.875rem', color: '#0f172a', fontWeight: 800 }}>Transaction Ledger</h1>
           <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Complete record of all ingested fiscal events.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline">
                <Download size={16} /> Export CSV
            </button>
        </div>
      </header>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                <Search size={18} color="#94a3b8" />
                <input 
                    type="text" 
                    placeholder="Search transactions, vendors, or departments..." 
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['All', 'High Risk', 'Medium Risk'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: '8px', 
                            border: '1px solid',
                            borderColor: filter === f ? '#2563eb' : '#e2e8f0',
                            backgroundColor: filter === f ? '#eff6ff' : 'white',
                            color: filter === f ? '#2563eb' : '#64748b',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <TransactionTable alerts={filteredAlerts} onInvestigate={onInvestigate} onVendorView={onVendorView} />
    </div>
  );
};

export default TransactionsPage;
