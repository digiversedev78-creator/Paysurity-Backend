'use client';

import React, { useState, useEffect } from 'react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  currency: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned' | 'Refunded';
  deliveryDate?: string;
  trackingNumber?: string;
  items: OrderItem[];
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Assuming the backend handles authentication and identifies the customer from the session
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Order[] = await response.json();
        setOrders(data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch orders.');
        console.error("Error fetching orders:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleReturnRefund = (orderId: string) => {
    // In a real application, this would trigger an API call to initiate a return/refund process
    // and ideally update the order status.
    alert(`Return/refund initiated for Order #${orderId}. This would typically trigger an API call.`);
    console.log(`Return/refund request for Order ID: ${orderId}`);
    // A refetch of orders or a local state update for the specific order might follow here.
  };

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
      case 'Returned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isReturnRefundEligible = (order: Order) => {
    if (order.status === 'Delivered' && order.deliveryDate) {
      const deliveredDate = new Date(order.deliveryDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return deliveredDate >= thirtyDaysAgo;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Order History</h1>
        <div className="text-center py-8 text-gray-600">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Order History</h1>
        <div className="text-center py-8 text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-600">You haven't placed any orders yet.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order #{order.orderNumber}</h2>
                  <p className="text-gray-600 text-sm">Ordered on: {new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-lg font-bold text-gray-800">{order.totalAmount.toFixed(2)} {order.currency}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent toggling expansion when clicking button
                      toggleExpand(order.id);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Order Details</h3>
                  <ul className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-gray-700 text-sm">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>{(item.price * item.quantity).toFixed(2)} {order.currency}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-right font-semibold text-gray-800 mt-2">
                    Total: {order.totalAmount.toFixed(2)} {order.currency}
                  </div>

                  {order.status === 'Shipped' && order.trackingNumber && (
                    <div className="mt-4 text-gray-700 text-sm">
                      <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                      {/* In a real app, this might be a link to a tracking page */}
                      <a href={`https://www.track-my-package.com?tn=${order.trackingNumber}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Track Package</a>
                    </div>
                  )}

                  {order.status === 'Delivered' && order.deliveryDate && (
                    <div className="mt-4 text-gray-700 text-sm">
                      <p><strong>Delivered On:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</p>
                    </div>
                  )}

                  {isReturnRefundEligible(order) && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => handleReturnRefund(order.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-sm"
                      >
                        Request Return/Refund
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;