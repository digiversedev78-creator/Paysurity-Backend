import { Injectable, Inject, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { supportTickets, csrSpecialties, adminAuditLogs, tenants } from '@paysurity/database';

@Injectable()
export class AdminTicketsService {
  private readonly logger = new Logger(AdminTicketsService.name);

  constructor(@Inject('DATABASE') private readonly db: any) {}

  async createTicket(data: { tenantId: string; issueContext: string }, adminUser: any, ip: string) {
    const [ticket] = await (this.db as any).insert(supportTickets).values({
      tenantId: data.tenantId,
      issueContext: data.issueContext,
      csrId: adminUser.role === 'CSR' ? adminUser.id : null, // assign to self if CSR creates it
      status: 'OPEN',
    }).returning();

    await (this.db as any).insert(adminAuditLogs).values({
      internalUserId: adminUser.id,
      tenantId: data.tenantId,
      action: 'CREATE_SUPPORT_TICKET',
      details: { ticketId: ticket.id },
      ipAddress: ip,
    }).catch(() => {});

    return ticket;
  }

  async updateTicketStatus(ticketId: string, status: 'OPEN' | 'PENDING' | 'ESCALATED' | 'CLOSED', adminUser: any, ip: string) {
    const closedAt = status === 'CLOSED' ? new Date() : null;

    const [ticket] = await (this.db as any).update(supportTickets)
      .set({ status, closedAt, updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId))
      .returning();

    if (!ticket) throw new NotFoundException('Ticket not found');

    await (this.db as any).insert(adminAuditLogs).values({
      internalUserId: adminUser.id,
      tenantId: ticket.tenantId,
      action: 'UPDATE_TICKET_STATUS',
      details: { ticketId, newStatus: status },
      ipAddress: ip,
    }).catch(() => {});

    return ticket;
  }

  async getQueue(adminUser: any) {
    // Phase 5 fix: Fetch the CSR's active tickets for the UI
    const query = (this.db as any).select().from(supportTickets);
    // If not super admin, scope to their own tickets
    if (adminUser.role === 'CSR') {
      return query.where(eq(supportTickets.csrId, adminUser.id));
    }
    return query; // Super admins see all queue
  }

  async getTicketContext(ticketId: string, adminUser: any) {
    const [ticket] = await (this.db as any).select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1);
    if (!ticket) throw new NotFoundException('Ticket not found');

    // Strict Enforcer Phase 4 applies here: if hitting tenant context through a ticket, verify scoping!
    if (adminUser.role === 'CSR') {
      await this.verifyCsrScope(adminUser.id, ticket.tenantId, 'fetchContext');
    }

    return ticket;
  }

  /**
   * STRICT ENFORCER PHASE 4:
   * Verify CSR possesses an OPEN ticket for the given tenant AND the tenant's vertical matches their specialty.
   */
  async verifyCsrScope(csrId: string, tenantId: string, requestedAction: string) {
    // 1. Fetch Tenant Vertical
    const [targetTenant] = await (this.db as any).select({ vertical: tenants.vertical }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!targetTenant) {
      throw new NotFoundException('Target tenant not found');
    }

    // 2. Fetch CSR Specialties
    const assignedSpecialties = await (this.db as any).select({ vertical: csrSpecialties.vertical })
      .from(csrSpecialties)
      .where(eq(csrSpecialties.internalUserId, csrId));

    const hasVerticalAccess = assignedSpecialties.some(s => s.vertical === targetTenant.vertical);

    // 3. Fetch CSR OPEN tickets for this tenant
    const openTickets = await (this.db as any).select()
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.csrId, csrId),
          eq(supportTickets.tenantId, tenantId),
          inArray(supportTickets.status, ['OPEN', 'PENDING', 'ESCALATED']) // Accept active tickets
        )
      );

    const hasActiveTicket = openTickets.length > 0;

    if (!hasVerticalAccess || !hasActiveTicket) {
      // VIOLATION - STRICT LOGGING
      const attemptDetails = {
        requestedAction,
        targetTenantVertical: targetTenant.vertical,
        hasVerticalAccess,
        hasActiveTicket
      };

      await (this.db as any).insert(adminAuditLogs).values({
        internalUserId: csrId,
        tenantId,
        action: 'UNAUTHORIZED_CSR_SCOPE_ATTEMPT',
        details: attemptDetails,
      }).catch(err => this.logger.error('Failed logging scope violation', err));

      throw new ForbiddenException('CSR Scope Enforcer: Unauthorized. You must possess an active support ticket and vertical access for this tenant.');
    }

    return true; // Execution authorized
  }

  async fetchTenantDataSecure(tenantId: string, adminUser: any, ip: string) {
    // Scaffolded endpoint representing "fetching data outside context"
    if (adminUser.role === 'CSR') {
      await this.verifyCsrScope(adminUser.id, tenantId, 'FETCH_TENANT_SECURE_DATA');
    }

    // Data fetched successfully. Log access.
    await (this.db as any).insert(adminAuditLogs).values({
        internalUserId: adminUser.id,
        tenantId,
        action: 'FETCH_TENANT_SECURE_DATA',
        ipAddress: ip,
    }).catch(() => {});

    return { data: 'SECURE_TENANT_TRANSACTIONS_OR_DATA_BLOB' };
  }
}

