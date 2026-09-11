import { Injectable, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@paysurity/database';
import { eq, and, desc, ilike, sql, asc, InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Define DTO interfaces using Drizzle's type inference for better type safety
type AuditLog = InferSelectModel<typeof schema.auditLogs>;
type InsertAuditLog = InferInsertModel<typeof schema.auditLogs>;

/**
 * DTO for creating a new audit log entry.
 * 'id' and 'timestamp' are typically auto-generated or set by the service.
 */
interface CreateAuditLogDto extends Omit<InsertAuditLog, 'id' | 'timestamp'> {}

/**
 * DTO for querying audit logs with filters and pagination.
 */
interface GetAuditLogsDto {
  entityType?: AuditLog['entityType'];
  entityId?: string; // UUID of the entity
  action?: AuditLog['action'];
  userId?: string; // UUID of the user who performed the action
  search?: string; // General search term for action or details (JSONB)
  startDate?: Date; // Filter logs from this date onwards
  endDate?: Date;   // Filter logs up to this date
  limit?: number;   // Maximum number of logs to return
  offset?: number;  // Number of logs to skip
  orderBy?: 'timestamp' | 'entityType' | 'action' | 'userId'; // Column to order by
  orderDirection?: 'asc' | 'desc'; // Order direction
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  // Inject the Drizzle database instance, typed with our schema
  constructor(@Inject('DATABASE') private db: NodePgDatabase<typeof schema>) {}

  /**
   * Creates a new audit log entry in the database.
   * @param data The data for the audit log entry.
   * @returns The newly created audit log entry.
   */
  async createLog(data: CreateAuditLogDto): Promise<AuditLog> {
    this.logger.debug(`Attempting to create audit log for action: ${data.action} on entityType: ${data.entityType}`);
    try {
      const [newLog] = await (this.db as any)
        .insert(schema.auditLogs)
        .values({
          ...data,
          timestamp: new Date(), // Explicitly set timestamp (can also be database default)
        })
        .returning(); // Return the inserted log entry
      this.logger.log(`Successfully created audit log with ID: ${newLog.id}`);
      return newLog;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw error; // Re-throw for NestJS exception filters
    }
  }

  /**
   * Finds audit log entries based on provided filters and pagination options.
   * @param query The filters, sorting, and pagination options.
   * @returns A list of audit log entries.
   */
  async findLogs(query: GetAuditLogsDto): Promise<AuditLog[]> {
    this.logger.debug(`Finding audit logs with query: ${JSON.stringify(query)}`);
    const {
      entityType,
      entityId,
      action,
      userId,
      search,
      startDate,
      endDate,
      limit = 100, // Default limit if not provided
      offset = 0,   // Default offset if not provided
      orderBy = 'timestamp',
      orderDirection = 'desc',
    } = query;

    const conditions = [];

    // Add conditions based on provided filters
    if (entityType) {
      conditions.push(eq(schema.auditLogs.entityType, entityType));
    }
    if (entityId) {
      conditions.push(eq(schema.auditLogs.entityId, entityId));
    }
    if (action) {
      conditions.push(eq(schema.auditLogs.action, action));
    }
    if (userId) {
      conditions.push(eq(schema.auditLogs.userId, userId));
    }
    if (startDate) {
      conditions.push(sql`${schema.auditLogs.timestamp} >= ${startDate.toISOString()}`);
    }
    if (endDate) {
      conditions.push(sql`${schema.auditLogs.timestamp} <= ${endDate.toISOString()}`);
    }
    if (search) {
        // Perform a case-insensitive search across the 'action' field and stringified 'details' JSONB
        conditions.push(
            sql`(${ilike(schema.auditLogs.action, `%${search}%`)} OR ${sql`CAST(${schema.auditLogs.details} AS TEXT)`} ILIKE '%${search}%')`
        );
    }

    // Determine the column for ordering, with a fallback if invalid
    const orderColumn = schema.auditLogs[orderBy];
    if (!orderColumn) {
        this.logger.warn(`Invalid orderBy column specified: '${orderBy}'. Defaulting to 'timestamp'.`);
        // If an invalid column is provided, default to timestamp
        return this.db
            .select()
            .from(schema.auditLogs)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(schema.auditLogs.timestamp));
    }

    // Apply ascending or descending order
    const order = orderDirection === 'asc' ? asc(orderColumn) : desc(orderColumn);

    try {
      const logs = await this.db
        .select()
        .from(schema.auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined) // Apply all conditions
        .limit(limit)
        .offset(offset)
        .orderBy(order);

      this.logger.debug(`Found ${logs.length} audit logs.`);
      return logs;
    } catch (error) {
      this.logger.error(`Failed to find audit logs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Finds a single audit log entry by its unique ID.
   * @param id The ID of the audit log entry.
   * @returns The audit log entry, or undefined if not found.
   */
  async findLogById(id: string): Promise<AuditLog | undefined> {
    this.logger.debug(`Attempting to find audit log with ID: ${id}`);
    try {
      const [log] = await this.db
        .select()
        .from(schema.auditLogs)
        .where(eq(schema.auditLogs.id, id));
      if (log) {
        this.logger.debug(`Found audit log with ID: ${id}`);
      } else {
        this.logger.debug(`Audit log with ID: ${id} not found.`);
      }
      return log;
    } catch (error) {
      this.logger.error(`Failed to find audit log by ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Counts audit log entries based on provided filters.
   * @param query The filters to apply for counting.
   * @returns The total number of audit log entries matching the filters.
   */
  async countLogs(query: GetAuditLogsDto): Promise<number> {
    this.logger.debug(`Counting audit logs with query: ${JSON.stringify(query)}`);
    const {
      entityType,
      entityId,
      action,
      userId,
      search,
      startDate,
      endDate,
    } = query;

    const conditions = [];

    // Add conditions based on provided filters
    if (entityType) {
      conditions.push(eq(schema.auditLogs.entityType, entityType));
    }
    if (entityId) {
      conditions.push(eq(schema.auditLogs.entityId, entityId));
    }
    if (action) {
      conditions.push(eq(schema.auditLogs.action, action));
    }
    if (userId) {
      conditions.push(eq(schema.auditLogs.userId, userId));
    }
    if (startDate) {
      conditions.push(sql`${schema.auditLogs.timestamp} >= ${startDate.toISOString()}`);
    }
    if (endDate) {
      conditions.push(sql`${schema.auditLogs.timestamp} <= ${endDate.toISOString()}`);
    }
    if (search) {
        // Perform a case-insensitive search across the 'action' field and stringified 'details' JSONB
        conditions.push(
            sql`(${ilike(schema.auditLogs.action, `%${search}%`)} OR ${sql`CAST(${schema.auditLogs.details} AS TEXT)`} ILIKE '%${search}%')`
        );
    }

    try {
      const [result] = await this.db
        .select({ count: sql<number>`count(*)` }) // Select the count of matching rows
        .from(schema.auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      this.logger.debug(`Counted ${result.count} audit logs.`);
      return result.count;
    } catch (error) {
      this.logger.error(`Failed to count audit logs: ${error.message}`, error.stack);
      throw error;
    }
  }
}

