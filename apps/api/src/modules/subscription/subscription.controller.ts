import { Controller, Post, Body, HttpCode, HttpStatus, Request, Get, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  private getTenantId(req: any): string {
    return req?.user?.tenantId || req?.headers?.['x-tenant-id'] || 'system';
  }

  private getUserId(req: any): string {
    return req?.user?.id || req?.user?.userId || 'system';
  }

  @Post(':id/upgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upgrade subscription plan (immediate + proration)' })
  @ApiParam({ name: 'id', type: String, description: 'Subscription ID' })
  @ApiBody({ schema: { type: 'object', properties: { planCode: { type: 'string' } } } })
  async upgrade(
    @Request() req: any,
    @Param('id') subscriptionId: string,
    @Body() body: { planCode: string },
  ): Promise<{ success: boolean }> {
    const userId = this.getUserId(req);
    await (this.subscriptionService as any).handleUpgrade(subscriptionId, body.planCode, userId);
    return { success: true };
  }

  @Post(':id/downgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule a downgrade at period end' })
  @ApiParam({ name: 'id', type: String, description: 'Subscription ID' })
  @ApiBody({ schema: { type: 'object', properties: { planCode: { type: 'string' } } } })
  async downgrade(
    @Request() req: any,
    @Param('id') subscriptionId: string,
    @Body() body: { planCode: string },
  ): Promise<{ success: boolean }> {
    const userId = this.getUserId(req);
    await (this.subscriptionService as any).handleDowngrade(subscriptionId, body.planCode, userId);
    return { success: true };
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Generate an invoice for a subscription' })
  @ApiParam({ name: 'id', type: String, description: 'Subscription ID' })
  async generateInvoice(@Param('id') subscriptionId: string): Promise<any> {
    return (this.subscriptionService as any).generateInvoice(subscriptionId);
  }
}

