'use client';

import React, { useState, useEffect, CSSProperties } from 'react';

interface DailySummary {
  ordersCount: number;
  totalRevenue: number;
  averageTicket: number;
  busiestHour: string;
}

interface TaxReportEntry {
  month: string;
  year: number;
  totalTaxCollected: number;
}

interface SalesByCategoryEntry {
  category: string;
  sales: number;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

const mockDailySummary: DailySummary = {
  ordersCount: 152,
  totalRevenue: 3456.78,
  averageTicket: 22.74,
  busiestHour: '3 PM - 4 PM',
};

const mockTaxReport: TaxReportEntry[] = [
  { month: 'January', year: 2024, totalTaxCollected: 150.25 },
  { month: 'February', year: 2024, totalTaxCollected: 165.80 },
  { month: 'March', year: 2024, totalTaxCollected: 180.10 },
  { month: 'April', year: 2024, totalTaxCollected: 172.50 },
  { month: 'May', year: 2024, totalTaxCollected: 190.40 },
  { month: 'June', year: 2024, totalTaxCollected: 205.15 },
];

const mockSalesByCategory: SalesByCategoryEntry[] = [
  { category: 'Electronics', sales: 1200 },
  { category: 'Apparel', sales: 800 },
  { category: 'Home Goods', sales: 600 },
  { category: 'Books', sales: 300 },
  { category: 'Food', sales: 500 },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const themeColors = {
  bg: '#09090b',
  card: '#18181b',
  border: 'rgba(63,63,70,0.5)',
  accentBlue: '#3b82f6',
  accentPurple: '#8b5cf6',
  accentGreen: '#10b981',
  accentOrange: '#f97316',
  text: '#fafafa',
  muted: '#71717a',
};

const glassmorphismCardStyle: CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  borderRadius: 12,
  padding: 24,
  color: themeColors.text,
  transition: 'all 0.3s ease-in-out',
  fontFamily: 'Inter, sans-serif',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const glassmorphismGradientOverlay: CSSProperties = {
  content: '""',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
  zIndex: -1,
  pointerEvents: 'none',
  borderRadius: 12,
};

const commonContainerStyle: CSSProperties = {
  display: 'grid',
  gap: 24,
  padding: 32,
  color: themeColors.text,
  minHeight: '100vh',
  fontFamily: 'Inter, sans-serif',
  backgroundColor: themeColors.bg,
  backgroundAttachment: 'fixed',
  backgroundImage: `
    radial-gradient(at 20% 70%, rgba(59, 130, 246, 0.1), transparent 50%),
    radial-gradient(at 80% 20%, rgba(139, 92, 246, 0.1), transparent 50%),
    radial-gradient(at 50% 0%, rgba(16, 185, 129, 0.05), transparent 50%)
  `,
};

const headerStyle: CSSProperties = {
  marginBottom: 40,
  textAlign: 'center',
};

const h1Style: CSSProperties = {
  fontSize: 36,
  fontWeight: 700,
  color: themeColors.text,
  marginBottom: 8,
};

const h2Style: CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  color: themeColors.text,
  marginBottom: 20,
};

const pStyle: CSSProperties = {
  color: themeColors.muted,
  fontSize: 16,
  lineHeight: 1.5,
};

const buttonStyle: CSSProperties = {
  backgroundColor: themeColors.accentBlue,
  color: themeColors.text,
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  fontSize: 16,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out',
  fontWeight: 600,
  marginRight: 12,
};

const exportButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: themeColors.accentGreen,
};

const pieColors = [themeColors.accentPurple, themeColors.accentBlue, themeColors.accentGreen, themeColors.accentOrange, themeColors.text];

async function fetchWithFallback<T>(
  url: string,
  mockData: T,
  delay: number = 500
): Promise<ApiResponse<T>> {
  await new Promise((resolve) => setTimeout(resolve, delay));
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Fetch failed for ${url} with status ${response.status}. Using mock data.`);
      return { data: mockData, error: `Failed to fetch: ${response.statusText}. Using mock data.`, loading: false };
    }
    const data: T = await response.json();
    return { data, error: null, loading: false };
  } catch (error: any) {
    console.error(`Fetch error for ${url}:`, error);
    return { data: mockData, error: error.message || 'Network error. Using mock data.', loading: false };
  }
}

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  onRefresh?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, onRefresh }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    textAlign: 'center',
    color: themeColors.muted,
    ...glassmorphismCardStyle,
    minHeight: 250,
  }}>
    <span style={{ fontSize: 64, marginBottom: 20, color: themeColors.accentBlue }}>
      {icon || '📊'}
    </span>
    <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, color: themeColors.text }}>No Data Available</h3>
    <p style={{ fontSize: 16, maxWidth: 400, color: themeColors.muted }}>
      {message}
    </p>
    {onRefresh && (
      <button
        style={{
          ...buttonStyle,
          marginTop: 24,
          backgroundColor: 'transparent',
          border: `1px solid ${themeColors.accentBlue}`,
          color: themeColors.accentBlue,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = themeColors.accentBlue;
          (e.currentTarget as HTMLButtonElement).style.color = themeColors.text;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = themeColors.accentBlue;
        }}
        onClick={onRefresh}
      >
        Refresh Data
      </button>
    )}
  </div>
);

interface PieChartProps {
  data: SalesByCategoryEntry[];
  pieColors: string[];
  width?: number;
  height?: number;
  radius?: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, pieColors, width = 200, height = 200, radius = 80 }) => {
  if (!data || data.length === 0) {
    return <div style={{ color: themeColors.muted, textAlign: 'center' }}>No sales data to display.</div>;
  }

  const total = data.reduce((sum, entry) => sum + entry.sales, 0);
  if (total === 0) {
    return <div style={{ color: themeColors.muted, textAlign: 'center' }}>Total sales are zero.</div>;
  }

  let startAngle = 0;
  const cx = width / 2;
  const cy = height / 2;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent) * radius;
    const y = Math.sin(2 * Math.PI * percent) * radius;
    return [x + cx, y + cy];
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {data.map((entry, index) => {
          const percent = entry.sales / total;
          const endAngle = startAngle + percent;

          const [startX, startY] = getCoordinatesForPercent(startAngle);
          const [endX, endY] = getCoordinatesForPercent(endAngle);

          const largeArcFlag = percent > 0.5 ? 1 : 0;

          const d = [
            `M ${cx},${cy}`,
            `L ${startX},${startY}`,
            `A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY}`,
            `Z`,
          ].join(' ');

          startAngle = endAngle;

          return (
            <path
              key={entry.category}
              d={d}
              fill={pieColors[index % pieColors.length]}
              style={{ transition: 'all 0.3s ease-in-out' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.filter = 'brightness(1.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            />
          );
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((entry, index) => (
          <div key={entry.category} style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: pieColors[index % pieColors.length],
                marginRight: 10,
              }}
            ></span>
            <span style={{ color: themeColors.text, fontSize: 14 }}>
              {entry.category} ({((entry.sales / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportsPage: React.FC = () => {
  const [dailySummary, setDailySummary] = useState<ApiResponse<DailySummary>>({ data: null, error: null, loading: true });
  const [taxReport, setTaxReport] = useState<ApiResponse<TaxReportEntry[]>>({ data: null, error: null, loading: true });
  const [salesByCategory, setSalesByCategory] = useState<ApiResponse<SalesByCategoryEntry[]>>({ data: null, error: null, loading: true });

  const fetchReports = async () => {
    setDailySummary(prev => ({ ...prev, loading: true, error: null }));
    const dailySumData = await fetchWithFallback<DailySummary>(
      `${API_BASE}/api/reports/daily-summary`,
      mockDailySummary
    );
    setDailySummary(dailySumData);

    setTaxReport(prev => ({ ...prev, loading: true, error: null }));
    const taxRepData = await fetchWithFallback<TaxReportEntry[]>(
      `${API_BASE}/api/reports/tax`,
      mockTaxReport
    );
    setTaxReport(taxRepData);
    
    // For sales by category, we use a mock directly for now as no specific API endpoint was provided.
    // In a real app, this would be a separate fetch.
    setSalesByCategory(prev => ({ ...prev, loading: true, error: null }));
    const salesCatData = await fetchWithFallback<SalesByCategoryEntry[]>(
      `${API_BASE}/api/reports/sales-by-category`, // Placeholder URL, as it was not specified
      mockSalesByCategory
    );
    setSalesByCategory(salesCatData);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExport = async (type: 'csv' | 'pdf') => {
    if (type !== 'pdf') {
      alert(`Exporting to ${type.toUpperCase()}... (Placeholder functionality)`);
      return;
    }

    try {
      setIsExportingPdf(true);
      const merchantId = 'MOCK-MERCHANT-ID'; // In real app, fetch from context
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      const response = await fetch(`${API_BASE}/api/v1/reports/merchants/statements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          type: 'SETTLEMENT_STATEMENT',
          format: 'pdf',
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to start export');
      
      alert(`PDF Generation Job Started: ${data.jobId}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to trigger PDF export');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const Card: React.FC<{ title: string; children: React.ReactNode; style?: CSSProperties }> = ({ title, children, style }) => (
    <div style={{ ...glassmorphismCardStyle, ...style }}>
      <div style={glassmorphismGradientOverlay}></div>
      <h2 style={{ ...h2Style, marginBottom: 20, fontSize: 20, color: themeColors.text }}>{title}</h2>
      {children}
    </div>
  );

  const onButtonHover = (e: React.MouseEvent<HTMLButtonElement>, hoverBg: string) => {
    e.currentTarget.style.backgroundColor = hoverBg;
  };

  const onButtonLeave = (e: React.MouseEvent<HTMLButtonElement>, originalBg: string) => {
    e.currentTarget.style.backgroundColor = originalBg;
  };

  const onButtonDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(0.98)';
  };

  const onButtonUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div style={commonContainerStyle}>
      <div style={headerStyle}>
        <h1 style={h1Style}>Reports Dashboard</h1>
        <p style={pStyle}>Comprehensive insights into your merchant activities.</p>
        <div style={{ marginTop: 24 }}>
          <button
            style={exportButtonStyle}
            onMouseEnter={(e) => onButtonHover(e, '#059669')}
            onMouseLeave={(e) => onButtonLeave(e, themeColors.accentGreen)}
            onMouseDown={onButtonDown}
            onMouseUp={onButtonUp}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </button>
          <button
            style={exportButtonStyle}
            onMouseEnter={(e) => onButtonHover(e, '#059669')}
            onMouseLeave={(e) => onButtonLeave(e, themeColors.accentGreen)}
            onMouseDown={onButtonDown}
            onMouseUp={onButtonUp}
            onClick={() => handleExport('pdf')}
            disabled={isExportingPdf}
          >
            {isExportingPdf ? 'Processing...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
        <Card title="Daily Summary">
          {dailySummary.loading ? (
            <p style={{ color: themeColors.muted }}>Loading daily summary...</p>
          ) : dailySummary.data ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 10px', fontSize: 16 }}>
              <div style={{ borderBottom: `1px dashed ${themeColors.border}`, paddingBottom: 10 }}>
                <div style={{ color: themeColors.muted, fontSize: 14 }}>Orders Count</div>
                <div style={{ color: themeColors.text, fontWeight: 600, fontSize: 24 }}>{dailySummary.data.ordersCount}</div>
              </div>
              <div style={{ borderBottom: `1px dashed ${themeColors.border}`, paddingBottom: 10 }}>
                <div style={{ color: themeColors.muted, fontSize: 14 }}>Total Revenue</div>
                <div style={{ color: themeColors.text, fontWeight: 600, fontSize: 24 }}>${dailySummary.data.totalRevenue.toFixed(2)}</div>
              </div>
              <div style={{ paddingBottom: 10 }}>
                <div style={{ color: themeColors.muted, fontSize: 14 }}>Average Ticket</div>
                <div style={{ color: themeColors.text, fontWeight: 600, fontSize: 24 }}>${dailySummary.data.averageTicket.toFixed(2)}</div>
              </div>
              <div style={{ paddingBottom: 10 }}>
                <div style={{ color: themeColors.muted, fontSize: 14 }}>Busiest Hour</div>
                <div style={{ color: themeColors.text, fontWeight: 600, fontSize: 24 }}>{dailySummary.data.busiestHour}</div>
              </div>
            </div>
          ) : (
            <EmptyState message="No daily summary data available. Please check back later or refresh." onRefresh={fetchReports} />
          )}
          {dailySummary.error && (
            <p style={{ color: themeColors.accentOrange, marginTop: 10, fontSize: 14 }}>{dailySummary.error}</p>
          )}
        </Card>

        <Card title="Sales by Category">
          {salesByCategory.loading ? (
            <p style={{ color: themeColors.muted }}>Loading sales categories...</p>
          ) : salesByCategory.data && salesByCategory.data.length > 0 ? (
            <PieChart data={salesByCategory.data} pieColors={pieColors} />
          ) : (
            <EmptyState message="No sales by category data available. Start recording sales to see insights!" icon="🛍️" onRefresh={fetchReports} />
          )}
          {salesByCategory.error && (
            <p style={{ color: themeColors.accentOrange, marginTop: 10, fontSize: 14 }}>{salesByCategory.error}</p>
          )}
        </Card>
      </div>

      <div style={{ marginBottom: 40 }}>
        <Card title="Tax Collected Report (Monthly)" style={{ gridColumn: '1 / -1' }}>
          {taxReport.loading ? (
            <p style={{ color: themeColors.muted }}>Loading tax report...</p>
          ) : taxReport.data && taxReport.data.length > 0 ? (
            <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${themeColors.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <tr>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${themeColors.border}`, color: themeColors.muted }}>Month</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${themeColors.border}`, color: themeColors.muted }}>Year</th>
                    <th style={{ padding: 12, textAlign: 'right', borderBottom: `1px solid ${themeColors.border}`, color: themeColors.muted }}>Total Tax Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {taxReport.data.map((entry, index) => (
                    <tr key={`${entry.month}-${entry.year}`} style={{
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      transition: 'background-color 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)')}
                    >
                      <td style={{ padding: 12, borderBottom: `1px dashed ${themeColors.border}`, color: themeColors.text }}>{entry.month}</td>
                      <td style={{ padding: 12, borderBottom: `1px dashed ${themeColors.border}`, color: themeColors.text }}>{entry.year}</td>
                      <td style={{ padding: 12, textAlign: 'right', borderBottom: `1px dashed ${themeColors.border}`, color: themeColors.text, fontWeight: 500 }}>
                        ${entry.totalTaxCollected.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No tax report data available for the selected period. Ensure your tax settings are configured." icon="💰" onRefresh={fetchReports} />
          )}
          {taxReport.error && (
            <p style={{ color: themeColors.accentOrange, marginTop: 10, fontSize: 14 }}>{taxReport.error}</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;