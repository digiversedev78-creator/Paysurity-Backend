import { Module, Global } from '@nestjs/common';
import { HSMIntentSpooler } from './hsm-intent-spooler';

@Global()
@Module({
  providers: [HSMIntentSpooler],
  exports: [HSMIntentSpooler],
})
export class HardwareModule {}
