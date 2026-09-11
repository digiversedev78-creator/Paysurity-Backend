import {
  Controller, Get, Post, Body, Param, Request, UseGuards, UnauthorizedException, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ErpService } from './erp.service';
import { JwtAuthGuard } from '@paysurity/auth';

const tenantOrThrow = (req: any): string => {
  const t = req.user?.tenantId;
  if (!t) throw new UnauthorizedException('Missing tenant context');
  return String(t);
};

@ApiTags('erp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/erp')
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  // ── Warehouses ────────────────────────────────────────────────────────────

  @Get('warehouses')
  @ApiOperation({ summary: 'List all warehouse / routing locations' })
  async getWarehouses(@Request() req: any) {
    return this.erpService.getWarehouses(tenantOrThrow(req));
  }

  @Post('warehouses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new warehouse or virtual location' })
  async createWarehouse(@Request() req: any, @Body() body: any) {
    return this.erpService.createWarehouse(tenantOrThrow(req), body);
  }

  // ── Stock / Inventory ─────────────────────────────────────────────────────

  @Get('stock')
  @ApiOperation({ summary: 'Full inventory snapshot across all warehouses' })
  async getStockSnapshot(@Request() req: any) {
    return this.erpService.getStockSnapshot(tenantOrThrow(req));
  }

  @Get('stock/:productId')
  @ApiOperation({ summary: 'Stock levels for a specific product across all warehouses' })
  async getProductStock(@Request() req: any, @Param('productId') productId: string) {
    return this.erpService.getProductStock(tenantOrThrow(req), productId);
  }

  @Post('stock-moves')
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  async processStockMove(@Request() req: any, @Body() body: any) {
    const { productId, sourceWh, destWh, qty, lotNumber } = body;
    await this.erpService.processStockMove(tenantOrThrow(req), productId, sourceWh, destWh, qty, lotNumber);
    return { success: true };
  }

  // ── Chart of Accounts ─────────────────────────────────────────────────────

  @Get('accounts')
  @ApiOperation({ summary: 'List Chart of Accounts for the tenant' })
  async getAccounts(@Request() req: any) {
    return this.erpService.getAccounts(tenantOrThrow(req));
  }

  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new account in the Chart of Accounts' })
  async createAccount(@Request() req: any, @Body() body: any) {
    return this.erpService.createAccount(tenantOrThrow(req), body);
  }

  // ── Accounting / Journals ─────────────────────────────────────────────────

  @Get('accounting/journals')
  @ApiOperation({ summary: 'View all double-entry journal entries' })
  async getJournals(@Request() req: any) {
    return this.erpService.getJournals(tenantOrThrow(req));
  }

  @Get('accounting/trial-balance')
  @ApiOperation({ summary: 'Generate real aggregated trial balance report' })
  async getTrialBalance(@Request() req: any) {
    return this.erpService.getTrialBalance(tenantOrThrow(req));
  }

  @Post('invoices/generate/:orderId')
  @ApiOperation({ summary: 'Convert POS Order into B2B PDF Invoice' })
  async generateInvoice(@Request() req: any, @Param('orderId') orderId: string) {
    return this.erpService.generateInvoice(tenantOrThrow(req), orderId);
  }

  // ── Landed Costs ──────────────────────────────────────────────────────────

  @Post('landed-costs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply landed costs (shipping, customs, insurance) to a stock move' })
  async createLandedCost(@Request() req: any, @Body() body: any) {
    return this.erpService.createLandedCost(tenantOrThrow(req), body);
  }
}
