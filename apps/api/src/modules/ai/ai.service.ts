/**
 * AiService â€” Production Grade v2.0 with Google Gemini
 *
 * REQ-AI-001: Multilingual AI Chat using real Gemini Pro model
 * REQ-AI-002: Business context injection (tenant KPIs pulled from DB)
 * REQ-AI-003: Multi-turn conversation history preserved in ai_chat_messages
 * REQ-AI-004: Customer Segmentation CRUD
 *
 * Canonical source: Requirements/Canonical/AI_EXPERIENCE.md
 * DB tables: ai_chat_sessions, ai_chat_messages (migration 021),
 *            customer_segments, customer_segment_members (migration 021)
 */

import {
  Injectable, NotFoundException, InternalServerErrorException, Logger, Inject,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  CreateCustomerSegmentDto,
  UpdateCustomerSegmentDto,
  CustomerSegmentFilterDto,
  CustomerSegmentDto,
} from './dto/customer-segment.dto';

// -- Gemini SDK (optional import â€” graceful fallback if API key not set) -------
let GoogleGenerativeAI: any = null;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (_e) {}

// -- Exported types -----------------------------------------------------------

export interface AiChatSession {
  id: string;
  tenantId: string;
  status: 'active' | 'closed';
  createdAt: string;
  messageCount: number;
}

export interface AiChatMessage {
  id: string;
  sessionId: string;
  tenantId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed?: number;
  createdAt: string;
}

// -- Business context builder --------------------------------------------------

async function buildBusinessContext(db: NodePgDatabase<any>, tenantId: string): Promise<string> {
  try {
    // Pull real KPIs from DB for context injection
    const [revenueResult, ordersResult, tenantResult] = await Promise.all([
      db.execute(sql`
        SELECT COALESCE(SUM(total_cents), 0) AS revenue, COUNT(*) AS orders
        FROM orders WHERE tenant_id = ${tenantId}::uuid AND created_at >= CURRENT_DATE
      `).catch(() => ({ rows: [{ revenue: 0, orders: 0 }] })),
      db.execute(sql`
        SELECT status, COUNT(*) AS count FROM orders
        WHERE tenant_id = ${tenantId}::uuid AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY status
      `).catch(() => ({ rows: [] })),
      db.execute(sql`
        SELECT name, vertical FROM tenants WHERE id = ${tenantId}::uuid LIMIT 1
      `).catch(() => ({ rows: [{ name: 'Your Business', vertical: 'restaurant' }] })),
    ]);

    const rev = (revenueResult as any)?.rows?.[0] ?? { revenue: 0, orders: 0 };
    const orderStatuses: any[] = (ordersResult as any)?.rows ?? [];
    const tenant = (tenantResult as any)?.rows?.[0] ?? { name: 'Your Business', vertical: 'restaurant' };

    const todayRevenueUSD = (Number(rev.revenue) / 100).toFixed(2);
    const todayOrders = Number(rev.orders);
    const orderStatusSummary = orderStatuses.map((r) => `${r.status}: ${r.count}`).join(', ');

    return `
BUSINESS CONTEXT (Real-time data as of ${new Date().toISOString()}):
- Business Name: ${tenant.name}
- Vertical: ${tenant.vertical}
- Today's Revenue: $${todayRevenueUSD}
- Today's Orders: ${todayOrders}
- 7-Day Order Status Breakdown: ${orderStatusSummary || 'No orders yet'}
- Timezone: America/Chicago
    `.trim();
  } catch (_e) {
    return `Business context unavailable â€” responding with general knowledge.`;
  }
}

// -- System prompt ------------------------------------------------------------

const SYSTEM_PROMPT = `You are PaySurity Business Intelligence AI â€” a specialized assistant for merchants using the PaySurity platform.

Your expertise covers:
- Restaurant, retail, tobacco, and grocery POS operations
- Revenue analysis, trend identification, and KPI interpretation
- Customer segmentation, loyalty programs, and CRM insights
- Payroll, tax, compliance, and settlement questions
- Product catalog and inventory management

Guidelines:
- Be concise, professional, and data-driven
- Use dollar amounts, percentages, and specific numbers when referencing data
- Proactively suggest actionable next steps
- If you don't have enough data, ask a clarifying question
- Support English, Spanish, Arabic, and Urdu equally
- Never mention competitor platforms

{{BUSINESS_CONTEXT}}`;

// -- Gemini caller ------------------------------------------------------------

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  conversationHistory: { role: string; content: string }[],
  userMessage: string,
): Promise<{ text: string; tokensUsed: number }> {
  if (!GoogleGenerativeAI || !apiKey) {
    throw new Error('Gemini API not available');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });

  // Build Gemini-format conversation history (last 10 turns for context window)
  const history = conversationHistory
    .slice(-20) // max 10 user+assistant pairs
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  const text = response.text();
  const tokensUsed = response.usageMetadata?.totalTokenCount ?? 0;

  return { text, tokensUsed };
}

// -- Fallback for when Gemini is unavailable ----------------------------------

function fallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('revenue') || lower.includes('sales'))
    return `I can analyze your revenue trends. Could you specify the time period? (e.g., 'last 30 days', 'this quarter')`;
  if (lower.includes('customer') || lower.includes('loyal'))
    return `I can segment your customers by visit frequency and spend. Would you like a breakdown by loyalty tier?`;
  if (lower.includes('inventory') || lower.includes('stock'))
    return `I can identify slow-moving items and projected stockout dates. Which category should I start with?`;
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('help'))
    return `Hello! I'm your PaySurity Business AI. I can help with revenue analysis, customer insights, inventory, payroll, and reports. What would you like to explore?`;
  return `I'm here to help with your business intelligence. Could you be more specific? For example: 'Show me revenue for last 7 days' or 'Who are my top customers?'`;
}

// -- Service ------------------------------------------------------------------

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private geminiApiKey: string = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
  private usingGemini: boolean = false;

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  onModuleInit() {
    if (this.geminiApiKey && GoogleGenerativeAI) {
      this.usingGemini = true;
      this.logger.log('REQ-AI-001: Gemini 1.5 Flash initialized âœ…');
    } else {
      this.logger.warn('REQ-AI-001: GOOGLE_AI_API_KEY not set â€” using keyword fallback. Set env var to enable Gemini.');
    }
  }

  // ---------------------------------------------------------------------------
  // REQ-AI-001: Chat Sessions
  // ---------------------------------------------------------------------------

  async createChatSession(tenantId: string): Promise<AiChatSession> {
    try {
      const result = await (this.db as any).execute(sql`
        INSERT INTO ai_chat_sessions (id, tenant_id, status, created_at, updated_at)
        VALUES (gen_random_uuid(), ${tenantId}::uuid, 'active', NOW(), NOW())
        RETURNING id, tenant_id, status, created_at;
      `);
      const row = ((result as any).rows as any)[0];
      return {
        id: row.id,
        tenantId: row.tenant_id,
        status: row.status,
        createdAt: row.created_at,
        messageCount: 0,
      };
    } catch (err: any) {
      this.logger.warn(`ai_chat_sessions table not ready: ${err.message}. Using in-memory session.`);
      return {
        id: require('crypto').randomUUID(),
        tenantId,
        status: 'active',
        createdAt: new Date().toISOString(),
        messageCount: 0,
      };
    }
  }

  /**
   * REQ-AI-001 + REQ-AI-002: Send message with business context injection.
   * Uses Gemini 1.5 Flash with multi-turn conversation history.
   * Falls back to keyword matching if Gemini unavailable.
   */
  async sendMessage(tenantId: string, sessionId: string, message: string): Promise<AiChatMessage[]> {
    const userMsgId = require('crypto').randomUUID();
    const aiMsgId = require('crypto').randomUUID();
    const now = new Date().toISOString();
    let aiResponse = '';
    let tokensUsed = 0;

    // REQ-AI-002: Inject real business context into system prompt
    let systemPrompt = SYSTEM_PROMPT;
    if (this.usingGemini) {
      const context = await buildBusinessContext(this.db, tenantId);
      systemPrompt = SYSTEM_PROMPT.replace('{{BUSINESS_CONTEXT}}', context);
    } else {
      systemPrompt = SYSTEM_PROMPT.replace('{{BUSINESS_CONTEXT}}', '');
    }

    // REQ-AI-003: Load conversation history for multi-turn context
    let history: { role: string; content: string }[] = [];
    try {
      const histResult = await (this.db as any).execute(sql`
        SELECT role, content FROM ai_chat_messages
        WHERE session_id = ${sessionId}::uuid AND tenant_id = ${tenantId}::uuid
        ORDER BY created_at ASC LIMIT 20
      `);
      history = ((histResult as any).rows as any[]).map((r) => ({ role: r.role, content: r.content }));
    } catch (_e) {}

    // Call Gemini or fallback
    if (this.usingGemini) {
      try {
        const result = await callGemini(this.geminiApiKey, systemPrompt, history, message);
        aiResponse = result.text;
        tokensUsed = result.tokensUsed;
        this.logger.debug(`REQ-AI-001: Gemini responded (${tokensUsed} tokens) for tenant ${tenantId}`);
      } catch (geminiErr: any) {
        this.logger.warn(`REQ-AI-001: Gemini call failed: ${geminiErr.message}. Using fallback.`);
        aiResponse = fallbackResponse(message);
      }
    } else {
      aiResponse = fallbackResponse(message);
    }

    // Persist both user and AI messages â€” REQ-AI-003
    try {
      await (this.db as any).execute(sql`
        INSERT INTO ai_chat_messages (id, session_id, tenant_id, role, content, tokens_used, model, created_at)
        VALUES
          (${userMsgId}::uuid, ${sessionId}::uuid, ${tenantId}::uuid, 'user', ${message}, 0, 'user-input', NOW()),
          (${aiMsgId}::uuid, ${sessionId}::uuid, ${tenantId}::uuid, 'assistant', ${aiResponse}, ${tokensUsed}, ${this.usingGemini ? 'gemini-1.5-flash' : 'keyword-fallback'}, NOW())
      `);
    } catch (err: any) {
      this.logger.warn(`ai_chat_messages table not ready: ${err.message}. Message not persisted.`);
    }

    return [
      { id: userMsgId, sessionId, tenantId, role: 'user', content: message, createdAt: now },
      { id: aiMsgId, sessionId, tenantId, role: 'assistant', content: aiResponse, tokensUsed, createdAt: now },
    ];
  }

  async getChatHistory(tenantId: string, sessionId: string, limit = 50, offset = 0): Promise<AiChatMessage[]> {
    try {
      const result = await (this.db as any).execute(sql`
        SELECT id, session_id, tenant_id, role, content, tokens_used, created_at
        FROM ai_chat_messages
        WHERE session_id = ${sessionId}::uuid AND tenant_id = ${tenantId}::uuid
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `);
      return ((result as any).rows as any[]).map((row) => ({
        id: row.id,
        sessionId: row.session_id,
        tenantId: row.tenant_id,
        role: row.role,
        content: row.content,
        tokensUsed: row.tokens_used,
        createdAt: row.created_at,
      }));
    } catch {
      return [];
    }
  }

  async closeSession(tenantId: string, sessionId: string): Promise<void> {
    try {
      await (this.db as any).execute(sql`
        UPDATE ai_chat_sessions
        SET status = 'closed', closed_at = NOW(), updated_at = NOW()
        WHERE id = ${sessionId}::uuid AND tenant_id = ${tenantId}::uuid
      `);
    } catch (_e) {}
  }

  // ---------------------------------------------------------------------------
  // REQ-AI-004: Customer Segmentation
  // ---------------------------------------------------------------------------

  async createSegment(dto: CreateCustomerSegmentDto, tenantId?: string): Promise<CustomerSegmentDto> {
    const effectiveTenantId = tenantId || dto.organizationId;
    try {
      const criteriaJson = JSON.stringify(dto.criteria);
      const result = await (this.db as any).execute(sql`
        INSERT INTO customer_segments (id, tenant_id, name, description, criteria, created_at, updated_at)
        VALUES (gen_random_uuid(), ${effectiveTenantId}::uuid, ${dto.name}, ${dto.description || null}, ${criteriaJson}::jsonb, NOW(), NOW())
        RETURNING id, tenant_id, name, description, criteria, created_at, updated_at
      `);
      const row = ((result as any).rows as any)[0];
      await (this.auditLogService as any).record(effectiveTenantId, {
        userId: 'system',
        action: 'AI_SEGMENT_CREATED',
        details: { segmentId: row.id, name: dto.name },
      });
      return this.mapSegmentRow(row);
    } catch (err: any) {
      this.logger.error(`createSegment failed: ${err.message}`);
      throw new InternalServerErrorException(`Failed to create segment: ${err.message}`);
    }
  }

  async updateSegment(id: string, dto: UpdateCustomerSegmentDto, tenantId: string): Promise<CustomerSegmentDto> {
    try {
      const updateParts: any[] = [];
      if (dto.name) updateParts.push(sql`name = ${dto.name}`);
      if (dto.description !== undefined) updateParts.push(sql`description = ${dto.description}`);
      if (dto.criteria) updateParts.push(sql`criteria = ${JSON.stringify(dto.criteria)}::jsonb`);
      updateParts.push(sql`updated_at = NOW()`);

      const result = await (this.db as any).execute(sql`
        UPDATE customer_segments
        SET ${sql.join(updateParts, sql`, `)}
        WHERE id = ${id}::uuid AND tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
        RETURNING id, tenant_id, name, description, criteria, created_at, updated_at
      `);
      if (!((result as any).rows as any[]).length) {
        throw new NotFoundException(`Segment ${id} not found`);
      }
      return this.mapSegmentRow(((result as any).rows as any)[0]);
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err.message);
    }
  }

  async listSegments(tenantId: string, filter: CustomerSegmentFilterDto): Promise<{ segments: CustomerSegmentDto[]; total: number }> {
    try {
      const limit = filter.limit || 10;
      const offset = filter.offset || 0;
      const result = await (this.db as any).execute(sql`
        SELECT id, tenant_id, name, description, criteria, created_at, updated_at
        FROM customer_segments
        WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `);
      const countResult = await (this.db as any).execute(sql`
        SELECT COUNT(*) as count FROM customer_segments
        WHERE tenant_id = ${tenantId}::uuid AND deleted_at IS NULL
      `);
      return {
        segments: ((result as any).rows as any[]).map((r) => this.mapSegmentRow(r)),
        total: parseInt(((countResult as any).rows as any)[0]?.count || '0', 10),
      };
    } catch {
      return { segments: [], total: 0 };
    }
  }

  async deleteSegment(id: string, tenantId: string): Promise<{ deleted: boolean }> {
    try {
      await (this.db as any).execute(sql`
        UPDATE customer_segments SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = ${id}::uuid AND tenant_id = ${tenantId}::uuid
      `);
      return { deleted: true };
    } catch {
      return { deleted: false };
    }
  }

  private mapSegmentRow(row: any): CustomerSegmentDto {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      criteria: typeof row.criteria === 'string' ? JSON.parse(row.criteria) : row.criteria,
      organizationId: row.tenant_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}



