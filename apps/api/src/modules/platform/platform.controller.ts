import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Request } from 'express'; // For @Req() type

/**
 * PlatformService
 * Handles business logic and database interactions for the dispatch board.
 */
@Injectable()
export class PlatformService {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  /**
   * Executes a raw SQL query.
   * Assumes for SELECT, it returns an array of row objects.
   * For DML, it returns a result object with `rowCount`.
   * @param sql The SQL query string.
   * @param params An array of parameters for the query.
   * @returns The result of the query.
   */
  private async executeSql<T>(sql: string, params: any[] = []): Promise<T[]> {
    // Rule 3: Use raw SQL via (this.db as any).execute(sql, params)
    const result = await (this.db as any).execute(sql, params);
    return result;
  }

  /**
   * Retrieves a list of available loads for a given tenant.
   * @param tenantId The ID of the tenant.
   * @returns A promise that resolves to an array of available loads.
   */
  async getAvailableLoads(tenantId: string): Promise<any[]> {
    const sql = `
      SELECT id, origin, destination, status, pickup_time, delivery_time, estimated_eta, driver_id
      FROM loads
      WHERE tenant_id = $1 AND status = 'available'
      ORDER BY pickup_time ASC;
    `;
    return this.executeSql(sql, [tenantId]);
  }

  /**
   * Retrieves details for a specific load.
   * @param tenantId The ID of the tenant.
   * @param loadId The ID of the load.
   * @returns A promise that resolves to the load details or null if not found.
   */
  async getLoadDetails(tenantId: string, loadId: string): Promise<any | null> {
    const sql = `
      SELECT id, origin, destination, status, driver_id, pickup_time, delivery_time, estimated_eta
      FROM loads
      WHERE tenant_id = $1 AND id = $2;
    `;
    const result = await this.executeSql(sql, [tenantId, loadId]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Finds potential drivers matching a given load.
   * (Simplified: returns all available drivers for the tenant.)
   * @param tenantId The ID of the tenant.
   * @param loadId The ID of the load (currently unused in simplified logic).
   * @returns A promise that resolves to an array of matching drivers.
   */
  async findMatchingDrivers(tenantId: string, loadId: string): Promise<any[]> {
    // In a real scenario, this would involve complex matching logic (location, vehicle type, availability, etc.)
    // For simplicity, we'll return all available drivers for the given tenant.
    const sql = `
      SELECT id, name, current_location, vehicle_type, is_available
      FROM drivers
      WHERE tenant_id = $1 AND is_available = TRUE;
    `;
    return this.executeSql(sql, [tenantId]);
  }

  /**
   * Assigns a driver to a specific load.
   * Marks the load as 'assigned' and the driver as 'unavailable'.
   * @param tenantId The ID of the tenant.
   * @param loadId The ID of the load.
   * @param driverId The ID of the driver to assign.
   * @returns A promise that resolves to true if assignment was successful, false otherwise.
   */
  async assignDriverToLoad(tenantId: string, loadId: string, driverId: string): Promise<boolean> {
    const assignLoadSql = `
      UPDATE loads
      SET driver_id = $1, status = 'assigned', assigned_at = NOW()
      WHERE id = $2 AND tenant_id = $3 AND status = 'available';
    `;
    const loadUpdateResult = await this.executeSql(assignLoadSql, [driverId, loadId, tenantId]);

    // Check if any rows were affected (i.e., load was found and was available)
    if ((loadUpdateResult as any)?.rowCount === 0) {
      return false; // Load not found or not available for assignment
    }

    // Mark driver as unavailable
    const updateDriverSql = `
      UPDATE drivers
      SET is_available = FALSE
      WHERE id = $1 AND tenant_id = $2;
    `;
    await this.executeSql(updateDriverSql, [driverId, tenantId]);

    return true;
  }

  /**
   * Updates the status of a specific load.
   * @param tenantId The ID of the tenant.
   * @param loadId The ID of the load.
   * @param status The new status for the load.
   * @returns A promise that resolves to true if the status was updated, false otherwise.
   * @throws Error if the provided status is invalid.
   */
  async updateLoadStatus(tenantId: string, loadId: string, status: string): Promise<boolean> {
    const validStatuses = ['available', 'assigned', 'en_route', 'delivered', 'cancelled', 'pending'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid load status: ${status}. Valid statuses are: ${validStatuses.join(', ')}.`);
    }

    const sql = `
      UPDATE loads
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND tenant_id = $3;
    `;
    const result = await this.executeSql(sql, [status, loadId, tenantId]);
    return (result as any)?.rowCount > 0;
  }

  /**
   * Calculates and sets the Estimated Time of Arrival (ETA) for a load.
   * (Simplified: uses mock calculation).
   * @param tenantId The ID of the tenant.
   * @param loadId The ID of the load.
   * @returns A promise that resolves to the calculated ETA string or null if load not found.
   */
  async calculateAndSetEta(tenantId: string, loadId: string): Promise<string | null> {
    const load = await this.getLoadDetails(tenantId, loadId);
    if (!load) {
      return null;
    }

    // Mock ETA calculation:
    // In a real system, this would integrate with external mapping APIs (e.g., Google Maps, HERE)
    // or internal logistics algorithms based on real-time traffic, driver location, etc.
    const mockDistanceKm = Math.floor(Math.random() * 800) + 100; // 100-900 km
    const averageSpeedKmH = 75; // Average speed for calculation
    const travelTimeHours = mockDistanceKm / averageSpeedKmH;

    const now = new Date();
    // Add estimated travel time in milliseconds
    const etaDate = new Date(now.getTime() + travelTimeHours * 60 * 60 * 1000);
    const estimatedEta = etaDate.toISOString(); // ISO string format for simplicity

    const sql = `
      UPDATE loads
      SET estimated_eta = $1, updated_at = NOW()
      WHERE id = $2 AND tenant_id = $3;
    `;
    await this.executeSql(sql, [estimatedEta, loadId, tenantId]);

    return estimatedEta;
  }
}

/**
 * PlatformController
 * Exposes API endpoints for dispatch board functionalities.
 */
@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  /**
   * Extracts the tenant ID from the request object.
   * Assumes `req.user.tenantId` is populated by a global authentication guard.
   * @param req The Express request object.
   * @returns The tenant ID as a string.
   */
  private getTenantId(req: Request): string {
    // Rule 7: Replace @TenantId() with @Request() req: any, extract from req.user.tenantId
    if (!(req as any).user || !(req as any).user.tenantId) {
      throw new BadRequestException('Tenant context not found. Authentication missing or invalid.');
    }
    return (req as any).user.tenantId;
  }

  /**
   * GET /platform/loads/available
   * Retrieves a list of all available loads for the current tenant.
   */
  @Get('loads/available')
  async getAvailableLoads(@Req() req: Request) {
    const tenantId = this.getTenantId(req);
    return (this.platformService as any).getAvailableLoads(tenantId);
  }

  /**
   * GET /platform/loads/:loadId
   * Retrieves details for a specific load by its ID.
   */
  @Get('loads/:loadId')
  async getLoadDetails(@Req() req: Request, @Param('loadId') loadId: string) {
    const tenantId = this.getTenantId(req);
    const load = await (this.platformService as any).getLoadDetails(tenantId, loadId);
    if (!load) {
      throw new NotFoundException(`Load with ID "${loadId}" not found for tenant "${tenantId}".`);
    }
    return load;
  }

  /**
   * GET /platform/loads/:loadId/drivers/match
   * Finds potential drivers suitable for a given load.
   * (Returns all available drivers for the tenant in this simplified version).
   */
  @Get('loads/:loadId/drivers/match')
  async findMatchingDrivers(@Req() req: Request, @Param('loadId') loadId: string) {
    const tenantId = this.getTenantId(req);
    // Ensure the load exists and belongs to the tenant before finding drivers
    const load = await (this.platformService as any).getLoadDetails(tenantId, loadId);
    if (!load) {
      throw new NotFoundException(`Load with ID "${loadId}" not found or not accessible for tenant "${tenantId}".`);
    }
    return (this.platformService as any).findMatchingDrivers(tenantId, loadId);
  }

  /**
   * POST /platform/loads/:loadId/assign
   * Assigns a specified driver to a load.
   */
  @Post('loads/:loadId/assign')
  async assignDriverToLoad(
    @Req() req: Request,
    @Param('loadId') loadId: string,
    @Body('driverId') driverId: string,
  ) {
    if (!driverId) {
      throw new BadRequestException('Driver ID is required for load assignment.');
    }
    const tenantId = this.getTenantId(req);
    const success = await (this.platformService as any).assignDriverToLoad(tenantId, loadId, driverId);
    if (!success) {
      throw new NotFoundException(
        `Load with ID "${loadId}" could not be assigned to driver "${driverId}". ` +
        `It might not exist, not be available, or not belong to tenant "${tenantId}".`,
      );
    }
    return { message: `Driver ${driverId} assigned to load ${loadId} successfully.` };
  }

  /**
   * GET /platform/loads/:loadId/status
   * Retrieves the current status of a specific load.
   */
  @Get('loads/:loadId/status')
  async getLoadStatus(@Req() req: Request, @Param('loadId') loadId: string) {
    const tenantId = this.getTenantId(req);
    const load = await (this.platformService as any).getLoadDetails(tenantId, loadId);
    if (!load) {
      throw new NotFoundException(`Load with ID "${loadId}" not found for tenant "${tenantId}".`);
    }
    return { loadId: load.id, currentStatus: load.status };
  }

  /**
   * PATCH /platform/loads/:loadId/status
   * Updates the status of a specific load.
   */
  @Patch('loads/:loadId/status')
  async updateLoadStatus(
    @Req() req: Request,
    @Param('loadId') loadId: string,
    @Body('status') status: string,
  ) {
    if (!status) {
      throw new BadRequestException('New status is required in the request body.');
    }
    const tenantId = this.getTenantId(req);
    try {
      const success = await (this.platformService as any).updateLoadStatus(tenantId, loadId, status);
      if (!success) {
        throw new NotFoundException(
          `Load with ID "${loadId}" not found or status could not be updated for tenant "${tenantId}".`,
        );
      }
      return { message: `Load ${loadId} status updated to "${status}".` };
    } catch (error) {
      // Catching the invalid status error thrown by the service
      if (error instanceof Error && error.message.startsWith('Invalid load status')) {
        throw new BadRequestException(error.message);
      }
      throw error; // Re-throw other unexpected errors
    }
  }

  /**
   * POST /platform/loads/:loadId/eta
   * Calculates and updates the Estimated Time of Arrival (ETA) for a load.
   */
  @Post('loads/:loadId/eta')
  async calculateLoadEta(@Req() req: Request, @Param('loadId') loadId: string) {
    const tenantId = this.getTenantId(req);
    const estimatedEta = await (this.platformService as any).calculateAndSetEta(tenantId, loadId);
    if (!estimatedEta) {
      throw new NotFoundException(
        `Load with ID "${loadId}" not found for ETA calculation for tenant "${tenantId}".`,
      );
    }
    return { loadId: loadId, estimatedEta: estimatedEta, message: 'ETA calculated and updated successfully.' };
  }
}

