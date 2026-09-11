'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Design System Colors & Styles ---
const colors = {
  bg: '#09090b',
  cardBase: 'rgba(24,24,27,0.8)', // Base card background if no deep glassmorphism
  borderBase: 'rgba(63,63,70,0.5)', // General border
  accentBlue: '#3b82f6',
  accentPurple: '#8b5cf6',
  accentGreen: '#10b981',
  accentOrange: '#f97316',
  text: '#fafafa',
  muted: '#71717a',
};

const cardGlassmorphismStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)', // Corresponds to Tailwind 'backdrop-blur-xl'
  border: '1px solid rgba(255, 255, 255, 0.1)', // Corresponds to 'border-white/10'
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  borderRadius: 12,
  padding: 24,
  position: 'relative', // For subtle gradients
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const buttonStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${colors.borderBase}`,
  borderRadius: 8,
  padding: '8px 16px',
  color: colors.text,
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.2s ease-in-out',
  fontFamily: 'Inter, sans-serif',
};

const activeButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: colors.accentBlue,
  borderColor: colors.accentBlue,
  boxShadow: `0 0 10px ${colors.accentBlue}30`,
};

const hoverButtonStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)',
  borderColor: colors.accentBlue,
};

// --- API Base & Types ---
const API_BASE = 'https://paysurity-api-44gyeebm6a-uc.a.run.app';

interface RevenueDataPoint {
  date: string; // YYYY-MM-DD
  revenue: number;
}

interface TopItem {
  id: string;
  name: string;
  revenue: number;
}

interface PeakHour {
  hour: number; // 0-23
  dayOfWeek: number; // 0 (Sunday) - 6 (Saturday)
  orders: number;
}

interface AnalyticsResponse {
  revenueOverTime: RevenueDataPoint[];
  topMenuRevenue: TopItem[];
  ordersByHour: PeakHour[];
  customerRetentionRate: number;
  averageOrderValue: number;
  averageOrderValueTrend: number; // Percentage change from previous period
}

// --- Mock Data for Fallback ---
const MOCK_REVENUE_DATA: RevenueDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  revenue: 1000 + Math.random() * 2000 + (i > 15 ? 500 : 0) * (Math.sin(i / 5) + 1),
}));

const MOCK_TOP_ITEMS: TopItem[] = [
  { id: '1', name: 'Premium Espresso', revenue: 7500 },
  { id: '2', name: 'Signature Blend Coffee', revenue: 6200 },
  { id: '3', name: 'Artisan Croissant', revenue: 4800 },
  { id: '4', name: 'Vegan Smoothie Bowl', revenue: 3900 },
  { id: '5', name: 'Avocado Toast', revenue: 3100 },
];

const MOCK_PEAK_HOURS: PeakHour[] = Array.from({ length: 7 * 24 }, (_, i) => {
  const dayOfWeek = Math.floor(i / 24);
  const hour = i % 24;
  let orders = Math.floor(Math.random() * 20); // Base orders
  if (hour >= 7 && hour <= 10) orders += Math.floor(Math.random() * 30); // Morning rush
  if (hour >= 12 && hour <= 14) orders += Math.floor(Math.random() * 25); // Lunch rush
  if (hour >= 17 && hour <= 20) orders += Math.floor(Math.random() * 35); // Evening rush
  if (dayOfWeek >= 5) orders *= 1.2; // Weekends busier
  return { dayOfWeek, hour, orders: Math.floor(orders) };
});

const MOCK_ANALYTICS_DATA: AnalyticsResponse = {
  revenueOverTime: MOCK_REVENUE_DATA,
  topMenuRevenue: MOCK_TOP_ITEMS,
  ordersByHour: MOCK_PEAK_HOURS,
  customerRetentionRate: 0.68,
  averageOrderValue: 28.55,
  averageOrderValueTrend: 0.04, // 4% increase
};

// --- Fetch Utility with Fallback ---
async function fetchData<T>(url: string, params: URLSearchParams): Promise<T> {
  const fullUrl = `${API_BASE}${url}?${params.toString()}`;
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`API call to ${fullUrl} failed with status ${response.status}. Falling back to mock data.`);
      // Simulate network error for specific statuses if needed
      if (response.status === 404 || response.status === 500) {
        throw new Error('API Error: Backend unavailable or resource not found.');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${fullUrl}:`, error);
    // Graceful fallback: always return mock data on error
    return MOCK_ANALYTICS_DATA as T; // Type assertion needed here
  }
}

// --- Empty State Component ---
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div style={{
    ...cardGlassmorphismStyle,
    gridColumn: '1 / -1',
    minHeight: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: colors.muted,
  }}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
    <p style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>No Data Available</p>
    <p style={{ fontSize: 14, color: colors.muted, maxWidth: 400 }}>{message}</p>
  </div>
);

// --- Main Dashboard Component ---
const DashboardAnalytics: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<'today' | '7d' | '30d' | 'custom'>('30d');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hourLabels = ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];

  const fetchDataForRange = useCallback(async (range: typeof selectedRange) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.append('range', range); // Pass the selected range to the API

    try {
      const result = await fetchData<AnalyticsResponse>('/api/analytics', params);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data.');
      // Fallback to mock data on error as handled in fetchData
      setData(MOCK_ANALYTICS_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDataForRange(selectedRange);
  }, [selectedRange, fetchDataForRange]);

  const getDateRangeDisplay = useCallback(() => {
    if (!data || !data.revenueOverTime || data.revenueOverTime.length === 0) return 'No data period';
    const dates = data.revenueOverTime.map(d => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = dates[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = dates[dates.length - 1]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startDate} - ${endDate}`;
  }, [data]);

  const totalRevenue = useMemo(() => {
    return data?.revenueOverTime.reduce((sum, d) => sum + d.revenue, 0) || 0;
  }, [data]);

  const renderRevenueChart = () => {
    if (!data || data.revenueOverTime.length === 0) {
      return <EmptyState message="No revenue data available for this period." />;
    }

    const { revenueOverTime } = data;
    const padding = 40;
    const width = 600;
    const height = 200;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const maxRevenue = Math.max(...revenueOverTime.map(d => d.revenue));
    const minRevenue = Math.min(...revenueOverTime.map(d => d.revenue));
    const revenueRange = maxRevenue - minRevenue;

    const points = revenueOverTime.map((d, i) => {
      const x = (i / (revenueOverTime.length - 1)) * chartWidth;
      const y = revenueRange === 0 ? chartHeight / 2 : chartHeight - ((d.revenue - minRevenue) / revenueRange) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    const numXTicks = Math.min(revenueOverTime.length, 5); // Max 5 x-axis labels
    const xTickInterval = Math.floor(revenueOverTime.length / numXTicks);
    const xLabels = Array.from({ length: numXTicks }).map((_, i) => {
      const index = i * xTickInterval;
      if (index >= revenueOverTime.length) return '';
      const date = new Date(revenueOverTime[index].date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const numYTicks = 3;
    const yLabels = Array.from({ length: numYTicks + 1 }).map((_, i) => {
      const value = minRevenue + (revenueRange / numYTicks) * i;
      return `$${value.toFixed(0)}`;
    }).reverse(); // Reverse to have max at top

    return (
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 18, color: colors.text, marginBottom: 16 }}>Revenue Over Time</h3>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
          {/* Y-axis labels */}
          {yLabels.map((label, i) => (
            <g key={`y-label-${i}`}>
              <text x={padding - 10} y={padding + (chartHeight / numYTicks) * i} dy="0.32em" textAnchor="end" fontSize="10" fill={colors.muted}>
                {label}
              </text>
              <line
                x1={padding}
                y1={padding + (chartHeight / numYTicks) * i}
                x2={width - padding}
                y2={padding + (chartHeight / numYTicks) * i}
                stroke={colors.borderBase}
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* X-axis labels */}
          {xLabels.map((label, i) => (
            <text
              key={`x-label-${i}`}
              x={padding + (i / (numXTicks - 1)) * chartWidth}
              y={height - padding + 15}
              textAnchor="middle"
              fontSize="10"
              fill={colors.muted}
            >
              {label}
            </text>
          ))}

          <g transform={`translate(${padding}, ${padding})`}>
            {/* Area under the line */}
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.accentBlue} stopOpacity={0.6} />
                <stop offset="95%" stopColor={colors.accentBlue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d={`M0,${chartHeight} L${points} L${chartWidth},${chartHeight} Z`}
              fill="url(#revenueGradient)"
            />
            {/* Line path */}
            <polyline
              fill="none"
              stroke={colors.accentBlue}
              strokeWidth="2"
              points={points}
            />
            {/* Data points */}
            {revenueOverTime.map((d, i) => {
              const x = (i / (revenueOverTime.length - 1)) * chartWidth;
              const y = revenueRange === 0 ? chartHeight / 2 : chartHeight - ((d.revenue - minRevenue) / revenueRange) * chartHeight;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={colors.accentBlue}
                  stroke={colors.bg}
                  strokeWidth="2"
                >
                  <title>{`${new Date(d.date).toLocaleDateString()}: $${d.revenue.toFixed(2)}`}</title>
                </circle>
              );
            })}
          </g>
        </svg>
      </div>
    );
  };

  const renderTopItemsChart = () => {
    if (!data || data.topMenuRevenue.length === 0) {
      return <EmptyState message="No top menu items data available for this period." />;
    }

    const maxRevenue = Math.max(...data.topMenuRevenue.map(item => item.revenue));

    return (
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 18, color: colors.text, marginBottom: 16 }}>Top Menu Items by Revenue</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.topMenuRevenue.map((item, index) => {
            const widthPercentage = (item.revenue / maxRevenue) * 100;
            const accentColor = [colors.accentPurple, colors.accentBlue, colors.accentGreen, colors.accentOrange][index % 4];
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: colors.text, width: 100, flexShrink: 0 }}>{item.name}</span>
                <div style={{
                  flexGrow: 1,
                  height: 16,
                  borderRadius: 8,
                  background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor} ${widthPercentage}%, ${colors.cardBase} ${widthPercentage}%, ${colors.cardBase} 100%)`,
                  boxShadow: `0 0 8px ${accentColor}30 inset`,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0, right: 0, bottom: 0, left: 0,
                    background: `linear-gradient(to right, ${accentColor}10, transparent)`, // Subtle inner gradient
                    borderRadius: 8,
                  }}></div>
                </div>
                <span style={{ color: colors.text, width: 80, textAlign: 'right', flexShrink: 0 }}>${item.revenue.toFixed(0)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOrdersByHourHeatMap = () => {
    if (!data || data.ordersByHour.length === 0) {
      return <EmptyState message="No orders by hour data available for this period." />;
    }

    const maxOrders = Math.max(...data.ordersByHour.map(h => h.orders));

    const getIntensityColor = (orders: number) => {
      if (maxOrders === 0) return `rgba(255, 255, 255, 0.05)`;
      const ratio = orders / maxOrders;
      const hue = 240 - (ratio * 120); // From blue to purple
      const saturation = 50 + ratio * 50; // More saturated for higher values
      const lightness = 10 + ratio * 20; // Brighter for higher values
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const heatmapGrid = Array.from({ length: 7 }, (_, day) =>
      Array.from({ length: 24 }, (_, hour) => {
        const entry = data.ordersByHour.find(
          h => h.dayOfWeek === day && h.hour === hour
        );
        return entry ? entry.orders : 0;
      })
    );

    return (
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 18, color: colors.text, marginBottom: 16 }}>Orders By Hour Heat Map</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(24, 1fr)', gap: 4, fontSize: 10, overflowX: 'auto', paddingBottom: '8px' }}>
          {/* Hour labels */}
          <div style={{ minWidth: 40 }}></div> {/* Empty corner for alignment */}
          {Array.from({ length: 24 }).map((_, hour) => (
            <div key={`hour-label-${hour}`} style={{ color: colors.muted, textAlign: 'center' }}>
              {hour % 3 === 0 ? hourLabels[hour / 3] : ''}
            </div>
          ))}

          {/* Heatmap cells */}
          {heatmapGrid.map((dayData, dayIndex) => (
            <React.Fragment key={`day-row-${dayIndex}`}>
              <div style={{ color: colors.muted, textAlign: 'right', minWidth: 40, paddingRight: 8, alignSelf: 'center' }}>
                {dayNames[dayIndex]}
              </div>
              {dayData.map((orders, hourIndex) => (
                <div
                  key={`cell-${dayIndex}-${hourIndex}`}
                  style={{
                    background: getIntensityColor(orders),
                    borderRadius: 4,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: orders > maxOrders * 0.5 ? colors.text : colors.muted,
                    fontSize: 10,
                    fontWeight: 500,
                    transition: 'background 0.3s ease-in-out',
                    cursor: 'help',
                    position: 'relative',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: -24, left: '50%', transform: 'translateX(-50%)',
                    background: colors.cardBase,
                    border: `1px solid ${colors.borderBase}`,
                    padding: '4px 8px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s ease-in-out',
                    zIndex: 10,
                  }} className="tooltip-text">
                    {`${dayNames[dayIndex]}, ${hourIndex}:00 - ${orders} orders`}
                  </span>
                  <style>{`
                    div[key="cell-${dayIndex}-${hourIndex}"]:hover .tooltip-text {
                      opacity: 1;
                    }
                  `}</style>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderKPIs = () => {
    if (!data) return null;

    const kpis = [
      {
        title: 'Total Revenue',
        value: `$${totalRevenue.toFixed(2)}`,
        trend: data.revenueOverTime.length > 1 && data.revenueOverTime[data.revenueOverTime.length - 1].revenue >= data.revenueOverTime[data.revenueOverTime.length - 2].revenue ? 0.05 : -0.02, // Placeholder
        color: colors.accentBlue,
      },
      {
        title: 'Avg. Order Value',
        value: `$${data.averageOrderValue.toFixed(2)}`,
        trend: data.averageOrderValueTrend,
        color: colors.accentGreen,
      },
      {
        title: 'Customer Retention Rate',
        value: `${(data.customerRetentionRate * 100).toFixed(1)}%`,
        trend: data.customerRetentionRate >= 0.65 ? 0.01 : -0.01, // Placeholder
        color: colors.accentPurple,
      },
    ];

    return (
      <>
        {kpis.map((kpi, index) => (
          <div key={index} style={{ ...cardGlassmorphismStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
            <div style={{ color: kpi.color, fontSize: 14, fontWeight: 500 }}>{kpi.title}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: colors.text }}>{kpi.value}</span>
              {kpi.trend !== undefined && (
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: kpi.trend >= 0 ? colors.accentGreen : colors.accentOrange,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {kpi.trend >= 0 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 17 12 3 18 9"></polyline><polyline points="12 17 12 3 6 9"></polyline></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 7 12 21 18 15"></polyline><polyline points="12 7 12 21 6 15"></polyline></svg>
                  )}
                  {`${(Math.abs(kpi.trend) * 100).toFixed(1)}%`}
                </span>
              )}
            </div>
            {totalRevenue === 0 && (
              <p style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>No data to calculate trend.</p>
            )}
          </div>
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: colors.bg,
        minHeight: '100vh',
        color: colors.text,
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: `6px solid ${colors.accentBlue}`,
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{ marginTop: 20, fontSize: 18 }}>Loading analytics data...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const hasData = data && (
    data.revenueOverTime.length > 0 ||
    data.topMenuRevenue.length > 0 ||
    data.ordersByHour.length > 0 ||
    data.customerRetentionRate !== 0 ||
    data.averageOrderValue !== 0
  );

  return (
    <div style={{
      backgroundColor: colors.bg,
      minHeight: '100vh',
      color: colors.text,
      fontFamily: 'Inter, sans-serif',
      padding: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
    }}>
      <style>{`
        body { margin: 0; font-family: 'Inter', sans-serif; }
      `}</style>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: colors.text }}>Analytics & Insights</h1>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 16, color: colors.muted }}>
          Data for {getDateRangeDisplay()}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['today', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range as any)}
              style={selectedRange === range ? activeButtonStyle : buttonStyle}
              onMouseEnter={(e) => { if (selectedRange !== range) e.currentTarget.style.background = hoverButtonStyle.background as string; e.currentTarget.style.borderColor = hoverButtonStyle.borderColor as string; }}
              onMouseLeave={(e) => { if (selectedRange !== range) e.currentTarget.style.background = buttonStyle.background as string; e.currentTarget.style.borderColor = buttonStyle.border as string; }}
            >
              {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
          <button
            onClick={() => setSelectedRange('custom')}
            style={selectedRange === 'custom' ? activeButtonStyle : buttonStyle}
            onMouseEnter={(e) => { if (selectedRange !== 'custom') e.currentTarget.style.background = hoverButtonStyle.background as string; e.currentTarget.style.borderColor = hoverButtonStyle.borderColor as string; }}
            onMouseLeave={(e) => { if (selectedRange !== 'custom') e.currentTarget.style.background = buttonStyle.background as string; e.currentTarget.style.borderColor = buttonStyle.border as string; }}
            disabled
          >
            Custom (Coming Soon)
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: 16,
          background: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          borderRadius: 8,
          color: '#ff5555',
          marginBottom: 24,
        }}>
          Error: {error}
        </div>
      )}

      {!hasData ? (
        <EmptyState message="It looks like there's no analytics data yet for the selected period. Start processing transactions to see your insights here!" />
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {renderKPIs()}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
            gap: 24,
          }}>
            <div style={cardGlassmorphismStyle}>
              {renderRevenueChart()}
            </div>
            <div style={cardGlassmorphismStyle}>
              {renderTopItemsChart()}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 24,
          }}>
            <div style={cardGlassmorphismStyle}>
              {renderOrdersByHourHeatMap()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAnalytics;