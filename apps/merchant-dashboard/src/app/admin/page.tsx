'use client';

import React, { useEffect, useState } from 'react';

// Define the shape of the platform-wide KPI data
interface KpiData {
  totalActiveTenants: number;
  totalGmvToday: number;
  totalGmvWeek: number;
  totalGmvMonth: number;
  totalTransactions: number;
  avgResponseTimeMs: number;
  errorRatePercentage: number;
  activeSubscriptions: number;
  mrr: number; // Monthly Recurring Revenue
  // Add more fields for trend data if available from API
  // e.g., gmvTodayTrendPercentage: number;
}

// Define the shape of props for a single KPI card component
interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral'; // Represents positive, negative, or no change
    percentage: number;
    period: string; // e.g., "vs last day", "vs last week"
  };
  valuePrefix?: string; // e.g., "$" for currency
  valueSuffix?: string; // e.g., "%" for percentage
}

// Helper component for displaying a single KPI metric card
const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, valuePrefix = '', valueSuffix = '' }) => {
  const trendArrow = trend?.direction === 'up' ? '▲' : trend?.direction === 'down' ? '▼' : '▬';
  const trendColor = trend?.direction === 'up' ? 'text-green-600' : trend?.direction === 'down' ? 'text-red-600' : 'text-gray-500';

  // Inline styles approximating a clean UI without a specific CSS framework assumption
  const cardStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0', // Equivalent to border-gray-200
    borderRadius: '0.5rem',      // Equivalent to rounded-lg
    padding: '1.5rem',           // Equivalent to p-6
    backgroundColor: '#ffffff',  // Equivalent to bg-white
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' // Equivalent to shadow-sm
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '0.875rem', // Equivalent to text-sm
    fontWeight: '500',    // Equivalent to font-medium
    color: '#4a5568',     // Equivalent to text-gray-700
    marginBottom: '0.5rem'// Equivalent to mb-2
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '1.875rem', // Equivalent to text-3xl
    fontWeight: 'bold',   // Equivalent to font-bold
    color: '#1a202c',     // Equivalent to text-gray-900
  };

  const trendContainerStyle: React.CSSProperties = {
    marginTop: '0.75rem', // Equivalent to mt-3
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem', // Equivalent to text-sm
    color: '#718096',     // Equivalent to text-gray-600
  };

  const trendArrowStyle: React.CSSProperties = {
    marginRight: '0.5rem',
    fontWeight: 'bold',
  };

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>
        {title}
      </h3>
      <div style={valueStyle}>
        {valuePrefix}{value}{valueSuffix}
      </div>
      {trend && (
        <div style={trendContainerStyle}>
          <span className={trendColor} style={trendArrowStyle}>
            {trendArrow} {trend.percentage}%
          </span>
          <span style={{ marginLeft: '0.25rem' }}>{trend.period}</span>
        </div>
      )}
    </div>
  );
};

// Main Admin Page Component
export default function AdminPage() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to simulate fetching KPI data from an API
  const fetchKpis = async (): Promise<KpiData> => {
    // In a real application, you would fetch from your backend API:
    // const response = await fetch('/api/admin/kpis');
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // const data = await response.json();
    // return data;

    // Simulate API call with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalActiveTenants: 150,
          totalGmvToday: 150000.75,
          totalGmvWeek: 1200000.50,
          totalGmvMonth: 4500000.25,
          totalTransactions: 35000,
          avgResponseTimeMs: 120,
          errorRatePercentage: 0.15,
          activeSubscriptions: 120,
          mrr: 150000,
        });
      }, 1000); // Simulate network delay
    });
  };

  useEffect(() => {
    const getKpis = async () => {
      try {
        setLoading(true);
        const data = await fetchKpis();
        setKpiData(data);
      } catch (err) {
        console.error("Failed to fetch KPIs:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    getKpis();
  }, []);

  // Inline styles for the page layout
  const pageContainerStyle: React.CSSProperties = {
    padding: '2rem',         // Equivalent to p-8
    backgroundColor: '#f8fafc', // Equivalent to bg-gray-50
    minHeight: '100vh',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '2.25rem',   // Equivalent to text-4xl
    fontWeight: 'bold',    // Equivalent to font-bold
    color: '#1a202c',      // Equivalent to text-gray-900
    marginBottom: '2rem',  // Equivalent to mb-8
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Responsive grid
    gap: '1.5rem',         // Equivalent to gap-6
  };

  if (loading) {
    return (
      <div style={pageContainerStyle}>
        <h1 style={headerStyle}>Super-admin Dashboard</h1>
        <p>Loading KPIs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageContainerStyle}>
        <h1 style={headerStyle}>Super-admin Dashboard</h1>
        <p style={{ color: '#ef4444' }}>{error}</p> {/* text-red-500 */}
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div style={pageContainerStyle}>
        <h1 style={headerStyle}>Super-admin Dashboard</h1>
        <p>No KPI data available.</p>
      </div>
    );
  }

  // Helper to format currency
  const formatCurrency = (value: number) => value.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={pageContainerStyle}>
      <h1 style={headerStyle}>Super-admin Dashboard</h1>
      <div style={gridStyle}>
        <KpiCard
          title="Total Active Tenants"
          value={kpiData.totalActiveTenants.toLocaleString()}
          trend={{ direction: 'up', percentage: 2.5, period: 'vs last month' }}
        />
        <KpiCard
          title="Total GMV Today"
          value={formatCurrency(kpiData.totalGmvToday)}
          trend={{ direction: 'up', percentage: 7.2, period: 'vs yesterday' }}
        />
        <KpiCard
          title="Total GMV This Week"
          value={formatCurrency(kpiData.totalGmvWeek)}
          trend={{ direction: 'up', percentage: 1.8, period: 'vs last week' }}
        />
        <KpiCard
          title="Total GMV This Month"
          value={formatCurrency(kpiData.totalGmvMonth)}
          trend={{ direction: 'up', percentage: 5.1, period: 'vs last month' }}
        />
        <KpiCard
          title="Total Transactions"
          value={kpiData.totalTransactions.toLocaleString()}
          trend={{ direction: 'up', percentage: 3.0, period: 'vs last month' }}
        />
        <KpiCard
          title="Avg Response Time"
          value={kpiData.avgResponseTimeMs}
          valueSuffix=" ms"
          trend={{ direction: 'down', percentage: 1.5, period: 'vs last day' }} // Lower is better
        />
        <KpiCard
          title="Error Rate"
          value={kpiData.errorRatePercentage}
          valueSuffix="%"
          trend={{ direction: 'down', percentage: 0.05, period: 'vs last day' }} // Lower is better
        />
        <KpiCard
          title="Active Subscriptions"
          value={kpiData.activeSubscriptions.toLocaleString()}
          trend={{ direction: 'up', percentage: 1.2, period: 'vs last month' }}
        />
        <KpiCard
          title="Monthly Recurring Revenue (MRR)"
          value={formatCurrency(kpiData.mrr)}
          trend={{ direction: 'up', percentage: 4.8, period: 'vs last month' }}
        />
      </div>
    </div>
  );
}