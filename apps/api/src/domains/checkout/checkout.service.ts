// @reusable:grocerease @origin:POSR
/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-015 -- FDA Tobacco/Age Compliance
 *               GE-POS-Checkout -- Grocery POS Checkout
 * FILE TYPE:    SERVICE
 * MODULE:       checkout
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-073
 * GENERATED:    2026-03-17T13:09:27.898Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
// @reusable:grocerease
// This file is part of PaySurity-Platform-2026.
// Copyright (C) 2026, PaySurity. All Rights Reserved.
// POSG-015: FDA Tobacco/Age Compliance - Orders Service
// GE-POS-Checkout: Grocery POS Checkout - Core Service

// Import Request type for req.user
// For generating UUIDs

// DTOs for incoming requests
interface ScanItemDto {
  barcode: string;
  quantity?: number;
}

interface UpdateItemQuantityDto {
  productId: string;
  quantity: number;
}

interface ApplyPromotionDto {
  promotionCode: string;
}

interface VerifyAgeDto {
  customerDateOfBirth: string; // YYYY-MM-DD
}

interface AddressDto {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string; // e.g., 'CA', 'NY'
  postalCode: string;
  country: string;
}

// Internal interfaces for cart items and promotions
interface CheckoutItem {
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  isAgeRestricted: boolean;
  minimumAge: number;
  taxCategoryId: string;
  taxRate: number; // Applied at the time of calculation based on state/category
  isEbtEligible: boolean;
  itemTotal: number; // quantity * unitPrice
  taxAmount: number;
  discountAmount: number;
  finalPrice: number; // itemTotal - discountAmount + taxAmount
}

interface CheckoutPromotion {
  promotionId: string;
  code: string;
  description: string;
  discountAmount: number;
  appliesTo: 'item' | 'order';
}

interface CheckoutSession {
  id: string; // Internal session ID or temporary order ID
  tenantId: string;
  userId: string; // User associated with the cart
  status: 'pending' | 'pending_payment' | 'completed' | 'canceled';
  items: CheckoutItem[];
  promotions: CheckoutPromotion[];
  shippingAddress?: AddressDto;
  billingAddress?: AddressDto;
  subtotal: number; // Sum of item totals before tax and discounts
  totalDiscount: number; // Sum of all discounts
  totalTax: number; // Sum of all taxes
  shippingCost: number;
  ebtEligibleTotal: number; // Sum of final prices for EBT eligible items
  nonEbtEligibleTotal: number; // Sum of final prices for non-EBT eligible items
  grandTotal: number; // Final amount due (subtotal - totalDiscount + totalTax + shippingCost)
  ageVerified: boolean; // Flag if age verification was performed for age-restricted items
  requiresAgeVerification: boolean; // Flag if any item in the cart requires age verification
  paymentIntentId?: string; // Stripe Payment Intent ID
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // For TTL
}
