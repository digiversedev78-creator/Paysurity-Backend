import { Module } from '@nestjs/common';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { RestaurantZReportService } from './restaurant-z-report.service';
import { AuditLogModule } from '@paysurity/audit-log';
import { EventBusModule } from '@paysurity/event-bus';
import { DatabaseModule } from '@paysurity/database'; // POSR-001: DATABASE token for order + table persistence
import { MenuService } from './menu.service';
import { KDSService } from './kds.service';

@Module({
  imports: [DatabaseModule, AuditLogModule, EventBusModule], // DatabaseModule provides 'DATABASE' Inject token
  controllers: [RestaurantController],
  providers: [RestaurantService, RestaurantZReportService, MenuService, KDSService],
  exports: [RestaurantService, RestaurantZReportService, MenuService, KDSService],
})
export class RestaurantModule {}
