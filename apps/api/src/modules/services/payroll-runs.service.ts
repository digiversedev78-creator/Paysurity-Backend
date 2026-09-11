import { Injectable, Inject, NotFoundException ,
  Optional} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc } from 'drizzle-orm';
type PayrollRun = any; type NewPayrollRun = any; const payrollRunsTable: any = {};

@Injectable()
export class PayrollRunsService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<any>) {}

  /**
   * Creates a new payroll run.
   * @param data The data for the new payroll run.
   * @returns The created payroll run.
   */
  async create(data: NewPayrollRun): Promise<PayrollRun> {
    const [newPayrollRun] = await (this.db as any).insert(payrollRunsTable).values(data).returning();
    if (!newPayrollRun) {
      throw new Error('Failed to create payroll run.');
    }
    return newPayrollRun;
  }

  /**
   * Finds all payroll runs, with optional pagination and organization filtering.
   * @param page The page number (default: 1).
   * @param limit The number of items per page (default: 10).
   * @param organizationId Optional: Filter by organization ID.
   * @returns An array of payroll runs.
   */
  async findAll(page: number = 1, limit: number = 10, organizationId?: string): Promise<PayrollRun[]> {
    const offset = (page - 1) * limit;

    const query = (this.db as any).select().from(payrollRunsTable);

    if (organizationId) {
      query.where(eq(payrollRunsTable.organizationId, organizationId));
    }

    const payrollRuns = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(payrollRunsTable.createdAt));

    return payrollRuns;
  }

  /**
   * Finds a single payroll run by its ID.
   * @param id The ID of the payroll run.
   * @param organizationId Optional: Filter by organization ID to ensure ownership.
   * @returns The payroll run, or undefined if not found.
   */
  async findOne(id: string, organizationId?: string): Promise<PayrollRun | undefined> {
    const conditions = [eq(payrollRunsTable.id, id)];
    if (organizationId) {
      conditions.push(eq(payrollRunsTable.organizationId, organizationId));
    }

    const [payrollRun] = await this.db
      .select()
      .from(payrollRunsTable)
      .where(and(...conditions));

    return payrollRun;
  }

  /**
   * Updates an existing payroll run.
   * @param id The ID of the payroll run to update.
   * @param data The partial data to update.
   * @param organizationId Optional: Filter by organization ID to ensure ownership.
   * @returns The updated payroll run.
   */
  async update(id: string, data: Partial<NewPayrollRun>, organizationId?: string): Promise<PayrollRun> {
    const conditions = [eq(payrollRunsTable.id, id)];
    if (organizationId) {
      conditions.push(eq(payrollRunsTable.organizationId, organizationId));
    }

    const [updatedPayrollRun] = await this.db
      .update(payrollRunsTable)
      .set(data)
      .where(and(...conditions))
      .returning();

    if (!updatedPayrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found or unauthorized.`);
    }
    return updatedPayrollRun;
  }

  /**
   * Removes a payroll run by its ID.
   * @param id The ID of the payroll run to remove.
   * @param organizationId Optional: Filter by organization ID to ensure ownership.
   * @returns An object containing the ID of the removed payroll run.
   */
  async remove(id: string, organizationId?: string): Promise<{ id: string }> {
    const conditions = [eq(payrollRunsTable.id, id)];
    if (organizationId) {
      conditions.push(eq(payrollRunsTable.organizationId, organizationId));
    }

    const [deletedPayrollRun] = await this.db
      .delete(payrollRunsTable)
      .where(and(...conditions))
      .returning({ id: payrollRunsTable.id });

    if (!deletedPayrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found or unauthorized.`);
    }
    return deletedPayrollRun;
  }
}


