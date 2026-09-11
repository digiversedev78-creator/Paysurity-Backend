/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-012 -- Cash Drawer Management
 * FILE TYPE:    SERVICE
 * MODULE:       cash-drawer
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-085
 * GENERATED:    2026-03-17T13:10:40.374Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
// fixed by fix-import-paths
import { eq, and } from 'drizzle-orm';
import { AuditLogService } from '../audit-log/audit-log.service' // fixed;
import * as schema from '@paysurity/database';
type CashDrawer = any;
import { CreateCashDrawerDto, UpdateCashDrawerDto, CashDrawerStatus, DepositWithdrawalDto, CloseCashDrawerDto } from './dto/cash-drawer.dto';

@Injectable()
export class CashDrawerService {
  constructor(
    @Inject('DATABASE') private db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createCashDrawerDto: CreateCashDrawerDto,
  ): Promise<CashDrawer> {
    const { locationId, name, initialBalance, currency  } = (createCashDrawerDto as any);

    const [newDrawer] = await (this.db as any).insert((schema as any).cashDrawers).values({
      tenantId,
      locationId,
      name,
      currency,
      balance: initialBalance.toFixed(2),
      status: (CashDrawerStatus as any).OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if (!newDrawer) {
      throw new BadRequestException('Failed to create cash drawer.');
    }

    await (this.db as any).insert((schema as any).cashDrawerTransactions).values({
      tenantId,
      cashDrawerId: newDrawer.id,
      type: 'INITIAL',
      amount: initialBalance.toFixed(2),
      newBalance: initialBalance.toFixed(2),
      description: 'Initial cash drawer setup',
      timestamp: new Date(),
    });

    await (this.auditLogService as any).logAuditAction(
      'CREATE_CASH_DRAWER',
      'CashDrawer',
      newDrawer.id,
      tenantId,
      userId,
      {
        name,
        locationId,
        currency,
        initialBalance,
        status: newDrawer.status,
      },
    );

    return newDrawer;
  }

  async findAll(tenantId: string): Promise<CashDrawer[]> {
    return (this.db as any).select().from((schema as any).cashDrawers).where(eq((schema as any).cashDrawers.tenantId, tenantId));
  }

  async findOne(tenantId: string, id: string): Promise<CashDrawer> {
    const drawer = await await (this.db as any).select().from((schema as any).cashDrawers).where(and(eq((schema as any).cashDrawers.id, id), eq((schema as any).cashDrawers.tenantId, tenantId))).then((res: any[]) => res[0]);

    if (!drawer) {
      throw new NotFoundException(`Cash drawer with ID \"${id}\" not found for tenant \"${tenantId}\".`);
    }
    return drawer;
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    updateCashDrawerDto: UpdateCashDrawerDto,
  ): Promise<CashDrawer> {
    const existingDrawer = await this.findOne(tenantId, id);

    if (Object.keys(updateCashDrawerDto).length === 0) {
      return existingDrawer;
    }

    const [updatedDrawer] = await (this.db as any)
        .update((schema as any).cashDrawers)
      .set({
        ...updateCashDrawerDto,
        updatedAt: new Date(),
      })
      .where(and(eq((schema as any).cashDrawers.id, id), eq((schema as any).cashDrawers.tenantId, tenantId)))
      .returning();

    if (!updatedDrawer) {
      throw new NotFoundException(`Cash drawer with ID \"${id}\" not found or failed to update.`);
    }

    await (this.auditLogService as any).logAuditAction(
      'UPDATE_CASH_DRAWER',
      'CashDrawer',
      id,
      tenantId,
      userId,
      {
        old: { name: existingDrawer.name, locationId: existingDrawer.locationId, status: existingDrawer.status },
        new: { name: updatedDrawer.name, locationId: updatedDrawer.locationId, status: updatedDrawer.status },
        changedFields: Object.keys(updateCashDrawerDto),
      },
    );

    return updatedDrawer;
  }

  async deposit(
    tenantId: string,
    userId: string,
    id: string,
    depositWithdrawalDto: DepositWithdrawalDto,
  ): Promise<CashDrawer> {
    const { amount } = depositWithdrawalDto;
    const drawer = await this.findOne(tenantId, id);

    if (drawer.status === (CashDrawerStatus as any).CLOSED) {
      throw new BadRequestException('Cannot deposit into a closed cash drawer.');
    }

    return (this.db as any).transaction(async (tx) => {
      const currentBalance = parseFloat(drawer.balance);
      const newBalance = currentBalance + amount;

      const [updatedDrawer] = await tx
        .update((schema as any).cashDrawers)
        .set({
          balance: newBalance.toFixed(2),
          updatedAt: new Date(),
        })
        .where(and(eq((schema as any).cashDrawers.id, id), eq((schema as any).cashDrawers.tenantId, tenantId)))
        .returning();

      if (!updatedDrawer) {
        throw new BadRequestException('Failed to process deposit due to concurrent modification or drawer not found.');
      }

      await tx.insert((schema as any).cashDrawerTransactions).values({
        tenantId,
        cashDrawerId: id,
        type: 'DEPOSIT',
        amount: amount.toFixed(2),
        newBalance: newBalance.toFixed(2),
        description: `Deposit of ${amount.toFixed(2)}`,
        timestamp: new Date(),
      });

      await (this.auditLogService as any).logAuditAction(
        'CASH_DRAWER_DEPOSIT',
        'CashDrawer',
        id,
        tenantId,
        userId,
        {
          amount,
          oldBalance: currentBalance,
          newBalance,
        },
      );

      return updatedDrawer;
    });
  }

  async withdraw(
    tenantId: string,
    userId: string,
    id: string,
    depositWithdrawalDto: DepositWithdrawalDto,
  ): Promise<CashDrawer> {
    const { amount } = depositWithdrawalDto;
    const drawer = await this.findOne(tenantId, id);

    if (drawer.status === (CashDrawerStatus as any).CLOSED) {
      throw new BadRequestException('Cannot withdraw from a closed cash drawer.');
    }

    return (this.db as any).transaction(async (tx) => {
      const currentBalance = parseFloat(drawer.balance);
      if (currentBalance < amount) {
        throw new BadRequestException('Insufficient funds in cash drawer for withdrawal.');
      }

      const newBalance = currentBalance - amount;

      const [updatedDrawer] = await tx
        .update((schema as any).cashDrawers)
        .set({
          balance: newBalance.toFixed(2),
          updatedAt: new Date(),
        })
        .where(and(eq((schema as any).cashDrawers.id, id), eq((schema as any).cashDrawers.tenantId, tenantId)))
        .returning();

      if (!updatedDrawer) {
        throw new BadRequestException('Failed to process withdrawal due to concurrent modification or drawer not found.');
      }

      await tx.insert((schema as any).cashDrawerTransactions).values({
        tenantId,
        cashDrawerId: id,
        type: 'WITHDRAWAL',
        amount: amount.toFixed(2),
        newBalance: newBalance.toFixed(2),
        description: `Withdrawal of ${amount.toFixed(2)}`,
        timestamp: new Date(),
      });

      await (this.auditLogService as any).logAuditAction(
        'CASH_DRAWER_WITHDRAWAL',
        'CashDrawer',
        id,
        tenantId,
        userId,
        {
          amount,
          oldBalance: currentBalance,
          newBalance,
        },
      );

      return updatedDrawer;
    });
  }

  async closeCashDrawer(
    tenantId: string,
    userId: string,
    id: string,
    closeCashDrawerDto: CloseCashDrawerDto,
  ): Promise<CashDrawer> {
    const { finalBalance  } = (closeCashDrawerDto as any);
    const drawer = await this.findOne(tenantId, id);

    if (drawer.status === (CashDrawerStatus as any).CLOSED) {
      throw new BadRequestException('Cash drawer is already closed.');
    }

    const currentBalance = parseFloat(drawer.balance);
    // For simplicity, we just update the balance to the finalBalance provided.
    // A real system might involve a discrepancy report or require exact match.

    const [updatedDrawer] = await (this.db as any)
        .update((schema as any).cashDrawers)
      .set({
        status: (CashDrawerStatus as any).CLOSED,
        balance: finalBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(and(eq((schema as any).cashDrawers.id, id), eq((schema as any).cashDrawers.tenantId, tenantId)))
      .returning();

    if (!updatedDrawer) {
      throw new NotFoundException(`Cash drawer with ID \"${id}\" not found or failed to close.`);
    }

    await (this.auditLogService as any).logAuditAction(
      'CASH_DRAWER_CLOSE',
      'CashDrawer',
      id,
      tenantId,
      userId,
      {
        oldStatus: (CashDrawerStatus as any).OPEN,
        newStatus: (CashDrawerStatus as any).CLOSED,
        reportedFinalBalance: finalBalance,
        actualBalanceAtClose: currentBalance,
        balanceDiscrepancy: (finalBalance - currentBalance).toFixed(2)
      },
    );

    return updatedDrawer;
  }

  async openCashDrawer(
    tenantId: string,
    userId: string,
    id: string,
  ): Promise<CashDrawer> {
    const drawer = await this.findOne(tenantId, id);

    if (drawer.status === (CashDrawerStatus as any).OPEN) {
      throw new BadRequestException('Cash drawer is already open.');
    }

    const [updatedDrawer] = await (this.db as any)
        .update((schema as any).cashDrawers)
      .set({
        status: (CashDrawerStatus as any).OPEN,
        updatedAt: new Date(),
      })
      .where(and(eq((schema as any).cashDrawers.id, id), eq((schema as any).cashDrawers.tenantId, tenantId)))
      .returning();

    if (!updatedDrawer) {
      throw new NotFoundException(`Cash drawer with ID \"${id}\" not found or failed to open.`);
    }

    await (this.auditLogService as any).logAuditAction(
      'CASH_DRAWER_OPEN',
      'CashDrawer',
      id,
      tenantId,
      userId,
      {
        oldStatus: (CashDrawerStatus as any).CLOSED,
        newStatus: (CashDrawerStatus as any).OPEN,
      },
    );

    return updatedDrawer;
  }
}










