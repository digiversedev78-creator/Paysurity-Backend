/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@paysurity/database';
import { eq } from 'drizzle-orm';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<typeof schema>) {}

  async create(createAuditLogDto: CreateAuditLogDto) {
    const [auditLog] = await this.db
      .insert(schema.auditLogs)
      .values(createAuditLogDto)
      .returning();
    return auditLog;
  }

  async findAll() {
    return this.db.query.auditLogs.findMany();
  }

  async findOne(id: number) {
    return this.db.query.auditLogs.findFirst({
      where: eq(schema.auditLogs.id, id),
    });
  }

  async findByUserId(userId: string) {
    return this.db.query.auditLogs.findMany({
      where: eq(schema.auditLogs.userId, userId),
      orderBy: [schema.auditLogs.timestamp],
    });
  }

  // Audit logs are typically immutable, so update/delete methods are not usually provided.
  // If a specific use case requires 'soft deletion' or status updates for an audit log entry
  // (e.g., marking a review status for an audit event), it should be handled carefully
  // and might involve a different table or field. For a standard audit log,
  // we omit update and delete.
  // The 'create' operation is the primary way to interact with audit logs.
}
