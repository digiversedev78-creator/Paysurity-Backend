import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { tenants, adminAuditLogs } from '@paysurity/database';

@Injectable()
export class AdminTenantsService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  async getTenants(limit: number = 50, offset: number = 0) {
    console.log(`[AdminTenantsService] getTenants called with limit=${limit}, offset=${offset}`);
    console.log(`[AdminTenantsService] tenants object:`, typeof tenants, tenants ? Object.keys(tenants) : 'NULL');
    try {
      const result = await (this.db as any).select().from(tenants).limit(limit).offset(offset);
      console.log(`[AdminTenantsService] getTenants found ${result.length} tenants`);
      return result;
    } catch (err) {
      console.error(`[AdminTenantsService] getTenants FAILED:`, err);
      throw err;
    }
  }

  async getTenantById(tenantId: string) {
    console.log(`[AdminTenantsService] getTenantById called for ${tenantId}`);
    try {
      const [t] = await (this.db as any).select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
      if (!t) throw new NotFoundException('Tenant not found');
      return t;
    } catch (err) {
      console.error(`[AdminTenantsService] getTenantById FAILED for ${tenantId}:`, err);
      throw err;
    }
  }

  async createTenant(data: { name: string; vertical?: string }, adminUser: any, ip: string) {
    const [t] = await (this.db as any).insert(tenants).values(data).returning();

    await (this.db as any).insert(adminAuditLogs).values({
      internalUserId: adminUser.id,
      tenantId: t.id,
      action: 'CREATE_TENANT',
      details: { name: t.name, vertical: t.vertical },
      ipAddress: ip,
    }).catch(() => {});

    return t;
  }

  async updateTenant(tenantId: string, data: { name?: string; vertical?: string }, adminUser: any, ip: string) {
    const [t] = await (this.db as any).update(tenants)
      .set(data)
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!t) throw new NotFoundException('Tenant not found');

    await (this.db as any).insert(adminAuditLogs).values({
      internalUserId: adminUser.id,
      tenantId: t.id,
      action: 'UPDATE_TENANT',
      details: data,
      ipAddress: ip,
    }).catch(() => {});

    return t;
  }

  async toggleSubscriptionVertical(tenantId: string, vertical: string, isActive: boolean, adminUser: any, ip: string) {
    // A simplified Subscription Matrix toggle. Let's assume vertical is stored directly in `tenants.vertical`
    // Alternatively, if it's an array, we'd adjust. For now, setting the primary vertical or toggling.
    const updateData = { vertical: isActive ? vertical : 'NONE' }; // Simplified action for toggling

    const [t] = await (this.db as any).update(tenants)
      .set(updateData)
      .where(eq(tenants.id, tenantId))
      .returning();

    await (this.db as any).insert(adminAuditLogs).values({
      internalUserId: adminUser.id,
      tenantId,
      action: isActive ? 'ENABLE_VERTICAL' : 'DISABLE_VERTICAL',
      details: { vertical, toggledTo: isActive },
      ipAddress: ip,
    }).catch(() => {});

    if (!t) throw new NotFoundException('Tenant update failed or tenant not found');
    return { success: true, vertical: t.vertical };
  }
}

