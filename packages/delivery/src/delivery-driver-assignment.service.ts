import { Injectable, Inject, NotFoundException, BadRequestException ,
  Optional} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { orders, deliveryDrivers } from '@paysurity/database';
import { QueryResultRow } from 'pg';

// Infer Drizzle types for better type safety despite raw SQL execution
type Order = typeof orders.$inferSelect;
type Driver = typeof deliveryDrivers.$inferSelect;
type InsertDriver = typeof deliveryDrivers.$inferInsert;
type UpdateDriver = Partial<Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>>;
type DriverStatus = 'available' | 'on-load' | 'off-duty' | 'inactive';

@Injectable()
export class DeliveryDriverAssignmentService {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  /**
   * Registers a new delivery driver.
   * @param driverData - The data for the new driver.
   * @returns The registered driver's profile.
   */
  async registerDriver(driverData: Omit<InsertDriver, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>, tenantId: string): Promise<Driver> {
    const { name, contactEmail, contactPhone, cdlNumber, cdlExpiryDate, insuranceProvider, insurancePolicyNumber, insuranceExpiryDate, status = 'off-duty' } = driverData;

    if (!name || !contactEmail || !cdlNumber) {
      throw new BadRequestException('Driver name, contact email, and CDL number are required.');
    }

    const insertQuery = `
      INSERT INTO delivery_drivers (tenant_id, name, contact_email, contact_phone, cdl_number, cdl_expiry_date, insurance_provider, insurance_policy_number, insurance_expiry_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const params = [
      tenantId,
      name,
      contactEmail,
      contactPhone,
      cdlNumber,
      cdlExpiryDate ? cdlExpiryDate.toISOString() : null,
      insuranceProvider,
      insurancePolicyNumber,
      insuranceExpiryDate ? insuranceExpiryDate.toISOString() : null,
      status
    ];

    const result = await (this.db as any).execute(insertQuery, params);
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to register driver.');
    }
    return (result.rows as any)[0] as Driver;
  }

  /**
   * Updates an existing driver's profile.
   * @param driverId - The ID of the driver to update.
   * @param updateData - The fields to update.
   * @param tenantId - The tenant ID.
   * @returns The updated driver's profile, or null if not found.
   */
  async updateDriverProfile(driverId: string, updateData: UpdateDriver, tenantId: string): Promise<Driver | null> {
    const fieldsToUpdate: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const key in updateData) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        // Convert camelCase to snake_case for database columns
        const dbColumnName = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        if (dbColumnName === 'cdl_expiry_date' || dbColumnName === 'insurance_expiry_date') {
          // Handle Date objects
          fieldsToUpdate.push(`${dbColumnName} = $${paramIndex++}`);
          params.push((updateData as any)[key] ? (updateData as any)[key].toISOString() : null);
        } else if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'tenantId') {
          fieldsToUpdate.push(`${dbColumnName} = $${paramIndex++}`);
          params.push((updateData as any)[key]);
        }
      }
    }

    if (fieldsToUpdate.length === 0) {
      return this.getDriverProfile(driverId, tenantId); // No updates, return current profile
    }

    params.push(driverId, tenantId); // Add driverId and tenantId for WHERE clause

    const updateQuery = `
      UPDATE delivery_drivers
      SET ${fieldsToUpdate.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING *;
    `;

    const result = await (this.db as any).execute(updateQuery, params);
    return result.rows.length > 0 ? (result.rows[0] as Driver) : null;
  }

  /**
   * Updates a driver's status.
   * @param driverId - The ID of the driver.
   * @param newStatus - The new status ('available', 'on-load', 'off-duty', 'inactive').
   * @param tenantId - The tenant ID.
   * @returns The updated driver's profile, or null if not found.
   */
  async updateDriverStatus(driverId: string, newStatus: DriverStatus, tenantId: string): Promise<Driver | null> {
    if (!['available', 'on-load', 'off-duty', 'inactive'].includes(newStatus)) {
      throw new BadRequestException(`Invalid driver status: ${newStatus}`);
    }

    const updateQuery = `
      UPDATE delivery_drivers
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND tenant_id = $3
      RETURNING *;
    `;
    const params = [newStatus, driverId, tenantId];

    const result = await (this.db as any).execute(updateQuery, params);
    return result.rows.length > 0 ? (result.rows[0] as Driver) : null;
  }

  /**
   * Retrieves a driver's profile by ID.
   * @param driverId - The ID of the driver.
   * @param tenantId - The tenant ID.
   * @returns The driver's profile, or null if not found.
   */
  async getDriverProfile(driverId: string, tenantId: string): Promise<Driver | null> {
    const selectQuery = `
      SELECT * FROM delivery_drivers
      WHERE id = $1 AND tenant_id = $2
      LIMIT 1;
    `;
    const params = [driverId, tenantId];

    const result = await (this.db as any).execute(selectQuery, params);
    return result.rows.length > 0 ? (result.rows[0] as Driver) : null;
  }

  /**
   * Retrieves all drivers for a given tenant, optionally filtered by status.
   * @param tenantId - The tenant ID.
   * @param status - Optional status to filter drivers by.
   * @returns An array of drivers.
   */
  async getDrivers(tenantId: string, status?: DriverStatus): Promise<Driver[]> {
    let selectQuery = `
      SELECT * FROM delivery_drivers
      WHERE tenant_id = $1
    `;
    const params = [tenantId];

    if (status) {
      selectQuery += ` AND status = $2`;
      params.push(status);
    }

    const result = await (this.db as any).execute(selectQuery, params);
    return result.rows as Driver[];
  }

  /**
   * Retrieves drivers whose CDL or insurance documents are expiring within a given number of days.
   * @param daysAhead - Number of days to look ahead for expiry.
   * @param tenantId - The tenant ID.
   * @returns An array of drivers with expiring documents.
   */
  async getExpiringDriverDocuments(daysAhead: number, tenantId: string): Promise<Driver[]> {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + daysAhead);

    const selectQuery = `
      SELECT * FROM delivery_drivers
      WHERE tenant_id = $1 AND (
        (cdl_expiry_date IS NOT NULL AND cdl_expiry_date <= $2) OR
        (insurance_expiry_date IS NOT NULL AND insurance_expiry_date <= $2)
      ) AND status != 'inactive';
    `;
    const params = [tenantId, expiryThreshold.toISOString()];

    const result = await (this.db as any).execute(selectQuery, params);
    return result.rows as Driver[];
  }

  /**
   * Assigns a driver to an order.
   * Updates order status to 'assigned' and driver status to 'on-load'.
   * @param orderId - The ID of the order.
   * @param driverId - The ID of the driver.
   * @param tenantId - The tenant ID.
   * @returns The updated order.
   */
  async assignDriverToOrder(orderId: string, driverId: string, tenantId: string): Promise<Order | null> {
    // 1. Check if driver exists and is available
    const driverResult = await (this.db as any).execute(
      `SELECT id, status FROM delivery_drivers WHERE id = $1 AND tenant_id = $2 LIMIT 1;`,
      [driverId, tenantId]
    );

    if (driverResult.rows.length === 0) {
      throw new NotFoundException('Delivery driver not found.');
    }
    const driver = driverResult.rows[0];
    if (driver.status !== 'available' && driver.status !== 'off-duty') { // Allow 'off-duty' to be assigned if system logic permits
      throw new BadRequestException(`Delivery driver is not available. Current status: ${driver.status}.`);
    }

    // Use a transaction for atomicity
    const client = await (this.db as any).execute.transaction();
    try {
      // 2. Update order with driverId and status
      const updatedOrdersResult = await client.execute(
        `UPDATE orders
         SET driver_id = $1, status = 'assigned', updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3 AND driver_id IS NULL AND status = 'pending'
         RETURNING *;`,
        [driverId, orderId, tenantId]
      );

      if (updatedOrdersResult.rows.length === 0) {
        // Check why it failed
        const existingOrderResult = await client.execute(
          `SELECT id, driver_id FROM orders WHERE id = $1 AND tenant_id = $2 LIMIT 1;`,
          [orderId, tenantId]
        );

        if (existingOrderResult.rows.length === 0) {
          throw new NotFoundException('Order not found.');
        } else if (existingOrderResult.rows[0].driver_id) {
          throw new BadRequestException('Order is already assigned to a driver.');
        } else {
          throw new BadRequestException('Order cannot be assigned in its current state (not pending).');
        }
      }

      // 3. Update driver status to 'on-load'
      await client.execute(
        `UPDATE delivery_drivers
         SET status = 'on-load', updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2;`,
        [driverId, tenantId]
      );

      await client.commit();
      return (updatedOrdersResult.rows as any)[0] as Order;

    } catch (error) {
      await client.rollback();
      throw error;
    }
  }

  /**
   * Retrieves an assignment by order ID, including driver details.
   * @param orderId - The ID of the order.
   * @param tenantId - The tenant ID.
   * @returns The order with driver details, or null if not found.
   */
  async getAssignmentByOrderId(orderId: string, tenantId: string): Promise<(Order & { driver?: Driver }) | null> {
    const selectQuery = `
      SELECT
        o.*,
        dd.id AS driver_id_alias, dd.name AS driver_name, dd.contact_email AS driver_contact_email,
        dd.contact_phone AS driver_contact_phone, dd.cdl_number AS driver_cdl_number,
        dd.cdl_expiry_date AS driver_cdl_expiry_date, dd.insurance_provider AS driver_insurance_provider,
        dd.insurance_policy_number AS driver_insurance_policy_number,
        dd.insurance_expiry_date AS driver_insurance_expiry_date, dd.status AS driver_status
      FROM orders o
      LEFT JOIN delivery_drivers dd ON o.driver_id = dd.id AND o.tenant_id = dd.tenant_id
      WHERE o.id = $1 AND o.tenant_id = $2
      LIMIT 1;
    `;
    const params = [orderId, tenantId];

    const result = await (this.db as any).execute(selectQuery, params);

    if (result.rows.length === 0) {
      return null;
    }

    const row: QueryResultRow = result.rows[0];
    const order: Order = {
      id: row.id,
      tenantId: row.tenant_id,
      status: row.status,
      driverId: row.driver_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // Add other order specific fields as needed
    } as Order;

    let driver: Driver | undefined;
    if (row.driver_id_alias) { // Check if driver joined successfully
      driver = {
        id: row.driver_id_alias,
        tenantId: row.tenant_id,
        name: row.driver_name,
        contactEmail: row.driver_contact_email,
        contactPhone: row.driver_contact_phone,
        cdlNumber: row.driver_cdl_number,
        cdlExpiryDate: row.driver_cdl_expiry_date,
        insuranceProvider: row.driver_insurance_provider,
        insurancePolicyNumber: row.driver_insurance_policy_number,
        insuranceExpiryDate: row.driver_insurance_expiry_date,
        status: row.driver_status,
        createdAt: row.created_at, // Assuming driver has these fields, need to map correctly
        updatedAt: row.updated_at,
        // Map other driver specific fields
      } as Driver;
    }

    if (driver) {
      return { ...order, driver };
    }
    return order;
  }

  /**
   * Retrieves all orders assigned to a specific driver.
   * @param driverId - The ID of the driver.
   * @param tenantId - The tenant ID.
   * @returns An array of orders.
   */
  async getAssignmentsByDriverId(driverId: string, tenantId: string): Promise<Order[]> {
    const selectQuery = `
      SELECT * FROM orders
      WHERE driver_id = $1 AND tenant_id = $2;
    `;
    const params = [driverId, tenantId];

    const result = await (this.db as any).execute(selectQuery, params);
    return result.rows as Order[];
  }

  /**
   * Updates an existing driver assignment for an order.
   * Can reassign to a new driver or unassign the order.
   * @param orderId - The ID of the order.
   * @param newDriverId - The ID of the new driver, or null to unassign.
   * @param tenantId - The tenant ID.
   * @returns The updated order.
   */
  async updateDriverAssignment(orderId: string, newDriverId: string | null, tenantId: string): Promise<Order | null> {
    // Start a transaction
    const client = await (this.db as any).execute.transaction();
    try {
      let currentDriverId: string | null = null;
      let orderStatus: string;

      // 1. Get current order and driver status
      const currentOrderResult = await client.execute(
        `SELECT driver_id, status FROM orders WHERE id = $1 AND tenant_id = $2 FOR UPDATE;`, // FOR UPDATE to lock row
        [orderId, tenantId]
      );

      if (currentOrderResult.rows.length === 0) {
        throw new NotFoundException('Order not found.');
      }
      currentDriverId = currentOrderResult.rows[0].driver_id;

      if (newDriverId !== null) {
        // Check new driver availability
        const newDriverResult = await client.execute(
          `SELECT id, status FROM delivery_drivers WHERE id = $1 AND tenant_id = $2 LIMIT 1;`,
          [newDriverId, tenantId]
        );

        if (newDriverResult.rows.length === 0) {
          throw new NotFoundException('New delivery driver not found.');
        }
        const newDriver = newDriverResult.rows[0];
        if (newDriver.status !== 'available' && newDriver.status !== 'off-duty') {
          throw new BadRequestException(`New delivery driver is not available. Current status: ${newDriver.status}.`);
        }
        orderStatus = 'reassigned';
      } else {
        orderStatus = 'pending_assignment';
      }

      // 2. Update the order
      const updatedOrdersResult = await client.execute(
        `UPDATE orders
         SET driver_id = $1, status = $2, updated_at = NOW()
         WHERE id = $3 AND tenant_id = $4
         RETURNING *;`,
        [newDriverId, orderStatus, orderId, tenantId]
      );

      if (updatedOrdersResult.rows.length === 0) {
        // This should not happen if the FOR UPDATE lock was successful, but as a safeguard.
        throw new Error('Failed to update order assignment.');
      }

      // 3. Update driver statuses
      if (currentDriverId && currentDriverId !== newDriverId) {
        // Set previous driver to 'available' or 'off-duty' based on logic (e.g., if they have other loads)
        // For simplicity, setting to 'available' if no other 'on-load' orders, otherwise 'off-duty'
        const activeLoadsForOldDriver = await client.execute(
            `SELECT COUNT(*) FROM orders WHERE driver_id = $1 AND tenant_id = $2 AND status IN ('assigned', 'in_transit');`,
            [currentDriverId, tenantId]
        );
        const oldDriverNewStatus = (activeLoadsForOldDriver.rows[0].count > 0) ? 'on-load' : 'available';

        await client.execute(
          `UPDATE delivery_drivers
           SET status = $1, updated_at = NOW()
           WHERE id = $2 AND tenant_id = $3;`,
          [oldDriverNewStatus, currentDriverId, tenantId]
        );
      }

      if (newDriverId) {
        // Set new driver to 'on-load'
        await client.execute(
          `UPDATE delivery_drivers
           SET status = 'on-load', updated_at = NOW()
           WHERE id = $1 AND tenant_id = $2;`,
          [newDriverId, tenantId]
        );
      }

      await client.commit();
      return (updatedOrdersResult.rows as any)[0] as Order;
    } catch (error) {
      await client.rollback();
      throw error;
    }
  }
}
