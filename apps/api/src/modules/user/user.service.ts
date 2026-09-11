import { Injectable, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
  ) {}

  async findById(userId: string): Promise<Record<string, any> | null> {
    try {
      const result = await (this.db as any).execute(sql`
        SELECT id, email, tenant_id, created_at FROM users WHERE id = ${userId}::uuid LIMIT 1
      `);
      return result[0] ?? null;
    } catch (error) {
      this.logger.error(`findById failed: ${error.message}`);
      return null;
    }
  }

  async findByEmail(email: string): Promise<Record<string, any> | null> {
    try {
      const result = await (this.db as any).execute(sql`
        SELECT id, email, tenant_id, password_hash, created_at FROM users WHERE email = ${email} LIMIT 1
      `);
      return result[0] ?? null;
    } catch (error) {
      this.logger.error(`findByEmail failed: ${error.message}`);
      return null;
    }
  }
}

