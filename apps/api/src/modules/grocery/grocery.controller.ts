import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { GroceryService } from './grocery.service';

@Controller('grocery')
export class GroceryController {
  constructor(private readonly groceryService: GroceryService) {}

  @Get('products')
  async getProducts(@Req() req: any) {
    const tenantId = req?.headers?.['x-tenant-id'] || req?.user?.tenantId || '77777777-7777-4777-7777-777777777777';
    return (this.groceryService as any).getProducts(tenantId);
  }

  @Post('orders')
  async createOrder(@Req() req: any, @Body() payload: any) {
    const tenantId = req?.headers?.['x-tenant-id'] || req?.user?.tenantId || '77777777-7777-4777-7777-777777777777';
    const userId = req?.user?.id || 'grocery_system';
    return (this.groceryService as any).createOrder(tenantId, userId, payload);
  }
}

