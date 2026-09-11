"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Tenant {
  id: string;
  name: string;
  plan: string;
  status: 'active' | 'suspended';
  mrr: number;
  created_at: string;
}

const AdminTenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const router = useRouter();

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/tenants');
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data: Tenant[] = await response.json();
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tenants');
      console.error('Failed to fetch tenants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const filteredTenants = useMemo(() => {
    if (!searchTerm) {
      return tenants;
    }
    return tenants.filter(tenant =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tenants, searchTerm]);

  const handleToggleStatus = useCallback(async (tenantId: string, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus} this tenant?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tenant status');
      }

      // Re-fetch tenants to reflect the change
      fetchTenants();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
      console.error('Error updating tenant status:', err);
    }
  }, [fetchTenants]);

  const handleImpersonate = useCallback(async (tenantId: string) => {
    if (!confirm('Are you sure you want to impersonate this tenant? You will be logged out of your current super-admin session.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/impersonate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to impersonate tenant');
      }

      // Assuming the API sets impersonation cookies/tokens and the client needs to redirect
      // to the general dashboard which will then load the impersonated tenant's data.
      alert('Impersonation successful! Redirecting to tenant dashboard.');
      router.push('/dashboard'); // Redirect to a common dashboard route
    } catch (err: any) {
      alert(`Error impersonating tenant: ${err.message}`);
      console.error('Error impersonating tenant:', err);
    }
  }, [router]);

  const handleRowClick = useCallback((tenantId: string) => {
    router.push(`/admin/tenants/${tenantId}`);
  }, [router]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>Super-Admin Tenants</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search tenants by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      {loading && <p>Loading tenants...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && filteredTenants.length === 0 && (
        <p>No tenants found.</p>
      )}

      {!loading && !error && filteredTenants.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Plan</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>MRR</th>
              <th style={tableHeaderStyle}>Created</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => (
              <tr key={tenant.id} style={{ borderBottom: '1px solid #eee' }}>
                <td
                  style={{ ...tableCellStyle, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => handleRowClick(tenant.id)}
                >
                  {tenant.name}
                </td>
                <td style={tableCellStyle}>{tenant.plan}</td>
                <td style={tableCellStyle}>
                  <span style={{ color: tenant.status === 'active' ? 'green' : 'red', fontWeight: 'bold' }}>
                    {tenant.status.toUpperCase()}
                  </span>
                </td>
                <td style={tableCellStyle}>${tenant.mrr.toFixed(2)}</td>
                <td style={tableCellStyle}>{new Date(tenant.created_at).toLocaleDateString()}</td>
                <td style={{ ...tableCellStyle, whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                    style={{
                      padding: '8px 12px',
                      marginRight: '8px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: tenant.status === 'active' ? '#f44336' : '#4CAF50',
                      color: 'white',
                      minWidth: '90px'
                    }}
                  >
                    {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleImpersonate(tenant.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      minWidth: '100px'
                    }}
                  >
                    Impersonate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Basic inline styles for a clean look
const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 15px',
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
  fontWeight: 'bold',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px 15px',
  borderBottom: '1px solid #ddd',
};

export default AdminTenantsPage;