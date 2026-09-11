import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsIP,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsIn
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_CHANGE_SUCCESS = 'PASSWORD_CHANGE_SUCCESS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_UNASSIGNED = 'ROLE_UNASSIGNED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  RESOURCE_CREATED = 'RESOURCE_CREATED',
  RESOURCE_UPDATED = 'RESOURCE_UPDATED',
  RESOURCE_DELETED = 'RESOURCE_DELETED',
  DATA_ACCESS = 'DATA_ACCESS',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  GENERIC = 'GENERIC',
}

export enum SecurityEventActorType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  API_KEY = 'API_KEY',
  SERVICE = 'SERVICE',
}

export enum SecurityEventSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum SecurityEventStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
  DENIED = 'DENIED',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
  IN_PROGRESS = 'IN_PROGRESS',
  UNKNOWN = 'UNKNOWN',
}

export class CreateSecurityEventDto {
  @IsNotEmpty()
  @IsEnum(SecurityEventType)
  type: SecurityEventType;

  @IsNotEmpty()
  @IsEnum(SecurityEventActorType)
  actorType: SecurityEventActorType;

  @IsOptional()
  @IsUUID('4')
  actorId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  targetType?: string;

  @IsOptional()
  @IsUUID('4')
  targetId?: string;

  @IsNotEmpty()
  @IsEnum(SecurityEventSeverity)
  severity: SecurityEventSeverity;

  @IsNotEmpty()
  @IsEnum(SecurityEventStatus)
  status: SecurityEventStatus;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class SecurityEventResponseDto extends CreateSecurityEventDto {
  @IsUUID('4')
  id: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

export class GetSecurityEventsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['id', 'createdAt', 'type', 'severity', 'actorType', 'status', 'actorId', 'targetId'])
  orderBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsEnum(SecurityEventType)
  type?: SecurityEventType;

  @IsOptional()
  @IsEnum(SecurityEventActorType)
  actorType?: SecurityEventActorType;

  @IsOptional()
  @IsUUID('4')
  actorId?: string;

  @IsOptional()
  @IsString()
  targetType?: string;

  @IsOptional()
  @IsUUID('4')
  targetId?: string;

  @IsOptional()
  @IsEnum(SecurityEventSeverity)
  severity?: SecurityEventSeverity;

  @IsOptional()
  @IsEnum(SecurityEventStatus)
  status?: SecurityEventStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
