/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-012 -- Table & Seating Management
 * FILE TYPE:    SERVICE
 * MODULE:       (schema as any).restaurant_tables
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-058
 * GENERATED:    2026-03-17T13:07:31.497Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, NotFoundException, BadRequestException, Inject ,
  Query} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter'; // For real-time events
import { AuditLogService } from '../audit-log/audit-log.service';
import {  CreateTableDto, UpdateTableDto, TableQueryParamsDto, TableStatus, TableShape  } from './dto/table.dto';
type AssignOrderToTableDto = any;
type MergeTablesDto = any;
type SplitTableDto = any;
import { InferInsertModel, InferSelectModel, sql, and, eq, like, SQL, gte, lte, isNotNull, isNull } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@paysurity/database';
type Table = any; type Location = any;

// Event constants for real-time updates
const TABLE_CREATED_EVENT = 'table.created';
const TABLE_UPDATED_EVENT = 'table.updated';
const TABLE_DELETED_EVENT = 'table.deleted';
const TABLE_STATUS_CHANGED_EVENT = 'table.statusChanged';
const TABLE_ORDER_ASSIGNED_EVENT = 'table.orderAssigned';
const TABLE_MERGED_EVENT = 'table.merged';
const TABLE_SPLIT_EVENT = 'table.split';


type TableSelect = any;

type LocationSelect = any;

type TableInsert = any;

interface TableWithLocation extends TableSelect {
  location: LocationSelect;
}

@Injectable()
export class TablesService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>, // Inject Drizzle instance
    private readonly auditLogService: AuditLogService,
    private readonly eventEmitter: EventEmitter2, // Inject EventEmitter2
  ) {}

  /**
   * Helper to retrieve a location by ID for a given tenant.
   * @param locationId The ID of the location.
   * @param tenantId The ID of the tenant.
   * @returns The found location.
   * @throws NotFoundException if the location is not found or does not belong to the tenant.
   */
  private async getLocationById(locationId: string, tenantId: string): Promise<LocationSelect> {
    const [location] = await (this.db as any).execute(sql`
      SELECT id, tenant_id, name, address_line1, address_line2, city, state, zip_code, phone_number, email
      FROM ${(schema as any).locations}
      WHERE ${eq((schema as any).locations.id, locationId)} AND ${eq((schema as any).locations.tenantId, tenantId)}
    `);
    if (!location) {
      throw new NotFoundException(`Location with ID '${locationId}' not found for tenant '${tenantId}'.`);
    }
    return location;
  }

  /**
   * Helper to retrieve a table by ID for a given tenant and location.
   * @param tableId The ID of the table.
   * @param locationId The ID of the location.
   * @param tenantId The ID of the tenant.
   * @returns The found table.
   * @throws NotFoundException if the table is not found or does not belong to the tenant/location.
   */
  private async getTableByIdInternal(tableId: string, locationId: string, tenantId: string): Promise<TableSelect> {
    const [table] = await (this.db as any).execute(sql`
      SELECT ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
             ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
             ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
             ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
      FROM ${(schema as any).restaurant_tables}
      WHERE ${eq((schema as any).restaurant_tables.id, tableId)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
    `);
    if (!table) {
      throw new NotFoundException(`Table with ID '${tableId}' not found for location '${locationId}'.`);
    }
    return table;
  }

  /**
   * Creates a new table for a specific location and tenant.
   * @param createTableDto Data for creating the table.
   * @param tenantId The ID of the tenant creating the table.
   * @param userId The ID of the user creating the table.
   * @returns The newly created table.
   */
  async createTable(createTableDto: CreateTableDto, tenantId: string, userId: string): Promise<TableSelect> {
    await this.getLocationById((createTableDto as any).locationId, tenantId);

    const newTableValues: TableInsert = {
      tenantId,
      locationId: (createTableDto as any).locationId,
      tableNumber: (createTableDto as any).tableNumber,
      capacity: (createTableDto as any).capacity,
      status: (createTableDto as any).status || (TableStatus as any).AVAILABLE,
      shape: (createTableDto as any).shape || TableShape.RECTANGLE,
      coordinatesX: (createTableDto as any).coordinatesX || 0,
      coordinatesY: (createTableDto as any).coordinatesY || 0,
      width: (createTableDto as any).width || 1,
      height: (createTableDto as any).height || 1,
      currentOrderId: null,
      mergedWithTableIds: null,
    };

    const [newTable] = await (this.db as any).execute(sql`
      INSERT INTO ${(schema as any).restaurant_tables} (
        ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
        ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
        ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}
      ) VALUES (
        ${newTableValues.tenantId}, ${newTableValues.locationId}, ${newTableValues.tableNumber}, ${newTableValues.capacity},
        ${newTableValues.status}, ${newTableValues.shape}, ${newTableValues.coordinatesX}, ${newTableValues.coordinatesY},
        ${newTableValues.width}, ${newTableValues.height}
      )
      RETURNING ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
                ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
                ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
                ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
    `);

    (this.auditLogService as any).logAuditAction({
      tenantId,
      userId,
      action: 'table.create',
      resourceType: 'table',
      resourceId: newTable.id,
      details: `Created table ${newTable.tableNumber} in location ${newTable.locationId}.`,
    });

    this.eventEmitter.emit(TABLE_CREATED_EVENT, { tenantId, locationId: newTable.locationId, table: newTable });
    return newTable;
  }

  /**
   * Retrieves a list of (schema as any).restaurant_tables for a specific location and tenant, with optional filters.
   * @param queryParams Query parameters for filtering (schema as any).restaurant_tables.
   * @param tenantId The ID of the tenant.
   * @returns A list of (schema as any).restaurant_tables.
   */
  async getTables(queryParams: TableQueryParamsDto, tenantId: string): Promise<TableSelect[]> {
    if (!(queryParams as any).locationId) {
      throw new BadRequestException('locationId is required to retrieve (schema as any).restaurant_tables.');
    }
    await this.getLocationById((queryParams as any).locationId, tenantId);

    const whereConditions: SQL[] = [
      eq((schema as any).restaurant_tables.tenantId, tenantId),
      eq((schema as any).restaurant_tables.locationId, (queryParams as any).locationId),
    ];

    if ((queryParams as any).status) {
      whereConditions.push(eq((schema as any).restaurant_tables.status, (queryParams as any).status));
    }
    if ((queryParams as any).tableNumber) {
      whereConditions.push(like((schema as any).restaurant_tables.tableNumber, `%${(queryParams as any).tableNumber}%`));
    }
    if ((queryParams as any).minCapacity) {
      whereConditions.push(gte((schema as any).restaurant_tables.capacity, (queryParams as any).minCapacity));
    }
    if ((queryParams as any).maxCapacity) {
      whereConditions.push(lte((schema as any).restaurant_tables.capacity, (queryParams as any).maxCapacity));
    }
    if ((queryParams as any).isMerged !== undefined) {
      if ((queryParams as any).isMerged) {
        whereConditions.push(isNotNull((schema as any).restaurant_tables.mergedWithTableIds));
      } else {
        whereConditions.push(isNull((schema as any).restaurant_tables.mergedWithTableIds));
      }
    }

    const allTables = await (this.db as any).execute(sql`
      SELECT ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
             ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
             ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
             ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
      FROM ${(schema as any).restaurant_tables}
      WHERE ${and(...whereConditions)}
      ORDER BY ${(schema as any).restaurant_tables.tableNumber} ASC
    `);

    return allTables as TableSelect[];
  }

  /**
   * Retrieves a single table by its ID for a given tenant and location.
   * @param tableId The ID of the table.
   * @param locationId The ID of the location.
   * @param tenantId The ID of the tenant.
   * @returns The found table with location details.
   */
  async getTableById(tableId: string, locationId: string, tenantId: string): Promise<TableWithLocation> {
    const [tableResult] = await (this.db as any).execute(sql`
      SELECT
        ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
        ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
        ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
        ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt},
        ${(schema as any).locations.id} AS "location.id",
        ${(schema as any).locations.name} AS "location.name",
        ${(schema as any).locations.addressLine1} AS "location.addressLine1",
        ${(schema as any).locations.city} AS "location.city",
        ${(schema as any).locations.state} AS "location.state"
      FROM ${(schema as any).restaurant_tables}
      JOIN ${(schema as any).locations} ON ${eq((schema as any).restaurant_tables.locationId, (schema as any).locations.id)}
      WHERE ${eq((schema as any).restaurant_tables.id, tableId)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
    `);

    if (!tableResult) {
      throw new NotFoundException(`Table with ID '${tableId}' not found for location '${locationId}'.`);
    }

    // Drizzle's `execute` on raw SQL doesn't auto-hydrate nested objects well without specific joins and aliases.
    // Manually reconstruct for `TableWithLocation` interface.
    const table: TableSelect = {
      id: tableResult.id,
      tenantId: tableResult.tenantId,
      locationId: tableResult.locationId,
      tableNumber: tableResult.tableNumber,
      capacity: tableResult.capacity,
      status: tableResult.status,
      shape: tableResult.shape,
      coordinatesX: tableResult.coordinatesX,
      coordinatesY: tableResult.coordinatesY,
      width: tableResult.width,
      height: tableResult.height,
      currentOrderId: tableResult.currentOrderId,
      mergedWithTableIds: tableResult.mergedWithTableIds,
      createdAt: tableResult.createdAt,
      updatedAt: tableResult.updatedAt,
    };

    const location: LocationSelect = {
      id: tableResult['location.id'],
      tenantId: tableResult.tenantId, // Assuming tenantId from table is sufficient for location as well
      name: tableResult['location.name'],
      addressLine1: tableResult['location.addressLine1'],
      addressLine2: tableResult['location.addressLine2'], // These might be null if not selected
      city: tableResult['location.city'],
      state: tableResult['location.state'],
      zipCode: tableResult['location.zipCode'], // These might be null if not selected
      phoneNumber: tableResult['location.phoneNumber'], // These might be null if not selected
      email: tableResult['location.email'], // These might be null if not selected
    };

    return { ...table, location } as TableWithLocation;
  }

  /**
   * Updates an existing table's details.
   * @param tableId The ID of the table to update.
   * @param locationId The ID of the location where the table resides.
   * @param updateTableDto Data for updating the table.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the update.
   * @returns The updated table.
   */
  async updateTable(tableId: string, locationId: string, updateTableDto: UpdateTableDto, tenantId: string, userId: string): Promise<TableSelect> {
    const existingTable = await this.getTableByIdInternal(tableId, locationId, tenantId);

    const setValues: SQL[] = [];
    if ((updateTableDto as any).tableNumber !== undefined) setValues.push(sql`${(schema as any).restaurant_tables.tableNumber} = ${(updateTableDto as any).tableNumber}`);
    if ((updateTableDto as any).capacity !== undefined) setValues.push(sql`${(schema as any).restaurant_tables.capacity} = ${(updateTableDto as any).capacity}`);
    // Status update should ideally go through updateTableStatus to ensure proper eventing
    if ((updateTableDto as any).status !== undefined && (updateTableDto as any).status !== existingTable.status) {
      setValues.push(sql`${(schema as any).restaurant_tables.status} = ${(updateTableDto as any).status}`);
    }
    if ((updateTableDto as any).shape !== undefined) setValues.push(sql`${(schema as any).restaurant_tables.shape} = ${(updateTableDto as any).shape}`);
    if ((updateTableDto as any).coordinatesX !== undefined) setValues.push(sql`${(schema as any).restaurant_tables.coordinatesX} = ${(updateTableDto as any).coordinatesX}`);
    if ((updateTableDto as any).coordinatesY !== undefined) setValues.push(sql`${(schema as any).restaurant_tables.coordinatesY} = ${(updateTableDto as any).coordinatesY}`);
    if ((updateTableDto as any).width !== undefined) setValues.push(sql`${(schema as any).restaurant_tables.width} = ${(updateTableDto as any).width}`);
    if ((updateTableDto as any).height !== undefined) setValues.push(sql`${(schema as any).restaurant_tables.height} = ${(updateTableDto as any).height}`);
    setValues.push(sql`${(schema as any).restaurant_tables.updatedAt} = NOW()`);

    if (setValues.length === 1 && (updateTableDto as any).status === undefined) { // Only updatedAt changed means no actual user-data change
      return existingTable; // No functional update
    }

    const [updatedTable] = await (this.db as any).execute(sql`
      UPDATE ${(schema as any).restaurant_tables}
      SET ${sql.join(setValues, sql`, `)}
      WHERE ${eq((schema as any).restaurant_tables.id, tableId)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
      RETURNING ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
                ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
                ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
                ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
    `);

    (this.auditLogService as any).logAuditAction({
      tenantId,
      userId,
      action: 'table.update',
      resourceType: 'table',
      resourceId: updatedTable.id,
      details: `Updated table ${updatedTable.tableNumber} in location ${updatedTable.locationId}.`,
      oldValues: existingTable,
      newValues: updatedTable,
    });

    this.eventEmitter.emit(TABLE_UPDATED_EVENT, { tenantId, locationId, table: updatedTable });
    if ((updateTableDto as any).status && (updateTableDto as any).status !== existingTable.status) {
      this.eventEmitter.emit(TABLE_STATUS_CHANGED_EVENT, {
        tenantId,
        locationId,
        tableId: updatedTable.id,
        oldStatus: existingTable.status,
        newStatus: updatedTable.status,
      });
    }

    return updatedTable;
  }

  /**
   * Updates the status of a table.
   * @param tableId The ID of the table to update.
   * @param locationId The ID of the location.
   * @param newStatus The new status for the table.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the update.
   * @returns The updated table.
   */
  async updateTableStatus(tableId: string, locationId: string, newStatus: TableStatus, tenantId: string, userId: string): Promise<TableSelect> {
    const existingTable = await this.getTableByIdInternal(tableId, locationId, tenantId);

    if (existingTable.status === newStatus) {
      return existingTable; // No change needed
    }

    // Basic status transition validation (can be expanded)
    if (newStatus === (TableStatus as any).OCCUPIED && existingTable.status !== (TableStatus as any).AVAILABLE && existingTable.status !== (TableStatus as any).RESERVED) {
      throw new BadRequestException(`Cannot set table ${tableId} to OCCUPIED from status ${existingTable.status}.`);
    }
    if (newStatus === (TableStatus as any).AVAILABLE && existingTable.currentOrderId) {
      throw new BadRequestException(`Cannot set table ${tableId} to AVAILABLE while an order is assigned. Close order first.`);
    }

    const [updatedTable] = await (this.db as any).execute(sql`
      UPDATE ${(schema as any).restaurant_tables}
      SET
        ${(schema as any).restaurant_tables.status} = ${newStatus},
        ${(schema as any).restaurant_tables.updatedAt} = NOW()
      WHERE ${eq((schema as any).restaurant_tables.id, tableId)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
      RETURNING ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
                ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
                ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
                ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
    `);

    (this.auditLogService as any).logAuditAction({
      tenantId,
      userId,
      action: 'table.status.update',
      resourceType: 'table',
      resourceId: updatedTable.id,
      details: `Table ${updatedTable.tableNumber} status changed from ${existingTable.status} to ${newStatus}.`,
      oldValues: { status: existingTable.status },
      newValues: { status: newStatus },
    });

    this.eventEmitter.emit(TABLE_STATUS_CHANGED_EVENT, {
      tenantId,
      locationId,
      tableId: updatedTable.id,
      oldStatus: existingTable.status,
      newStatus: updatedTable.status,
    });
    this.eventEmitter.emit(TABLE_UPDATED_EVENT, { tenantId, locationId, table: updatedTable }); // General update event

    return updatedTable;
  }

  /**
   * Assigns an order to a table, changing its status to 'occupied'.
   * @param assignOrderDto Data for assigning the order.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the assignment.
   * @returns The updated table.
   */
  async assignOrderToTable(assignOrderDto: AssignOrderToTableDto, tenantId: string, userId: string): Promise<TableSelect> {
    const { tableId, locationId, orderId } = assignOrderDto;
    const existingTable = await this.getTableByIdInternal(tableId, locationId, tenantId);

    if (existingTable.currentOrderId) {
      throw new BadRequestException(`Table ${tableId} already has an order assigned: ${existingTable.currentOrderId}.`);
    }
    if (existingTable.status === (TableStatus as any).OCCUPIED || existingTable.status === (TableStatus as any).CLEANING) {
      throw new BadRequestException(`Table ${tableId} is currently ${existingTable.status} and cannot accept a new order.`);
    }

    const [updatedTable] = await (this.db as any).execute(sql`
      UPDATE ${(schema as any).restaurant_tables}
      SET
        ${(schema as any).restaurant_tables.currentOrderId} = ${orderId},
        ${(schema as any).restaurant_tables.status} = ${(TableStatus as any).OCCUPIED},
        ${(schema as any).restaurant_tables.updatedAt} = NOW()
      WHERE ${eq((schema as any).restaurant_tables.id, tableId)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
      RETURNING ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
                ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
                ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
                ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
    `);

    (this.auditLogService as any).logAuditAction({
      tenantId,
      userId,
      action: 'table.assignOrder',
      resourceType: 'table',
      resourceId: updatedTable.id,
      details: `Order ${orderId} assigned to table ${updatedTable.tableNumber}.`,
      oldValues: { currentOrderId: existingTable.currentOrderId, status: existingTable.status },
      newValues: { currentOrderId: updatedTable.currentOrderId, status: updatedTable.status },
    });

    this.eventEmitter.emit(TABLE_ORDER_ASSIGNED_EVENT, { tenantId, locationId, tableId, orderId, table: updatedTable });
    this.eventEmitter.emit(TABLE_STATUS_CHANGED_EVENT, {
      tenantId,
      locationId,
      tableId: updatedTable.id,
      oldStatus: existingTable.status,
      newStatus: updatedTable.status,
    });
    this.eventEmitter.emit(TABLE_UPDATED_EVENT, { tenantId, locationId, table: updatedTable });

    return updatedTable;
  }

  /**
   * Removes an order from a table, updating its status.
   * @param tableId The ID of the table.
   * @param locationId The ID of the location.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the action.
   * @returns The updated table.
   */
  async unassignOrderFromTable(tableId: string, locationId: string, tenantId: string, userId: string): Promise<TableSelect> {
    const existingTable = await this.getTableByIdInternal(tableId, locationId, tenantId);

    if (!existingTable.currentOrderId) {
      throw new BadRequestException(`Table ${tableId} does not have an order assigned.`);
    }

    const oldOrderId = existingTable.currentOrderId;
    const oldStatus = existingTable.status;
    const newStatus = (TableStatus as any).AVAILABLE; // Or PENDING_CLEANING, etc.

    const [updatedTable] = await (this.db as any).execute(sql`
      UPDATE ${(schema as any).restaurant_tables}
      SET
        ${(schema as any).restaurant_tables.currentOrderId} = NULL,
        ${(schema as any).restaurant_tables.status} = ${newStatus},
        ${(schema as any).restaurant_tables.updatedAt} = NOW()
      WHERE ${eq((schema as any).restaurant_tables.id, tableId)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
      RETURNING ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
                ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
                ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
                ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
    `);

    (this.auditLogService as any).logAuditAction({
      tenantId,
      userId,
      action: 'table.unassignOrder',
      resourceType: 'table',
      resourceId: updatedTable.id,
      details: `Order ${oldOrderId} unassigned from table ${updatedTable.tableNumber}.`,
      oldValues: { currentOrderId: oldOrderId, status: oldStatus },
      newValues: { currentOrderId: updatedTable.currentOrderId, status: updatedTable.status },
    });

    this.eventEmitter.emit('table.orderUnassigned', { tenantId, locationId, tableId, orderId: oldOrderId, table: updatedTable });
    this.eventEmitter.emit(TABLE_STATUS_CHANGED_EVENT, {
      tenantId,
      locationId,
      tableId: updatedTable.id,
      oldStatus: oldStatus,
      newStatus: updatedTable.status,
    });
    this.eventEmitter.emit(TABLE_UPDATED_EVENT, { tenantId, locationId, table: updatedTable });

    return updatedTable;
  }

  /**
   * Merges multiple source (schema as any).restaurant_tables into a target table.
   * The source (schema as any).restaurant_tables will be marked as 'merged' and their IDs added to the target table's mergedWithTableIds.
   * The target table's capacity will be updated to reflect the sum of merged (schema as any).restaurant_tables.
   * @param mergeTablesDto Data for merging (schema as any).restaurant_tables.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the merge.
   * @returns The updated target table.
   */
  async mergeTables(mergeTablesDto: MergeTablesDto, tenantId: string, userId: string): Promise<TableSelect> {
    const { targetTableId, sourceTableIds, locationId } = mergeTablesDto;

    if (sourceTableIds.includes(targetTableId)) {
      throw new BadRequestException('Target table cannot be one of the source (schema as any).restaurant_tables.');
    }
    if (new Set(sourceTableIds).size !== sourceTableIds.length) {
      throw new BadRequestException('Source table IDs must be unique.');
    }
    if (sourceTableIds.length === 0) {
      throw new BadRequestException('At least one source table must be provided for merging.');
    }

    const targetTable = await this.getTableByIdInternal(targetTableId, locationId, tenantId);
    let totalCapacity = targetTable.capacity;
    const oldMergedWithTableIds = targetTable.mergedWithTableIds || [];

    const sourceTables: TableSelect[] = [];
    for (const id of sourceTableIds) {
      const sourceTable = await this.getTableByIdInternal(id, locationId, tenantId);
      if (sourceTable.status === (TableStatus as any).OCCUPIED || sourceTable.currentOrderId) {
        throw new BadRequestException(`Source table ${sourceTable.tableNumber} (${id}) is currently occupied or has an active order.`);
      }
      if (sourceTable.status === (TableStatus as any).MERGED) {
        throw new BadRequestException(`Source table ${sourceTable.tableNumber} (${id}) is already merged.`);
      }
      sourceTables.push(sourceTable);
      totalCapacity += sourceTable.capacity;
    }

    // Update target table
    const newMergedTableIds = [...new Set([...oldMergedWithTableIds, ...sourceTableIds])];
    const [updatedTargetTable] = await (this.db as any).execute(sql`
      UPDATE ${(schema as any).restaurant_tables}
      SET
        ${(schema as any).restaurant_tables.capacity} = ${totalCapacity},
        ${(schema as any).restaurant_tables.mergedWithTableIds} = ${JSON.stringify(newMergedTableIds)},
        ${(schema as any).restaurant_tables.status} = ${(TableStatus as any).MERGED}, -- Mark target as merged if it wasn't already, to signify it manages other (schema as any).restaurant_tables
        ${(schema as any).restaurant_tables.updatedAt} = NOW()
      WHERE ${eq((schema as any).restaurant_tables.id, targetTableId)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
      RETURNING ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
                ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
                ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
                ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
    `);

    // Update source (schema as any).restaurant_tables status to MERGED
    const sourceTableUpdatePromises = sourceTableIds.map(id =>
      (this.db as any).execute(sql`
        UPDATE ${(schema as any).restaurant_tables}
        SET
          ${(schema as any).restaurant_tables.status} = ${(TableStatus as any).MERGED},
          ${(schema as any).restaurant_tables.currentOrderId} = NULL, -- Ensure no order is assigned to a merged table
          ${(schema as any).restaurant_tables.updatedAt} = NOW()
        WHERE ${eq((schema as any).restaurant_tables.id, id)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
        RETURNING ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
                  ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
                  ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
                  ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
      `)
    );
    const updatedSourceTables = (await Promise.all(sourceTableUpdatePromises)).flat();


    (this.auditLogService as any).logAuditAction({
      tenantId,
      userId,
      action: 'table.merge',
      resourceType: 'table',
      resourceId: updatedTargetTable.id,
      details: `Merged (schema as any).restaurant_tables ${sourceTableIds.join(', ')} into table ${updatedTargetTable.tableNumber}.`,
      oldValues: { targetTable, sourceTables: sourceTables.map(st => ({ id: st.id, status: st.status })) },
      newValues: { targetTable: updatedTargetTable, sourceTables: updatedSourceTables.map(ust => ({ id: ust.id, status: ust.status })) },
    });

    this.eventEmitter.emit(TABLE_MERGED_EVENT, {
      tenantId,
      locationId,
      targetTableId: updatedTargetTable.id,
      sourceTableIds,
      updatedTargetTable,
      updatedSourceTables,
    });
    this.eventEmitter.emit(TABLE_UPDATED_EVENT, { tenantId, locationId, table: updatedTargetTable });
    updatedSourceTables.forEach(table => this.eventEmitter.emit(TABLE_UPDATED_EVENT, { tenantId, locationId, table }));

    return updatedTargetTable;
  }

  /**
   * Splits a merged table, making the constituent (schema as any).restaurant_tables available again.
   * This operation only applies to (schema as any).restaurant_tables that were previously merged.
   * It makes all (schema as any).restaurant_tables in `mergedWithTableIds` available, and clears `mergedWithTableIds` on the primary table.
   * @param splitTableDto Data for splitting a table.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the split.
   * @returns The updated primary table and a list of reactivated (schema as any).restaurant_tables.
   */
  async splitTable(splitTableDto: SplitTableDto, tenantId: string, userId: string): Promise<{ primaryTable: TableSelect; reactivatedTables: TableSelect[] }> {
    const { tableId, locationId } = splitTableDto;
    const primaryTable = await this.getTableByIdInternal(tableId, locationId, tenantId);

    if (!primaryTable.mergedWithTableIds || primaryTable.mergedWithTableIds.length === 0) {
      throw new BadRequestException(`Table ${tableId} is not a merged table and cannot be split.`);
    }

    if (primaryTable.currentOrderId) {
      throw new BadRequestException(`Table ${tableId} has an active order and cannot be split. Please unassign the order first.`);
    }

    const mergedSourceTableIds = primaryTable.mergedWithTableIds;

    // Reset primary table
    const [updatedPrimaryTable] = await (this.db as any).execute(sql`
      UPDATE ${(schema as any).restaurant_tables}
      SET
        ${(schema as any).restaurant_tables.mergedWithTableIds} = NULL,
        ${(schema as any).restaurant_tables.status} = ${(TableStatus as any).AVAILABLE}, -- Set primary table back to available
        ${(schema as any).restaurant_tables.capacity} = ${primaryTable.capacity - (await this.getMergedTablesTotalCapacity(mergedSourceTableIds, locationId, tenantId))}, // Restore original capacity
        ${(schema as any).restaurant_tables.updatedAt} = NOW()
      WHERE ${eq((schema as any).restaurant_tables.id, tableId)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
      RETURNING ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
                ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
                ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
                ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
    `);

    // Reactivate merged source (schema as any).restaurant_tables
    const reactivatedTablePromises = mergedSourceTableIds.map(id =>
      (this.db as any).execute(sql`
        UPDATE ${(schema as any).restaurant_tables}
        SET
          ${(schema as any).restaurant_tables.status} = ${(TableStatus as any).AVAILABLE},
          ${(schema as any).restaurant_tables.updatedAt} = NOW()
        WHERE ${eq((schema as any).restaurant_tables.id, id)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
        RETURNING ${(schema as any).restaurant_tables.id}, ${(schema as any).restaurant_tables.tenantId}, ${(schema as any).restaurant_tables.locationId}, ${(schema as any).restaurant_tables.tableNumber}, ${(schema as any).restaurant_tables.capacity},
                  ${(schema as any).restaurant_tables.status}, ${(schema as any).restaurant_tables.shape}, ${(schema as any).restaurant_tables.coordinatesX}, ${(schema as any).restaurant_tables.coordinatesY},
                  ${(schema as any).restaurant_tables.width}, ${(schema as any).restaurant_tables.height}, ${(schema as any).restaurant_tables.currentOrderId}, ${(schema as any).restaurant_tables.mergedWithTableIds},
                  ${(schema as any).restaurant_tables.createdAt}, ${(schema as any).restaurant_tables.updatedAt}
      `)
    );
    const reactivatedTables = (await Promise.all(reactivatedTablePromises)).flat();

    (this.auditLogService as any).logAuditAction({
      tenantId,
      userId,
      action: 'table.split',
      resourceType: 'table',
      resourceId: primaryTable.id,
      details: `Split merged table ${primaryTable.tableNumber}, reactivating (schema as any).restaurant_tables ${mergedSourceTableIds.join(', ')}.`,
      oldValues: { primaryTable, mergedSourceTableIds },
      newValues: { primaryTable: updatedPrimaryTable, reactivatedTables: reactivatedTables.map(rt => ({ id: rt.id, status: rt.status })) },
    });

    this.eventEmitter.emit(TABLE_SPLIT_EVENT, {
      tenantId,
      locationId,
      primaryTableId: updatedPrimaryTable.id,
      reactivatedTableIds: mergedSourceTableIds,
      primaryTable: updatedPrimaryTable,
      reactivatedTables,
    });
    this.eventEmitter.emit(TABLE_UPDATED_EVENT, { tenantId, locationId, table: updatedPrimaryTable });
    reactivatedTables.forEach(table => this.eventEmitter.emit(TABLE_UPDATED_EVENT, { tenantId, locationId, table }));

    return { primaryTable: updatedPrimaryTable, reactivatedTables };
  }

  private async getMergedTablesTotalCapacity(tableIds: string[], locationId: string, tenantId: string): Promise<number> {
    if (tableIds.length === 0) return 0;
    const placeholders = tableIds.map((_, i) => `$${i + 4}`).join(', '); // For 3 preceding params: tenantId, locationId, tableId
    const query = sql`
      SELECT SUM(${(schema as any).restaurant_tables.capacity}) as totalCapacity
      FROM ${(schema as any).restaurant_tables}
      WHERE ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)} AND ${sql`${(schema as any).restaurant_tables.id} IN (${sql.join(tableIds.map(id => sql`${id}`), sql`,`)})`}
    `;
    const [result] = await (this.db as any).execute(query);
    return result?.totalCapacity || 0;
  }

  /**
   * Deletes a table.
   * @param tableId The ID of the table to delete.
   * @param locationId The ID of the location.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the deletion.
   */
  async deleteTable(tableId: string, locationId: string, tenantId: string, userId: string): Promise<void> {
    const existingTable = await this.getTableByIdInternal(tableId, locationId, tenantId);

    if (existingTable.currentOrderId) {
      throw new BadRequestException(`Cannot delete table ${tableId} while an order is assigned (${existingTable.currentOrderId}).`);
    }
    if (existingTable.status === (TableStatus as any).OCCUPIED || existingTable.status === (TableStatus as any).RESERVED || existingTable.status === (TableStatus as any).CLEANING) {
      throw new BadRequestException(`Cannot delete table ${tableId} while its status is ${existingTable.status}.`);
    }
    if (existingTable.mergedWithTableIds && existingTable.mergedWithTableIds.length > 0) {
      throw new BadRequestException(`Cannot delete table ${tableId} as it is currently managing merged (schema as any).restaurant_tables. Please split first.`);
    }

    await (this.db as any).execute(sql`
      DELETE FROM ${(schema as any).restaurant_tables}
      WHERE ${eq((schema as any).restaurant_tables.id, tableId)} AND ${eq((schema as any).restaurant_tables.tenantId, tenantId)} AND ${eq((schema as any).restaurant_tables.locationId, locationId)}
    `);

    (this.auditLogService as any).logAuditAction({
      tenantId,
      userId,
      action: 'table.delete',
      resourceType: 'table',
      resourceId: tableId,
      details: `Deleted table ${existingTable.tableNumber} from location ${locationId}.`,
      oldValues: existingTable,
    });

    this.eventEmitter.emit(TABLE_DELETED_EVENT, { tenantId, locationId, tableId: tableId });
  }
}










