import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateMerchantDto, UpdateMerchantDto, ApplicationStatus } from './merchants.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class MerchantsService {
  private readonly logger = new Logger(MerchantsService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<Record<string, unknown>>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createMerchant(tenantId: string, userId: string, createMerchantDto: CreateMerchantDto): Promise<Record<string, unknown>> {
    const status = (createMerchantDto as any).status || ApplicationStatus.DRAFT;
    const name = (createMerchantDto as any).name;
    const taxId = (createMerchantDto as any).taxId || null;

    const query = `
      INSERT INTO merchants (tenant_id, name, tax_id, status, created_at, updated_at) 
      VALUES ($1::uuid, $2, $3, $4, NOW(), NOW()) 
      RETURNING id, tenant_id as "tenantId", name, tax_id as "taxId", status, created_at as "createdAt", updated_at as "updatedAt"
    `;

    try {
      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(query, [tenantId, name, taxId, status]);
      const newMerchant = (result as any)?.rows?.[0] || result?.[0];

      await (this.auditLogService as any).logActivity(
        tenantId,
        userId,
        'merchants',
        'MERCHANT_CREATED',
        { merchantId: newMerchant.id, name, status }
      );

      return newMerchant;
    } catch (error: unknown) {
      this.logger.error(`createMerchant failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async findAllMerchants(tenantId: string, status?: ApplicationStatus): Promise<Record<string, unknown>[]> {
    try {
      let query = `SELECT id, tenant_id as "tenantId", name, tax_id as "taxId", status, created_at as "createdAt", updated_at as "updatedAt" FROM merchants WHERE tenant_id = $1::uuid`;
      const params: unknown[] = [tenantId];

      if (status) {
        query += ` AND status = $2`;
        params.push(status);
      }

      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(query, params);
      return (result as any)?.rows || result || [];
    } catch (error: unknown) {
      this.logger.error(`findAllMerchants failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async findMerchantById(tenantId: string, merchantId: string): Promise<Record<string, unknown>> {
    try {
      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `SELECT id, tenant_id as "tenantId", name, tax_id as "taxId", status, created_at as "createdAt", updated_at as "updatedAt" FROM merchants WHERE id = $1::uuid AND tenant_id = $2::uuid LIMIT 1`,
        [merchantId, tenantId]
      );
      const merchant = (result as any)?.rows?.[0] || result?.[0];
      if (!merchant) {
        throw new NotFoundException(`Merchant with ID "${merchantId}" not found.`);
      }
      return merchant;
    } catch (error: unknown) {
      this.logger.error(`findMerchantById failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async updateMerchant(tenantId: string, userId: string, merchantId: string, updateMerchantDto: UpdateMerchantDto): Promise<Record<string, unknown>> {
    const existing = await this.findMerchantById(tenantId, merchantId);
    
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if ((updateMerchantDto as any).name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      params.push((updateMerchantDto as any).name);
    }
    if ((updateMerchantDto as any).taxId !== undefined) {
      setClauses.push(`tax_id = $${paramIndex++}`);
      params.push((updateMerchantDto as any).taxId);
    }
    if ((updateMerchantDto as any).status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      params.push((updateMerchantDto as any).status);
    }

    if (setClauses.length === 0) {
      return existing;
    }

    setClauses.push(`updated_at = NOW()`);
    params.push(merchantId);
    params.push(tenantId);

    const query = `
      UPDATE merchants 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex++}::uuid AND tenant_id = $${paramIndex++}::uuid
      RETURNING id, tenant_id as "tenantId", name, tax_id as "taxId", status, created_at as "createdAt", updated_at as "updatedAt"
    `;

    try {
      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(query, params);
      const updatedMerchant = (result as any)?.rows?.[0] || result?.[0];

      await (this.auditLogService as any).logActivity(
        tenantId,
        userId,
        'merchants',
        'MERCHANT_UPDATED',
        { merchantId, changes: updateMerchantDto }
      );

      return updatedMerchant;
    } catch (error: unknown) {
      this.logger.error(`updateMerchant failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteMerchant(tenantId: string, userId: string, merchantId: string): Promise<void> {
    await this.findMerchantById(tenantId, merchantId);

    try {
      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `UPDATE merchants SET status = 'REJECTED', updated_at = NOW() WHERE id = $1::uuid AND tenant_id = $2::uuid RETURNING id`,
        [merchantId, tenantId]
      );
      
      if (!(result as any)?.rows?.length && !(result as any)?.length) {
         throw new NotFoundException('Merchant not found.');
      }

      await (this.auditLogService as any).logActivity(
        tenantId,
        userId,
        'merchants',
        'MERCHANT_DEACTIVATED',
        { merchantId, status: 'REJECTED' }
      );
    } catch (error: unknown) {
      this.logger.error(`deleteMerchant failed: ${(error as Error).message}`);
      throw error;
    }
  }
}













