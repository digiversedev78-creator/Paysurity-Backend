import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { ApplicationService } from './application.service';

@Controller('v1/applications')
export class ApplicationController {
  constructor(private readonly appService: ApplicationService) {}

  @Post()
  async startApplication(@Body() body: any) {
    return (this.appService as any).startApplication({
      legalBusinessName: body.legalBusinessName,
      ownerFirstName: body.ownerFirstName,
      ownerLastName: body.ownerLastName,
      ownerEmail: body.ownerEmail,
      ownerPhone: body.ownerPhone,
      vertical: body.vertical,
      selectedPlanCode: body.selectedPlanCode,
      referralCode: body.referralCode
    });
  }

  @Get(':id')
  async getApplicationStatus(@Param('id') id: string) {
    // Return mock status for now
    return { status: 'STARTED' };
  }

  @Patch(':id')
  async updateApplication(@Param('id') id: string, @Body() body: any) {
    return { success: true };
  }

  @Post(':id/submit')
  async submitForKYB(@Param('id') id: string) {
    await (this.appService as any).runKYBChecks(id);
    return { success: true, status: 'KYB_IN_PROGRESS' };
  }

  @Get(':id/kyb-status')
  async getKybStatus(@Param('id') id: string) {
    return { status: 'PASSED' };
  }

  @Post(':id/underwrite')
  async manualUnderwrite(@Param('id') id: string, @Body() body: any) {
    await (this.appService as any).runUnderwriting(id);
    return { success: true };
  }
}

@Controller('v1/admin/applications')
export class AdminApplicationController {
  @Get()
  async getApplicationsQueue() {
    return [];
  }
}

@Controller('v1/onboarding')
export class OnboardingController {
  @Get('progress')
  async getProgress() {
    return { currentPhase: 1 };
  }

  @Patch('phase/:n')
  async completePhase(@Param('n') n: string) {
    return { success: true, phase: parseInt(n, 10) };
  }
}

@Controller('webhooks/stripe-identity')
export class StripeIdentityWebhookController {
  @Post('kyb')
  async handleKybWebhook(@Body() body: any) {
    // Handle mock Stripe webhook
    return { received: true };
  }
}

