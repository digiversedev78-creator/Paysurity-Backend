/**
 * PaySurity Nerve Center - Centralized API Client
 * Handles tenant context and impersonation headers automatically.
 */

export class ApiClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  private static getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 1. Native Tenant Context (from local storage or session)
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('ps_tenant_id') : null;
    if (tenantId) headers['x-tenant-id'] = tenantId;

    // 2. Impersonation Context (from Admin Switchboard)
    const impersonateId = typeof window !== 'undefined' ? localStorage.getItem('ps_impersonate_tenant_id') : null;
    if (impersonateId) {
      headers['x-impersonate-tenant'] = impersonateId;
    }

    // 3. Auth Token
    const token = typeof window !== 'undefined' ? localStorage.getItem('ps_auth_token') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return headers;
  }

  static async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`API GET Failed: ${res.statusText}`);
    return res.json();
  }

  static async post<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API POST Failed: ${res.statusText}`);
    return res.json();
  }

  static async patch<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API PATCH Failed: ${res.statusText}`);
    return res.json();
  }
}
