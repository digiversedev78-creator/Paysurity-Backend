import { Injectable, Logger } from '@nestjs/common';
import { IProviderAdapter } from '../../../interfaces/IProviderAdapter';
import { FluidPayAdapter } from './fluidpay.adapter';
import { NMIAdapter } from './nmi.adapter';
import { ArgyleAdapter } from './argyle.adapter';

/**
 * GatewayRouter -- Selects the correct payment adapter per tenant/merchant config.
 *
 * All 3 Phase-1 gateways (FluidPay, NMI, Argyle) are registered here.
 * The ORC PaymentService uses this router instead of a single adapter.
 *
 * Selection priority:
 *   1. Merchant-specific gateway override (merchant_config.preferred_gateway)
 *   2. Tenant default gateway (tenant_config.default_gateway)
 *   3. Platform fallback: FluidPay
 *
 * Future: Add automatic failover when circuit breaker trips.
 */

export type GatewayName = 'FLUIDS_PAY' | 'NMI' | 'ARGYLE';

@Injectable()
export class GatewayRouter {
  private readonly logger = new Logger(GatewayRouter.name);
  private readonly adapters: Map<GatewayName, IProviderAdapter>;

  constructor(
    private readonly fluidpay: FluidPayAdapter,
    private readonly nmi: NMIAdapter,
    private readonly argyle: ArgyleAdapter,
  ) {
    this.adapters = new Map<GatewayName, IProviderAdapter>(
      [['FLUIDS_PAY', this.fluidpay as any], ['NMI', this.nmi as any], ['ARGYLE', this.argyle as any]]
    );
  }

  /**
   * Resolve the correct adapter for a given merchant/tenant configuration.
   */
  resolve(
    merchantGateway?: string,
    tenantGateway?: string,
  ): IProviderAdapter {
    // 1. Merchant override
    if (merchantGateway) {
      const adapter = this.adapters.get(merchantGateway.toUpperCase() as GatewayName);
      if (adapter) {
        this.logger.debug(`[ROUTER] Using merchant-preferred gateway: ${merchantGateway}`);
        return adapter;
      }
    }

    // 2. Tenant default
    if (tenantGateway) {
      const adapter = this.adapters.get(tenantGateway.toUpperCase() as GatewayName);
      if (adapter) {
        this.logger.debug(`[ROUTER] Using tenant-default gateway: ${tenantGateway}`);
        return adapter;
      }
    }

    // 3. Platform fallback
    this.logger.debug(`[ROUTER] Using platform fallback: FluidPay`);
    return this.fluidpay as any;
  }

  /**
   * Get health status for all gateways.
   */
  async getAllHealthStatuses(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    for (const [name, adapter] of this.adapters) {
      try {
        results[name] = await adapter.getHealthStatus();
      } catch {
        results[name] = { status: 'ERROR', checkedAt: new Date().toISOString() };
      }
    }
    return results;
  }

  /**
   * List available gateways.
   */
  getAvailableGateways(): string[] {
    return [...this.adapters.keys()];
  }

  /**
   * Get the resolved gateway name for a given merchant/tenant config.
   * Used by PaymentService to persist gateway name to DB.
   */
  getGatewayName(merchantGateway?: string, tenantGateway?: string): GatewayName {
    if (merchantGateway) {
      const name = merchantGateway.toUpperCase() as GatewayName;
      if (this.adapters.has(name)) return name;
    }
    if (tenantGateway) {
      const name = tenantGateway.toUpperCase() as GatewayName;
      if (this.adapters.has(name)) return name;
    }
    return 'FLUIDS_PAY';
  }
}
