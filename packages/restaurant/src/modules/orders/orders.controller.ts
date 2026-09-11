import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard, Roles, RolesGuard, UserRole } from '@paysurity/auth';

@Controller('orders')
@UseGuards(AuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(UserRole.BRANCH_MANAGER)
  async getOrders() {
    return this.ordersService.getOrders();
  }
}
