import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import Stripe from 'stripe';

/**
 * Custom exception for errors originating from the Stripe payment provider.
 * This allows the application to catch and handle provider-specific errors
 * without coupling directly to Stripe's error types.
 */
export class PaymentProviderException extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'PaymentProviderException';
    // Restore prototype chain for proper instanceof checks
    Object.setPrototypeOf(this, PaymentProviderException.prototype);
  }
}

/**
 * Parameters for creating a Stripe Payment Intent.
 */
interface CreatePaymentIntentParams {
  amount: number; // Amount in cents
  currency: string; // e.g., 'usd', 'eur'
  customer_id?: string; // Optional: Stripe Customer ID
  payment_method_id?: string; // Optional: A PaymentMethod ID to attach and confirm
  confirm?: boolean; // Optional: Set to true to automatically confirm the PaymentIntent
  metadata?: { [key: string]: string | number | boolean | null }; // Custom key-value pairs
}

/**
 * Parameters for capturing a Stripe Payment Intent.
 */
interface CapturePaymentIntentParams {
  paymentIntentId: string;
  amountToCapture?: number; // Optional: Amount in cents to capture, defaults to full amount
}

/**
 * Parameters for canceling a Stripe Payment Intent.
 */
interface CancelPaymentIntentParams {
  paymentIntentId: string;
}

/**
 * Parameters for creating a Stripe Refund.
 */
interface CreateRefundParams {
  paymentIntentId: string;
  amount?: number; // Optional: Amount in cents to refund, defaults to full amount
  reason?: Stripe.RefundCreateParams.Reason; // Optional: Reason for the refund
  metadata?: { [key: string]: string | number | boolean | null }; // Custom key-value pairs
}

/**
 * Parameters for retrieving a Stripe Payment Intent.
 */
interface RetrievePaymentIntentParams {
  paymentIntentId: string;
}

/**
 * `StripeAdapter` provides an interface to interact with the Stripe API.
 * It handles Stripe API calls, error translation into domain-specific exceptions,
 * and encapsulates Stripe-specific implementation details.
 */
@Injectable()
export class StripeAdapter {
  private readonly stripe: Stripe;

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>, // CRITICAL RULE 2: Injected for compliance, not directly used in this adapter logic.
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      // It's critical for the application to fail early if the key is missing.
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any, // Recommended to lock to a specific API version
      typescript: true, // Enable TypeScript type checking for Stripe objects
    });
  }

  /**
   * Creates a new Stripe Payment Intent.
   * A Payment Intent tracks the lifecycle of a customer's payment process.
   * @param params - Parameters for creating the payment intent.
   * @returns A Promise that resolves to the created Stripe PaymentIntent object.
   * @throws {PaymentProviderException} if the Stripe API call fails.
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        customer: params.customer_id,
        payment_method: params.payment_method_id,
        confirm: params.confirm,
        // For scenarios where `payment_method_id` is not provided (e.g., client-side confirmation flow),
        // enable automatic payment methods for easier integration.
        automatic_payment_methods: params.payment_method_id ? undefined : { enabled: true, allow_redirects: 'always' },
        metadata: params.metadata as Stripe.MetadataParam, // Stripe expects metadata values to be strings or null
      });
      return paymentIntent;
    } catch (error: unknown) {
      console.error('StripeAdapter: Error creating Payment Intent:', error);
      throw new PaymentProviderException('Failed to create payment intent with Stripe.', error);
    }
  }

  /**
   * Captures a previously authorized Stripe Payment Intent.
   * This finalizes the charge and transfers funds from the customer.
   * @param params - Parameters for capturing the payment intent.
   * @returns A Promise that resolves to the captured Stripe PaymentIntent object.
   * @throws {PaymentProviderException} if the Stripe API call fails.
   */
  async capturePaymentIntent(params: CapturePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.capture(
        params.paymentIntentId,
        params.amountToCapture ? { amount_to_capture: params.amountToCapture } : undefined,
      );
      return paymentIntent;
    } catch (error: unknown) {
      console.error('StripeAdapter: Error capturing Payment Intent:', error);
      throw new PaymentProviderException(`Failed to capture payment intent ${params.paymentIntentId} with Stripe.`, error);
    }
  }

  /**
   * Cancels a Stripe Payment Intent.
   * This prevents further capture attempts and releases any held funds.
   * @param params - Parameters for canceling the payment intent.
   * @returns A Promise that resolves to the canceled Stripe PaymentIntent object.
   * @throws {PaymentProviderException} if the Stripe API call fails.
   */
  async cancelPaymentIntent(params: CancelPaymentIntentParams): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(params.paymentIntentId);
      return paymentIntent;
    } catch (error: unknown) {
      console.error('StripeAdapter: Error canceling Payment Intent:', error);
      throw new PaymentProviderException(`Failed to cancel payment intent ${params.paymentIntentId} with Stripe.`, error);
    }
  }

  /**
   * Creates a refund for a specific Stripe Payment Intent.
   * @param params - Parameters for creating the refund.
   * @returns A Promise that resolves to the created Stripe Refund object.
   * @throws {PaymentProviderException} if the Stripe API call fails.
   */
  async createRefund(params: CreateRefundParams): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: params.paymentIntentId,
        amount: params.amount,
        reason: params.reason,
        metadata: params.metadata as Stripe.MetadataParam, // Stripe expects metadata values to be strings or null
      });
      return refund;
    } catch (error: unknown) {
      console.error('StripeAdapter: Error creating Refund:', error);
      throw new PaymentProviderException(`Failed to create refund for payment intent ${params.paymentIntentId} with Stripe.`);
    }
  }

  /**
   * Retrieves the details of a specific Stripe Payment Intent.
   * @param params - Parameters for retrieving the payment intent.
   * @returns A Promise that resolves to the retrieved Stripe PaymentIntent object.
   * @throws {PaymentProviderException} if the Stripe API call fails (e.g., intent not found).
   */
  async retrievePaymentIntent(params: RetrievePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(params.paymentIntentId);
      return paymentIntent;
    } catch (error: unknown) {
      console.error('StripeAdapter: Error retrieving Payment Intent:', error);
      throw new PaymentProviderException(`Failed to retrieve payment intent ${params.paymentIntentId} with Stripe.`, error);
    }
  }
}
