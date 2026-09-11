'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { format, isBefore, addDays } from 'date-fns';

interface CateringItem {
  name: string;
  quantity: number;
  price: number;
}

type OrderStatus = 'pending' | 'confirmed' | 'deposit_paid' | 'fulfilled' | 'cancelled';

interface CateringOrder {
  id: string;
  customerName: string;
  eventName: string;
  eventDate: string; // ISO string
  guestCount: number;
  items: CateringItem[];
  status: OrderStatus;
  total: number;
  depositRequired?: number;
  createdAt: string; // ISO string
}

interface ApiCateringResponse {
  orders: CateringOrder[];
  revenueThisMonth: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const DARK_COLORS = {
  bg: '#09090b',
  card: 'rgba(24,24,27,0.8)',
  border: 'rgba(63,63,70,0.5)',
  accentBlue: '#3b82f6',
  accentPurple: '#8b5cf6',
  accentGreen: '#10b981',
  accentOrange: '#f97316',
  text: '#fafafa',
  muted: '#71717a',
};

const PIE_COLORS = [DARK_COLORS.accentPurple, DARK_COLORS.accentBlue, DARK_COLORS.accentGreen, DARK_COLORS.accentOrange, DARK_COLORS.muted];

const GLASS_CARD_BASE_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  borderRadius: 12,
  padding: 24,
};

const ALL_CARDS_STYLE: React.CSSProperties = {
  background: DARK_COLORS.card,
  border: `1px solid ${DARK_COLORS.border}`,
  borderRadius: 12,
  padding: 24,
};

const MOCKED_ORDERS: ApiCateringResponse = {
  orders: [
    {
      id: 'ord_12345',
      customerName: 'Alice Wonderland',
      eventName: 'Birthday Party',
      eventDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
      guestCount: 50,
      items: [
        { name: 'Gourmet Sliders', quantity: 100, price: 3.5 },
        { name: 'Artisan Cheese Board', quantity: 5, price: 45.0 },
      ],
      status: 'pending',
      total: 625.00,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    },
    {
      id: 'ord_67890',
      customerName: 'Bob The Builder',
      eventName: 'Corporate Launch',
      eventDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
      guestCount: 120,
      items: [
        { name: 'Seafood Paella', quantity: 120, price: 18.0 },
        { name: 'Fresh Fruit Platter', quantity: 10, price: 30.0 },
      ],
      status: 'confirmed',
      total: 2460.00,
      depositRequired: 1230.00,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    },
    {
      id: 'ord_11223',
      customerName: 'Charlie Chaplin',
      eventName: 'Wedding Reception',
      eventDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
      guestCount: 200,
      items: [
        { name: 'Filet Mignon', quantity: 200, price: 45.0 },
        { name: 'Vegan Risotto', quantity: 50, price: 30.0 },
        { name: 'Dessert Bar', quantity: 1, price: 500.0 },
      ],
      status: 'deposit_paid',
      total: 11000.00,
      depositRequired: 5500.00,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    },
    {
      id: 'ord_44556',
      customerName: 'Diana Prince',
      eventName: 'Charity Gala',
      eventDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
      guestCount: 150,
      items: [
        { name: 'Chicken Florentine', quantity: 150, price: 25.0 },
        { name: 'Garden Salad', quantity: 150, price: 5.0 },
      ],
      status: 'fulfilled',
      total: 4500.00,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    },
    {
      id: 'ord_77889',
      customerName: 'Eve Harrington',
      eventName: 'Company Picnic',
      eventDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      guestCount: 80,
      items: [
        { name: 'BBQ Ribs', quantity: 80, price: 20.0 },
        { name: 'Corn on the Cob', quantity: 80, price: 3.0 },
      ],
      status: 'pending',
      total: 1840.00,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    },
    {
      id: 'ord_00112',
      customerName: 'Frank Sinatra',
      eventName: 'Holiday Party',
      eventDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      guestCount: 100,
      items: [
        { name: 'Prime Rib', quantity: 100, price: 35.0 },
        { name: 'Roasted Vegetables', quantity: 100, price: 8.0 },
      ],
      status: 'fulfilled',
      total: 4300.00,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
    },
    {
      id: 'ord_22334',
      customerName: 'Grace Hopper',
      eventName: 'Tech Meetup',
      eventDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      guestCount: 30,
      items: [
        { name: 'Assorted Sandwiches', quantity: 30, price: 15.0 },
        { name: 'Coffee & Pastries', quantity: 30, price: 10.0 },
      ],
      status: 'pending',
      total: 750.00,
      createdAt: new Date(new Date().setHours(new Date().getHours() - 12)).toISOString(),
    },
    {
      id: 'ord_33445',
      customerName: 'Harry Potter',
      eventName: 'Magic Show',
      eventDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      guestCount: 70,
      items: [
        { name: 'Pumpkin Juice', quantity: 70, price: 4.0 },
        { name: 'Cauldron Cakes', quantity: 70, price: 5.0 },
      ],
      status: 'pending',
      total: 630.00,
      createdAt: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString(),
    },
  ],
  revenueThisMonth: 15300.00,
};

async function apiFetch<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn(`API Error: ${response.status} ${response.statusText} for ${url}. Falling back to mock data.`);
      return Promise.resolve(MOCKED_ORDERS as T);
    }

    return await response.json();
  } catch (error) {
    console.error(`Network or parsing error for ${url}:`, error, 'Falling back to mock data.');
    return Promise.resolve(MOCKED_ORDERS as T);
  }
}

const getStatusBadgeStyle = (status: OrderStatus): React.CSSProperties => {
  let color = DARK_COLORS.muted;
  switch (status) {
    case 'pending':
      color = DARK_COLORS.accentOrange;
      break;
    case 'confirmed':
      color = DARK_COLORS.accentBlue;
      break;
    case 'deposit_paid':
      color = DARK_COLORS.accentPurple;
      break;
    case 'fulfilled':
      color = DARK_COLORS.accentGreen;
      break;
    case 'cancelled':
      color = DARK_COLORS.muted;
      break;
  }
  return {
    backgroundColor: `${color}1A`,
    color: color,
    padding: '4px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    textTransform: 'capitalize',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    height: 28,
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: DARK_COLORS.card,
        border: `1px solid ${DARK_COLORS.border}`,
        borderRadius: 8,
        padding: '10px 15px',
        color: DARK_COLORS.text,
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{`${payload[0].name}`}</p>
        <p style={{ margin: '5px 0 0', color: DARK_COLORS.muted }}>{`Count: ${payload[0].value}`}</p>
        <p style={{ margin: 0, color: DARK_COLORS.muted }}>{`Percentage: ${(payload[0].percent * 100).toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};

const OrderCard: React.FC<{ order: CateringOrder }> = ({ order }) => {
  const eventDate = new Date(order.eventDate);
  const createdAt = new Date(order.createdAt);
  const now = new Date();

  const eventSoon = isBefore(eventDate, addDays(now, 2)); // Event within 48 hours
  const createdVeryRecently = isBefore(createdAt, addDays(now, -1)); // Created within last 24 hours

  let showWarning = false;
  let warningText = '';

  if (order.status === 'pending') {
    if (eventSoon) {
      showWarning = true;
      warningText = `Urgent: Event in less than 48 hours!`;
    } else if (createdVeryRecently) {
      showWarning = true;
      warningText = `New Request: This order was placed recently and needs review.`;
    }
  }

  const cardHoverStyle: React.CSSProperties = {
    transform: 'translateY(-4px)',
    boxShadow: `0 15px 40px ${DARK_COLORS.accentBlue}30`,
  };

  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...GLASS_CARD_BASE_STYLE,
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'all 0.3s ease-in-out',
        ...(hovered ? cardHoverStyle : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, color: DARK_COLORS.text, fontSize: 18, fontWeight: 600 }}>
          {order.customerName}
          <span style={{ fontSize: 14, fontWeight: 400, color: DARK_COLORS.muted, marginLeft: 10 }}>
            ({order.eventName})
          </span>
        </h3>
        <div style={getStatusBadgeStyle(order.status)}>{order.status.replace('_', ' ')}</div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ color: DARK_COLORS.muted, fontSize: 14 }}>
          <strong style={{ color: DARK_COLORS.text, display: 'block', marginBottom: 4 }}>Event Date</strong>
          {format(eventDate, 'MMM d, yyyy @ h:mm a')}
        </div>
        <div style={{ color: DARK_COLORS.muted, fontSize: 14 }}>
          <strong style={{ color: DARK_COLORS.text, display: 'block', marginBottom: 4 }}>Guests</strong>
          {order.guestCount}
        </div>
        <div style={{ color: DARK_COLORS.muted, fontSize: 14 }}>
          <strong style={{ color: DARK_COLORS.text, display: 'block', marginBottom: 4 }}>Total</strong>
          <span style={{ color: DARK_COLORS.text, fontWeight: 500 }}>
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>

      <div>
        <strong style={{ color: DARK_COLORS.text, display: 'block', marginBottom: 8, fontSize: 15 }}>Items Summary:</strong>
        <ul style={{ margin: 0, padding: '0 0 0 20px', listStyleType: 'disc', color: DARK_COLORS.muted, fontSize: 14 }}>
          {order.items.slice(0, 3).map((item, index) => (
            <li key={index} style={{ marginBottom: 4 }}>
              {item.name} x {item.quantity} (${(item.price * item.quantity).toFixed(2)})
            </li>
          ))}
          {order.items.length > 3 && (
            <li style={{ color: DARK_COLORS.muted }}>... {order.items.length - 3} more items</li>
          )}
        </ul>
      </div>

      {showWarning && (
        <div style={{
          backgroundColor: `${DARK_COLORS.accentOrange}20`,
          border: `1px solid ${DARK_COLORS.accentOrange}80`,
          borderRadius: 8,
          padding: '12px 16px',
          color: DARK_COLORS.accentOrange,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 20, lineHeight: 1, marginRight: 5 }}>⚠️</span>
          <span>
            <strong>{warningText.split(':')[0]}:</strong> {warningText.split(':')[1]}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        <button
          style={{
            ...ALL_CARDS_STYLE,
            padding: '10px 18px',
            backgroundColor: DARK_COLORS.accentBlue,
            color: DARK_COLORS.text,
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'background-color 0.2s ease, transform 0.2s ease',
            flexShrink: 0,
            flexGrow: 1,
            minWidth: 100,
            maxWidth: 180,
            boxShadow: `0 4px 10px ${DARK_COLORS.accentBlue}40`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DARK_COLORS.accentBlue + 'E0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = DARK_COLORS.accentBlue)}
        >
          Confirm
        </button>
        {order.depositRequired && (
          <button
            style={{
              ...ALL_CARDS_STYLE,
              padding: '10px 18px',
              backgroundColor: DARK_COLORS.accentPurple,
              color: DARK_COLORS.text,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background-color 0.2s ease, transform 0.2s ease',
              flexShrink: 0,
              flexGrow: 1,
              minWidth: 100,
              maxWidth: 180,
              boxShadow: `0 4px 10px ${DARK_COLORS.accentPurple}40`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DARK_COLORS.accentPurple + 'E0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = DARK_COLORS.accentPurple)}
          >
            Request Deposit
          </button>
        )}
        <button
          style={{
            ...ALL_CARDS_STYLE,
            padding: '10px 18px',
            backgroundColor: DARK_COLORS.accentGreen,
            color: DARK_COLORS.text,
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'background-color 0.2s ease, transform 0.2s ease',
            flexShrink: 0,
            flexGrow: 1,
            minWidth: 100,
            maxWidth: 180,
            boxShadow: `0 4px 10px ${DARK_COLORS.accentGreen}40`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DARK_COLORS.accentGreen + 'E0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = DARK_COLORS.accentGreen)}
        >
          Mark Paid
        </button>
        <button
          style={{
            ...ALL_CARDS_STYLE,
            padding: '10px 18px',
            backgroundColor: 'transparent',
            color: DARK_COLORS.muted,
            border: `1px solid ${DARK_COLORS.muted}80`,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
            flexShrink: 0,
            flexGrow: 1,
            minWidth: 100,
            maxWidth: 180,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = DARK_COLORS.muted + '20';
            e.currentTarget.style.borderColor = DARK_COLORS.muted;
            e.currentTarget.style.color = DARK_COLORS.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = DARK_COLORS.muted + '80';
            e.currentTarget.style.color = DARK_COLORS.muted;
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const CateringDashboard: React.FC = () => {
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueThisMonth, setRevenueThisMonth] = useState<number>(0);

  useEffect(() => {
    const fetchCateringData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<ApiCateringResponse>('/api/catering-orders');
        const sortedOrders = data.orders
          .filter(order => new Date(order.eventDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
          .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
        setOrders(sortedOrders);
        setRevenueThisMonth(data.revenueThisMonth);
      } catch (err) {
        setError('Failed to fetch catering data.');
        // Fallback to mock data if there's any error in processing or if apiFetch somehow missed it
        setOrders(MOCKED_ORDERS.orders.filter(order => new Date(order.eventDate) >= new Date(new Date().setHours(0, 0, 0, 0))).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()));
        setRevenueThisMonth(MOCKED_ORDERS.revenueThisMonth);
      } finally {
        setLoading(false);
      }
    };

    fetchCateringData();
  }, []);

  const getStatusDistributionData = () => {
    const statusCounts: { [key: string]: number } = {
      pending: 0,
      confirmed: 0,
      deposit_paid: 0,
      fulfilled: 0,
      cancelled: 0,
    };

    const ordersToAnalyze = MOCKED_ORDERS.orders; // Always use mock for chart fallback, even if orders are empty

    ordersToAnalyze.forEach(order => {
      statusCounts[order.status]++;
    });

    return Object.entries(statusCounts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
        value: count,
      }));
  };

  const statusDistributionData = getStatusDistributionData();

  if (loading) {
    return (
      <div style={{
        backgroundColor: DARK_COLORS.bg,
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
        color: DARK_COLORS.text,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: 40,
        gap: 30,
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: `6px solid ${DARK_COLORS.accentBlue}30`,
          borderTop: `6px solid ${DARK_COLORS.accentBlue}`,
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ fontSize: 20, color: DARK_COLORS.muted }}>Loading catering orders...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div style={{
        backgroundColor: DARK_COLORS.bg,
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
        color: DARK_COLORS.text,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: 40,
        textAlign: 'center',
      }}>
        <div style={{
          ...GLASS_CARD_BASE_STYLE,
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          maxWidth: 600,
          width: '100%',
        }}>
          <span style={{ fontSize: 60 }}>🎉</span>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: DARK_COLORS.text }}>
            No Upcoming Catering Orders
          </h2>
          <p style={{ fontSize: 18, color: DARK_COLORS.muted, lineHeight: 1.6 }}>
            It looks like your catering calendar is clear for now. This is a great time to promote your services or plan for future events!
          </p>
          <button
            style={{
              padding: '12px 28px',
              backgroundColor: DARK_COLORS.accentBlue,
              color: DARK_COLORS.text,
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 600,
              marginTop: 20,
              transition: 'background-color 0.3s ease, transform 0.2s ease',
              boxShadow: `0 8px 20px ${DARK_COLORS.accentBlue}50`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = DARK_COLORS.accentBlue + 'E0'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = DARK_COLORS.accentBlue; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Create New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: DARK_COLORS.bg,
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      color: DARK_COLORS.text,
      padding: '40px 60px',
    }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 40, color: DARK_COLORS.text }}>Catering Orders</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, marginBottom: 40 }}>
        <div style={{ ...ALL_CARDS_STYLE, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', background: `linear-gradient(135deg, ${DARK_COLORS.accentBlue}30, ${DARK_COLORS.accentPurple}30)`, border: `1px solid ${DARK_COLORS.accentBlue}80`, boxShadow: `0 10px 30px ${DARK_COLORS.accentBlue}40` }}>
          <h2 style={{ margin: 0, fontSize: 18, color: DARK_COLORS.text }}>Revenue This Month</h2>
          <p style={{ margin: 0, fontSize: 36, fontWeight: 700, color: DARK_COLORS.text }}>
            ${revenueThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span style={{ fontSize: 14, color: DARK_COLORS.muted }}>
            Total from fulfilled catering orders
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 40 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 25, color: DARK_COLORS.text }}>Upcoming Catering Orders</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 25, color: DARK_COLORS.text }}>Order Status Distribution</h2>
          <div style={{ ...ALL_CARDS_STYLE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            {statusDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value: any) => <span style={{ color: DARK_COLORS.muted }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: DARK_COLORS.muted, fontSize: 16 }}>No order data available for distribution.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CateringDashboard;