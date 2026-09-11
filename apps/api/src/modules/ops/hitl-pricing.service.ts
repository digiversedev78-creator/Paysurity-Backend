import { Injectable, Logger } from '@nestjs/common';

export interface PricingVarianceAlert {
  itemId: string;
  itemName: string;
  oldPrice: number;
  newPrice: number;
  variancePct: number;
  status: 'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED';
}

@Injectable()
export class HitlPricingService {
  private readonly logger = new Logger(HitlPricingService.name);
  private readonly VARIANCE_THRESHOLD = 0.20; // 20%

  /**
   * REQ-OPS-004: HITL Pricing Variance Trigger
   * Checks if a price change exceeds the 20% threshold.
   */
  async checkPriceVariance(
    itemName: string,
    oldPrice: number,
    newPrice: number,
  ): Promise<PricingVarianceAlert | null> {
    const variance = Math.abs(newPrice - oldPrice) / oldPrice;

    if (variance > this.VARIANCE_THRESHOLD) {
      this.logger.warn(
        `🚨 HITL TRIGGER: Pricing variance for "${itemName}" is ${(variance * 100).toFixed(2)}% (Threshold: 20%)`,
      );
      
      return {
        itemId: 'stub-uuid',
        itemName,
        oldPrice,
        newPrice,
        variancePct: variance,
        status: 'PENDING_APPROVAL',
      };
    }

    return null;
  }
}
