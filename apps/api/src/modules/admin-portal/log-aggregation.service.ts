import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
// Replaced local stub with unified shim import
import { auditLogs } from '@paysurity/database';

import { eq, and, sql, count, desc, asc, between } from 'drizzle-orm';
import { IsOptional, IsString, IsInt, Min, Max, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';


enum AuditLogEntityType {
  USER = 'user',
  ACCOUNT = 'account',
  TRANSACTION = 'transaction',
  PAYMENT_METHOD = 'payment_method',
  ORGANIZATION = 'organization',
  API_KEY = 'api_key',
  SETTINGS = 'settings',
  WEBHOOK = 'webhook',
  REPORT = 'report',
  PRODUCT = 'product',
  SUBSCRIPTION = 'subscription',
  INVOICE = 'invoice',
  REFUND = 'refund',
  CHARGE = 'charge',
  TRANSFER = 'transfer',
  BALANCE = 'balance',
  DISPUTE = 'dispute',
  COUPON = 'coupon',
  PLAN = 'plan',
  VAULT = 'vault',
  RISK = 'risk',
  ANALYTICS = 'analytics',
  NOTIFICATION = 'notification',
  INTEGRATION = 'integration',
  SECURITY = 'security',
  SYSTEM = 'system',
  UNKNOWN = 'unknown',
}

enum AuditLogActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  API_CALL = 'api_call',
  STATUS_CHANGE = 'status_change',
  EXPORT = 'export',
  IMPORT = 'import',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
  PROCESS = 'process',
  AUTHENTICATION_FAILED = 'authentication_failed',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET = 'password_reset',
  PROFILE_UPDATE = 'profile_update',
  EMAIL_VERIFY = 'email_verify',
  TWO_FACTOR_SETUP = 'two_factor_setup',
  TWO_FACTOR_DISABLE = 'two_factor_disable',
  SUBSCRIPTION_CREATE = 'subscription_create',
  SUBSCRIPTION_UPDATE = 'subscription_update',
  SUBSCRIPTION_CANCEL = 'subscription_cancel',
  REFUND = 'refund',
  CHARGE = 'charge',
  TRANSFER = 'transfer',
  BALANCE_ADJUSTMENT = 'balance_adjustment',
  CONFIG_UPDATE = 'config_update',
  PERMISSION_UPDATE = 'permission_update',
  ROLE_UPDATE = 'role_update',
  KEY_GENERATE = 'key_generate',
  KEY_REVOKE = 'key_revoke',
  NOTIFICATION_SENT = 'notification_sent',
  DATA_PURGE = 'data_purge',
  DATA_RETENTION_POLICY_CHANGE = 'data_retention_policy_change',
  WEBHOOK_SENT = 'webhook_sent',
  WEBHOOK_RECEIVED = 'webhook_received',
  REPORT_GENERATE = 'report_generate',
  REPORT_DOWNLOAD = 'report_download',
  BATCH_PROCESS = 'batch_process',
  FILE_UPLOAD = 'file_upload',
  FILE_DOWNLOAD = 'file_download',
  TOKEN_REFRESH = 'token_refresh',
  ACCESS_DENIED = 'access_denied',
  INITIATE = 'initiate',
  COMPLETE = 'complete',
  FAIL = 'fail',
  VOID = 'void',
  CAPTURE = 'capture',
  AUTHORIZE = 'authorize',
  CANCEL = 'cancel',
  SETTLE = 'settle',
}

export class GetLogsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsEnum(AuditLogEntityType)
  entityType?: AuditLogEntityType;

  @IsOptional()
  @IsEnum(AuditLogActionType)
  actionType?: AuditLogActionType;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: keyof typeof auditLogs.$inferSelect = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

enum LogAggregationGroupBy {
  ENTITY_TYPE = 'entityType',
  ACTION_TYPE = 'actionType',
  USER_ID = 'userId',
  DAY = 'day',
  MONTH = 'month',
  HOUR = 'hour',
}

export class GetLogAggregationDto {
  @IsOptional()
  @IsEnum(LogAggregationGroupBy)
  groupBy?: LogAggregationGroupBy = LogAggregationGroupBy.DAY;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateAuditLogDto {
  @IsEnum(AuditLogActionType)
  actionType: AuditLogActionType;

  @IsEnum(AuditLogEntityType)
  entityType: AuditLogEntityType;

  @IsString()
  entityId: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  details?: string;
}


@Injectable()
export class LogAggregationService {
  constructor(
    @Inject('DATABASE') private db: NodePgDatabase<any>,
  ) {}

  async getLogs(dto: GetLogsDto) {
    const {
      search,
      entityId,
      entityType,
      actionType,
      userId,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;

    const offset = (page - 1) * pageSize;

    const whereConditions = [];

    if (search) {
      whereConditions.push(
        sql`(${auditLogs.action} ILIKE ${`%${search}%`} OR ${auditLogs.resource} ILIKE ${`%${search}%`})`,
      );
    }
    if (entityId) {
      whereConditions.push(eq(auditLogs.resourceId, entityId));
    }
    if (entityType) {
      whereConditions.push(eq(auditLogs.resource, entityType));
    }
    if (actionType) {
      whereConditions.push(eq(auditLogs.action, actionType));
    }
    if (userId) {
      whereConditions.push(eq(auditLogs.userId, userId));
    }
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      whereConditions.push(between(auditLogs.createdAt, start, end));
    } else if (start) {
      whereConditions.push(sql`${auditLogs.createdAt} >= ${start}`);
    } else if (end) {
      whereConditions.push(sql`${auditLogs.createdAt} <= ${end}`);
    }

    const finalWhereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const logsQuery = this.db
      .select()
      .from(auditLogs)
      .where(finalWhereCondition)
      .limit(pageSize)
      .offset(offset)
      .orderBy(sortOrder === 'asc' ? asc(auditLogs[sortBy]) : desc(auditLogs[sortBy]))
      .execute();

    const countQuery = this.db
      .select({ count: count() })
      .from(auditLogs)
      .where(finalWhereCondition)
      .execute();

    const [logs, totalCountResult] = await Promise.all([logsQuery, countQuery]);
    const total = totalCountResult[0]?.count || 0;

    return {
      data: logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getLogById(id: string) {
    const log = await this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id))
      .limit(1)
      .execute();

    if (!log.length) {
      throw new NotFoundException(`Log entry with ID "${id}" not found.`);
    }
    return log[0];
  }

  async getLogAggregation(dto: GetLogAggregationDto) {
    const { groupBy = LogAggregationGroupBy.DAY, startDate, endDate } = dto;

    const whereConditions = [];
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      whereConditions.push(between(auditLogs.createdAt, start, end));
    } else if (start) {
      whereConditions.push(sql`${auditLogs.createdAt} >= ${start}`);
    } else if (end) {
      whereConditions.push(sql`${auditLogs.createdAt} <= ${end}`);
    }

    const finalWhereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    let groupByColumn: any;
    let selectFields: any = { count: count() };

    switch (groupBy) {
      case LogAggregationGroupBy.ENTITY_TYPE:
        groupByColumn = auditLogs.resource;
        selectFields = { ...selectFields, groupKey: auditLogs.resource };
        break;
      case LogAggregationGroupBy.ACTION_TYPE:
        groupByColumn = auditLogs.action;
        selectFields = { ...selectFields, groupKey: auditLogs.action };
        break;
      case LogAggregationGroupBy.USER_ID:
        groupByColumn = auditLogs.userId;
        selectFields = { ...selectFields, groupKey: auditLogs.userId };
        break;
      case LogAggregationGroupBy.MONTH:
        groupByColumn = sql`TO_CHAR(${auditLogs.createdAt}, 'YYYY-MM')`;
        selectFields = { ...selectFields, groupKey: sql`TO_CHAR(${auditLogs.createdAt}, 'YYYY-MM')` };
        break;
      case LogAggregationGroupBy.HOUR:
        groupByColumn = sql`TO_CHAR(${auditLogs.createdAt}, 'YYYY-MM-DD HH24')`;
        selectFields = { ...selectFields, groupKey: sql`TO_CHAR(${auditLogs.createdAt}, 'YYYY-MM-DD HH24')` };
        break;
      case LogAggregationGroupBy.DAY:
      default:
        groupByColumn = sql`TO_CHAR(${auditLogs.createdAt}, 'YYYY-MM-DD')`;
        selectFields = { ...selectFields, groupKey: sql`TO_CHAR(${auditLogs.createdAt}, 'YYYY-MM-DD')` };
        break;
    }

    const aggregationQuery = this.db
      .select(selectFields)
      .from(auditLogs)
      .where(finalWhereCondition)
      .groupBy(groupByColumn)
      .orderBy(sql`groupKey ASC`)
      .execute();

    return aggregationQuery;
  }

  async createLog(dto: CreateAuditLogDto) {
    const newLog = {
      action: dto.actionType,
      resource: dto.entityType,
      resourceId: dto.entityId,
      details: dto.details ? JSON.parse(dto.details) : {},
      userId: dto.userId || null,
    };

    const result = await this.db
      .insert(auditLogs)
      .values(newLog)
      .returning()
      .execute();

    return result[0];
  }
}
