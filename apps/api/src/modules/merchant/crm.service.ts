/**
 * CRM Integration Service
 * PORTED FROM: PS-Platform/shared/services/CRMIntegrationService.ts (704 lines)
 *
 * Contact, Deal, and Activity management with pipeline analytics.
 * Integrates payment and transaction events into CRM workflow.
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

// ─── Domain Interfaces ──────────────────────────────────────────────

export interface CRMContact {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  tags: string[];
  customFields: Record<string, any>;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMDeal {
  id: string;
  contactId: string;
  tenantId: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  status: 'open' | 'won' | 'lost' | 'cancelled';
  source: string;
  assignedTo?: string;
  notes: string;
  createdAt: Date;
}

export interface CRMActivity {
  id: string;
  contactId?: string;
  dealId?: string;
  tenantId: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'payment' | 'transaction';
  subject: string;
  description?: string;
  status: 'completed' | 'pending' | 'cancelled';
  completedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface PipelineStage {
  name: string;
  order: number;
  dealCount: number;
  totalValue: number;
  avgDaysInStage: number;
}

export interface SalesPipelineReport {
  tenantId: string;
  stages: PipelineStage[];
  totalDeals: number;
  totalPipelineValue: number;
  weightedValue: number;
  winRate: number;
  averageDealSize: number;
  averageSalesCycle: number;
}

// ─── NestJS Service ─────────────────────────────────────────────────

@Injectable()
export class CRMService {
  private readonly logger = new Logger(CRMService.name);

  private readonly DEFAULT_PIPELINE_STAGES = [
    { name: 'Lead', order: 1 },
    { name: 'Qualified', order: 2 },
    { name: 'Proposal', order: 3 },
    { name: 'Negotiation', order: 4 },
    { name: 'Closed Won', order: 5 },
    { name: 'Closed Lost', order: 6 },
  ];

  /**
   * Build a new CRM contact from merchant onboarding data.
   */
  buildContact(tenantId: string, data: Partial<CRMContact>): CRMContact {
    return {
      id: randomUUID(),
      tenantId,
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      email: data.email ?? '',
      phone: data.phone,
      company: data.company,
      position: data.position,
      source: data.source ?? 'direct',
      status: 'lead',
      tags: data.tags ?? [],
      customFields: data.customFields ?? {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Automatically create a CRM activity when a payment transaction occurs.
   * This bridges the payment engine → CRM pipeline.
   */
  buildPaymentActivity(
    tenantId: string,
    contactId: string,
    dealId: string | undefined,
    transactionId: string,
    amount: number,
    status: string,
  ): CRMActivity {
    return {
      id: randomUUID(),
      contactId,
      dealId,
      tenantId,
      type: 'payment',
      subject: `Payment ${status}: $${(amount / 100).toFixed(2)}`,
      description: `Transaction ${transactionId} -- ${status}`,
      status: 'completed',
      completedAt: new Date(),
      metadata: { transactionId, amount, paymentStatus: status },
      createdAt: new Date(),
    };
  }

  /**
   * Calculate pipeline report from deals.
   */
  calculatePipelineReport(tenantId: string, deals: CRMDeal[]): SalesPipelineReport {
    const stageMap = new Map<string, { count: number; value: number; weightedValue: number }>();

    for (const stage of this.DEFAULT_PIPELINE_STAGES) {
      stageMap.set(stage.name, { count: 0, value: 0, weightedValue: 0 });
    }

    for (const deal of deals) {
      const entry = stageMap.get(deal.stage);
      if (entry) {
        entry.count++;
        entry.value += deal.value;
        entry.weightedValue += deal.value * (deal.probability / 100);
      }
    }

    const stages: PipelineStage[] = this.DEFAULT_PIPELINE_STAGES.map(s => ({
      name: s.name,
      order: s.order,
      dealCount: stageMap.get(s.name)?.count ?? 0,
      totalValue: stageMap.get(s.name)?.value ?? 0,
      avgDaysInStage: 0, // Would be calculated from deal history
    }));

    const wonDeals = deals.filter(d => d.status === 'won');
    const lostDeals = deals.filter(d => d.status === 'lost');
    const closedDeals = wonDeals.length + lostDeals.length;

    return {
      tenantId,
      stages,
      totalDeals: deals.length,
      totalPipelineValue: deals.reduce((s, d) => s + d.value, 0),
      weightedValue: [...stageMap.values()].reduce((s, e) => s + e.weightedValue, 0),
      winRate: closedDeals > 0 ? (wonDeals.length / closedDeals) * 100 : 0,
      averageDealSize: deals.length > 0 ? deals.reduce((s, d) => s + d.value, 0) / deals.length : 0,
      averageSalesCycle: 0, // Would be calculated from deal timestamps
    };
  }

  /**
   * Score a lead based on engagement and payment data.
   */
  scoreLead(contact: CRMContact, activities: CRMActivity[], deals: CRMDeal[]): number {
    let score = 0;

    // Recency score (0-25)
    if (contact.lastActivityAt) {
      const daysSince = (Date.now() - contact.lastActivityAt.getTime()) / 86_400_000;
      score += Math.max(0, 25 - daysSince);
    }

    // Activity score (0-25)
    score += Math.min(25, activities.length * 5);

    // Deal score (0-25)
    const openDeals = deals.filter(d => d.status === 'open');
    score += Math.min(25, openDeals.length * 10);

    // Profile completeness score (0-25)
    if (contact.email) score += 5;
    if (contact.phone) score += 5;
    if (contact.company) score += 5;
    if (contact.tags.length > 0) score += 5;
    if (Object.keys(contact.customFields).length > 0) score += 5;

    return Math.min(100, Math.round(score));
  }
}
