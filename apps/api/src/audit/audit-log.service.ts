import { Injectable, Inject ,
  Optional} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { eq, sql } from 'drizzle-orm';

// Define a minimal audit logs schema locally for demonstration purposes.
// In a real application, this would typically be imported from a centralized
// Drizzle schema file (e.g., `../drizzle/schema/audit-logs.ts`) and part of
// a larger `schema` object injected into the service.
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  action: text('action').notNull(), // e.g., 'PAYMENT_CREATED', 'USER_LOGIN', 'ORDER_UPDATED'
  entityType: text('entity_type').notNull(), // e.g., 'Payment', 'Order', 'User', 'Merchant'
  entityId: text('entity_id').notNull(), // ID of the entity affected (e.g., payment_id, order_id)
  userId: text('user_id').notNull(), // ID of the user performing the action
  timestamp: timestamp('timestamp', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  details: text('details'), // Optional JSON string or descriptive text for additional context
});

// Infer types for Drizzle operations
type AuditLog = typeof auditLogs.$inferSelect; // Type for selecting audit logs
type InsertAuditLog = typeof auditLogs.$inferInsert; // Type for inserting audit logs

@Injectable()
export class AuditLogService {
  constructor(
    // The 'DATABASE' token should be provided by a Drizzle module (e.g., in app.module.ts)
    // The actual type might be NodePgDatabase<typeof schema> if a full schema object is provided.
    @Inject('DATABASE') private db: NodePgDatabase,
  ) {}

  /**
   * Logs an audit event into the database.
   * @param action The specific action performed (e.g., 'PAYMENT_CREATED', 'USER_PROFILE_UPDATED').
   * @param entityType The type of the entity that was affected (e.g., 'Payment', 'User', 'Order').
   * @param entityId The unique identifier of the affected entity.
   * @param userId The unique identifier of the user who initiated the action.
   * @param details Optional string containing additional context or JSON details of the event.
   * @returns A promise that resolves to the newly created AuditLog entry.
   * @throws Error if the audit log entry fails to be created.
   */
  async logAction(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    details?: string,
  ): Promise<AuditLog> {
    const [newLog] = await this.db
      .insert(auditLogs)
      .values({
        action,
        entityType,
        entityId,
        userId,
        details,
      } as any)
      .returning(); // .returning() fetches the inserted row, including the generated ID and timestamp

    if (!newLog) {
      throw new Error('Failed to create audit log entry.');
    }
    return newLog;
  }

  /**
   * Retrieves audit logs associated with a specific entity.
   * @param entityType The type of the entity to filter by (e.g., 'Payment', 'Order').
   * @param entityId The unique identifier of the entity.
   * @returns A promise that resolves to an array of AuditLog entries for the specified entity.
   */
  async getLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, entityId) && eq(auditLogs.entityType, entityType));
  }

  /**
   * Retrieves all audit logs from the database.
   * Caution: This method can return a very large dataset and should be used judiciously,
   * preferably with pagination and filtering in a production environment.
   * @returns A promise that resolves to an array of all AuditLog entries.
   */
  async getAllAuditLogs(): Promise<AuditLog[]> {
    return this.db.select().from(auditLogs);
  }
}
