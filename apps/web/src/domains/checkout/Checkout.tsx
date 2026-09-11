'use client';
import React, { useState, useEffect, FormEvent } from 'react';
import { FrontendPQC } from '../../lib/pqc';

const MOCK_CART_ITEMS = [
  { id: 'b1', name: 'Chicken Biryani (Large)', price: 16.99, quantity: 2 },
  { id: 's1', name: 'Veg Samosa (3 pcs)', price: 4.50, quantity: 1 },
  { id: 'd1', name: 'Gulab Jamun (2 pcs)', price: 3.00, quantity: 1 },
  { id: 'c1', name: 'Coke', price: 2.00, quantity: 2 },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderConfirmation {
  orderNumber: string;
  total: number;
}

export const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('houseOfBiryaniCart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      } else {
        setCartItems(MOCK_CART_ITEMS);
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
      setCartItems(MOCK_CART_ITEMS);
    }
  }, []);

  const calculateTotal = (): number => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const orderPayload = {
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
      orderType,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: calculateTotal(),
      ...(orderType === 'delivery' && { deliveryAddress }),
      specialInstructions,
    };

    try {
      const signature = FrontendPQC.signPayload(JSON.stringify(orderPayload));

      const response = await fetch('http://localhost:4000/api/v1/orders/sovereign-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PQC-Signature': signature,
          'X-Tenant-ID': 'houseofbiryani'
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Order failed to process. Please try again.');
      }

      const data = await response.json();
      setOrderConfirmation({
        orderNumber: data.orderNumber || `HODB-${Math.floor(Math.random() * 1000000)}`,
        total: calculateTotal(),
      });

      localStorage.removeItem('houseOfBiryaniCart');
      setCartItems([]);

    } catch (err: any) {
      console.error('Order submission error:', err);
      setError(err.message || 'An unexpected error occurred. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmation) {
    return (
      <div className="order-confirmation-container" style={{
        maxWidth: '600px', margin: '50px auto', padding: '30px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '10px',
        fontFamily: 'Arial, sans-serif', textAlign: 'center', backgroundColor: '#fff',
        borderTop: '5px solid #8B0000'
      }}>
        <h2 style={{ color: '#8B0000', fontSize: '2.2em', marginBottom: '20px' }}>Order Confirmed!</h2>
        <p style={{ fontSize: '1.1em', marginBottom: '15px', color: '#333' }}>
          Thank you for your order from <strong style={{ color: '#8B0000' }}>House of Biryani</strong>!
        </p>
        <p style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#222', marginBottom: '25px' }}>
          Your Order Number: <span style={{ color: '#8B0000' }}>{orderConfirmation.orderNumber}</span>
        </p>
        <p style={{ fontSize: '1.2em', marginBottom: '20px', color: '#555' }}>
          Total Paid: <span style={{ fontWeight: 'bold' }}>${orderConfirmation.total.toFixed(2)}</span>
        </p>
        <p style={{ fontSize: '0.95em', color: '#666', lineHeight: '1.5' }}>
          You will receive an email confirmation shortly with all your order details and estimated {orderType === 'pickup' ? 'pickup' : 'delivery'} time.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            backgroundColor: '#8B0000', color: '#fff', padding: '14px 30px',
            border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '1.1em',
            marginTop: '30px', transition: 'background-color 0.3s ease, transform 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="order-page-container" style={{
      maxWidth: '900px', margin: '20px auto', padding: '25px',
      boxShadow: '0 2px 15px rgba(0,0,0,0.08)', borderRadius: '10px',
      fontFamily: 'Arial, sans-serif', backgroundColor: '#fdfdfd',
      color: '#333'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '35px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
        <h1 style={{ color: '#8B0000', fontSize: '2.8em', margin: '0', letterSpacing: '-1px' }}>House of Biryani</h1>
        <p style={{ color: '#666', fontSize: '1.2em', marginTop: '8px' }}>Complete your order, savor the flavor!</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
        <div className="left-column" style={{ paddingRight: '15px', borderRight: '1px solid #f0f0f0' }}>
          <h2 style={{ color: '#8B0000', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px', marginBottom: '25px', fontSize: '1.6em' }}>1. Your Details</h2>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' }}>Name:</label>
            <input
              type="text"
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              aria-label="Your Name"
              style={{
                width: '100%', padding: '12px', border: '1px solid #ccc',
                borderRadius: '6px', fontSize: '1em', boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' }}>Phone Number:</label>
            <input
              type="tel"
              id="phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
              aria-label="Your Phone Number"
              style={{
                width: '100%', padding: '12px', border: '1px solid #ccc',
                borderRadius: '6px', fontSize: '1em', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' }}>Email Address:</label>
            <input
              type="email"
              id="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              aria-label="Your Email Address"
              style={{
                width: '100%', padding: '12px', border: '1px solid #ccc',
                borderRadius: '6px', fontSize: '1em', boxSizing: 'border-box'
              }}
            />
          </div>

          <h2 style={{ color: '#8B0000', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px', marginBottom: '25px', fontSize: '1.6em' }}>2. Order Type</h2>
          <div style={{ display: 'flex', gap: '25px', marginBottom: '25px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '1.05em' }}>
              <input
                type="radio"
                name="orderType"
                value="pickup"
                checked={orderType === 'pickup'}
                onChange={() => setOrderType('pickup')}
                style={{ marginRight: '10px', transform: 'scale(1.2)' }}
              />
              Pickup
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '1.05em' }}>
              <input
                type="radio"
                name="orderType"
                value="delivery"
                checked={orderType === 'delivery'}
                onChange={() => setOrderType('delivery')}
                style={{ marginRight: '10px', transform: 'scale(1.2)' }}
              />
              Delivery
            </label>
          </div>

          {orderType === 'delivery' && (
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="deliveryAddress" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' }}>Delivery Address:</label>
              <textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required={orderType === 'delivery'}
                rows={4}
                aria-label="Delivery Address"
                style={{
                  width: '100%', padding: '12px', border: '1px solid #ccc',
                  borderRadius: '6px', fontSize: '1em', resize: 'vertical', boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="specialInstructions" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' }}>Special Instructions:</label>
            <textarea
              id="specialInstructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={4}
              placeholder="e.g., No cilantro, extra spicy, allergies, dietary restrictions, etc."
              aria-label="Special Instructions for your order"
              style={{
                width: '100%', padding: '12px', border: '1px solid #ccc',
                borderRadius: '6px', fontSize: '1em', resize: 'vertical', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div className="right-column" style={{ paddingLeft: '15px' }}>
          <h2 style={{ color: '#8B0000', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px', marginBottom: '25px', fontSize: '1.6em' }}>3. Your Order Summary</h2>
          {cartItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1em', padding: '20px', border: '1px dashed #ddd', borderRadius: '5px' }}>
              Your cart is empty. Please add items to place an order.
            </p>
          ) : (
            <div className="cart-items-list" style={{ marginBottom: '25px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', borderBottom: '1px dotted #eee' }}>
                  <span style={{ color: '#333', fontSize: '1.05em' }}>{item.quantity} x {item.name}</span>
                  <span style={{ fontWeight: 'bold', color: '#222', fontSize: '1.05em' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 15px', fontSize: '1.3em', fontWeight: 'bold', borderTop: '2px solid #f0f0f0', backgroundColor: '#f8f8f8', borderRadius: '0 0 8px 8px' }}>
                <span>Order Total:</span>
                <span style={{ color: '#8B0000' }}>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          <h2 style={{ color: '#8B0000', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px', marginBottom: '25px', fontSize: '1.6em' }}>4. Payment</h2>
          <div style={{ marginBottom: '25px', padding: '18px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #d0eaff', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '12px', fontSize: '2em', color: '#007bff' }}>💳</span>
            <p style={{ margin: '0', color: '#555', fontSize: '1.05em' }}>
              Pay securely online. We use <strong style={{ color: '#007bff' }}>FluidPay</strong> for encrypted transactions.
            </p>
          </div>

          {error && (
            <div style={{
              color: '#D8000C', backgroundColor: '#FFD2D2', padding: '12px',
              borderRadius: '6px', marginBottom: '20px', border: '1px solid #D8000C',
              fontSize: '0.95em'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || cartItems.length === 0 || !customerName || !customerPhone || !customerEmail || (orderType === 'delivery' && !deliveryAddress)}
            style={{
              width: '100%', padding: '16px', backgroundColor: '#8B0000', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '1.3em', fontWeight: 'bold',
              cursor: 'pointer', transition: 'background-color 0.3s ease, transform 0.2s ease',
              opacity: (isSubmitting || cartItems.length === 0 || !customerName || !customerPhone || !customerEmail || (orderType === 'delivery' && !deliveryAddress)) ? 0.7 : 1,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            {isSubmitting ? 'Processing Order...' : 'Pay Online'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#888', marginTop: '25px' }}>
            <span style={{ marginRight: '8px', color: '#28a745' }}>✅</span> All transactions are secure and encrypted.
            <br />
            Your privacy is our priority.
          </p>
        </div>
      </form>
    </div>
  );
};
