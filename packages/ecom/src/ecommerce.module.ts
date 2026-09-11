import { Module } from '@nestjs/common';
import { ProductReviewsController } from './product-reviews/product-reviews.controller';
import { ProductReviewsService } from './product-reviews/product-reviews.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
@Module({
  imports: [AuditLogModule],
  controllers: [ProductReviewsController],
  providers: [ProductReviewsService],
  exports: [ProductReviewsService],
})
export class EcommerceModule {}
