import { TenantsTable } from './table.client';
import { API_URL, ADMIN_HEADERS } from '../../lib/constants';

async function fetchTenants() {
  try {
    const res = await fetch(`${API_URL}/admin/tenants`, {
      headers: ADMIN_HEADERS,
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error('Failed to fetch tenants:', err);
    return [];
  }
}

export default async function TenantsPage() {
  const tenants = await fetchTenants();

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-bold">Registry // Infrastructure</span>
          <div className="h-px w-8 bg-zinc-800" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Tenant Matrix Control</h1>
        <p className="text-zinc-500 text-sm mt-2 font-medium">Manage sovereign merchant instances, vertical subscriptions, and secure access vectors.</p>
      </div>

      <TenantsTable initialTenants={tenants} />
    </div>
  );
}
