'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

// Define the shape of a cart item
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// Define the shape of the cart estimates
interface CartEstimates {
  subtotal: number;
  shipping: number;
  tax: number;
}

// Define the shape of a promo response
interface PromoResponse {
  discountAmount: number;
  message: string;
}

// Define the shape of a checkout success response
interface CheckoutResponse {
  orderId: string;
  message: string;
}

export default function CartPage() {
  const router = useRouter(); // Initialize router for navigation

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [estimates, setEstimates] = useState<CartEstimates>({ subtotal: 0, shipping: 0, tax: 0 });

  const [isLoadingCart, setIsLoadingCart] = useState<boolean>(true);
  const [isLoadingEstimates, setIsLoadingEstimates] = useState<boolean>(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMessage, setPromoSuccessMessage] = useState<string | null>(null);
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState<string | null>(null);

  // Calculate total: subtotal - discount + shipping + tax
  const total = estimates.subtotal - promoDiscount + estimates.shipping + estimates.tax;

  // Helper to save cart to localStorage and update state
  const updateCartInLocalStorage = useCallback((newCart: CartItem[]) => {
    localStorage.setItem('paySurityCart', JSON.stringify(newCart));
    setCartItems(newCart);
  }, []);

  // Fetch estimates (shipping, tax, subtotal from server)
  const fetchEstimates = useCallback(async (currentCart: CartItem[]) => {
    if (currentCart.length === 0) {
      setEstimates({ subtotal: 0, shipping: 0, tax: 0 });
      setPromoDiscount(0); // Clear promo if cart becomes empty
      return;
    }

    setIsLoadingEstimates(true);
    setError(null); // Clear general errors
    try {
      const response = await fetch('/api/checkout/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: currentCart }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch estimates');
      }

      const data: CartEstimates = await response.json();
      setEstimates(data);
    } catch (err: any) {
      setError(err.message);
      setEstimates({ subtotal: 0, shipping: 0, tax: 0 }); // Reset estimates on error
    } finally {
      setIsLoadingEstimates(false);
    }
  }, []);

  // Debounced version of fetchEstimates to limit API calls on rapid changes
  const debouncedFetchEstimates = useCallback(
    (currentCart: CartItem[]) => {
      const handler = setTimeout(() => {
        fetchEstimates(currentCart);
      }, 500); // Debounce for 500ms
      return () => clearTimeout(handler);
    },
    [fetchEstimates]
  );

  // Effect to load cart from localStorage on component mount
  useEffect(() => {
    setIsLoadingCart(true);
    try {
      const storedCart = localStorage.getItem('paySurityCart');
      if (storedCart) {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        setCartItems(parsedCart);
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
      setError('Failed to load your cart. Please try again.');
    } finally {
      setIsLoadingCart(false);
    }
  }, []); // Run only once on mount

  // Effect to re-fetch estimates whenever cartItems change
  useEffect(() => {
    const cleanup = debouncedFetchEstimates(cartItems);
    return cleanup;
  }, [cartItems, debouncedFetchEstimates]);

  // Handle quantity change for a cart item
  const handleQuantityChange = useCallback((id: string, newQuantity: number) => {
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    );
    updateCartInLocalStorage(updatedCart);
  }, [cartItems, updateCartInLocalStorage]);

  // Handle removing an item from the cart
  const handleRemoveItem = useCallback((id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    updateCartInLocalStorage(updatedCart);
    setPromoDiscount(0); // Clear promo discount if an item is removed
    setPromoError(null);
    setPromoSuccessMessage(null);
  }, [cartItems, updateCartInLocalStorage]);

  // Apply promo code logic
  const applyPromoCode = useCallback(async () => {
    if (!promoCode || cartItems.length === 0) {
      setPromoError('Please enter a promo code and ensure your cart is not empty.');
      setPromoSuccessMessage(null);
      setPromoDiscount(0);
      return;
    }

    setIsApplyingPromo(true);
    setPromoError(null);
    setPromoSuccessMessage(null);

    try {
      const response = await fetch('/api/checkout/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode, cartItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply promo code.');
      }

      const data: PromoResponse = await response.json();
      setPromoDiscount(data.discountAmount);
      setPromoSuccessMessage(data.message || `Promo code '${promoCode}' applied successfully!`);
    } catch (err: any) {
      setPromoDiscount(0);
      setPromoError(err.message);
    } finally {
      setIsApplyingPromo(false);
    }
  }, [promoCode, cartItems]);

  // Handle checkout process
  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsCheckingOut(true);
    setError(null);
    setCheckoutSuccessMessage(null);

    try {
      const response = await fetch('/api/checkout/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          promoCode: promoCode || undefined, // Only send if a code was entered
          promoDiscount,
          shippingEstimate: estimates.shipping,
          taxEstimate: estimates.tax,
          totalAmount: total,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process checkout.');
      }

      const data: CheckoutResponse = await response.json();
      setCheckoutSuccessMessage(data.message || 'Checkout successful!');
      localStorage.removeItem('paySurityCart'); // Clear cart after successful checkout
      setCartItems([]); // Clear local state
      setPromoCode(''); // Clear promo code
      setPromoDiscount(0); // Clear promo discount
      setEstimates({ subtotal: 0, shipping: 0, tax: 0 }); // Reset estimates

      router.push(`/order-confirmation?orderId=${data.orderId}`); // Redirect to order confirmation page
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, promoCode, promoDiscount, estimates, total, router]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Shopping Cart</h1>

      {/* General Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {checkoutSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {checkoutSuccessMessage}</span>
        </div>
      )}

      {/* Cart Loading State */}
      {isLoadingCart ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading your cart...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mt-4"></div>
        </div>
      ) : cartItems.length === 0 ? (
        // Empty Cart State
        <div className="text-center py-12 bg-white shadow-md rounded-lg">
          <p className="text-xl text-gray-700 mb-4">Your cart is empty.</p>
          <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        // Cart Content Display
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Items in Cart</h2>
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row items-center py-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md mr-4 mb-4 md:mb-0"
                    />
                  )}
                  <div className="flex-grow text-center md:text-left">
                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium text-gray-900 w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mt-4 md:mt-0 md:ml-auto">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-6 h-fit">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Order Summary</h2>

            {isLoadingEstimates && (
              <div className="text-center py-4">
                <p className="text-gray-600">Calculating estimates...</p>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mt-2"></div>
              </div>
            )}

            {!isLoadingEstimates && (
              <>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-900 font-medium">${estimates.subtotal.toFixed(2)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200 text-green-600">
                    <span className="font-medium">Promo Discount:</span>
                    <span className="font-medium">-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Shipping:</span>
                  <span className="text-gray-900 font-medium">{estimates.shipping === 0 ? 'Free' : `$${estimates.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Tax:</span>
                  <span className="text-gray-900 font-medium">${estimates.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-4 mt-2">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>
              </>
            )}

            {/* Promo Code Input */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Have a promo code?</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={isApplyingPromo || cartItems.length === 0}
                />
                <button
                  onClick={applyPromoCode}
                  disabled={isApplyingPromo || !promoCode || cartItems.length === 0}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplyingPromo ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {promoError && (
                <p className="text-red-500 text-sm mt-2">{promoError}</p>
              )}
              {promoSuccessMessage && (
                <p className="text-green-600 text-sm mt-2">{promoSuccessMessage}</p>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || cartItems.length === 0 || isLoadingEstimates}
              className="mt-8 w-full px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'Processing Checkout...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}