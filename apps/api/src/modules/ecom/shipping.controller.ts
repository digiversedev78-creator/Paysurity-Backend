import { Controller } from '@nestjs/common';
import { Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

// Mock types to satisfy Rule 3 (no imports from specific paysurity paths)
interface CartItem {
  productId: string;
  quantity: number;
  weight: number; // weight per unit of product, in grams or kg
}

interface ShippingCalculationResult {
  amount: number;
  carrier: string;
  estimatedDeliveryDate: string; // YYYY-MM-DD
}

interface ShipmentCreationResult {
  shipmentId: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
}

enum FulfillmentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('ecom/shipping')
export class ShippingController {
  private readonly logger = new Logger(ShippingController.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService, // AuditLogService is assumed to be provided by the module
  ) {}

  /**
   * Calculates shipping costs for a given cart and destination.
   * Looks up tenant-specific shipping rates (flat or table-based by weight/zone).
   */
  async calculateShipping(
    tenantId: string,
    cartItems: CartItem[],
    destinationZip: string,
  ): Promise<ShippingCalculationResult> {
    this.logger.debug(`Calculating shipping for tenant ${tenantId}, destination ${destinationZip}`);

    if (!cartItems || cartItems.length === 0) {
      // If no items, shipping is free. Estimate a short delivery time.
      const estimatedDeliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return { amount: 0, carrier: 'N/A', estimatedDeliveryDate };
    }

    const totalWeight = cartItems.reduce((sum, item) => sum + item.weight * item.quantity, 0); // Sum of all item weights

    // 1. Get tenant's shipping configuration
    const configResult = await (this.db as any).execute(sql`
      SELECT id, rate_type, default_carrier
      FROM ecom_shipping_configs
      WHERE tenant_id = ${tenantId}
      LIMIT 1;
    `);

    const config = (configResult as any).rows[0];

    if (!config) {
      this.logger.warn(`No shipping configuration found for tenant ${tenantId}. Defaulting to flat rate $10.`);
      const estimatedDeliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return { amount: 10.00, carrier: 'Default Carrier', estimatedDeliveryDate };
    }

    let shippingAmount: number | null = null;
    let carrier: string = config.default_carrier || 'Standard Shipping';

    if (config.rate_type === 'FLAT') {
      // 2. Fetch flat rate
      const flatRateResult = await (this.db as any).execute(sql`
        SELECT rate_amount, carrier
        FROM ecom_shipping_flat_rates
        WHERE tenant_id = ${tenantId} AND config_id = ${config.id}
        LIMIT 1;
      `);
      const flatRate = (flatRateResult as any).rows[0];
      if (flatRate) {
        shippingAmount = parseFloat(flatRate.rate_amount);
        carrier = flatRate.carrier;
      } else {
        this.logger.warn(`No flat rate found for config ${config.id} of tenant ${tenantId}. Using a fallback.`);
        shippingAmount = 10.00; // Fallback if config exists but no specific flat rate
      }
    } else if (config.rate_type === 'TABLE') {
      // 2. Determine shipping zone based on destination zip
      const zoneResult = await (this.db as any).execute(sql`
        SELECT id, zone_name
        FROM ecom_shipping_zones
        WHERE tenant_id = ${tenantId}
          AND ${destinationZip} ~ zip_codes_regex -- Assumes zip_codes_regex is a valid PostgreSQL regex pattern
        LIMIT 1;
      `);
      const zone = (zoneResult as any).rows[0];

      if (!zone) {
        this.logger.warn(`No shipping zone found for destination zip ${destinationZip} for tenant ${tenantId}. Defaulting to fallback rate.`);
        shippingAmount = 15.00; // Fallback if no zone matches
      } else {
        // 3. Fetch table rate by weight and zone
        const tableRateResult = await (this.db as any).execute(sql`
          SELECT rate_amount, carrier
          FROM ecom_shipping_table_rates
          WHERE tenant_id = ${tenantId}
            AND config_id = ${config.id}
            AND shipping_zone_id = ${zone.id}
            AND ${totalWeight} >= weight_min
            AND ${totalWeight} < weight_max -- Assumes exclusive upper bound
          LIMIT 1;
        `);
        const tableRate = (tableRateResult as any).rows[0];

        if (tableRate) {
          shippingAmount = parseFloat(tableRate.rate_amount);
          carrier = tableRate.carrier;
        } else {
          this.logger.warn(`No table rate found for weight ${totalWeight} in zone ${zone.zone_name} for tenant ${tenantId}. Using a fallback.`);
          shippingAmount = 20.00; // Fallback if no rate matches weight range in zone
        }
      }
    } else {
      this.logger.error(`Unknown rate_type "${config.rate_type}" for tenant ${tenantId}. Defaulting to generic rate.`);
      shippingAmount = 12.00; // Generic fallback for unrecognized rate type
    }

    // Ensure shippingAmount is not null, apply a final fallback if necessary
    if (shippingAmount === null) {
      shippingAmount = 10.00;
    }

    const estimatedDeliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Simple estimate: 5 days from now

    return {
      amount: parseFloat(shippingAmount.toFixed(2)),
      carrier: carrier,
      estimatedDeliveryDate: estimatedDeliveryDate,
    };
  }

  /**
   * Creates a new shipment for an order.
   * This method simulates calling an external shipping provider API and records the details in the DB.
   */
  async createShipment(orderId: string, userId: string): Promise<ShipmentCreationResult> {
    this.logger.log(`Attempting to create shipment for order ${orderId} initiated by user ${userId}.`);

    // First, retrieve tenantId from the order to ensure tenant-scoped operations
    const orderResult = await (this.db as any).execute(sql`
      SELECT tenant_id
      FROM ecom_orders
      WHERE id = ${orderId}
      LIMIT 1;
    `);
    const order = (orderResult as any).rows[0];

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    const { tenant_id: tenantId } = order;

    // Simulate an external API call to create a shipment with a carrier
    // In a real application, this would involve integrating with FedEx, UPS, USPS APIs etc.
    const simulatedCarrier = 'FedEx'; // This would typically be determined by the shipping calculation or chosen by the user
    const simulatedTrackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const simulatedTrackingUrl = this.getTrackingUrl(simulatedTrackingNumber, simulatedCarrier, tenantId);

    // Record the newly created shipment in the database
    const shipmentResult = await (this.db as any).execute(sql`
      INSERT INTO ecom_shipments (id, tenant_id, order_id, carrier, tracking_number, status, tracking_url)
      VALUES (gen_random_uuid(), ${tenantId}, ${orderId}, ${simulatedCarrier}, ${simulatedTrackingNumber}, ${FulfillmentStatus.PROCESSING}, ${simulatedTrackingUrl})
      RETURNING id;
    `);

    const shipmentId = (shipmentResult as any).rows[0].id;

    // Update the order's fulfillment status to PROCESSING
    await (this.db as any).execute(sql`
      UPDATE ecom_orders
      SET fulfillment_status = ${FulfillmentStatus.PROCESSING}, updated_at = NOW()
      WHERE id = ${orderId} AND tenant_id = ${tenantId};
    `);

    // Record the action in the audit log
    (this.auditLogService as any).record(tenantId, {
      userId: userId,
      action: 'SHIPMENT_CREATED',
      details: { orderId, shipmentId, carrier: simulatedCarrier, trackingNumber: simulatedTrackingNumber },
    });

    this.logger.log(`Shipment ${shipmentId} created for order ${orderId} with tracking number ${simulatedTrackingNumber}.`);

    return {
      shipmentId: shipmentId,
      trackingNumber: simulatedTrackingNumber,
      carrier: simulatedCarrier,
      trackingUrl: simulatedTrackingUrl,
    };
  }

  /**
   * Generates a carrier-specific tracking URL for a given tracking number.
   * In a production environment, this might query tenant-specific carrier configurations from the DB.
   */
  getTrackingUrl(trackingNumber: string, carrier: string, tenantId: string): string {
    let baseUrl: string;
    // Hardcoded tracking URL templates for common carriers.
    // In a robust system, these would be configurable per tenant in the database.
    switch (carrier.toLowerCase()) {
      case 'fedex':
        baseUrl = 'https://www.fedex.com/fedextracking/online/track/summary?trackNumberA=';
        break;
      case 'ups':
        baseUrl = 'https://www.ups.com/track?tracknum=';
        break;
      case 'usps':
        baseUrl = 'https://tools.usps.com/go/TrackConfirmAction?tLabels=';
        break;
      case 'dhl':
        baseUrl = 'https://www.dhl.com/global-en/home/tracking/tracking-parcel.html?submit=1&trackingCode=';
        break;
      default:
        this.logger.warn(`Unknown carrier "${carrier}" for tenant ${tenantId}. Using generic tracking URL fallback.`);
        baseUrl = 'https://example.com/track?id='; // Fallback generic tracking URL
        break;
    }
    return `${baseUrl}${trackingNumber}`;
  }

  /**
   * Updates the fulfillment status of an order and all its associated shipments.
   */
  async updateFulfillmentStatus(
    orderId: string,
    status: FulfillmentStatus,
    userId: string, // The user or system process that initiated the status update
  ): Promise<void> {
    this.logger.log(`Updating fulfillment status for order ${orderId} to ${status} by user ${userId}.`);

    // Retrieve tenantId from the order to ensure tenant-scoped operations
    const orderResult = await (this.db as any).execute(sql`
      SELECT tenant_id
      FROM ecom_orders
      WHERE id = ${orderId}
      LIMIT 1;
    `);
    const order = (orderResult as any).rows[0];

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    const { tenant_id: tenantId } = order;

    // Update the order's fulfillment status
    await (this.db as any).execute(sql`
      UPDATE ecom_orders
      SET fulfillment_status = ${status}, updated_at = NOW()
      WHERE id = ${orderId} AND tenant_id = ${tenantId};
    `);

    // Update all associated shipments' statuses.
    // If an order has multiple shipments (e.g., partial fulfillment), all will be updated to this status.
    await (this.db as any).execute(sql`
      UPDATE ecom_shipments
      SET status = ${status}, updated_at = NOW()
      WHERE order_id = ${orderId} AND tenant_id = ${tenantId};
    `);

    // Record the status update in the audit log
    (this.auditLogService as any).record(tenantId, {
      userId: userId,
      action: 'FULFILLMENT_STATUS_UPDATED',
      details: { orderId, newStatus: status },
    });

    this.logger.log(`Fulfillment status for order ${orderId} successfully updated to ${status}.`);
  }
}






