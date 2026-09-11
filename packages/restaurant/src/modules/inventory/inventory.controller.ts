import { Controller, Get, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AiSandboxGuard, AuthGuard, Roles, RolesGuard, UserRole } from '@paysurity/auth';

@Controller('inventory')
@UseGuards(AuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('predict-stock')
  @UseGuards(AiSandboxGuard)
  @Roles(UserRole.BRANCH_MANAGER)
  async predictStock() {
    return this.inventoryService.predictStock();
  }

  @Get('cross-location-report')
  @Roles(UserRole.TENANT_ADMIN)
  async getCrossLocationReport() {
    return this.inventoryService.getCrossLocationReport();
  }
}
