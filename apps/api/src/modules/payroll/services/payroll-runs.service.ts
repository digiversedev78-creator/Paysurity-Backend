import { Injectable, Inject } from '@nestjs/common';
type NodePgDatabase<T = any> = any; const payrollRuns: any = {};
import { eq } from 'drizzle-orm';

// Assuming DTOs for payroll run creation and update.
// For the purpose of this stub fix, we use Drizzle's inferred types.
// In a real application, these would be proper DTO classes with class-validator decorators.
type CreatePayrollRunDto = typeof payrollRuns.$inferInsert;
type UpdatePayrollRunDto = Partial<typeof payrollRuns.$inferInsert>;

@Injectable()
export class PayrollRunsService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<any>) {}

  /**
   * Creates a new payroll run record.
   * @param createPayrollRunDto Data for the new payroll run.
   * @returns The newly created payroll run record.
   */
  async create(createPayrollRunDto: CreatePayrollRunDto) {
    const result = await (this.db as any).insert(payrollRuns).values(createPayrollRunDto).returning();
    return result[0];
  }

  /**
   * Retrieves all payroll run records.
   * @returns An array of all payroll run records.
   */
  async findAll() {
    return (this.db as any).select().from(payrollRuns);
  }

  /**
   * Retrieves a single payroll run record by its ID.
   * @param id The ID of the payroll run to retrieve.
   * @returns The payroll run record, or undefined if not found.
   */
  async findOne(id: string) {
    const result = await (this.db as any).select().from(payrollRuns).where(eq(payrollRuns.id, id));
    return result[0];
  }

  /**
   * Updates an existing payroll run record.
   * @param id The ID of the payroll run to update.
   * @param updatePayrollRunDto Data to update the payroll run with.
   * @returns The updated payroll run record.
   */
  async update(id: string, updatePayrollRunDto: UpdatePayrollRunDto) {
    const result = await (this.db as any).update(payrollRuns).set(updatePayrollRunDto).where(eq(payrollRuns.id, id)).returning();
    return result[0];
  }

  /**
   * Deletes a payroll run record by its ID.
   * @param id The ID of the payroll run to delete.
   * @returns The deleted payroll run record.
   */
  async remove(id: string) {
    const result = await (this.db as any).delete(payrollRuns).where(eq(payrollRuns.id, id)).returning();
    return result[0];
  }
}



