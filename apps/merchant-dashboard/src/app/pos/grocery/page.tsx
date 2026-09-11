'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Mock product data for frontend development
interface Product {
  id: string;
  name: string;
  price: number;
  isEBTEligible: boolean;
  snapCategory: string; // e.g., "food", "non-food". SNAP-eligible for "food"
}

interface CartItem extends Product {
  quantity: number;
}

// Mock API utility - In a real application, these would be actual fetch calls to /api endpoints.
const mockApi = {
  fetchProductByBarcode: (barcode: string): Promise<Product | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulating a database lookup
        const products: Product[] = [
          { id: '1001', name: 'Milk (1 Gallon)', price: 3.50, isEBTEligible: true, snapCategory: 'food' },
          { id: '1002', name: 'Whole Wheat Bread', price: 2.75, isEBTEligible: true, snapCategory: 'food' },
          { id: '1003', name: 'Dozen Eggs', price: 4.20, isEBTEligible: true, snapCategory: 'food' },
          { id: '1004', name: 'Paper Towels (6-pack)', price: 5.00, isEBTEligible: false, snapCategory: 'non-food' },
          { id: '1005', name: 'Canned Black Beans', price: 1.20, isEBTEligible: true, snapCategory: 'food' },
          { id: '1006', name: 'Soda (12-pack)', price: 6.99, isEBTEligible: true, snapCategory: 'food' }, // SNAP eligible for soda
          { id: '1007', name: 'Shampoo', price: 6.50, isEBTEligible: false, snapCategory: 'non-food' },
          { id: '1008', name: 'Bananas (per lb)', price: 0.79, isEBTEligible: true, snapCategory: 'food' },
          { id: '1009', name: 'Toilet Paper (8-rolls)', price: 12.99, isEBTEligible: false, snapCategory: 'non-food' },
          { id: '1010', name: 'Ground Beef (1lb)', price: 7.50, isEBTEligible: true, snapCategory: 'food' },
          { id: '1011', name: 'Hot Coffee', price: 2.50, isEBTEligible: false, snapCategory: 'prepared-food' }, // Prepared food is not EBT eligible
        ];
        // Simple mock lookup by ID or partial name match
        const product = products.find(p => p.id === barcode || p.name.toLowerCase().includes(barcode.toLowerCase()));
        resolve(product || null);
      }, 300); // Simulate network delay
    });
  },
  processPayment: (payload: { cart: CartItem[]; ebtAmount: number; totalAmount: number; regularAmount: number }) => {
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      setTimeout(() => {
        // Server-side validation (mocked)
        const ebtEligibleTotal = payload.cart
          .filter(item => item.isEBTEligible)
          .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const cartTotal = payload.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Ensure EBT amount does not exceed EBT-eligible items and is not negative
        if (payload.ebtAmount < 0) {
            resolve({ success: false, message: "EBT amount cannot be negative." });
            return;
        }
        if (payload.ebtAmount > ebtEligibleTotal + 0.001) { // Allowing small float tolerance
            resolve({ success: false, message: `EBT amount ($${payload.ebtAmount.toFixed(2)}) exceeds EBT-eligible item total ($${ebtEligibleTotal.toFixed(2)}).` });
            return;
        }
        
        // Ensure the total payment (EBT + Regular) matches the cart total
        if (Math.abs(payload.ebtAmount + payload.regularAmount - cartTotal) > 0.001) {
            resolve({ success: false, message: `Payment discrepancy. EBT: $${payload.ebtAmount.toFixed(2)}, Regular: $${payload.regularAmount.toFixed(2)}, Cart Total: $${cartTotal.toFixed(2)}.` });
            return;
        }

        resolve({ success: true, message: "Payment processed successfully!" });
      }, 1000); // Simulate network delay for payment processing
    });
  },
};

const GrocerEaseCheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [loadingProduct, setLoadingProduct] = useState<boolean>(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [ebtPaymentAmount, setEbtPaymentAmount] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);

  // Calculate totals
  const { ebtEligibleSubtotal, regularSubtotal, totalAmount } = useMemo(() => {
    let ebtEligible = 0;
    let regular = 0;
    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      if (item.isEBTEligible) {
        ebtEligible += itemTotal;
      } else {
        regular += itemTotal;
      }
    });
    return {
      ebtEligibleSubtotal: ebtEligible,
      regularSubtotal: regular,
      totalAmount: ebtEligible + regular,
    };
  }, [cartItems]);

  const remainingRegularPayment = useMemo(() => {
    const remaining = totalAmount - ebtPaymentAmount;
    return Math.max(0, remaining); // Ensure it doesn't go negative display-wise
  }, [totalAmount, ebtPaymentAmount]);

  const handleBarcodeScan = useCallback(async () => {
    if (!barcodeInput.trim()) return;

    setLoadingProduct(true);
    setProductError(null);
    try {
      const product = await mockApi.fetchProductByBarcode(barcodeInput.trim());
      if (product) {
        setCartItems(prevItems => {
          const existingItem = prevItems.find(item => item.id === product.id);
          if (existingItem) {
            return prevItems.map(item =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            return [...prevItems, { ...product, quantity: 1 }];
          }
        });
        setBarcodeInput('');
      } else {
        setProductError('Product not found.');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProductError('Failed to fetch product. Please try again.');
    } finally {
      setLoadingProduct(false);
    }
  }, [barcodeInput]);

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBarcodeScan();
    }
  };

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
      );
    }
  };

  const removeCartItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleEbtAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setEbtPaymentAmount(value);
    } else if (e.target.value === '') {
      setEbtPaymentAmount(0);
    }
  };

  const handleProcessPayment = async () => {
    setProcessingPayment(true);
    setPaymentMessage(null);
    setPaymentSuccess(null);

    // Frontend validation for EBT amount not exceeding eligible total
    if (ebtPaymentAmount > ebtEligibleSubtotal + 0.001) {
        setPaymentMessage(`EBT amount ($${ebtPaymentAmount.toFixed(2)}) cannot exceed EBT-eligible total ($${ebtEligibleSubtotal.toFixed(2)}).`);
        setPaymentSuccess(false);
        setProcessingPayment(false);
        return;
    }

    if (ebtPaymentAmount + remainingRegularPayment < totalAmount - 0.001) {
      setPaymentMessage("Total payment does not cover the cart total.");
      setPaymentSuccess(false);
      setProcessingPayment(false);
      return;
    }


    try {
      const response = await mockApi.processPayment({
        cart: cartItems,
        ebtAmount: ebtPaymentAmount,
        totalAmount: totalAmount,
        regularAmount: remainingRegularPayment,
      });

      setPaymentMessage(response.message);
      setPaymentSuccess(response.success);
      if (response.success) {
        setCartItems([]);
        setEbtPaymentAmount(0);
        setBarcodeInput('');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentMessage('Failed to process payment. Please try again.');
      setPaymentSuccess(false);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Reset EBT amount if cart changes or total amount changes significantly
  useEffect(() => {
    setEbtPaymentAmount(prev => Math.min(prev, ebtEligibleSubtotal));
  }, [ebtEligibleSubtotal]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '900px', margin: 'auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>GrocerEase POS Checkout</h1>

      {/* Barcode Scanner Input */}
      <div style={{ marginBottom: '25px', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <label htmlFor="barcode-scanner" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Scan Barcode or Enter Product ID:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            id="barcode-scanner"
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleBarcodeKeyDown}
            placeholder="e.g., 1001 or Milk"
            style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={loadingProduct}
          />
          <button
            onClick={handleBarcodeScan}
            style={{
              padding: '10px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: loadingProduct ? 0.7 : 1,
            }}
            disabled={loadingProduct}
          >
            {loadingProduct ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
        {productError && <p style={{ color: 'red', marginTop: '10px' }}>{productError}</p>}
      </div>

      {/* Cart Display */}
      <div style={{ marginBottom: '25px', border: '1px solid #eee', borderRadius: '5px', padding: '15px' }}>
        <h2 style={{ marginBottom: '15px', color: '#555' }}>Shopping Cart</h2>
        {cartItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777' }}>Your cart is empty.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cartItems.map((item) => (
              <li
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px',
                  paddingBottom: '10px',
                  borderBottom: '1px dashed #eee',
                }}
              >
                <div style={{ flexGrow: 1 }}>
                  <span style={{ fontWeight: 'bold' }}>{item.name}</span>{' '}
                  {item.isEBTEligible && (
                    <span
                      style={{
                        backgroundColor: '#e6ffed',
                        color: '#28a745',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8em',
                        marginLeft: '8px',
                      }}
                    >
                      EBT Eligible ({item.snapCategory})
                    </span>
                  )}
                  <div style={{ fontSize: '0.9em', color: '#666', marginTop: '3px' }}>
                    ${item.price.toFixed(2)} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <button
                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeCartItem(item.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginLeft: '10px',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Subtotals */}
      <div style={{ marginBottom: '25px', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ marginBottom: '15px', color: '#555' }}>Order Summary</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold' }}>EBT Eligible Subtotal:</span>
          <span>${ebtEligibleSubtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold' }}>Regular Subtotal:</span>
          <span>${regularSubtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2em', fontWeight: 'bold', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
          <span>Total Amount:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Split Tender UI */}
      <div style={{ marginBottom: '25px', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ marginBottom: '15px', color: '#555' }}>Payment Details</h2>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="ebt-amount" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            EBT Payment Amount:
          </label>
          <input
            id="ebt-amount"
            type="number"
            step="0.01"
            value={ebtPaymentAmount.toFixed(2)}
            onChange={handleEbtAmountChange}
            min="0"
            max={ebtEligibleSubtotal.toFixed(2)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={processingPayment || totalAmount === 0}
          />
          {ebtPaymentAmount > ebtEligibleSubtotal + 0.001 && (
              <p style={{ color: 'orange', fontSize: '0.9em', marginTop: '5px' }}>
                  Warning: EBT amount exceeds EBT-eligible items. It will be capped by payment system.
              </p>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1em', fontWeight: 'bold', marginBottom: '15px' }}>
          <span>Remaining to pay (Regular Tender):</span>
          <span>${remainingRegularPayment.toFixed(2)}</span>
        </div>
        <button
          onClick={handleProcessPayment}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1.2em',
            opacity: processingPayment || totalAmount === 0 ? 0.7 : 1,
          }}
          disabled={processingPayment || totalAmount === 0}
        >
          {processingPayment ? 'Processing Payment...' : 'Process Payment'}
        </button>
        {paymentMessage && (
          <p
            style={{
              marginTop: '15px',
              textAlign: 'center',
              color: paymentSuccess ? 'green' : 'red',
              fontWeight: 'bold',
            }}
          >
            {paymentMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default GrocerEaseCheckoutPage;