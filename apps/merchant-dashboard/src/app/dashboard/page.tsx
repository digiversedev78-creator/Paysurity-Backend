'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
import { RevenueVelocityChart, DistributionMatrixChart } from '@paysurity/ui-components';

interface KpiData {
  todayRevenue: number;
  todayOrders: number;
  activeCustomers: number;
  walletBalance: number;
}

interface RevenueTrendData {
  date: string;
  revenue: number;
}

interface OrderStatusData {
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  refunded: number;
}

interface RecentOrder {
  id: string;
  time: string;
  items: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled' | 'Refunded';
}

type DataState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

const initialDataState = <T,>(initialValue: T | null = null): DataState<T> => ({
  data: initialValue,
  loading: true,
  error: null,
});

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const KPISkeleton = () => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl animate-pulse h-32">
    <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
    <div className="h-8 bg-white/20 rounded w-1/2"></div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl animate-pulse h-80">
    <div className="h-full w-full bg-white/10 rounded"></div>
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl animate-pulse">
    <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex justify-between items-center py-4 border-b border-white/5">
        <div className="h-4 bg-white/10 rounded w-1/5"></div>
        <div className="h-4 bg-white/10 rounded w-1/6"></div>
        <div className="h-4 bg-white/10 rounded w-1/5"></div>
      </div>
    ))}
  </div>
);

const HoverTooltip = ({ message }: { message: string }) => (
  <div className="group relative inline-block ml-2 cursor-help">
    <Info size={14} className="text-gray-400 hover:text-blue-400 transition-colors" />
    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 transition-opacity group-hover:opacity-100 z-50">
      <div className="bg-black/90 text-white text-xs p-2 rounded border border-white/10 shadow-xl text-center">
        {message}
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: RecentOrder['status'] }) => {
  let colorClass = '';
  switch (status) {
    case 'Completed': colorClass = 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'; break;
    case 'Processing': colorClass = 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20'; break;
    case 'Pending': colorClass = 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'; break;
    case 'Cancelled': colorClass = 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'; break;
    case 'Refunded': colorClass = 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20'; break;
    default: colorClass = 'bg-white/10 text-white border-white/20';
  }
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>{status}</span>;
};

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  
  const [kpis, setKpis] = useState<DataState<KpiData>>(initialDataState());
  const [revenueTrend, setRevenueTrend] = useState<DataState<RevenueTrendData[]>>(initialDataState([]));
  const [orderStatus, setOrderStatus] = useState<DataState<OrderStatusData>>(initialDataState());
  const [recentOrders, setRecentOrders] = useState<DataState<RecentOrder[]>>(initialDataState([]));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
    else router.push('/');
  }, [router]);

  const fetchData = useCallback(async <T,>(
    path: string,
    setter: React.Dispatch<React.SetStateAction<DataState<T>>>
  ) => {
    if (!token) return;
    setter(prev => ({ ...prev, loading: true, error: null }));
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://paysurity-api-44gyeebm6a-uc.a.run.app';
      const response = await fetch(`${API}${path}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Network Database Unavailable');
      
      const data = await response.json();
      setter({ data, loading: false, error: null });
    } catch (err: any) {
      setter({ data: null, loading: false, error: err.message || 'Database Connection Failed' });
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData<KpiData>('/api/v1/dashboard/kpis', setKpis);
      fetchData<RevenueTrendData[]>('/api/v1/dashboard/revenue-trend', setRevenueTrend);
      fetchData<OrderStatusData>('/api/v1/dashboard/order-status', setOrderStatus);
      fetchData<RecentOrder[]>('/api/v1/dashboard/recent-orders', setRecentOrders);
    }
  }, [token, fetchData]);

  const orderStatusChartData = orderStatus.data
    ? Object.entries(orderStatus.data).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }))
    : [];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0A0A] text-white selection:bg-purple-500/30">
      <div className="relative z-10 p-6 sm:p-10 max-w-7xl mx-auto font-sans">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
              Merchant Operations
            </h1>
            <p className="mt-2 text-sm text-gray-400 font-medium">
              Live Network Telemetry & Performance
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-all duration-300">
              Wallet Settings
            </button>
          </div>
        </header>

        {/* Global KPIs */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.loading ? (
              <><KPISkeleton /><KPISkeleton /><KPISkeleton /><KPISkeleton /></>
            ) : kpis.error ? (
               <div className="col-span-full p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-red-400">
                 Database Error: {kpis.error}
               </div>
            ) : (
              <>
                <div className="relative bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase">Gross Revenue</h3>
                    <HoverTooltip message="Total volume generated today across all branches" />
                  </div>
                  <p className="text-4xl font-black text-white">
                    ${kpis.data?.todayRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="relative bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase">Transactions</h3>
                    <HoverTooltip message="Total POS and E-commerce orders fulfilled today" />
                  </div>
                  <p className="text-4xl font-black text-white">{kpis.data?.todayOrders}</p>
                </div>
                
                <div className="relative bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase">Active CRM Base</h3>
                    <HoverTooltip message="Number of unique consumers identified in the ledger" />
                  </div>
                  <p className="text-4xl font-black text-white">{kpis.data?.activeCustomers?.toLocaleString()}</p>
                </div>
                
                <div className="relative bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase">Settlement Wallet</h3>
                    <HoverTooltip message="Available fiat balance ready for ACH withdrawal" />
                  </div>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-300 to-cyan-300">
                    ${kpis.data?.walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Charts & Status Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl">
            <div className="flex items-center mb-6">
                <h2 className="text-xl font-bold text-gray-200">Revenue Velocity</h2>
                <HoverTooltip message="7-Day rolling revenue extracted directly from the fulfillment DB" />
            </div>
            {revenueTrend.loading ? <ChartSkeleton /> : revenueTrend.error ? (
                 <div className="text-red-400">Database Connection Refused</div>
            ) : (
              <div className="h-[320px] w-full mt-4">
                <RevenueVelocityChart data={revenueTrend.data ?? []} />
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl">
             <div className="flex items-center mb-6">
                <h2 className="text-xl font-bold text-gray-200">Distribution Matrix</h2>
                <HoverTooltip message="Current operational states of all active orders" />
            </div>
            {orderStatus.loading ? <ChartSkeleton /> : orderStatus.error ? (
                <div className="text-red-400">Database Connection Refused</div>
            ) : (
              <div className="h-[280px] w-full">
                <DistributionMatrixChart data={orderStatus.data ?? {}} />
              </div>
            )}
          </div>
        </section>

        {/* Floating Table Section */}
        <section>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white pr-2">Real-time Order Feed</h2>
              <HoverTooltip message="Live stream of POS transactions committing to the Ledger" />
            </div>
            
            <div className="overflow-x-auto">
              {recentOrders.loading ? <TableSkeleton /> : recentOrders.error ? (
                  <div className="p-8 text-center text-red-400">Database Connection Expected. API server is offline.</div>
              ) : (
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5">
                      <th className="px-8 py-4">Transaction ID</th>
                      <th className="px-8 py-4">Timestamp</th>
                      <th className="px-8 py-4">Quantity</th>
                      <th className="px-8 py-4">Settlement Vol</th>
                      <th className="px-8 py-4">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentOrders.data?.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                        <td className="px-8 py-5 text-sm font-semibold text-gray-200">{order.id}</td>
                        <td className="px-8 py-5 text-sm text-gray-400">{order.time}</td>
                        <td className="px-8 py-5 text-sm text-gray-400">{order.items} Units</td>
                        <td className="px-8 py-5 text-sm font-bold text-emerald-400">${order.total.toFixed(2)}</td>
                        <td className="px-8 py-5"><StatusBadge status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}