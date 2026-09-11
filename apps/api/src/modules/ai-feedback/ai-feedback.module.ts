import { Module, Global } from '@nestjs/common';
import { AIFeedbackService } from './ai-feedback.service';
import { AIFeedbackController } from './ai-feedback.controller';
// Assuming DatabaseModule is in a sibling directory
import { AuditLogModule } from '../audit-log/audit-log.module'; // Assuming AuditLogModule is in a sibling directory

@Global()
@Module({
  imports: [
    // Provide Drizzle ORM instance
    AuditLogModule, // Enable audit logging for operations
  ],
  providers: [AIFeedbackService],
  controllers: [AIFeedbackController],
  exports: [AIFeedbackService],
})
export class AIFeedbackModule {}
