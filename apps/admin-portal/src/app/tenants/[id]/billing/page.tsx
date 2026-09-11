import { updateTenantSubscription } from '../../../actions/billing';

export default function TenantBillingDashboard({ params }: { params: { id: string } }) {
  const { id: tenantId } = params;

  // Mocking the data fetch for demonstration.
  // In production, this performs a secure GET request using the super_admin role.
  const currentPlan = "UUID-PRO-TIER-123";
  const currentStatus = "active";

  return (
    <div className="p-8">
      <div className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscriptions</h1>
        <p className="text-gray-400">Securely manage pricing tiers and billing statuses for Tenant: <span className="text-[#8b5cf6] font-mono text-sm">{tenantId}</span></p>
      </div>

      <div className="bg-[#0a0a0f] border border-gray-800 rounded-xl p-8 max-w-2xl shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-6">Modify Subscription</h2>
        
        <form action={updateTenantSubscription} className="space-y-6">
          <input type="hidden" name="tenantId" value={tenantId} />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subscription Plan</label>
            <select 
              name="planId" 
              defaultValue={currentPlan}
              className="w-full bg-[#14141c] border border-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            >
              <option value="UUID-STARTER-123">Starter Plan ($99/mo)</option>
              <option value="UUID-PRO-TIER-123">Pro Tier ($299/mo)</option>
              <option value="UUID-ENTERPRISE-123">Enterprise ($999/mo)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Account Status</label>
            <select 
              name="status" 
              defaultValue={currentStatus}
              className="w-full bg-[#14141c] border border-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            >
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-[#10b981] text-white font-bold py-3 px-4 rounded-md hover:bg-[#0d9d6e] transition-colors"
            >
              Update Subscription Securely
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-gray-900 border-l-4 border-yellow-500 rounded-md">
          <p className="text-xs text-gray-400">
            <span className="text-yellow-500 font-bold uppercase mr-1">Security Notice:</span>
            This action executes under strict PostgreSQL Row Level Security (RLS). Only users with the <code className="bg-gray-800 px-1 rounded text-white">super_admin</code> context can successfully mutate this ledger.
          </p>
        </div>
      </div>
    </div>
  );
}
