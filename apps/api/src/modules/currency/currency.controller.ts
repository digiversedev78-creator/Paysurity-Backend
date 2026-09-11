import { Controller, Get, Post, Body, Query, Headers, Logger } from '@nestjs/common';

import { CurrencyService } from './currency.service';

@Controller('v1/currency')
export class CurrencyController {
  private readonly logger = new Logger(CurrencyController.name);

  constructor(private readonly currency: CurrencyService) {}

  @Get('tax/calculate')
  calculateTax(
    @Query('state') state: string,
    @Query('subtotalCents') subtotalCents: string,
    @Query('localRate') localRate?: string,
    @Query('category') category?: string,
  ) {
    const cat = (category?.toUpperCase() ?? 'GENERAL') as 'GENERAL' | 'FOOD' | 'CLOTHING' | 'DIGITAL';
    return { data: this.currency.calculateTax(state, parseInt(subtotalCents), parseFloat(localRate ?? '0'), cat) };
  }

  @Get('tax/rates')
  getAllTaxRates() {
    return { data: this.currency.getAllTaxRates() };
  }

  @Get('fx/convert')
  convertCurrency(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amountCents') amountCents: string,
  ) {
    return { data: this.currency.convertCurrency(from, to, parseInt(amountCents)) };
  }

  @Get('fx/rates')
  getSupportedCurrencies() {
    return { data: this.currency.getSupportedCurrencies() };
  }

  @Post('settlement/crossborder')
  async crossBorderSettlement(
    @Body() body: { tenantId: string; sourceCurrency: string; targetCurrency: string; sourceAmountCents: number },
    @Headers('x-trace-id') traceId: string,
  ) {
    return { data: await this.currency.processCrossBorderSettlement(
      body.tenantId, body.sourceCurrency, body.targetCurrency, body.sourceAmountCents, traceId || 'fx-settle',
    )};
  }
}
