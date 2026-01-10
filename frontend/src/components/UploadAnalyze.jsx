import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle, Loader2, Download, Filter, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const UploadAnalyze = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a CSV file');
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a CSV file');
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Analysis failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to API. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getRiskBg = (level) => {
    switch (level) {
      case 'CRITICAL': return 'rgba(220, 38, 38, 0.1)';
      case 'HIGH': return 'rgba(249, 115, 22, 0.1)';
      case 'MEDIUM': return 'rgba(234, 179, 8, 0.1)';
      case 'LOW': return 'rgba(34, 197, 94, 0.1)';
      default: return 'rgba(100, 116, 139, 0.1)';
    }
  };

  const filteredResults = results?.results?.filter(r => {
    if (filterLevel === 'all') return true;
    return r.risk_level === filterLevel;
  }) || [];

  const exportResults = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fraud_analysis_results.json';
    a.click();
  };

  const resetAnalysis = () => {
    setFile(null);
    setResults(null);
    setError(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Upload & Analyze Transactions
        </h1>
        <p style={{ color: '#64748b' }}>
          Upload a CSV file to detect fraud using our ML-powered analysis engine
        </p>
      </div>

      {/* Upload Zone */}
      {!results && (
        <div 
          className="card"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? '#2563eb' : '#e2e8f0'}`,
            backgroundColor: isDragging ? 'rgba(37, 99, 235, 0.05)' : 'white',
            padding: '3rem',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <Upload size={32} color="#64748b" />
            </div>
          </div>
          
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
            {file ? file.name : 'Drop your CSV file here'}
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}
          </p>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="file-upload"
          />
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <label 
              htmlFor="file-upload"
              className="btn btn-secondary"
              style={{ cursor: 'pointer' }}
            >
              <FileText size={16} style={{ marginRight: '0.5rem' }} />
              Browse Files
            </label>
            
            {file && (
              <button 
                className="btn btn-primary"
                onClick={analyzeFile}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} style={{ marginRight: '0.5rem' }} />
                    Analyze for Fraud
                  </>
                )}
              </button>
            )}
          </div>
          
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '1.5rem' }}>
            Required columns: transaction_id, amount, department_id, vendor_id
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card" style={{ 
          backgroundColor: 'rgba(220, 38, 38, 0.1)', 
          border: '1px solid #dc2626',
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <XCircle color="#dc2626" size={20} />
          <span style={{ color: '#dc2626', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <SummaryCard 
              label="Total Analyzed" 
              value={results.total_transactions} 
              color="#0f172a" 
            />
            <SummaryCard 
              label="Fraudulent" 
              value={results.fraudulent_transactions} 
              color="#dc2626" 
              icon={<XCircle size={16} />}
            />
            <SummaryCard 
              label="High Risk" 
              value={results.high_risk_count} 
              color="#f97316" 
              icon={<AlertTriangle size={16} />}
            />
            <SummaryCard 
              label="Medium Risk" 
              value={results.medium_risk_count} 
              color="#eab308" 
            />
            <SummaryCard 
              label="Low Risk" 
              value={results.low_risk_count} 
              color="#22c55e" 
              icon={<CheckCircle size={16} />}
            />
          </div>

          {/* Detection Rate */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Detection Rate</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  {results.detection_rate}% of transactions flagged as potentially fraudulent
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={exportResults}>
                  <Download size={16} style={{ marginRight: '0.5rem' }} />
                  Export Results
                </button>
                <button className="btn btn-primary" onClick={resetAnalysis}>
                  <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
                  New Analysis
                </button>
              </div>
            </div>
            <div style={{ 
              height: 8, 
              backgroundColor: '#f1f5f9', 
              borderRadius: 4, 
              marginTop: '1rem',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%', 
                width: `${results.detection_rate}%`,
                backgroundColor: results.detection_rate > 30 ? '#dc2626' : '#f97316',
                borderRadius: 4,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Filter & Results Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem' }}>Detection Results</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Filter size={16} color="#64748b" />
                <select 
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="all">All Levels</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>
              </div>
            </div>

            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Transaction ID</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Amount</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Department</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Risk Score</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Risk Level</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>ML Flag</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.slice(0, 100).map((result, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 500 }}>{result.transaction_id}</td>
                      <td style={{ padding: '0.75rem' }}>₹{result.amount?.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem' }}>{result.department_id}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ 
                            width: 40, 
                            height: 6, 
                            backgroundColor: '#f1f5f9', 
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              height: '100%', 
                              width: `${result.risk_score * 100}%`,
                              backgroundColor: getRiskColor(result.risk_level)
                            }} />
                          </div>
                          <span style={{ fontSize: '0.875rem' }}>{(result.risk_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          backgroundColor: getRiskBg(result.risk_level),
                          color: getRiskColor(result.risk_level),
                          padding: '0.25rem 0.75rem',
                          borderRadius: 12,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {result.risk_level}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          backgroundColor: result.ml_flag === 'ANOMALY' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                          color: result.ml_flag === 'ANOMALY' ? '#dc2626' : '#22c55e',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {result.ml_flag}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', maxWidth: 300 }}>
                        {result.explanation || (result.reasons || []).join(' | ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredResults.length > 100 && (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', marginTop: '1rem' }}>
                Showing 100 of {filteredResults.length} results
              </p>
            )}
          </div>
        </>
      )}

      {/* Help Section */}
      {!results && (
        <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f8fafc' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Expected CSV Format</h3>
          <code style={{ 
            display: 'block', 
            backgroundColor: '#1e293b', 
            color: '#e2e8f0', 
            padding: '1rem', 
            borderRadius: 8,
            fontSize: '0.75rem',
            overflow: 'auto'
          }}>
            transaction_id,timestamp,department_id,vendor_id,vendor_category,amount,payment_method,description<br/>
            TX-00001,2025-01-10T10:00:00,DEPT-RAIL,VEN-001,Civil Works,150000,NEFT,Infrastructure payment<br/>
            TX-00002,2025-01-10T14:30:00,DEPT-HEALTH-AIIMS,VEN-042,Medical Supplies,85000,RTGS,Medical equipment
          </code>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const SummaryCard = ({ label, value, color, icon }) => (
  <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>{label}</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {icon && <span style={{ color }}>{icon}</span>}
      <span style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</span>
    </div>
  </div>
);

export default UploadAnalyze;
