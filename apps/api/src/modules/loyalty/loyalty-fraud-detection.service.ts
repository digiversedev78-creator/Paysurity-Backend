import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class LoyaltyFraudDetectionService {
  constructor(
    @Inject('DATABASE') private readonly db: any
  ) {}

  detectFraud(loyaltyId: string): boolean {
    return false;
  }
}
