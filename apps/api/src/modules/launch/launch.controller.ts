import { Controller, Get, Post, Patch, Body, Param, Query, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { LaunchService } from './launch.service';

@ApiTags('Launch Operations')
@Controller('v1/launch')
export class LaunchController {
  private readonly logger = new Logger(LaunchController.name);

  constructor(private readonly launch: LaunchService) {}

  // ═══ PUBLIC SIGN-UP (no auth required) ════════════════════════
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Public merchant sign-up' })
  async signup(@Body() body: {
    businessName: string; contactName: string; email: string;
    phone?: string; industry: string; estimatedMonthlyVolume?: string;
    streetName?: string; postCode?: string; townName?: string; countryCode?: string;
  }) {
    return { success: true, data: await this.launch.submitSignup(body) };
  }

  @Get('signups')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'List merchant signups' })
  getSignups(@Query('status') status?: string) {
    return { data: this.launch.getSignups(status) };
  }

  @Patch('signups/:id/approve')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a merchant signup' })
  async approveSignup(@Param('id') id: string, @Body() body: { approvedBy: string }) {
    return { data: await this.launch.approveSignup(id, body.approvedBy) };
  }

  // ═══ MERCHANT ACTIVATION ══════════════════════════════════════
  @Post('activate-alpha')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate all 4 Alpha Merchants from Sandbox → Live Production' })
  async activateAlpha() {
    return { data: await this.launch.activateAlphaMerchants() };
  }

  @Get('lifecycle')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant lifecycle events' })
  getLifecycle(@Query('tenantId') tenantId?: string) {
    return { data: this.launch.getLifecycleEvents(tenantId) };
  }

  @Get('alpha-merchants')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Alpha merchant configurations' })
  getAlphaMerchants() {
    return { data: this.launch.getAlphaMerchants() };
  }

  // ═══ DRIFT CRON ═══════════════════════════════════════════════
  @Post('drift-cron/start')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Start 5-minute high-frequency drift monitor' })
  startDriftCron() {
    return { data: this.launch.startDriftCron() };
  }

  @Post('drift-cron/stop')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Stop drift cron' })
  stopDriftCron() {
    return { data: this.launch.stopDriftCron() };
  }

  @Get('drift-cron/runs')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Get drift cron run history' })
  getDriftRuns() {
    return { data: this.launch.getDriftCronRuns() };
  }

  // ═══ PCI ARCHIVE ══════════════════════════════════════════════
  @Post('pci/archive')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive PCI-DSS audit results (pen test, PAN redaction, load test)' })
  async archivePCI() {
    return { data: await this.launch.archivePCIAuditResults() };
  }

  @Get('pci/archive')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Get PCI audit archive' })
  getPCIArchive(@Query('type') auditType?: string) {
    return { data: this.launch.getPCIArchive(auditType) };
  }

  // ═══ PLATFORM MODE ════════════════════════════════════════════
  @Post('mode/production')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Switch platform to PRODUCTION mode' })
  goProduction() {
    return { data: this.launch.switchToProduction() };
  }

  @Post('mode/maintenance')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Switch to MAINTENANCE mode' })
  goMaintenance() {
    return { data: this.launch.switchToMaintenance() };
  }

  @Get('mode')
  @ApiOperation({ summary: 'Get current platform mode' })
  getMode() {
    return { data: { mode: this.launch.getPlatformMode() } };
  }
}
