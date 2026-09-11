'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';

interface Notification {
  id?: string;
  type?: string;
  channel?: string;
  message?: string;
  status?: string;
  createdAt?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms' | 'push'>('email');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    // Load notification history (stub for now)
    setTimeout(() => {
      setNotifications([
        { id: '1', type: 'RECEIPT', channel: 'email', message: 'Payment receipt sent to customer@email.com', status: 'delivered', createdAt: new Date().toISOString() },
        { id: '2', type: 'LOYALTY', channel: 'sms', message: 'Loyalty points earned notification to +1-555-xxx-xxxx', status: 'delivered', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', type: 'SUBSCRIPTION', channel: 'email', message: 'Subscription renewal reminder', status: 'pending', createdAt: new Date(Date.now() - 7200000).toISOString() },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const endpoint = `/notifications/${channel}`;
      const payload = channel === 'email'
        ? { to, subject, body }
        : channel === 'sms'
        ? { to, body }
        : { expoPushToken: to, title: subject, body };
      
      const res = await apiClient.post<any>(endpoint, payload);
      setResult({ success: res.success });
      if (res.success) { setTo(''); setSubject(''); setBody(''); setComposing(false); }
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setSending(false);
    }
  };

  const channelIcon = (ch?: string) => ({ email: '📧', sms: '💬', push: '🔔' }[ch || 'email'] || '📩');
  const statusColor = (s?: string) => s === 'delivered' ? '#10b981' : s === 'pending' ? '#f59e0b' : '#6b7280';

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>🔔 Notifications</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            Send and track email, SMS, and push notifications
          </p>
        </div>
        <button
          onClick={() => setComposing(!composing)}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontWeight: 600, fontSize: '0.875rem',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}
        >
          {composing ? '✕ Cancel' : '+ Compose'}
        </button>
      </div>

      {/* Compose Panel */}
      {composing && (
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, padding: 24, marginBottom: 24,
        }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>New Notification</h2>
          
          {/* Channel selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['email', 'sms', 'push'] as const).map(ch => (
              <button key={ch} onClick={() => setChannel(ch)} style={{
                padding: '8px 16px', borderRadius: 8,
                border: channel === ch ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.12)',
                background: channel === ch ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: channel === ch ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              }}>
                {channelIcon(ch)} {ch.toUpperCase()}
              </button>
            ))}
          </div>

          {[
            { label: channel === 'push' ? 'Expo Push Token' : channel === 'sms' ? 'Phone (E.164)' : 'Email', value: to, onChange: setTo, placeholder: channel === 'email' ? 'customer@email.com' : channel === 'sms' ? '+15551234567' : 'ExponentPushToken[...]' },
            ...(channel !== 'sms' ? [{ label: 'Subject / Title', value: subject, onChange: setSubject, placeholder: 'Payment Receipt — Thank you!' }] : []),
          ].map(field => (
            <div key={field.label} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: 6 }}>{field.label}</label>
              <input value={field.value} onChange={e => field.onChange(e.target.value)} placeholder={field.placeholder} style={{
                width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '0.875rem', outline: 'none',
                boxSizing: 'border-box',
              }} />
            </div>
          ))}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Message Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} style={{
              width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '0.875rem', outline: 'none',
              resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
            }} />
          </div>

          {result && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 12,
              background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${result.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: result.success ? '#10b981' : '#ef4444', fontSize: '0.875rem',
            }}>
              {result.success ? '✅ Notification sent successfully!' : `❌ Error: ${result.error}`}
            </div>
          )}

          <button onClick={handleSend} disabled={sending || !to || !body} style={{
            padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontWeight: 700, fontSize: '0.875rem',
            opacity: sending || !to || !body ? 0.5 : 1,
          }}>
            {sending ? 'Sending...' : `Send ${channel.toUpperCase()}`}
          </button>
        </div>
      )}

      {/* Notification Log */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Recent Notifications</h2>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
        ) : (
          <div>
            {notifications.map((n, i) => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px',
                borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{ fontSize: 24 }}>{channelIcon(n.channel)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 500 }}>{n.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                    {n.type} • {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                  color: statusColor(n.status),
                  background: `${statusColor(n.status)}20`,
                  border: `1px solid ${statusColor(n.status)}40`,
                }}>
                  {n.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}