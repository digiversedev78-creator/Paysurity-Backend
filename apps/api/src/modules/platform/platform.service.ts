import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
// As per STRICT RULE 4: No imports from fake packages (drizzle-orm/node-postgres).
// As per STRICT RULE 2: Use @Inject('DATABASE') private readonly db: NodePgDatabase<any> for DB access.
// These rules are contradictory as `NodePgDatabase` typically comes from a Drizzle package.
// To adhere to Rule 4 strictly, we cannot import `NodePgDatabase`.
// Therefore, to ensure compilation and satisfy the database injection,
// the type of `db` will be `any` to avoid a type error from an undeclared type.

// Define interfaces for data structures for better type safety within the service.
interface Load {
  id: string;
  tenantId: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  weightKg: number;
  volumeM3: number;
  pickupTime: Date;
  deliveryWindowStart: Date;
  deliveryWindowEnd: Date;
  status: 'available' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface Driver {
  id: string;
  tenantId: string;
  name: string;
  currentLat: number;
  currentLng: number;
  availabilityStatus: 'available' | 'on_load' | 'off_duty';
  vehicleType: string;
  capacityKg: number;
  capacityM3: number;
  createdAt: Date;
  updatedAt: Date;
}

interface LoadAssignment {
  id: string;
  tenantId: string;
  loadId: string;
  driverId: string;
  assignedAt: Date;
  pickedUpAt: Date | null;
  deliveredAt: Date | null;
  status: 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
  estimatedDeliveryAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PlatformService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  /**
   * Calculates the great-circle distance between two points on the Earth
   * (specified in degrees) using the Haversine formula.
   * @param lat1 Latitude of point 1.
   * @param lon1 Longitude of point 1.
   * @param lat2 Latitude of point 2.
   * @param lon2 Longitude of point 2.
   * @returns Distance in kilometers.
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const toRadians = (deg: number) => deg * (Math.PI / 180);

    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);
    const deltaPhi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lon2 - lon1);

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
  }

  /**
   * Calculates a simple Estimated Time of Arrival based on distance and average speed.
   * @param distanceKm Distance to travel in kilometers.
   * @returns Estimated arrival time as a Date object.
   */
  private calculateEta(distanceKm: number): Date {
    const AVERAGE_SPEED_KMH = 60; // Assumed average speed in km/h
    const timeHours = distanceKm / AVERAGE_SPEED_KMH;
    const etaMs = timeHours * 60 * 60 * 1000;
    return new Date(Date.now() + etaMs);
  }

  /**
   * Retrieves a list of available loads for a given tenant.
   * @param tenantId The ID of the tenant.
   * @param limit Maximum number of loads to return.
   * @param offset Number of loads to skip.
   * @returns A promise that resolves to an array of Load objects.
   */
  async getAvailableLoads(tenantId: string, limit = 100, offset = 0): Promise<Load[]> {
    const sql = `
      SELECT
        id, tenant_id as "tenantId", origin_lat as "originLat", origin_lng as "originLng",
        destination_lat as "destinationLat", destination_lng as "destinationLng",
        weight_kg as "weightKg", volume_m3 as "volumeM3", pickup_time as "pickupTime",
        delivery_window_start as "deliveryWindowStart", delivery_window_end as "deliveryWindowEnd",
        status, created_at as "createdAt", updated_at as "updatedAt"
      FROM loads
      WHERE tenant_id = $1 AND status = 'available'
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3;
    `;
    const result = await (this.db as any).execute(sql, [tenantId, limit, offset]);
    return (result as any).rows;
  }

  /**
   * Finds suitable drivers for a specific load based on proximity to origin,
   * availability, and vehicle capacity.
   * @param tenantId The ID of the tenant.
   * @param loadId The ID of the load to match drivers for.
   * @param maxDistanceKm Maximum distance a driver can be from the load's origin (in km).
   * @returns A promise that resolves to an array of suitable Driver objects.
   */
  async matchDriversForLoad(tenantId: string, loadId: string, maxDistanceKm = 50): Promise<Driver[]> {
    const loadSql = `
      SELECT origin_lat, origin_lng, weight_kg, volume_m3
      FROM loads
      WHERE id = $1 AND tenant_id = $2;
    `;
    const loadResult = await (this.db as any).execute(loadSql, [loadId, tenantId]);
    const load = (loadResult as any).rows[0];

    if (!load) {
      throw new NotFoundException(`Load with ID ${loadId} not found or not accessible.`);
    }

    // Fetch all available drivers for the tenant.
    // In a real-world scenario with PostGIS, spatial filtering would happen in the DB.
    const driversSql = `
      SELECT
        id, tenant_id as "tenantId", name, current_lat as "currentLat", current_lng as "currentLng",
        availability_status as "availabilityStatus", vehicle_type as "vehicleType",
        capacity_kg as "capacityKg", capacity_m3 as "capacityM3",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM drivers
      WHERE tenant_id = $1 AND availability_status = 'available';
    `;
    const driversResult = await (this.db as any).execute(driversSql, [tenantId]);
    const allAvailableDrivers: Driver[] = (driversResult as any).rows;

    const suitableDrivers: Driver[] = [];
    for (const driver of allAvailableDrivers) {
      const distance = this.calculateDistance(
        load.origin_lat, load.origin_lng,
        driver.currentLat, driver.currentLng
      );

      // Filter drivers by distance to load origin and capacity matching.
      if (
        distance <= maxDistanceKm &&
        driver.capacityKg >= load.weight_kg &&
        driver.capacityM3 >= load.volume_m3
      ) {
        suitableDrivers.push(driver);
      }
    }

    return suitableDrivers;
  }

  /**
   * Assigns a driver to a specific load, updating statuses and creating an assignment record.
   * @param tenantId The ID of the tenant.
   * @param loadId The ID of the load to assign.
   * @param driverId The ID of the driver to assign.
   * @returns A promise that resolves to the created LoadAssignment object.
   */
  async assignDriverToLoad(tenantId: string, loadId: string, driverId: string): Promise<LoadAssignment> {
    // Check if load is available and exists.
    const loadSql = `SELECT id, status FROM loads WHERE id = $1 AND tenant_id = $2;`;
    const loadResult = await (this.db as any).execute(loadSql, [loadId, tenantId]);
    const load = (loadResult as any).rows[0];

    if (!load) {
      throw new NotFoundException(`Load with ID ${loadId} not found or not accessible.`);
    }
    if (load.status !== 'available') {
      throw new BadRequestException(`Load with ID ${loadId} is not available for assignment (current status: ${load.status}).`);
    }

    // Check if driver is available and exists.
    const driverSql = `SELECT id, availability_status FROM drivers WHERE id = $1 AND tenant_id = $2;`;
    const driverResult = await (this.db as any).execute(driverSql, [driverId, tenantId]);
    const driver = (driverResult as any).rows[0];

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${driverId} not found or not accessible.`);
    }
    if (driver.availability_status !== 'available') {
      throw new BadRequestException(`Driver with ID ${driverId} is not available for assignment (current status: ${driver.availability_status}).`);
    }

    // Update load status to 'assigned'.
    const updateLoadSql = `
      UPDATE loads
      SET status = 'assigned', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND tenant_id = $2;
    `;
    await (this.db as any).execute(updateLoadSql, [loadId, tenantId]);

    // Update driver status to 'on_load'.
    const updateDriverSql = `
      UPDATE drivers
      SET availability_status = 'on_load', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND tenant_id = $2;
    `;
    await (this.db as any).execute(updateDriverSql, [driverId, tenantId]);

    // Create new assignment record.
    const insertAssignmentSql = `
      INSERT INTO load_assignments (tenant_id, load_id, driver_id, status, assigned_at)
      VALUES ($1, $2, $3, 'assigned', CURRENT_TIMESTAMP)
      RETURNING
        id, tenant_id as "tenantId", load_id as "loadId", driver_id as "driverId",
        assigned_at as "assignedAt", picked_up_at as "pickedUpAt", delivered_at as "deliveredAt",
        status, estimated_delivery_at as "estimatedDeliveryAt",
        created_at as "createdAt", updated_at as "updatedAt";
    `;
    const assignmentResult = await (this.db as any).execute(insertAssignmentSql, [tenantId, loadId, driverId]);
    return (assignmentResult as any).rows[0];
  }

  /**
   * Updates the status of a load and its corresponding assignment.
   * Handles status transitions and updates driver availability if the load is delivered or cancelled.
   * @param tenantId The ID of the tenant.
   * @param loadId The ID of the load to update.
   * @param newStatus The new status for the load ('picked_up', 'delivered', 'cancelled').
   * @returns A promise that resolves to the updated LoadAssignment object.
   */
  async updateLoadStatus(
    tenantId: string,
    loadId: string,
    newStatus: 'picked_up' | 'delivered' | 'cancelled'
  ): Promise<LoadAssignment> {
    // Find the current assignment for the load.
    const assignmentSql = `
      SELECT
        id, load_id, driver_id, status, assigned_at,
        picked_up_at, delivered_at, estimated_delivery_at
      FROM load_assignments
      WHERE load_id = $1 AND tenant_id = $2
      ORDER BY assigned_at DESC
      LIMIT 1;
    `;
    const assignmentResult = await (this.db as any).execute(assignmentSql, [loadId, tenantId]);
    const assignment = (assignmentResult as any).rows[0];

    if (!assignment) {
      throw new NotFoundException(`No active assignment found for load ID ${loadId}.`);
    }

    // Validate status transition.
    if (newStatus === 'picked_up' && assignment.status !== 'assigned') {
      throw new BadRequestException(`Load status cannot be updated to 'picked_up' from '${assignment.status}'.`);
    }
    if (newStatus === 'delivered' && assignment.status !== 'picked_up') {
      throw new BadRequestException(`Load status cannot be updated to 'delivered' from '${assignment.status}'.`);
    }
    if (newStatus === 'cancelled' && ['delivered', 'cancelled'].includes(assignment.status)) {
        throw new BadRequestException(`Load status cannot be cancelled from '${assignment.status}'.`);
    }

    // Update load status in the loads table.
    const updateLoadSql = `
      UPDATE loads
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND tenant_id = $3;
    `;
    await (this.db as any).execute(updateLoadSql, [newStatus, loadId, tenantId]);

    // Update assignment status and timestamps.
    let updateAssignmentSql = `
      UPDATE load_assignments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    const params = [newStatus, assignment.id, tenantId];

    if (newStatus === 'picked_up') {
      updateAssignmentSql += `, picked_up_at = CURRENT_TIMESTAMP`;
    } else if (newStatus === 'delivered') {
      updateAssignmentSql += `, delivered_at = CURRENT_TIMESTAMP`;
      // When delivered, set driver's availability back to 'available'.
      const updateDriverAvailabilitySql = `
        UPDATE drivers
        SET availability_status = 'available', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND tenant_id = $2;
      `;
      await (this.db as any).execute(updateDriverAvailabilitySql, [assignment.driver_id, tenantId]);
    } else if (newStatus === 'cancelled') {
      // If cancelled, set driver's availability back to 'available' and load's status back to 'available'.
      const updateDriverAvailabilitySql = `
        UPDATE drivers
        SET availability_status = 'available', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND tenant_id = $2;
      `;
      await (this.db as any).execute(updateDriverAvailabilitySql, [assignment.driver_id, tenantId]);

      const updateLoadAvailabilitySql = `
        UPDATE loads
        SET status = 'available', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND tenant_id = $2;
      `;
      await (this.db as any).execute(updateLoadAvailabilitySql, [loadId, tenantId]);
    }
    updateAssignmentSql += `
      WHERE id = $2 AND tenant_id = $3
      RETURNING
        id, tenant_id as "tenantId", load_id as "loadId", driver_id as "driverId",
        assigned_at as "assignedAt", picked_up_at as "pickedUpAt", delivered_at as "deliveredAt",
        status, estimated_delivery_at as "estimatedDeliveryAt",
        created_at as "createdAt", updated_at as "updatedAt";
    `;

    const result = await (this.db as any).execute(updateAssignmentSql, params);
    return (result as any).rows[0];
  }

  /**
   * Calculates the Estimated Time of Arrival (ETA) for an assigned load.
   * If the load is picked up, ETA is from the driver's current location to destination.
   * Otherwise, it's from load's origin to destination (assuming driver is at origin).
   * @param tenantId The ID of the tenant.
   * @param loadId The ID of the load to calculate ETA for.
   * @returns A promise that resolves to an object containing loadId, driverId, and currentEta.
   */
  async calculateLoadEta(tenantId: string, loadId: string): Promise<{ loadId: string; driverId: string; currentEta: Date; }> {
    // Find the current assignment and relevant load/driver information.
    const assignmentSql = `
      SELECT
        la.load_id, la.driver_id,
        l.origin_lat, l.origin_lng, l.destination_lat, l.destination_lng,
        d.current_lat, d.current_lng,
        la.status as "assignmentStatus"
      FROM load_assignments la
      JOIN loads l ON la.load_id = l.id AND la.tenant_id = l.tenant_id
      JOIN drivers d ON la.driver_id = d.id AND la.tenant_id = d.tenant_id
      WHERE la.load_id = $1 AND la.tenant_id = $2
      ORDER BY la.assigned_at DESC
      LIMIT 1;
    `;
    const assignmentResult = await (this.db as any).execute(assignmentSql, [loadId, tenantId]);
    const assignment = (assignmentResult as any).rows[0];

    if (!assignment) {
      throw new NotFoundException(`No active assignment found for load ID ${loadId}.`);
    }

    if (assignment.assignmentStatus === 'delivered' || assignment.assignmentStatus === 'cancelled') {
        throw new BadRequestException(`Cannot calculate ETA for a ${assignment.assignmentStatus} load.`);
    }

    // Determine the starting point for ETA calculation based on assignment status.
    const currentLat = assignment.assignmentStatus === 'picked_up' ? assignment.current_lat : assignment.origin_lat;
    const currentLng = assignment.assignmentStatus === 'picked_up' ? assignment.current_lng : assignment.origin_lng;

    // Calculate distance from current position to destination.
    const distanceKm = this.calculateDistance(
      currentLat, currentLng,
      assignment.destination_lat, assignment.destination_lng
    );

    const currentEta = this.calculateEta(distanceKm);

    // Optionally, update the estimated_delivery_at in the assignment record.
    const updateAssignmentEtaSql = `
      UPDATE load_assignments
      SET estimated_delivery_at = $1, updated_at = CURRENT_TIMESTAMP
      WHERE load_id = $2 AND tenant_id = $3 AND driver_id = $4
      RETURNING estimated_delivery_at;
    `;
    await (this.db as any).execute(updateAssignmentEtaSql, [currentEta, loadId, tenantId, assignment.driver_id]);

    return {
      loadId: assignment.load_id,
      driverId: assignment.driver_id,
      currentEta: currentEta,
    };
  }
}

