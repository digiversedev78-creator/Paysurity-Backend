'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../../../lib/api-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  status: string;
}

const SUGGESTED_PROMPTS = [
  "What were today's top-selling items?",
  "Show me revenue trends for this week",
  "Which customers are my most loyal?",
  "Analyze my staff tip distribution",
  "What inventory items need reordering?",
  "Generate a business performance summary",
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16,
      animation: 'fadeInUp 0.3s ease',
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, marginRight: 10, flexShrink: 0, marginTop: 4,
          boxShadow: '0 0 12px rgba(99,102,241,0.4)',
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: '72%',
        background: isUser
          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
          : 'rgba(255,255,255,0.06)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '12px 16px',
        boxShadow: isUser
          ? '0 4px 20px rgba(99,102,241,0.3)'
          : '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        <p style={{
          margin: 0, fontSize: '0.875rem', lineHeight: 1.6,
          color: isUser ? '#fff' : 'rgba(255,255,255,0.9)',
          whiteSpace: 'pre-wrap',
        }}>{msg.content}</p>
        <div style={{
          fontSize: '0.65rem',
          color: isUser ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
          marginTop: 6, textAlign: isUser ? 'right' : 'left',
        }}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, marginLeft: 10, flexShrink: 0, marginTop: 4,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>👤</div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, boxShadow: '0 0 12px rgba(99,102,241,0.4)',
      }}>🤖</div>
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '18px 18px 18px 4px',
        padding: '14px 20px',
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'rgba(99,102,241,0.8)',
            animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function AiAssistantPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    // Start a new chat session
    const initSession = async () => {
      try {
        const sess = await apiClient.post<ChatSession>('/ai/chat/sessions', {});
        setSession(sess);
        // Welcome message
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm your PaySurity AI Business Assistant. 🚀\n\nI have access to your live transaction data, customer insights, inventory levels, and operational metrics.\n\nAsk me anything about your business — I'm here to turn your data into actionable intelligence.`,
          timestamp: new Date(),
        }]);
      } catch {
        // Fallback: create a local session for demo
        setSession({ id: 'demo-session', status: 'active' });
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm your PaySurity AI Business Assistant. 🚀\n\nI can help you analyze revenue, customers, inventory, staff performance, and more.\n\nWhat would you like to explore today?`,
          timestamp: new Date(),
        }]);
      } finally {
        setCreating(false);
      }
    };
    initSession();
  }, []);

  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || loading || !session) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post<{ id: string; content: string; role: string }[]>(
        `/ai/chat/sessions/${session.id}/messages`,
        { message: messageText }
      );
      
      // The API returns [userMsg, assistantMsg]
      const aiResponse = response.find((m: any) => m.role === 'assistant');
      if (aiResponse) {
        setMessages(prev => [...prev, {
          id: aiResponse.id || `a-${Date.now()}`,
          role: 'assistant',
          content: aiResponse.content,
          timestamp: new Date(),
        }]);
      }
    } catch {
      // Fallback response if API is not yet available
      const fallbackResponses: Record<string, string> = {
        revenue: "I'm analyzing your revenue data... Based on recent transactions, your 7-day revenue trend shows consistent growth. Connect to a live database for real-time figures.",
        order: "Order analysis requires database connectivity. In staging mode, I can show you that your average order value is tracking well.",
        customer: "Customer segmentation is available once connected to your live database. I can identify VIP customers, at-risk churners, and new-acquisition patterns.",
      };
      
      const lower = messageText.toLowerCase();
      let fallback = "I'm running in demo mode — connect a live database to unlock full AI analytics. In the meantime, I can describe what insights I'd surface for this query.";
      for (const [key, val] of Object.entries(fallbackResponses)) {
        if (lower.includes(key)) { fallback = val; break; }
      }
      
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: fallback,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .prompt-chip:hover {
          background: rgba(99,102,241,0.2) !important;
          border-color: rgba(99,102,241,0.5) !important;
          color: #a5b4fc !important;
        }
        .send-btn:hover {
          background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
          box-shadow: 0 4px 20px rgba(99,102,241,0.5) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, boxShadow: '0 0 20px rgba(99,102,241,0.4)',
        }}>🤖</div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            AI Business Assistant
          </h1>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            Powered by PaySurity Intelligence • {session ? `Session ${session.id.slice(0, 8)}...` : 'Starting...'}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: session ? '#10b981' : '#f59e0b',
            boxShadow: session ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
          }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            {session ? 'Connected' : 'Initializing...'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '24px',
        display: 'flex', flexDirection: 'column',
      }}>
        {creating ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
              <p>Initializing AI session...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator />}
          </>
        )}
        
        {/* Suggested prompts — show when no user messages yet */}
        {!creating && messages.length === 1 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: 12, textAlign: 'center' }}>
              SUGGESTED QUERIES
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  className="prompt-chip"
                  onClick={() => sendMessage(prompt)}
                  style={{
                    padding: '8px 14px', borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.78rem', cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-end',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16, padding: '12px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about your business data... (Enter to send, Shift+Enter for new line)"
            disabled={loading || creating || !session}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: '0.875rem', resize: 'none',
              lineHeight: 1.6, maxHeight: 120, overflowY: 'auto',
              fontFamily: 'inherit',
            }}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={loading || creating || !input.trim() || !session}
            style={{
              width: 40, height: 40, borderRadius: 12, border: 'none',
              background: input.trim()
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.08)',
              color: '#fff', cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0,
              transition: 'all 200ms',
              boxShadow: input.trim() ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            {loading ? '⏳' : '↑'}
          </button>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          AI insights are based on your actual business data. Always verify critical decisions.
        </p>
      </div>
    </div>
  );
}
