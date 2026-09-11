import { IsString, IsNumber, IsOptional } from 'class-validator';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import {
  Module,
  Injectable,
  Inject,
  Optional,
  CanActivate,
  ExecutionContext,
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  createParamDecorator
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthGuard } from '@nestjs/passport';

// DTO: AuditLogEntryDto
export class AuditLogEntryDto {
  @IsString()
  action: string;

  @IsString()
  entityType: string;

  @IsNumber()
  entityId: number;

  @IsString()
  @IsOptional()
  details?: string;
}

// Interface: AuditLog
export interface AuditLog {
  id: number;
  action: string;
  timestamp: Date;
  userId?: number;
}

// Enum: AuditEventType
export enum AuditEventType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
}

// Schema: Drizzle pgTable definition
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: serial('entity_id').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  userId: serial('user_id'),
  details: text('details'),
});

// Service: AuditLogService
@Injectable()
export class AuditLogService {
  constructor(@Inject('DATABASE') @Optional() private db: any) {}

  async logEvent(entry: AuditLogEntryDto): Promise<void> {
    console.log('Audit log event recorded:', entry);
    // In a real application, this.db would be used to persist the log.
  }

  async getRecentLogs(): Promise<AuditLog[]> {
    return [
      { id: 1, action: 'User login', timestamp: new Date() },
      { id: 2, action: 'Product updated', timestamp: new Date() },
    ];
  }
}

// Guard: AuditLogGuard
@Injectable()
export class AuditLogGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true; // Minimal implementation, always allows activation
  }
}

// Strategy: JwtStrategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your_super_secret_key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}

// Custom Decorator: UserAgent
export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['user-agent'];
  },
);

// Controller: AuditLogController
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get('recent')
    async getRecent(@UserAgent() userAgent: string): Promise<AuditLog[]> {
    console.log(`Request for recent logs from User-Agent: ${userAgent}`);
    return this.auditLogService.getRecentLogs();
  }

  @Post('event')
  async createEvent(@Body() auditLogEntryDto: AuditLogEntryDto): Promise<string> {
    await this.auditLogService.logEvent(auditLogEntryDto);
    return 'Audit log event recorded successfully.';
  }
}

// Module: AuditLogModuleModule
@Module({
  providers: [AuditLogService, AuditLogGuard, JwtStrategy],
  controllers: [AuditLogController],
  exports: [AuditLogService, auditLogs],
})
export class AuditLogModuleModule {}
