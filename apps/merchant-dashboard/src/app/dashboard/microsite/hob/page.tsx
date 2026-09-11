"use client";

import React, { useState, useEffect, useCallback } from 'react';

// Mock API utility - In a real application, these would be actual fetch calls to your backend API endpoints.
// For demonstration, we simulate network delays and return mock data.
const mockApi = {
  fetchMicrositeData: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      menuItems: [
        { id: 'item-001', name: 'Signature Burger', price: 12.99, isActive: true },
        { id: 'item-002', name: 'Classic Fries', price: 4.50, isActive: true },
        { id: 'item-003', name: 'Chocolate Milkshake', price: 6.00, isActive: false },
        { id: 'item-004', name: 'Garden Salad', price: 10.00, isActive: true },
        { id: 'item-005', name: 'Spicy Chicken Sandwich', price: 13.50, isActive: true },
      ],
      hours: {
        monday: { open: '09:00', close: '22:00' },
        tuesday: { open: '09:00', close: '22:00' },
        wednesday: { open: '09:00', close: '22:00' },
        thursday: { open: '09:00', close: '22:00' },
        friday: { open: '09:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '21:00' },
      },
      cateringLeadTimeHours: 48, // Default lead time in hours
      onlineOrderQueue: [
        { id: 'ord-001', customerName: 'Alice Smith', items: ['Signature Burger (x1)', 'Classic Fries (x1)'], status: 'Pending', orderTime: new Date(Date.now() - 30 * 60 * 1000).toLocaleString() },
        { id: 'ord-002', customerName: 'Bob Johnson', items: ['Garden Salad (x1)', 'Chocolate Milkshake (x1)'], status: 'Preparing', orderTime: new Date(Date.now() - 60 * 60 * 1000).toLocaleString() },
        { id: 'ord-003', customerName: 'Charlie Brown', items: ['Spicy Chicken Sandwich (x2)'], status: 'Pending', orderTime: new Date(Date.now() - 15 * 60 * 1000).toLocaleString() },
      ],
      analytics: {
        views: 12500,
        orders: 580,
        conversionRate: '4.64%',
      },
    };
  },
  updateMenuItemStatus: async (itemId: string, isActive: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`API call: Updated item ${itemId} active status to ${isActive}`);
    // In a real app, this would return an API response, e.g., { success: true }
    return { success: true };
  },
  updateHours: async (newHours: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('API call: Updated hours:', newHours);
    return { success: true };
  },
  updateCateringLeadTime: async (hours: number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('API call: Updated catering lead time:', hours, 'hours');
    return { success: true };
  },
  updateOrderStatus: async (orderId: string, newStatus: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`API call: Order ${orderId} status updated to ${newStatus}`);
    return { success: true };
  }
};

interface MenuItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

interface DayHours {
  open: string;
  close: string;
}

interface HoursConfig {
  [key: string]: DayHours;
}

interface Order {
  id: string;
  customerName: string;
  items: string[];
  status: string;
  orderTime: string;
}

interface Analytics {
  views: number;
  orders: number;
  conversionRate: string;
}


const HobMicrositeAdminPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [hours, setHours] = useState<HoursConfig>({});
  const [cateringLeadTime, setCateringLeadTime] = useState<number>(0);
  const [onlineOrderQueue, setOnlineOrderQueue] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await mockApi.fetchMicrositeData();
        setMenuItems(data.menuItems);
        setHours(data.hours);
        setCateringLeadTime(data.cateringLeadTimeHours);
        setOnlineOrderQueue(data.onlineOrderQueue);
        setAnalytics(data.analytics);
      } catch (err) {
        setError("Failed to load microsite data. Please try again.");
        console.error("Error fetching microsite data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleMenuItem = useCallback(async (itemId: string, isActive: boolean) => {
    try {
      await mockApi.updateMenuItemStatus(itemId, isActive);
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, isActive: isActive } : item
        )
      );
    } catch (err) {
      alert('Failed to update menu item status. Please try again.');
      console.error("Error updating menu item status:", err);
    }
  }, []);

  const handleHoursChange = useCallback((day: string, type: 'open' | 'close', value: string) => {
    setHours(prevHours => ({
      ...prevHours,
      [day]: {
        ...prevHours[day],
        [type]: value,
      },
    }));
  }, []);

  const saveHours = useCallback(async () => {
    try {
      await mockApi.updateHours(hours);
      alert('Operating hours updated successfully!');
    } catch (err) {
      alert('Failed to save hours. Please try again.');
      console.error("Error saving hours:", err);
    }
  }, [hours]);

  const handleCateringLeadTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setCateringLeadTime(value);
    }
  }, []);

  const saveCateringLeadTime = useCallback(async () => {
    if (cateringLeadTime < 27) {
      alert('Catering lead time must be at least 27 hours.');
      return;
    }
    try {
      await mockApi.updateCateringLeadTime(cateringLeadTime);
      alert('Catering lead time updated successfully!');
    } catch (err) {
      alert('Failed to save catering lead time. Please try again.');
      console.error("Error saving catering lead time:", err);
    }
  }, [cateringLeadTime]);

  const handleUpdateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    try {
      await mockApi.updateOrderStatus(orderId, newStatus);
      setOnlineOrderQueue(prevQueue =>
        prevQueue.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert('Failed to update order status. Please try again.');
      console.error("Error updating order status:", err);
    }
  }, []);


  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Loading HOB Microsite Admin Dashboard...</h2>
        <p>Please wait while we fetch your data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: 'red' }}>
        <h2>Error: {error}</h2>
        <p>There was an issue loading the microsite administration data. Please refresh the page or contact support.</p>
      </div>
    );
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '30px' }}>HOB Microsite Admin Panel</h1>

      {/* Section 1: Preview of live microsite */}
      <section style={{ marginBottom: '40px', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#555', marginBottom: '15px' }}>Live Microsite Preview</h2>
        <div style={{ height: '500px', width: '100%', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
          {/* Replace with actual microsite URL from tenant configuration */}
          <iframe
            src="https://your-paysurity-microsite.com/hob-demo" // Placeholder URL for demonstration
            title="HOB Microsite Live Preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms" // Recommended for iframe security
          ></iframe>
        </div>
        <p style={{ marginTop: '15px', fontSize: '0.9em', color: '#666', borderLeft: '3px solid #007bff', paddingLeft: '10px' }}>
          This iframe provides a real-time view of your live HOB microsite. Changes made in the admin panel will automatically reflect here.
        </p>
      </section>

      {/* Section 2: Toggle menu items active/inactive */}
      <section style={{ marginBottom: '40px', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#555', marginBottom: '20px' }}>Manage Menu Items</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {menuItems.map(item => (
            <div key={item.id} style={{ border: '1px solid #eee', padding: '18px', borderRadius: '8px', backgroundColor: item.isActive ? '#eafaf1' : '#fdeded', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{item.name}</h3>
              <p style={{ margin: '0 0 15px 0', fontSize: '1.1em', fontWeight: 'bold', color: '#444' }}>Price: ${item.price.toFixed(2)}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                <span style={{ color: item.isActive ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>{item.isActive ? 'Active' : 'Inactive'}</span>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(e) => handleToggleMenuItem(item.id, e.target.checked)}
                    style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                  />
                  Toggle Status
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Update hours */}
      <section style={{ marginBottom: '40px', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#555', marginBottom: '20px' }}>Update Operating Hours</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {daysOfWeek.map(day => (
            <div key={day} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
              <h4 style={{ textTransform: 'capitalize', marginBottom: '15px', color: '#333' }}>{day}</h4>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                Open Time:
                <input
                  type="time"
                  value={hours[day]?.open || ''}
                  onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                  style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </label>
              <label style={{ display: 'block', marginTop: '10px' }}>
                Close Time:
                <input
                  type="time"
                  value={hours[day]?.close || ''}
                  onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                  style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </label>
            </div>
          ))}
        </div>
        <button
          onClick={saveHours}
          style={{
            marginTop: '30px',
            padding: '12px 25px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1.1em',
            fontWeight: 'bold',
            transition: 'background-color 0.2s ease',
          }}
        >
          Save Hours
        </button>
      </section>

      {/* Section 4: Manage catering lead time */}
      <section style={{ marginBottom: '40px', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#555', marginBottom: '20px' }}>Catering Lead Time Configuration</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '1.1em', color: '#444' }}>
            Minimum Lead Time (hours):
            <input
              type="number"
              value={cateringLeadTime}
              onChange={handleCateringLeadTimeChange}
              min="27"
              style={{ marginLeft: '15px', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '120px', fontSize: '1em' }}
            />
          </label>
          <button
            onClick={saveCateringLeadTime}
            style={{
              padding: '12px 25px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.1em',
              fontWeight: 'bold',
              transition: 'background-color 0.2s ease',
            }}
          >
            Save Lead Time
          </button>
        </div>
        {cateringLeadTime < 27 && (
          <p style={{ color: '#dc3545', marginTop: '15px', fontWeight: 'bold', borderLeft: '3px solid #dc3545', paddingLeft: '10px' }}>
            Warning: Catering lead time must be at least 27 hours to allow sufficient preparation.
          </p>
        )}
        <p style={{ marginTop: '15px', fontSize: '0.9em', color: '#666', borderLeft: '3px solid #6c757d', paddingLeft: '10px' }}>
          This setting defines the minimum number of hours required for customers to place a catering order in advance.
        </p>
      </section>

      {/* Section 5: View online order queue */}
      <section style={{ marginBottom: '40px', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#555', marginBottom: '20px' }}>Online Order Queue</h2>
        {onlineOrderQueue.length === 0 ? (
          <p style={{ fontSize: '1.1em', color: '#666' }}>No new orders in the queue. All clear!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ddd' }}>
                  <th style={{ border: '1px solid #eee', padding: '12px', textAlign: 'left', color: '#333' }}>Order ID</th>
                  <th style={{ border: '1px solid #eee', padding: '12px', textAlign: 'left', color: '#333' }}>Customer</th>
                  <th style={{ border: '1px solid #eee', padding: '12px', textAlign: 'left', color: '#333' }}>Items</th>
                  <th style={{ border: '1px solid #eee', padding: '12px', textAlign: 'left', color: '#333' }}>Order Time</th>
                  <th style={{ border: '1px solid #eee', padding: '12px', textAlign: 'left', color: '#333' }}>Status</th>
                  <th style={{ border: '1px solid #eee', padding: '12px', textAlign: 'left', color: '#333' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {onlineOrderQueue.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ border: '1px solid #eee', padding: '12px' }}>{order.id}</td>
                    <td style={{ border: '1px solid #eee', padding: '12px' }}>{order.customerName}</td>
                    <td style={{ border: '1px solid #eee', padding: '12px' }}>{order.items.join(', ')}</td>
                    <td style={{ border: '1px solid #eee', padding: '12px' }}>{order.orderTime}</td>
                    <td style={{ border: '1px solid #eee', padding: '12px', fontWeight: 'bold', color: order.status === 'Pending' ? '#ffc107' : (order.status === 'Preparing' ? '#17a2b8' : '#28a745') }}>{order.status}</td>
                    <td style={{ border: '1px solid #eee', padding: '12px' }}>
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                          style={{
                            padding: '8px 15px',
                            backgroundColor: '#ffc107',
                            color: 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            marginRight: '8px',
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          Prepare
                        </button>
                      )}
                      {(order.status === 'Pending' || order.status === 'Preparing') && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                          style={{
                            padding: '8px 15px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 6: Analytics (views/orders/conversion rate) */}
      <section style={{ marginBottom: '40px', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#555', marginBottom: '20px' }}>Microsite Performance Analytics</h2>
        {analytics && (
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '25px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px', textAlign: 'center', padding: '25px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Total Views</h3>
              <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#007bff', margin: '0' }}>{analytics.views.toLocaleString()}</p>
              <p style={{ fontSize: '0.9em', color: '#888', marginTop: '5px' }}>Unique page loads on your microsite</p>
            </div>
            <div style={{ flex: 1, minWidth: '250px', textAlign: 'center', padding: '25px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Total Orders</h3>
              <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#28a745', margin: '0' }}>{analytics.orders.toLocaleString()}</p>
              <p style={{ fontSize: '0.9em', color: '#888', marginTop: '5px' }}>Number of completed online orders</p>
            </div>
            <div style={{ flex: 1, minWidth: '250px', textAlign: 'center', padding: '25px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Conversion Rate</h3>
              <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#fd7e14', margin: '0' }}>{analytics.conversionRate}</p>
              <p style={{ fontSize: '0.9em', color: '#888', marginTop: '5px' }}>Orders / Views</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default HobMicrositeAdminPage;