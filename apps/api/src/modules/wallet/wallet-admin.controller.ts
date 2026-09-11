import { Controller, Get, Req, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';

/**
 * Serves the admin telemetry explicitly requested under /api/admin/v1/ledger/metrics
 * Placed in the wallet module per user architectural requirements.
 */
@ApiTags('wallet-admin')
@Controller('api/admin/v1/ledger')
export class WalletAdminController {
  constructor(private readonly walletService: WalletService) {}

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Live ledger snapshot for sub-super-admin operator console' })
  async getLedgerMetrics(@Req() req: any) {
    const locationId = req.headers['x-location-id'];
    if (!locationId) throw new BadRequestException('x-location-id header required');
    return (this.walletService as any).getLedgerMetrics(locationId);
  }
}

