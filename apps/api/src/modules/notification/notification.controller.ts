/**
 * NotificationController â€” Phase 3C (clean rebuild)
 * 
 * Provides REST endpoints for direct notification dispatch:
 *   POST /notifications/email
 *   POST /notifications/sms
 *   POST /notifications/push
 */

import {
  Controller, Post, Body, HttpCode, HttpStatus, Logger,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';
import {
  NotificationService,
  NotificationResult,
} from './notification.service';
import { AuditLogService } from '../audit-log/audit-log.service';

// â”€â”€ DTOs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsString()
  @IsOptional()
  html?: string;
}

export class SendSmsDto {
  @IsString()
  to: string; // E.164 phone number

  @IsString()
  body: string;
}

export class SendPushDto {
  @IsString()
  expoPushToken: string;

  @IsString()
  title: string;

  @IsString()
  body: string;
}

// â”€â”€ Controller â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
  ) {}

  private getTenantId(req: any): string {
    return req?.user?.tenantId || req?.headers?.['x-tenant-id'] || 'system';
  }

  private getUserId(req: any): string {
    return req?.user?.id || req?.user?.userId || 'system';
  }

  @Post('email')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a transactional email notification' })
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({ status: 202, description: 'Email queued for delivery.' })
  async sendEmail(@Body() dto: SendEmailDto, @Request() req: any): Promise<NotificationResult> {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);
    this.logger.log(`[EMAIL] Triggered by ${userId} for tenant ${tenantId} â†’ ${dto.to}`);
    const result = await (this.notificationService as any).send({
      channel: 'email',
      tenantId,
      to: dto.to,
      subject: dto.subject,
      body: dto.body,
      html: dto.html,
    });
    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'NOTIFICATION_EMAIL_SENT',
      details: { to: dto.to, subject: dto.subject, success: result.success },
    });
    return result;
  }

  @Post('sms')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send an SMS notification (TCPA + rate-limit enforced)' })
  @ApiBody({ type: SendSmsDto })
  @ApiResponse({ status: 202, description: 'SMS queued (subject to opt-in + rate limit).' })
  async sendSms(@Body() dto: SendSmsDto, @Request() req: any): Promise<NotificationResult> {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);
    const result = await (this.notificationService as any).send({
      channel: 'sms',
      tenantId,
      to: dto.to,
      body: dto.body,
    });
    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'NOTIFICATION_SMS_SENT',
      details: { to: dto.to, success: result.success },
    });
    return result;
  }

  @Post('push')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a push notification via Expo' })
  @ApiBody({ type: SendPushDto })
  @ApiResponse({ status: 202, description: 'Push notification dispatched.' })
  async sendPush(@Body() dto: SendPushDto, @Request() req: any): Promise<NotificationResult> {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);
    const result = await (this.notificationService as any).send({
      channel: 'push',
      tenantId,
      to: dto.expoPushToken,
      subject: dto.title,
      body: dto.body,
    });
    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'NOTIFICATION_PUSH_SENT',
      details: { token: dto.expoPushToken, success: result.success },
    });
    return result;
  }
}

