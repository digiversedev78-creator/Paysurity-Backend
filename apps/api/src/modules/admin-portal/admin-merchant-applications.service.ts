import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { merchantApplications, adminAuditLogs } from '@paysurity/database';

@Injectable()
export class AdminMerchantApplicationsService {
  private readonly logger = new Logger(AdminMerchantApplicationsService.name);

  constructor(@Inject('DATABASE') private readonly db: any) {}

  async getApplications(limit: number = 50, offset: number = 0) {
    return (this.db as any).select()
      .from(merchantApplications)
      .orderBy(desc(merchantApplications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getApplicationById(id: string) {
    const [app] = await (this.db as any).select()
      .from(merchantApplications)
      .where(eq(merchantApplications.id, id))
      .limit(1);
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async approveApplication(id: string, adminUser: any, notes: string, ip: string) {
    const [app] = await (this.db as any).update(merchantApplications)
      .set({ 
        status: 'APPROVED', 
        reviewedBy: adminUser.email, 
        reviewNotes: notes, 
        updatedAt: new Date() 
      })
      .where(eq(merchantApplications.id, id))
      .returning();

    if (!app) throw new NotFoundException('Application not found');

    await (this.db as any).insert(adminAuditLogs).values({
      internalUserId: adminUser.id,
      action: 'APPROVE_MERCHANT_APPLICATION',
      details: { applicationId: id, notes },
      ipAddress: ip,
    }).catch(() => {});

    return app;
  }

  async rejectApplication(id: string, adminUser: any, notes: string, ip: string) {
    const [app] = await (this.db as any).update(merchantApplications)
      .set({ 
        status: 'REJECTED', 
        reviewedBy: adminUser.email, 
        reviewNotes: notes, 
        updatedAt: new Date() 
      })
      .where(eq(merchantApplications.id, id))
      .returning();

    if (!app) throw new NotFoundException('Application not found');

    await (this.db as any).insert(adminAuditLogs).values({
      internalUserId: adminUser.id,
      action: 'REJECT_MERCHANT_APPLICATION',
      details: { applicationId: id, notes },
      ipAddress: ip,
    }).catch(() => {});

    return app;
  }
}

