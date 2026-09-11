// AI vertical module — REQ-AI-001 (Gemini), REQ-AI-002 (context), REQ-AI-003 (persistence), REQ-AI-004 (segmentation)
import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [AuditLogModule, DatabaseModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
