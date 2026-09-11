import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationConsumer } from './notification.consumer';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    AuditLogModule,
    // EventEmitterModule is already global in AppModule — importing forFeature-like is fine
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationConsumer],
  exports: [NotificationService],
})
export class NotificationModule {}
