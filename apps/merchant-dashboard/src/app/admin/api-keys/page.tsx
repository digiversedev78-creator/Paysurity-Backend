'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Define the shape of an API key
interface ApiKey {
  id: string;
  tenantName: string; // Assuming we get tenant name directly from the API
  tenantId: string;
  name: string;
  createdDate: string;
  lastUsedDate: string | null;
  status: 'active' | 'revoked';
  rateLimit: number; // requests per minute
}

// Define the shape of usage statistics
interface UsageStats {
  date: string; // YYYY-MM-DD format
  requests: number;
}

const AdminApiKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for Usage Stats Modal
  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);
  const [selectedKeyForUsage, setSelectedKeyForUsage] = useState<ApiKey | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [usageLoading, setUsageLoading] = useState<boolean>(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  // State for Rate Limit Override Modal
  const [showRateLimitModal, setShowRateLimitModal] = useState<boolean>(false);
  const [selectedKeyForRateLimit, setSelectedKeyForRateLimit] = useState<ApiKey | null>(null);
  const [newRateLimit, setNewRateLimit] = useState<number | ''>(''); // Can be number or empty string for input field

  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/api-keys');
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data: ApiKey[] = await response.json();
      setApiKeys(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch API keys');
      console.error('Failed to fetch API keys:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      setApiKeys((prevKeys) =>
        prevKeys.map((key) => (key.id === keyId ? { ...key, status: 'revoked' } : key))
      );
      alert('API key revoked successfully.');
    } catch (err: any) {
      alert(`Failed to revoke API key: ${err.message}`);
      console.error('Failed to revoke API key:', err);
    }
  };

  const openUsageModal = async (key: ApiKey) => {
    setSelectedKeyForUsage(key);
    setShowUsageModal(true);
    setUsageLoading(true);
    setUsageError(null);
    setUsageStats([]);

    try {
      const response = await fetch(`/api/admin/api-keys/${key.id}/usage`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data: UsageStats[] = await response.json();
      setUsageStats(data);
    } catch (err: any) {
      setUsageError(err.message || 'Failed to fetch usage statistics');
      console.error('Failed to fetch usage stats:', err);
    } finally {
      setUsageLoading(false);
    }
  };

  const handleUpdateRateLimit = async () => {
    if (!selectedKeyForRateLimit) return;

    const keyId = selectedKeyForRateLimit.id;
    const limit = Number(newRateLimit);

    if (isNaN(limit) || limit <= 0) {
      alert('Please enter a valid positive number for the rate limit.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}/rate-limit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rateLimit: limit }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      setApiKeys((prevKeys) =>
        prevKeys.map((key) => (key.id === keyId ? { ...key, rateLimit: limit } : key))
      );
      alert('Rate limit updated successfully.');
      setShowRateLimitModal(false);
      setNewRateLimit('');
    } catch (err: any) {
      alert(`Failed to update rate limit: ${err.message}`);
      console.error('Failed to update rate limit:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin API Keys Management</h1>

      {loading && <p>Loading API keys...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tenant</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Last Used</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Rate Limit (req/min)</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>No API keys found.</td>
              </tr>
            ) : (
              apiKeys.map((key) => (
                <tr key={key.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{key.tenantName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{key.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(key.createdDate).toLocaleDateString()}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {key.lastUsedDate ? new Date(key.lastUsedDate).toLocaleDateString() : 'Never'}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{key.status}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{key.rateLimit}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      disabled={key.status === 'revoked'}
                      style={{ marginRight: '5px', background: key.status === 'revoked' ? '#ccc' : '#dc3545', color: 'white', border: 'none', padding: '8px 12px', cursor: key.status === 'revoked' ? 'not-allowed' : 'pointer' }}
                    >
                      Revoke
                    </button>
                    <button
                      onClick={() => openUsageModal(key)}
                      style={{ marginRight: '5px', background: '#007bff', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
                    >
                      View Usage
                    </button>
                    <button
                      onClick={() => {
                        setSelectedKeyForRateLimit(key);
                        setNewRateLimit(key.rateLimit);
                        setShowRateLimitModal(true);
                      }}
                      style={{ background: '#ffc107', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
                    >
                      Edit Rate Limit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Usage Stats Modal */}
      {showUsageModal && selectedKeyForUsage && (
        <div style={{
          position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '400px', maxWidth: '600px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2>Usage Stats for {selectedKeyForUsage.name}</h2>
            {usageLoading && <p>Loading usage statistics...</p>}
            {usageError && <p style={{ color: 'red' }}>Error: {usageError}</p>}
            {!usageLoading && !usageError && (
              usageStats.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                  {usageStats.map((stat, index) => (
                    <p key={index} style={{ margin: '5px 0' }}>
                      <strong>{stat.date}:</strong> {stat.requests} requests
                    </p>
                  ))}
                </div>
              ) : (
                <p>No usage data available for this API key.</p>
              )
            )}
            <button onClick={() => setShowUsageModal(false)} style={{ marginTop: '20px', background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rate Limit Override Modal */}
      {showRateLimitModal && selectedKeyForRateLimit && (
        <div style={{
          position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '300px', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2>Set Rate Limit for {selectedKeyForRateLimit.name}</h2>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="newRateLimitInput" style={{ display: 'block', marginBottom: '5px' }}>New Rate Limit (requests/minute):</label>
              <input
                id="newRateLimitInput"
                type="number"
                value={newRateLimit}
                onChange={(e) => setNewRateLimit(Number(e.target.value))}
                min="1"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <button
                onClick={handleUpdateRateLimit}
                disabled={newRateLimit === '' || isNaN(Number(newRateLimit)) || Number(newRateLimit) <= 0}
                style={{ marginRight: '10px', background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}
              >
                Save
              </button>
              <button onClick={() => setShowRateLimitModal(false)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApiKeysPage;