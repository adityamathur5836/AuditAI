import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, ChevronRight, Sparkles } from 'lucide-react';

const PolicyChat = () => {
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: 'Hello! I am your AI Policy Assistant. Ask me about procurement limits, vendor rules, or compliance schedules.',
            sources: []
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.text })
            });

            const data = await response.json();

            setMessages(prev => [...prev, {
                type: 'bot',
                text: data.reply,
                sources: data.sources || []
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: "Sorry, I'm having trouble accessing the policy database.",
                sources: []
            }]);
        }
        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="policy-chat fade-in" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginBottom: '2rem' }}>
                <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    <span>Deep Tech</span> <ChevronRight size={12} /> <span>RAG Assistant</span>
                </nav>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)' }}>
                        <Sparkles size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', color: '#0f172a' }}>Policy Genius</h1>
                        <p style={{ color: '#64748b' }}>RAG-powered answers from your internal documents</p>
                    </div>
                </div>
            </header>

            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {/* Chat Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', backgroundColor: '#f8fafc' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '1.5rem'
                        }}>
                            {msg.type === 'bot' && (
                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bot size={18} color="white" />
                                </div>
                            )}

                            <div style={{ maxWidth: '70%' }}>
                                <div style={{
                                    padding: '1rem 1.5rem',
                                    borderRadius: msg.type === 'user' ? '16px 16px 0 16px' : '0 16px 16px 16px',
                                    backgroundColor: msg.type === 'user' ? '#2563eb' : 'white',
                                    color: msg.type === 'user' ? 'white' : '#1e293b',
                                    boxShadow: msg.type === 'bot' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    fontSize: '0.95rem',
                                    lineHeight: 1.5
                                }}>
                                    {msg.text}
                                </div>

                                {msg.sources && msg.sources.length > 0 && (
                                    <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <FileText size={12} /> CITED POLICY SOURCES
                                        </p>
                                        {msg.sources.map((src, i) => (
                                            <div key={i} style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '4px', marginBottom: '0.25rem', borderLeft: '2px solid #64748b' }}>
                                                "{src.text.substring(0, 100)}..."
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {msg.type === 'user' && (
                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <User size={18} color="#64748b" />
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={18} color="white" />
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0 16px 16px 16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '1.5rem', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Ask about compliance, limits, or vendor rules..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '1rem',
                                backgroundColor: '#f8fafc'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ borderRadius: '12px', padding: '0 1.5rem' }}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                        {['What is the limit for Dept A?', 'Can we pay vendors on weekends?', 'Vendor rules?'].map(q => (
                            <button
                                key={q}
                                onClick={() => setInput(q)}
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: 'white',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        .typing-indicator { display: flex; gap: 4px; }
        .typing-indicator span {
            width: 8px; height: 8px; background: #cbd5e1;
            border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
      `}</style>
        </div>
    );
};

export default PolicyChat;
