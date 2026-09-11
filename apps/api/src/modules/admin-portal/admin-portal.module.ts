import { Module } from '@nestjs/common';
import { AdminSearchService } from './admin-search.service';
import { AdminFinanceService } from './admin-finance.service';
import { SystemHealthCronService } from './admin-health.cron';
import { AdminPortalController } from './admin-portal.controller';
import { LogAggregationService } from './log-aggregation.service';
import { LogAggregationController } from './log-aggregation.controller';

import { AdminTenantsService } from './admin-tenants.service';
import { AdminTenantsController } from './admin-tenants.controller';
import { AdminMerchantApplicationsService } from './admin-merchant-applications.service';
import { AdminMerchantApplicationsController } from './admin-merchant-applications.controller';
import { AdminFilesService } from './admin-files.service';
import { AdminFilesController } from './admin-files.controller';
import { AdminTicketsService } from './admin-tickets.service';
import { AdminTicketsController } from './admin-tickets.controller';

import { FeatureFlagModule } from '../feature-flag/feature-flag.module';

@Module({
  imports: [
    FeatureFlagModule,
  ],
  controllers: [
    AdminPortalController,
    LogAggregationController,
    AdminTenantsController,
    AdminMerchantApplicationsController,
    AdminFilesController,
    AdminTicketsController
  ],
  providers: [
    AdminSearchService,
    AdminFinanceService,
    SystemHealthCronService,
    LogAggregationService,
    AdminTenantsService,
    AdminMerchantApplicationsService,
    AdminFilesService,
    AdminTicketsService
  ],
})
export class AdminPortalModule {}
