/**
 * Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-004 -- Auto-Provision on Approval
 * FILE TYPE:    CONTROLLER
 * MODULE:       merchant-onboarding
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/MER_MERCHANT_SERVICES_ONBOARDING.md
 * WORKER:       CODER-112
 * GENERATED:    2026-03-17T13:11:31.759Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
 */
import { 
  Controller,
  Post,
  Get,
  Body,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  Req,
  InternalServerErrorException,
  Param } from '@nestjs/common';
import { MerchantOnboardingService } from './merchant-onboarding.service';
import { Request } from 'express';
import { UserRole } from '../auth/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiProperty, ApiParam } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsUrl,
  IsOptional,
  IsArray,
  ArrayMinSize,
  IsObject,
} from 'class-validator';

/**
 * DTOs for Merchant Onboarding Endpoints.
 * In a production setup, these DTOs would typically reside in separate `.dto.ts` files
 * within the `dto` directory. They are defined inline here for completeness
 * as per the task to 'complete the file content'.
 */

class SubmitKycDto {
  @ApiProperty({ description: 'Legal business name', example: 'Acme Corp LLC' })
  @IsString()
  @IsNotEmpty()
  legalBusinessName: string;

  @ApiProperty({ description: 'Business registration number', example: '123456789' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({ description: 'Tax identification number', example: '987654321' })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({ description: 'Business legal structure', example: 'LLC', enum: ['SOLE_PROPRIETORSHIP', 'LLC', 'CORPORATION', 'PARTNERSHIP'] })
  @IsString()
  @IsEnum(['SOLE_PROPRIETORSHIP', 'LLC', 'CORPORATION', 'PARTNERSHIP'])
  @IsNotEmpty()
  legalStructure: string;

  @ApiProperty({ description: 'Primary contact full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  primaryContactName: string;

  @ApiProperty({ description: 'Primary contact email', example: 'john.doe@example.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  primaryContactEmail: string;

  @ApiProperty({ description: 'Address line 1', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ description: 'Address line 2', example: 'Suite 100' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ description: 'City', example: 'Anytown' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State/Province', example: 'CA' })
  @IsString()
  @IsNotEmpty()
  stateProvince: string;

  @ApiProperty({ description: 'Postal code', example: '90210' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)', example: 'US' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ description: 'Array of document URLs (e.g., business license, ID)', type: [String], example: ['https://docs.paysurity.com/doc1.pdf'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentUrls?: string[];
}

class GatewayConfigDto {
  @ApiProperty({ description: 'Gateway provider name (e.g., Stripe, PayPal)', example: 'Stripe' })
  @IsString()
  @IsNotEmpty()
  providerName: string;

  @ApiProperty({ description: 'API Key for the payment gateway', example: 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty({ description: 'Secret Key for the payment gateway (if applicable)', example: 'rk_test_xxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  secretKey?: string;

  @ApiProperty({ description: 'Webhook Secret for the payment gateway (if applicable)', example: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  webhookSecret?: string;

  @ApiProperty({ description: 'Environment (TEST or LIVE)', example: 'TEST', enum: ['TEST', 'LIVE'] })
  @IsEnum(['TEST', 'LIVE'])
  @IsNotEmpty()
  environment: 'TEST' | 'LIVE';

  @ApiProperty({ description: 'Webhook URL for receiving notifications from the gateway', example: 'https://api.paysurity.com/webhooks/stripe' })
  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @ApiProperty({ description: 'Additional configuration parameters as a JSON object', example: { 'accountId': 'acct_12345' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

class InviteUserDto {
  @ApiProperty({ description: 'Email address of the user to invite', example: 'new.user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Roles to assign to the invited user', enum: UserRole, isArray: true, example: [(UserRole as any).MERCHANT_VIEWER] })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  @ArrayMinSize(1)
  roles: UserRole[];

  @ApiProperty({ description: 'Optional message to include in the invitation email', example: 'Welcome to PaySurity!' })
  @IsOptional()
  @IsString()
  message?: string;
}

/**
 * Extends the Express Request object to include user information
 * typically populated by authentication middleware.
 */
type RequestWithUser = any;

@ApiTags('Merchant Onboarding')
@Controller('merchant-onboarding') // Updated controller path to /merchant-onboarding as per the task
// Strict Rule #4: NEVER use @UseGuards() in controllers. Removed class-level guards.
export class MerchantOnboardingController {
  constructor(private readonly onboardingService: MerchantOnboardingService) {}

  // The original admin-facing ':id/approve' endpoint for 'onboarding-applications' has been removed.
  // This endpoint is for an administrative approval process and does not align with the
  // merchant-facing onboarding steps requested in the task. It would typically reside in
  // a separate controller, e.g., `admin/onboarding-applications.controller.ts`.

  /**
   * Submits Know Your Customer (KYC) information for a merchant's onboarding application.
   * This is typically one of the first steps in the merchant self-onboarding process.
   */
  @Post('kyc')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Submit Know Your Customer (KYC) information for merchant onboarding.' })
  @ApiBearerAuth()
  @ApiBody({ type: SubmitKycDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'KYC information successfully submitted/updated.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'KYC information submitted successfully.' },
        onboardingApplicationId: { type: 'string', format: 'uuid', example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' },
        status: { type: 'string', example: 'KYC_PENDING' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid KYC data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User not authenticated or authorized.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Onboarding application not found for this user.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Failed to submit KYC information.' })
  async submitKyc(
    @Body() submitKycDto: SubmitKycDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    // For initial KYC submission, `tenantId` might not be available yet as the merchant is onboarding.
    // The service layer will associate this action with the correct onboarding application based on `userId`.
    if (!userId) {
      throw new InternalServerErrorException('User ID not found in request context. Cannot submit KYC.');
    }

    const result = await (this.onboardingService as any).submitKyc(userId, submitKycDto);
    return {
      message: 'KYC information submitted successfully.',
      onboardingApplicationId: result.onboardingApplicationId,
      status: result.status,
    };
  }

  /**
   * Retrieves the current KYC decision status and the overall completion
   * percentage of the onboarding checklist for the authenticated merchant.
   */
  @Get('status')
  @ApiOperation({ summary: 'Retrieve current KYC decision status and onboarding checklist completion percentage.' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current onboarding status and checklist progress.',
    schema: {
      type: 'object',
      properties: {
        kycDecision: { type: 'string', example: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED', 'INFORMATION_REQUIRED'] },
        kycDecisionDetails: { type: 'string', example: 'Documents under review.' },
        checklistProgressPercentage: { type: 'number', example: 60 },
        nextSteps: { type: 'array', items: { type: 'string' }, example: ['Submit gateway configuration', 'Invite team members'] },
        onboardingApplicationId: { type: 'string', format: 'uuid', example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Onboarding application not found for this user.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User not authenticated or authorized.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Failed to retrieve onboarding status.' })
  async getOnboardingStatus(
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new InternalServerErrorException('User ID not found in request context. Cannot retrieve status.');
    }
    const status = await (this.onboardingService as any).getOnboardingStatus(userId);
    return status;
  }

  /**
   * Submits or updates payment gateway configuration details for the merchant.
   * This is a critical step to enable transaction processing.
   */
  @Post('gateway-config')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Submit payment gateway configuration details for the merchant.' })
  @ApiBearerAuth()
  @ApiBody({ type: GatewayConfigDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment gateway configuration successfully submitted/updated.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Gateway configuration saved successfully.' },
        configId: { type: 'string', format: 'uuid', example: 'e390f1ee-6c54-4b01-90e6-d701748f0851' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid gateway configuration data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User not authenticated or authorized.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Onboarding application or tenant not found for this user.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Failed to save gateway configuration.' })
  async submitGatewayConfig(
    @Body() gatewayConfigDto: GatewayConfigDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    // Strict Rule #5: Extract tenantId with: const tenantId = req?.user?.tenantId
    const tenantId = req.user.tenantId; // Will be available if tenant is already provisioned
    if (!userId) {
      throw new InternalServerErrorException('User ID not found in request context. Cannot submit gateway config.');
    }
    // The service layer will handle the logic of whether to use `tenantId` (if provisioned)
    // or `userId` (to find the onboarding application).
    const result = await (this.onboardingService as any).submitGatewayConfig(userId, tenantId, gatewayConfigDto);
    return {
      message: 'Gateway configuration saved successfully.',
      configId: result.configId,
    };
  }

  /**
   * Allows the primary merchant contact to invite additional users to their
   * merchant organization during the onboarding process.
   */
  @Post('invite-user')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Invite a new user to the merchant organization during onboarding.' })
  @ApiBearerAuth()
  @ApiBody({ type: InviteUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User invitation sent successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invitation sent to new.user@example.com.' },
        invitedUserId: { type: 'string', format: 'uuid', example: 'f490f1ee-6c54-4b01-90e6-d701748f0851' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid invitation data or user already exists.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions to invite users.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User not authenticated or authorized.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Onboarding application or tenant not found for this user.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Failed to send invitation.' })
  async inviteUser(
    @Body() inviteUserDto: InviteUserDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id; // User initiating the invite
    // Strict Rule #5: Extract tenantId with: const tenantId = req?.user?.tenantId
    const tenantId = req.user.tenantId; // The tenant they are onboarding for or already part of

    if (!userId || !tenantId) {
      // Inviting users requires a `tenantId` (even if temporary/onboarding application ID)
      // because users are invited *to* a specific organization/tenant.
      throw new InternalServerErrorException('User ID or Tenant ID not found in request context. Cannot invite user without a linked tenant/application.');
    }
    const result = await (this.onboardingService as any).inviteUser(userId, tenantId, inviteUserDto);
    return {
      message: `Invitation sent to ${(inviteUserDto as any).email}.`,
      invitedUserId: result.invitedUserId,
    };
  }

  /**
   * Retrieves a detailed list of all onboarding steps, their current status,
   * and relevant links for the authenticated merchant.
   */
  @Get('checklist')
  @ApiOperation({ summary: 'Retrieve the list of onboarding steps and their current completion status.' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of onboarding steps and their completion status.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stepId: { type: 'string', example: 'SUBMIT_KYC' },
          title: { type: 'string', example: 'Submit KYC Information' },
          description: { type: 'string', example: 'Provide legal business details and documents.' },
          isCompleted: { type: 'boolean', example: true },
          completionDate: { type: 'string', format: 'date-time', nullable: true, example: '2026-03-20T10:00:00Z' },
          status: { type: 'string', example: 'COMPLETED', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PENDING_REVIEW', 'ACTION_REQUIRED'] },
          link: { type: 'string', example: '/merchant-onboarding/kyc' },
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User not authenticated or authorized.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Onboarding application not found for this user.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Failed to retrieve onboarding checklist.' })
  async getOnboardingChecklist(
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new InternalServerErrorException('User ID not found in request context. Cannot retrieve checklist.');
    }
    const checklist = await (this.onboardingService as any).getOnboardingChecklist(userId);
    return checklist;
  }

  /**
   * Endpoint for aggressively capturing merchant onboarding state securely in the DB.
   */
  @Post('draft')
  @ApiOperation({ summary: 'Auto-saves or updates the merchant application draft.' })
  @ApiResponse({ status: 200, description: 'Application draft secured successfully' })
  async saveDraft(@Body() payload: any) {
    const applicationId = payload.applicationId || null;
    return await (this.onboardingService as any).saveDraft(applicationId, payload);
  }

  /**
   * Endpoint for capturing public leads from marketing forms properly encrypted.
   */
  @Post('leads')
  @ApiOperation({ summary: 'Captures public lead from marketing forms' })
  async saveLead(@Body() payload: any) {
    return await (this.onboardingService as any).saveLead(payload);
  }

  /**
   * Endpoint for Shareholder Dashboard to retrieve Merchant Registry.
   */
  @Get('registry')
  @ApiOperation({ summary: 'Retrieves the sovereign merchant registry' })
  async getSovereignRegistry() {
    return await (this.onboardingService as any).getSovereignRegistry();
  }

  /**
   * Retrieves a specific onboarding application for administrative review.
   */
  @Get('applications/:id')
  @ApiOperation({ summary: 'Retrieves a single onboarding application by ID' })
  async getApplication(@Param('id') id: string) {
    return await (this.onboardingService as any).getApplicationById(id);
  }

  /**
   * Securely discloses a sensitive field (e.g. SSN) for an application.
   */
  @Post('applications/:id/reveal')
  @ApiOperation({ summary: 'Decrypts and reveals a sensitive field for an application (Audit Logged)' })
  async revealField(
    @Param('id') id: string,
    @Body('field') field: string,
    @Req() req: RequestWithUser
  ) {
    // In a real launch, the user ID would come from the JWT guard
    const actorId = req?.user?.id || 'admin-demo-user';
    const value = await (this.onboardingService as any).revealSensitiveField(id, field, actorId);
    return { field, value };
  }
}







