import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, FileText, Lightbulb, MessageCircle } from 'lucide-react';

const PolicyChat = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 **Hi! I\'m your Policy Genius** - an AI assistant trained on government financial policies and audit regulations.\n\n**I can help you with:**\n• Audit compliance questions\n• Policy interpretation\n• Financial regulations\n• Transaction approval rules\n• Best practices\n\n**What would you like to know?**'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestedQuestions = [
        'What is the approval process for high-value transactions?',
        'What are the red flags for vendor fraud?',
        'How should off-hours transactions be handled?',
        'What documentation is required for procurement?',
        'Explain departmental spending limits'
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (question = input) => {
        if (!question.trim()) return;

        const userMessage = { role: 'user', content: question };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question })
            });

            const data = await response.json();

            const assistantMessage = {
                role: 'assistant',
                content: data.reply,
                sources: data.sources || []
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ **Error**: Sorry, I encountered an error. Please make sure the backend is running and try again.',
                error: true
            }]);
        }

        setLoading(false);
    };

    const handleSuggestedQuestion = (question) => {
        handleSend(question);
    };

    const renderMessage = (text) => {
        return text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                {line.split('**').map((part, j) =>
                    j % 2 === 0 ? part : <strong key={j}>{part}</strong>
                )}
                {i < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 200px)',
            maxWidth: '900px',
            margin: '0 auto'
        }}>
            {/* Chat Messages */}
            <div className="card" style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: '#f8fafc'
            }}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1rem',
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%'
                        }}
                    >
                        {msg.role === 'assistant' && (
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Sparkles size={20} color="white" />
                            </div>
                        )}

                        <div style={{ flex: 1 }}>
                            <div style={{
                                padding: '1rem 1.25rem',
                                borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                backgroundColor: msg.role === 'user' ? '#2563eb' : 'white',
                                color: msg.role === 'user' ? 'white' : msg.error ? '#dc2626' : '#0f172a',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{
                                    fontSize: '0.875rem',
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {renderMessage(msg.content)}
                                </div>
                            </div>

                            {msg.sources && msg.sources.length > 0 && (
                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <FileText size={14} color="#64748b" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                                            Policy Sources Referenced:
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                                        {msg.sources.map((source, i) => {
                                            const text = typeof source === 'string' ? source : source.text || '';
                                            return (
                                                <div key={i} style={{
                                                    marginTop: '0.25rem',
                                                    paddingLeft: '0.75rem',
                                                    borderLeft: '2px solid #e2e8f0'
                                                }}>
                                                    "{text.substring(0, 120)}..."
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                                flexShrink: 0
                            }}>
                                👤
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Sparkles size={20} color="white" />
                        </div>
                        <div style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '16px',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span style={{ fontSize: '0.875rem', color: '#64748b', marginLeft: '0.5rem' }}>Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Lightbulb size={16} color="#f59e0b" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
                            Suggested Questions:
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {suggestedQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestedQuestion(q)}
                                className="btn"
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    borderRadius: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#2563eb';
                                    e.currentTarget.style.color = '#2563eb';
                                    e.currentTarget.style.backgroundColor = '#eff6ff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.color = '#475569';
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <MessageCircle size={20} color="#64748b" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Ask about policies, regulations, compliance..."
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="btn btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            opacity: loading || !input.trim() ? 0.5 : 1,
                            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Send size={16} />
                        Send
                    </button>
                </div>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.75rem', textAlign: 'center' }}>
                    💡 Powered by Google Gemini AI • Press Enter to send • Sources are from policy documents
                </p>
            </div>

            <style>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
        }
        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #64748b;
          animation: typing 1.4s infinite;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
};

export default PolicyChat;
