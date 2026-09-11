import {
  Controller, Get, Post, Body, Param, Request, UseGuards, UnauthorizedException, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ErpService } from './erp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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

  // â”€â”€ Warehouses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Get('warehouses')
  @ApiOperation({ summary: 'List all warehouse / routing locations' })
  async getWarehouses(@Request() req: any) {
    return (this.erpService as any).getWarehouses(tenantOrThrow(req));
  }

  @Post('warehouses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new warehouse or virtual location' })
  async createWarehouse(@Request() req: any, @Body() body: any) {
    return (this.erpService as any).createWarehouse(tenantOrThrow(req), body);
  }

  // â”€â”€ Stock / Inventory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Get('stock')
  @ApiOperation({ summary: 'Full inventory snapshot across all warehouses' })
  async getStockSnapshot(@Request() req: any) {
    return (this.erpService as any).getStockSnapshot(tenantOrThrow(req));
  }

  @Get('stock/:productId')
  @ApiOperation({ summary: 'Stock levels for a specific product across all warehouses' })
  async getProductStock(@Request() req: any, @Param('productId') productId: string) {
    return (this.erpService as any).getProductStock(tenantOrThrow(req), productId);
  }

  @Post('stock-moves')
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  async processStockMove(@Request() req: any, @Body() body: any) {
    const { productId, sourceWh, destWh, qty, lotNumber } = body;
    await (this.erpService as any).processStockMove(tenantOrThrow(req), productId, sourceWh, destWh, qty, lotNumber);
    return { success: true };
  }

  // â”€â”€ Chart of Accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Get('accounts')
  @ApiOperation({ summary: 'List Chart of Accounts for the tenant' })
  async getAccounts(@Request() req: any) {
    return (this.erpService as any).getAccounts(tenantOrThrow(req));
  }

  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new account in the Chart of Accounts' })
  async createAccount(@Request() req: any, @Body() body: any) {
    return (this.erpService as any).createAccount(tenantOrThrow(req), body);
  }

  // â”€â”€ Accounting / Journals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Get('accounting/journals')
  @ApiOperation({ summary: 'View all double-entry journal entries' })
  async getJournals(@Request() req: any) {
    return (this.erpService as any).getJournals(tenantOrThrow(req));
  }

  @Get('accounting/trial-balance')
  @ApiOperation({ summary: 'Generate real aggregated trial balance report' })
  async getTrialBalance(@Request() req: any) {
    return (this.erpService as any).getTrialBalance(tenantOrThrow(req));
  }

  @Post('invoices/generate/:orderId')
  @ApiOperation({ summary: 'Convert POS Order into B2B PDF Invoice' })
  async generateInvoice(@Request() req: any, @Param('orderId') orderId: string) {
    return (this.erpService as any).generateInvoice(tenantOrThrow(req), orderId);
  }

  // â”€â”€ Landed Costs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Post('landed-costs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply landed costs (shipping, customs, insurance) to a stock move' })
  async createLandedCost(@Request() req: any, @Body() body: any) {
    return (this.erpService as any).createLandedCost(tenantOrThrow(req), body);
  }
}

