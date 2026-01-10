import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Shield, Lock, Mail, User, ChevronRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@auditai.gov');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (!result.success) setError(result.error);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgb(0, 0, 0) 0%, rgb(4, 9, 30) 90.2%)', // Cyber dark background
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Abstract Background Elements */}
      <div style={{ position: 'absolute', top: -100, left: -100, width: 600, height: 600, background: '#2563eb', filter: 'blur(150px)', opacity: 0.2, borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: -100, right: -100, width: 500, height: 500, background: '#3b82f6', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }}></div>

      <div style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '3rem',
        borderRadius: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)', // Glass effect
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
          }}>
            <Shield size={36} color="white" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>AuditAI</h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>Advanced Fraud Detection Unit</p>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171', 
            borderRadius: '12px', 
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access ID</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="auditor@gov.in"
                required
                style={{ 
                  width: '100%', 
                  padding: '1rem 1rem 1rem 3rem', 
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(51, 65, 85, 0.5)', 
                  borderRadius: '12px',
                  fontSize: '0.925rem',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Secure Key</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ 
                  width: '100%', 
                  padding: '1rem 1rem 1rem 3rem', 
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(51, 65, 85, 0.5)', 
                  borderRadius: '12px',
                  fontSize: '0.925rem',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)'}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              backgroundColor: '#2563eb',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {loading ? 'Verifying Credentials...' : 'Access Safe Environment'}
            {!loading && <ChevronRight size={18} style={{ marginLeft: '0.5rem' }} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1' }}>Restricted Area Level 4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
