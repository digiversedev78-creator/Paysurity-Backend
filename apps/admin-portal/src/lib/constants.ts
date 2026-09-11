// Cloud-first URL — falls back to the live Cloud Run endpoint, never localhost in production.
// NEXT_PUBLIC_API_URL is injected at Docker build time via --build-arg.
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://paysurity-api-44gyeebm6a-uc.a.run.app').replace(/\/$/, '');
export const API_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

export const ADMIN_HEADERS = {
  'x-admin-id': '22222222-0001-4000-a000-000000000001',
  'x-internal-key': 'paysurity-admin',
};
