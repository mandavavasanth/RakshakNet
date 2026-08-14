import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, Users, Shield, MessageSquare, Terminal } from 'lucide-react';

const DispatchChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'EOC Command', time: '10:00', text: 'All units, stand by for situational update. Weather deterioration expected in Sector 4.', isOwn: true, type: 'command' },
    { id: 2, sender: 'Alpha Team', time: '10:02', text: 'Alpha Team holding at checkpoint Charlie. Visual on minor flooding.', isOwn: false, type: 'team' },
    { id: 3, sender: 'Bravo Squad', time: '10:05', text: 'Bravo Squad requesting medevac for civilian casualty at grid 784.', isOwn: false, type: 'team' },
    { id: 4, sender: 'System AI', time: '10:06', text: 'Automated Response: Medevac drone dispatched. ETA 4 minutes.', isOwn: false, type: 'system' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { 
      id: Date.now(), 
      sender: 'EOC Command', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}), 
      text: input, 
      isOwn: true,
      type: 'command'
    }]);
    setInput('');
  };

  const getSenderColor = (type) => {
    if (type === 'command') return 'var(--accent-green)';
    if (type === 'system') return 'var(--accent-blue)';
    return 'var(--text-secondary)';
  }

  const getSenderIcon = (type) => {
    if (type === 'command') return <Shield size={12} />;
    if (type === 'system') return <Terminal size={12} />;
    return <Users size={12} />;
  }

  return (
    <div className="flex-col animate-fade-in" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="page-title flex-row" style={{ gap: '0.75rem', margin: 0 }}>
          <MessageSquare size={28} className="text-accent-blue" /> Dispatch Communications
        </h2>
      </div>

      <div className="card flex-row" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
        {/* Sidebar Channels */}
        <div style={{ width: '280px', borderRight: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-primary)', fontWeight: '600', fontSize: '0.875rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Active Channels
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 0' }}>
            {['General_Ops', 'Alpha_Team_Sec', 'Bravo_Squad_Med', 'Charlie_Rescue', 'Air_Support_Drone'].map((ch, i) => (
              <div key={i} style={{ 
                padding: '0.75rem 1.5rem', 
                cursor: 'pointer', 
                background: i === 0 ? 'rgba(34, 197, 94, 0.1)' : 'transparent', 
                color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderLeft: i === 0 ? '3px solid var(--accent-green)' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                transition: 'var(--transition)'
              }}>
                <Hash size={16} className={i === 0 ? "text-accent-green" : "text-muted"} /> {ch}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Hash size={20} className="text-accent-green" /> 
            <span style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '1.125rem' }}>General_Ops</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>14 Participants • Secure Link</span>
          </div>
          
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map(m => (
              <div key={m.id} style={{ 
                alignSelf: m.isOwn ? 'flex-end' : 'flex-start', 
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)', 
                  alignSelf: m.isOwn ? 'flex-end' : 'flex-start',
                  flexDirection: m.isOwn ? 'row-reverse' : 'row'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: getSenderColor(m.type) }}>
                    {getSenderIcon(m.type)}
                    <span style={{ fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{m.sender}</span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{m.time}</span>
                </div>
                
                <div style={{ 
                  padding: '0.875rem 1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  borderTopRightRadius: m.isOwn ? '2px' : 'var(--radius-md)',
                  borderTopLeftRadius: !m.isOwn ? '2px' : 'var(--radius-md)',
                  background: m.isOwn ? 'rgba(34, 197, 94, 0.1)' : m.type === 'system' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)', 
                  border: `1px solid ${m.isOwn ? 'rgba(34, 197, 94, 0.3)' : m.type === 'system' ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-primary)'}`,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={send} style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.2)' }}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Transmit message to General_Ops..." 
              style={{ 
                flex: 1, 
                background: 'rgba(0,0,0,0.4)', 
                border: '1px solid var(--border-primary)', 
                color: 'var(--text-primary)', 
                padding: '0.875rem 1.25rem', 
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', borderRadius: 'var(--radius-md)' }}>
              <Send size={18} /> <span style={{ marginLeft: '0.5rem' }}>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DispatchChat;
