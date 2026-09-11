import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * AIFeedbackService -- Logs unknown intents for merchant knowledge base improvement.
 * Part of the PILON Launch Protocol AI Learning Loop.
 */

export interface AIFeedbackEntry {
  id: string;
  tenantId: string;
  locationId?: string | undefined;
  sessionToken?: string | undefined;
  channel: string;
  consumerMessage: string;
  detectedIntent: string;
  aiResponse: string;
  wasHelpful?: boolean | undefined;
  merchantNotes?: string | undefined;
  resolutionStatus: string;
  languageCode: string;
  createdAt: string;
}

@Injectable()
export class AIFeedbackService {
  private readonly logger = new Logger(AIFeedbackService.name);
  private readonly store: AIFeedbackEntry[] = [];

  async logUnknownIntent(params: {
    tenantId: string;
    locationId?: string;
    sessionToken?: string;
    channel?: string;
    consumerMessage: string;
    aiResponse: string;
    detectedIntent?: string;
    languageCode?: string;
  }): Promise<AIFeedbackEntry> {
    const entry: AIFeedbackEntry = {
      id: randomUUID(),
      tenantId: params.tenantId,
      locationId: params.locationId,
      sessionToken: params.sessionToken,
      channel: params.channel || 'WEB_WIDGET',
      consumerMessage: params.consumerMessage,
      detectedIntent: params.detectedIntent || 'UNKNOWN',
      aiResponse: params.aiResponse,
      resolutionStatus: 'PENDING',
      languageCode: params.languageCode || 'en',
      createdAt: new Date().toISOString(),
    };
    this.store.push(entry);
    this.logger.log(
      `[AI-FEEDBACK] Unknown intent logged for tenant=${params.tenantId}: "${params.consumerMessage.substring(0, 80)}"`,
    );
    return entry;
  }

  async getFeedback(tenantId: string, filters?: {
    status?: string | undefined;
    intent?: string | undefined;
    limit?: number | undefined;
  }): Promise<{ entries: AIFeedbackEntry[]; totalCount: number; pendingCount: number }> {
    let filtered = this.store.filter(e => e.tenantId === tenantId);
    if (filters?.status) filtered = filtered.filter(e => e.resolutionStatus === filters.status);
    if (filters?.intent) filtered = filtered.filter(e => e.detectedIntent === filters.intent);
    const pending = this.store.filter(e => e.tenantId === tenantId && e.resolutionStatus === 'PENDING').length;
    const limited = filtered.slice(0, filters?.limit || 50);
    return { entries: limited, totalCount: filtered.length, pendingCount: pending };
  }

  async updateResolution(id: string, update: {
    resolutionStatus: string;
    merchantNotes?: string;
  }): Promise<AIFeedbackEntry | null> {
    const entry = this.store.find(e => e.id === id);
    if (!entry) return null;
    entry.resolutionStatus = update.resolutionStatus;
    if (update.merchantNotes) entry.merchantNotes = update.merchantNotes;
    this.logger.log(`[AI-FEEDBACK] Entry ${id} → ${update.resolutionStatus}`);
    return entry;
  }

  async getAnalytics(tenantId: string): Promise<{
    totalFeedback: number;
    unknownCount: number;
    pendingReview: number;
    addedToKB: number;
    topUnknownQuestions: { message: string; count: number }[];
  }> {
    const all = this.store.filter(e => e.tenantId === tenantId);
    const unknown = all.filter(e => e.detectedIntent === 'UNKNOWN');
    const pending = all.filter(e => e.resolutionStatus === 'PENDING');
    const added = all.filter(e => e.resolutionStatus === 'ADDED_TO_KB');

    // Group unknown messages by similarity (simple prefix matching)
    const msgCounts: Record<string, number> = {};
    unknown.forEach(e => {
      const key = e.consumerMessage.toLowerCase().substring(0, 50);
      msgCounts[key] = (msgCounts[key] || 0) + 1;
    });
    const topUnknown = Object.entries(msgCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    return {
      totalFeedback: all.length,
      unknownCount: unknown.length,
      pendingReview: pending.length,
      addedToKB: added.length,
      topUnknownQuestions: topUnknown,
    };
  }
}
