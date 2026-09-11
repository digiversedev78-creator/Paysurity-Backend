import { CSRWorkspace } from './workspace.client';
import { API_URL, ADMIN_HEADERS } from '../../lib/constants';

async function fetchTicketQueue() {
  const res = await fetch(`${API_URL}/admin/tickets`, {
    headers: ADMIN_HEADERS,
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function TicketsPage() {
  const tickets = await fetchTicketQueue();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-bold">Communications // CSR Control</span>
          <div className="h-px w-8 bg-zinc-800" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Merchant Dispatch Hub</h1>
        <p className="text-zinc-500 text-sm mt-2 font-medium max-w-xl">
          High-efficiency command center for support vector resolution and secure merchant context synchronization.
        </p>
      </div>

      {/* 100% height container mapping to split screen */}
      <div className="flex-1 flex gap-8 overflow-hidden">
        <CSRWorkspace initialQueue={tickets} />
      </div>
    </div>
  );
}
