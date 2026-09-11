'use client';
import React, { useState, useEffect, FormEvent } from 'react';
import { FrontendPQC } from '../../../../lib/pqc';

// Define interfaces for better type safety
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderConfirmation {
  orderNumber: string;
  total: number;
  customerName: string;
}

const OrderPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryStreet, setDeliveryStreet] = useState<string>('');
  const [deliveryCity, setDeliveryCity] = useState<string>('');
  const [deliveryState, setDeliveryState] = useState<string>('');
  const [deliveryZip, setDeliveryZip] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load cart items from localStorage on component mount
  // This simulates cart items being passed from a previous page (e.g., menu)
  useEffect(() => {
    try {
      // Example cart items for testing if localStorage is empty:
      // const dummyCart = [
      //   { id: '1', name: 'Chicken Biryani', price: 12.99, quantity: 2 },
      //   { id: '2', name: 'Vegetable Curry', price: 10.50, quantity: 1 },
      //   { id: '3', name: 'Garlic Naan', price: 3.00, quantity: 3 },
      // ];
      // localStorage.setItem('tawakkulRestaurantCart', JSON.stringify(dummyCart));

      const storedCart = localStorage.getItem('tawakkulRestaurantCart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
      setError("Failed to load your cart. Please try refreshing the page.");
    }
  }, []);

  const calculateTotal = (): number => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items before placing an order.");
      setIsSubmitting(false);
      return;
    }

    if (!customerName || !customerPhone || !customerEmail) {
      setError("Please fill in all required customer information.");
      setIsSubmitting(false);
      return;
    }

    if (orderType === 'delivery' && (!deliveryStreet || !deliveryCity || !deliveryState || !deliveryZip)) {
      setError("Please fill in all required delivery address details.");
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
      orderType: orderType,
      deliveryAddress: orderType === 'delivery' ? {
        street: deliveryStreet,
        city: deliveryCity,
        state: deliveryState,
        zip: deliveryZip,
      } : null,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      specialInstructions: specialInstructions,
      total: calculateTotal(),
    };

    try {
      const signature = FrontendPQC.signPayload(JSON.stringify(orderData));

      // Bridge to Live NestJS Backend (Sovereign Engine)
      const response = await fetch('http://localhost:4000/api/v1/orders/sovereign-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PQC-Signature': signature,
          'X-Tenant-ID': 'tawakkul'
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        setOrderConfirmation({
          orderNumber: result.orderNumber,
          total: orderData.total,
          customerName: customerName,
        });
        // Clear cart after successful order
        localStorage.removeItem('tawakkulRestaurantCart');
        setCartItems([]);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "An unexpected error occurred while placing your order.");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setError("Failed to connect to the server. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline styles for a clean, simple look without external CSS files
  const styles: any = {
    container: {
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      maxWidth: '800px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      color: '#333',
    },
    header: {
      textAlign: 'center',
      color: '#28a745', // A pleasant green for the restaurant branding
      marginBottom: '30px',
      fontSize: '2.5em',
      fontWeight: '600',
    },
    section: {
      marginBottom: '25px',
      borderTop: '1px solid #eee',
      paddingTop: '25px',
    },
    sectionHeader: {
      color: '#555',
      fontSize: '1.6em',
      marginBottom: '15px',
      borderBottom: '2px solid #28a745',
      paddingBottom: '5px',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#444',
    },
    input: {
      width: 'calc(100% - 20px)',
      padding: '12px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1em',
      boxSizing: 'border-box',
    },
    textarea: {
      width: 'calc(100% - 20px)',
      padding: '12px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1em',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box',
    },
    radioGroup: {
      display: 'flex',
      gap: '20px',
      marginBottom: '15px',
    },
    radioLabel: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    cartSummary: {
      border: '1px solid #eee',
      borderRadius: '4px',
      padding: '15px',
      marginBottom: '20px',
      backgroundColor: '#f9f9f9',
    },
    cartItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      paddingBottom: '8px',
      borderBottom: '1px dotted #eee',
      fontSize: '0.95em',
    },
    cartTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 'bold',
      fontSize: '1.2em',
      marginTop: '15px',
      paddingTop: '15px',
      borderTop: '2px solid #28a745',
    },
    payButton: {
      backgroundColor: '#28a745',
      color: '#fff',
      padding: '15px 25px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1.2em',
      cursor: 'pointer',
      width: '100%',
      marginTop: '20px',
      transition: 'background-color 0.3s ease',
    },
    // Note: Actual :hover effects require CSS. This simulates a disabled look.
    disabledButton: {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid #f5c6cb',
    },
    confirmation: {
      textAlign: 'center',
      padding: '40px 20px',
      backgroundColor: '#e6ffe6',
      border: '1px solid #28a745',
      borderRadius: '8px',
      color: '#1a5a2a',
    },
    confirmationTitle: {
      fontSize: '2em',
      color: '#28a745',
      marginBottom: '15px',
    },
    confirmationText: {
      fontSize: '1.1em',
      lineHeight: '1.6',
    },
    orderNumber: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      color: '#007bff',
      marginTop: '15px',
      display: 'block',
    }
  };

  if (orderConfirmation) {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>Tawakkul Restaurant</h1>
        <div style={styles.confirmation}>
          <h2 style={styles.confirmationTitle}>Order Placed Successfully!</h2>
          <p style={styles.confirmationText}>
            Thank you, {orderConfirmation.customerName}! Your order has been received.
          </p>
          <span style={styles.orderNumber}>Order Number: {orderConfirmation.orderNumber}</span>
          <p style={styles.confirmationText}>
            Your total was ${orderConfirmation.total.toFixed(2)}. We appreciate your business and hope you enjoy your meal!
          </p>
          <p style={styles.confirmationText}>
            You will receive a confirmation email shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Tawakkul Restaurant</h1>
      <h2 style={{ ...styles.sectionHeader, borderBottom: 'none', textAlign: 'center', marginBottom: '30px' }}>Fast Online Order</h2>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.section}>
          <h3 style={styles.sectionHeader}>Your Order Summary</h3>
          {cartItems.length === 0 ? (
            <p>Your cart is currently empty. Please add items from our menu to place an order.</p>
          ) : (
            <div style={styles.cartSummary}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.cartItem}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={styles.cartTotal}>
                <span>Order Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionHeader}>Customer Information</h3>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>Full Name</label>
            <input
              type="text"
              id="name"
              style={styles.input}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              aria-label="Full Name"
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="phone" style={styles.label}>Phone Number</label>
            <input
              type="tel"
              id="phone"
              style={styles.input}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
              aria-label="Phone Number"
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              type="email"
              id="email"
              style={styles.input}
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              aria-label="Email Address"
            />
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionHeader}>Order Type</h3>
          <div style={styles.radioGroup}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="orderType"
                value="pickup"
                checked={orderType === 'pickup'}
                onChange={() => setOrderType('pickup')}
                aria-label="Pickup Order Type"
              />
              Pickup
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="orderType"
                value="delivery"
                checked={orderType === 'delivery'}
                onChange={() => setOrderType('delivery')}
                aria-label="Delivery Order Type"
              />
              Delivery
            </label>
          </div>
        </div>

        {orderType === 'delivery' && (
          <div style={styles.section}>
            <h3 style={styles.sectionHeader}>Delivery Address</h3>
            <div style={styles.formGroup}>
              <label htmlFor="street" style={styles.label}>Street Address</label>
              <input
                type="text"
                id="street"
                style={styles.input}
                value={deliveryStreet}
                onChange={(e) => setDeliveryStreet(e.target.value)}
                required={orderType === 'delivery'}
                aria-label="Street Address"
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="city" style={styles.label}>City</label>
              <input
                type="text"
                id="city"
                style={styles.input}
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                required={orderType === 'delivery'}
                aria-label="City"
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="state" style={styles.label}>State / Province</label>
              <input
                type="text"
                id="state"
                style={styles.input}
                value={deliveryState}
                onChange={(e) => setDeliveryState(e.target.value)}
                required={orderType === 'delivery'}
                aria-label="State or Province"
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="zip" style={styles.label}>Zip / Postal Code</label>
              <input
                type="text"
                id="zip"
                style={styles.input}
                value={deliveryZip}
                onChange={(e) => setDeliveryZip(e.target.value)}
                required={orderType === 'delivery'}
                aria-label="Zip or Postal Code"
              />
            </div>
          </div>
        )}

        <div style={styles.section}>
          <h3 style={styles.sectionHeader}>Special Instructions</h3>
          <div style={styles.formGroup}>
            <label htmlFor="instructions" style={styles.label}>Any specific requests or allergies? (Optional)</label>
            <textarea
              id="instructions"
              style={styles.textarea}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={4}
              aria-label="Special Instructions"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          style={{
            ...styles.payButton,
            ...(isSubmitting || cartItems.length === 0 ? styles.disabledButton : {}),
          }}
          disabled={isSubmitting || cartItems.length === 0}
          aria-label={isSubmitting ? 'Processing Order...' : 'Pay Online'}
        >
          {isSubmitting ? 'Processing Order...' : 'Pay Online'}
        </button>
      </form>
    </div>
  );
};

export default OrderPage;