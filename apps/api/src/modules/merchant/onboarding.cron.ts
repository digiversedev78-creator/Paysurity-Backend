import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApplicationService } from './application.service';

@Injectable()
export class OnboardingCron {
  private readonly logger = new Logger(OnboardingCron.name);

  constructor(private readonly appService: ApplicationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSlaEscalations() {
    this.logger.debug('Running daily SLA escalation checks for onboarding applications');
    // Execute the Escalation Sentry Worker logic directly from the cron
    await (this.appService as any).process({} as any);
  }
}

