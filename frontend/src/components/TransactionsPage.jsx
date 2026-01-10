import React, { useState } from 'react';
import TransactionTable from './TransactionTable';
import { Search, Filter, Download } from 'lucide-react';

const TransactionsPage = ({ alerts, onInvestigate, onVendorView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('All');

  const uniqueVendors = [...new Set(alerts.map(a => a.vendor))].sort();

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.amount.toString().includes(searchTerm);
    
    const matchesVendor = vendorFilter === 'All' || alert.vendor === vendorFilter;
    
    // Risk Filter
    let matchesRisk = true;
    if (filter === 'High Risk') matchesRisk = alert.risk_score > 0.7;
    if (filter === 'Medium Risk') matchesRisk = alert.risk_score > 0.4 && alert.risk_score <= 0.7;

    return matchesSearch && matchesVendor && matchesRisk;
  });

  return (
    <div className="transactions-page">

      <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                <Search size={18} color="#94a3b8" />
                <input 
                    type="text" 
                    placeholder="Search ID, Amount..." 
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* Vendor Filter */}
            <div style={{ minWidth: '200px' }}>
                <select 
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                    style={{ 
                        width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', 
                        fontSize: '0.875rem', color: '#475569', outline: 'none'
                    }}
                >
                    <option value="All">All Vendors</option>
                    {uniqueVendors.map(v => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
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

      <TransactionTable alerts={filteredAlerts} onInvestigate={onInvestigate} onVendorView={onVendorView} />
    </div>
  );
};

export default TransactionsPage;
