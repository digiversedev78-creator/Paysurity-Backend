const schema: any = {};
import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
const LogStatus: any = {}; type LogStatus = any;
import { eq, and, desc, asc, sql, ilike, count } from 'drizzle-orm';

import { IsOptional, IsString, IsDateString, IsNumber, IsEnum, IsUUID, IsObject, IsDefined, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLogEntryDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsDefined()
  action: string;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsUUID()
  @IsOptional()
  entityId?: string;

  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsEnum(LogStatus)
  @IsDefined()
  status: LogStatus;
}

export class GetLogEntriesFilterDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  action?: string;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsUUID()
  @IsOptional()
  entityId?: string;

  @IsEnum(LogStatus)
  @IsOptional()
  status?: LogStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsString()
  @IsOptional()
  sortBy: 'createdAt' | 'action' | 'status' = 'createdAt';

  @IsString()
  @IsOptional()
  sortOrder: 'asc' | 'desc' = 'desc';
}

@Injectable()
export class LogAggregationService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<any>) {}

  /**
   * Creates a new log entry.
   * @param data The data for the log entry.
   * @returns The created log entry.
   */
  async createLogEntry(data: CreateLogEntryDto) {
    const [newLog] = (await (this.db as any)
      .insert((schema as any).auditLogs)
      .values({
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status,
      })
      .returning() as any);
    return newLog;
  }

  /**
   * Retrieves a log entry by its ID.
   * @param id The ID of the log entry.
   * @returns The log entry, or null if not found.
   */
  async getLogEntryById(id: string) {
    const [logEntry] = await this.db
      .select()
      .from((schema as any).auditLogs)
      .where(eq((schema as any).auditLogs.id, id));
    return logEntry;
  }

  /**
   * Retrieves a paginated and filtered list of log entries.
   * @param filters The filters and pagination options.
   * @returns An object containing the list of log entries, total count, and pagination info.
   */
  async getLogEntries(filters: GetLogEntriesFilterDto) {
    const { userId, action, entityType, entityId, status, startDate, endDate, search, page, limit, sortBy, sortOrder } = filters;

    const whereClause = [];

    if (userId) {
      whereClause.push(eq((schema as any).auditLogs.userId, userId));
    }
    if (action) {
      whereClause.push(ilike((schema as any).auditLogs.action, `%${action}%`));
    }
    if (entityType) {
      whereClause.push(ilike((schema as any).auditLogs.entityType, `%${entityType}%`));
    }
    if (entityId) {
      whereClause.push(eq((schema as any).auditLogs.entityId, entityId));
    }
    if (status) {
      whereClause.push(eq((schema as any).auditLogs.status, status));
    }
    if (startDate) {
      whereClause.push(sql`${(schema as any).auditLogs.createdAt} >= ${new Date(startDate)}`);
    }
    if (endDate) {
      whereClause.push(sql`${(schema as any).auditLogs.createdAt} <= ${new Date(endDate)}`);
    }
    if (search) {
        whereClause.push(
          sql`${(schema as any).auditLogs.action} ILIKE ${`%${search}%`} OR ${(schema as any).auditLogs.details}::text ILIKE ${`%${search}%`}`
        );
    }

    const offset = (page - 1) * limit;

    const query = this.db
      .select()
      .from((schema as any).auditLogs)
      .where(and(...whereClause))
      .limit(limit)
      .offset(offset)
      .orderBy(sortOrder === 'asc' ? asc((schema as any).auditLogs[sortBy]) : desc((schema as any).auditLogs[sortBy]));

    const logEntries = await query;

    const [totalCountResult] = await this.db
      .select({ count: count((schema as any).auditLogs.id) })
      .from((schema as any).auditLogs)
      .where(and(...whereClause));

    const total = totalCountResult.count;

    return {
      logEntries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}






