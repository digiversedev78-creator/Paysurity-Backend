import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '@paysurity/database';

// Define DTOs for clarity, though in a real app these would be in separate .dto.ts files
interface CreateSecurityEventDto {
  userId: string;
  eventType: string;
  payload: Record<string, any>; // Flexible JSON payload
  timestamp?: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface UpdateSecurityEventDto {
  eventType?: string;
  payload?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

interface CreateAuditLogDto {
  userId: string;
  action: string;
  entityType: string; // e.g., 'User', 'Product', 'Order'
  entityId: string;
  details: Record<string, any>; // Flexible JSON details
  timestamp?: Date;
  ipAddress?: string;
}

// SecurityEventsService handles logging and retrieving security-related events.
@Injectable()
export class SecurityEventsService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<typeof schema>) {}

  /**
   * Creates a new security event log.
   * @param data The data for the security event.
   * @returns The created security event record.
   */
  async createEvent(data: CreateSecurityEventDto) {
    const [newEvent] = await (this.db as any).insert((schema as any).securityEvents).values({
      id: crypto.randomUUID(), // Generate a unique ID for the event
      userId: data.userId,
      eventType: data.eventType,
      payload: data.payload,
      timestamp: data.timestamp || new Date(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    }).returning();
    return newEvent;
  }

  /**
   * Retrieves all security events.
   * @returns A list of all security event records.
   */
  async findAllEvents() {
    return (this.db as any).query.securityEvents.findMany({
      orderBy: [desc((schema as any).securityEvents.timestamp)],
    });
  }

  /**
   * Retrieves a single security event by its ID.
   * @param id The ID of the security event.
   * @returns The security event record, or undefined if not found.
   */
  async findEventById(id: string) {
    return (this.db as any).query.securityEvents.findFirst({
      where: eq((schema as any).securityEvents.id, id),
    });
  }

  /**
   * Retrieves security events associated with a specific user.
   * @param userId The ID of the user.
   * @returns A list of security event records for the specified user.
   */
  async findEventsByUserId(userId: string) {
    return (this.db as any).query.securityEvents.findMany({
      where: eq((schema as any).securityEvents.userId, userId),
      orderBy: [desc((schema as any).securityEvents.timestamp)],
    });
  }

  /**
   * Retrieves security events of a specific type.
   * @param eventType The type of the security event (e.g., 'LOGIN_SUCCESS', 'PASSWORD_RESET_ATTEMPT').
   * @returns A list of security event records of the specified type.
   */
  async findEventsByType(eventType: string) {
    return (this.db as any).query.securityEvents.findMany({
      where: eq((schema as any).securityEvents.eventType, eventType),
      orderBy: [desc((schema as any).securityEvents.timestamp)],
    });
  }

  /**
   * Updates an existing security event.
   * Note: Updating security events might be discouraged for auditability.
   * @param id The ID of the event to update.
   * @param data The updated data for the event.
   * @returns The updated security event record.
   */
  async updateEvent(id: string, data: UpdateSecurityEventDto) {
    const [updatedEvent] = await (this.db as any).update((schema as any).securityEvents)
      .set({
        ...data,
        timestamp: new Date(), // Optionally update timestamp on modification
      })
      .where(eq((schema as any).securityEvents.id, id))
      .returning();
    return updatedEvent;
  }

  /**
   * Deletes a security event by its ID.
   * Note: Deleting security events is generally not recommended for audit trails.
   * @param id The ID of the event to delete.
   * @returns The deleted security event record.
   */
  async deleteEvent(id: string) {
    const [deletedEvent] = await (this.db as any).delete((schema as any).securityEvents)
      .where(eq((schema as any).securityEvents.id, id))
      .returning();
    return deletedEvent;
  }
}

// AuditLogService handles logging and retrieving general audit trail entries.
@Injectable()
export class AuditLogService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<typeof schema>) {}

  /**
   * Creates a new audit log entry.
   * @param data The data for the audit log entry.
   * @returns The created audit log record.
   */
  async createLog(data: CreateAuditLogDto) {
    const [newLog] = await (this.db as any).insert(schema.auditLogs).values({
      id: crypto.randomUUID(), // Generate a unique ID for the log
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.details,
      timestamp: data.timestamp || new Date(),
      ipAddress: data.ipAddress,
    }).returning();
    return newLog;
  }

  /**
   * Retrieves all audit log entries.
   * @returns A list of all audit log records, ordered by timestamp descending.
   */
  async findAllLogs() {
    return (this.db as any).query.auditLogs.findMany({
      orderBy: [desc(schema.auditLogs.timestamp)],
    });
  }

  /**
   * Retrieves a single audit log entry by its ID.
   * @param id The ID of the audit log entry.
   * @returns The audit log record, or undefined if not found.
   */
  async findLogById(id: string) {
    return (this.db as any).query.auditLogs.findFirst({
      where: eq(schema.auditLogs.id, id),
    });
  }

  /**
   * Retrieves audit log entries associated with a specific user.
   * @param userId The ID of the user.
   * @returns A list of audit log records for the specified user, ordered by timestamp descending.
   */
  async findLogsByUserId(userId: string) {
    return (this.db as any).query.auditLogs.findMany({
      where: eq(schema.auditLogs.userId, userId),
      orderBy: [desc(schema.auditLogs.timestamp)],
    });
  }

  /**
   * Retrieves audit log entries of a specific action.
   * @param action The type of action (e.g., 'CREATE_USER', 'UPDATE_PRODUCT', 'DELETE_ORDER').
   * @returns A list of audit log records for the specified action, ordered by timestamp descending.
   */
  async findLogsByAction(action: string) {
    return (this.db as any).query.auditLogs.findMany({
      where: eq(schema.auditLogs.action, action),
      orderBy: [desc(schema.auditLogs.timestamp)],
    });
  }

  /**
   * Retrieves audit log entries related to a specific entity.
   * @param entityType The type of the entity (e.g., 'User', 'Product').
   * @param entityId The ID of the entity.
   * @returns A list of audit log records for the specified entity, ordered by timestamp descending.
   */
  async findLogsByEntity(entityType: string, entityId: string) {
    return (this.db as any).query.auditLogs.findMany({
      where: and(
        eq(schema.auditLogs.entityType, entityType),
        eq(schema.auditLogs.entityId, entityId)
      ),
      orderBy: [desc(schema.auditLogs.timestamp)],
    });
  }
  // Audit logs are typically immutable, so update and delete methods are generally not provided.
  // If such functionality is required, it should be implemented with extreme caution
  // to maintain the integrity and trustworthiness of the audit trail.
}


