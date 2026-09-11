const raw: any = {};
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AuditLogService } from '../audit-log/audit-log.service';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for better type safety
interface CartItem {
  productId: string;
  quantity: number;
  weightGrams: number;
  price: number;
}

interface ShippingConfig {
  id: string;
  tenantId: string;
  type: 'FLAT_RATE' | 'TABLE_RATE';
  flatRateAmount: number | null;
  rateTableId: string | null;
}

interface Shipment {
  id: string;
  tenantId: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ShippingService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Calculates the shipping cost for a given tenant's cart items to a destination.
   * Supports flat rate and table rate (by weight/zone) configurations.
   * @param tenantId The ID of the tenant.
   * @param cartItems An array of items in the cart, including weight.
   * @param destinationZip The destination ZIP code.
   * @param userId The ID of the user performing the action (for audit logging).
   * @returns The calculated shipping cost.
   */
  async calculateShipping(
    tenantId: string,
    cartItems: CartItem[],
    destinationZip: string,
    userId: string, // Added userId for audit logging
  ): Promise<number> {
    const totalWeightGrams = cartItems.reduce((sum, item) => sum + (item.weightGrams * item.quantity), 0);

    // Fetch tenant's shipping configuration
    const configResult = await (this.db as any).execute(raw`
      SELECT id, tenant_id AS "tenantId", type, flat_rate_amount AS "flatRateAmount", rate_table_id AS "rateTableId"
      FROM ecom_shipping_configs
      WHERE tenant_id = ${tenantId}
      LIMIT 1;
    `);

    const config: ShippingConfig | undefined = (configResult as any).rows[0];

    if (!config) {
      await (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: {} as any,
        details: `No shipping configuration found for tenant ${tenantId}.`,
      });
      throw new NotFoundException(`No shipping configuration found for tenant ${tenantId}.`);
    }

    let shippingCost = 0;

    switch (config.type) {
      case 'FLAT_RATE':
        shippingCost = config.flatRateAmount || 0;
        break;
      case 'TABLE_RATE':
        if (!config.rateTableId) {
          throw new BadRequestException('Table rate configuration requires a rate table ID.');
        }

        // Find a matching rate from ecom_shipping_rate_zones
        // We'll use a simple prefix match for zip codes. Real systems might use complex geocoding.
        const rateZoneResult = await (this.db as any).execute(raw`
          SELECT rate_amount AS "rateAmount"
          FROM ecom_shipping_rate_zones
          WHERE tenant_id = ${tenantId}
            AND rate_table_id = ${config.rateTableId}
            AND ${destinationZip} LIKE zip_code_prefix || '%'
            AND ${totalWeightGrams} >= min_weight_g
            AND (${totalWeightGrams} < max_weight_g OR max_weight_g IS NULL)
          ORDER BY LENGTH(zip_code_prefix) DESC, min_weight_g DESC -- Prioritize more specific zip prefixes and higher min weights
          LIMIT 1;
        `);

        const rateZone = (rateZoneResult as any).rows[0];

        if (!rateZone) {
          await (this.auditLogService as any).record(tenantId, {
            userId: userId,
            action: {} as any,
            details: `No matching shipping rate found for tenant ${tenantId}, weight ${totalWeightGrams}g, and zip ${destinationZip}.`,
          });
          throw new NotFoundException('No matching shipping rate found for the given criteria.');
        }
        shippingCost = rateZone.rateAmount;
        break;
      default:
        throw new BadRequestException(`Unsupported shipping configuration type: ${config.type}.`);
    }

    await (this.auditLogService as any).record(tenantId, {
      userId: userId,
      action: {} as any,
      details: `Shipping cost for cart calculated: ${shippingCost} for tenant ${tenantId}.`,
    });

    return shippingCost;
  }

  /**
   * Creates a new shipment record for an order.
   * In a real-world scenario, this would integrate with a third-party shipping API.
   * For this task, it's a mock creation.
   * @param tenantId The ID of the tenant.
   * @param orderId The ID of the order to create a shipment for.
   * @param userId The ID of the user performing the action (for audit logging).
   * @returns The created shipment details.
   */
  async createShipment(tenantId: string, orderId: string, userId: string): Promise<Shipment> {
    // Mock carrier and tracking number generation
    const carrier = 'UPS'; // Could be dynamic based on tenant config or chosen rate
    const trackingNumber = `TRK-${uuidv4().substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const status = 'PENDING'; // Initial status

    const newShipmentId = uuidv4();

    await (this.db as any).execute(raw`
      INSERT INTO ecom_shipments (id, tenant_id, order_id, tracking_number, carrier, status, created_at, updated_at)
      VALUES (${newShipmentId}, ${tenantId}, ${orderId}, ${trackingNumber}, ${carrier}, ${status}, NOW(), NOW());
    `);

    const createdShipment: Shipment = {
      id: newShipmentId,
      tenantId,
      orderId,
      trackingNumber,
      carrier,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await (this.auditLogService as any).record(tenantId, {
      userId: userId,
      action: {} as any,
      details: `Shipment ${newShipmentId} created for order ${orderId} with tracking ${trackingNumber} by ${carrier}.`,
    });

    return createdShipment;
  }

  /**
   * Retrieves the tracking URL for a given tracking number and carrier.
   * @param trackingNumber The tracking number.
   * @param carrier The shipping carrier (e.g., 'UPS', 'FEDEX', 'USPS').
   * @returns The URL to track the shipment.
   */
  async getTrackingUrl(trackingNumber: string, carrier: string): Promise<string> {
    let baseUrl: string;

    switch (carrier.toUpperCase()) {
      case 'UPS':
        baseUrl = 'https://www.ups.com/track?tracknum=';
        break;
      case 'FEDEX':
        baseUrl = 'https://www.fedex.com/fedextrack/?tracknumbers=';
        break;
      case 'USPS':
        baseUrl = 'https://tools.usps.com/go/TrackConfirmAction?qtc_action=track&qtc_EMAILOPTIN=true&qtc_tLabels1=';
        break;
      case 'DHL':
        baseUrl = 'https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&trackingNumber=';
        break;
      default:
        throw new BadRequestException(`Unsupported carrier: ${carrier}`);
    }

    return `${baseUrl}${trackingNumber}`;
  }

  /**
   * Updates the fulfillment status of an order's shipment.
   * @param tenantId The ID of the tenant.
   * @param orderId The ID of the order whose shipment status is to be updated.
   * @param status The new fulfillment status (e.g., 'SHIPPED', 'DELIVERED', 'RETURNED').
   * @param userId The ID of the user performing the action (for audit logging).
   */
  async updateFulfillmentStatus(tenantId: string, orderId: string, status: string, userId: string): Promise<void> {
    // Validate status or ensure it's from a predefined list in a real system
    const validStatuses = ['PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      throw new BadRequestException(`Invalid fulfillment status: ${status}. Allowed statuses: ${validStatuses.join(', ')}`);
    }

    const updateResult = await (this.db as any).execute(raw`
      UPDATE ecom_shipments
      SET status = ${status},
          updated_at = NOW()
      WHERE tenant_id = ${tenantId} AND order_id = ${orderId};
    `);

    if (updateResult.rowCount === 0) {
      throw new NotFoundException(`No shipment found for order ${orderId} for tenant ${tenantId}.`);
    }

    await (this.auditLogService as any).record(tenantId, {
      userId: userId,
      action: {} as any,
      details: `Fulfillment status for order ${orderId} updated to ${status}.`,
    });
  }
}






