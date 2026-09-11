import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';

@Controller()
export class AppController {
  constructor(@Inject('DATABASE') private db: any) {}

  @Get('health')
  checkHealth() {
    return { status: 'ok', service: 'PaySurity Core API', timestamp: new Date().toISOString() };
  }

  @Get('admin/system/init-db')
  async initDb() {
    try {
      // 1. Enum
      await this.db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE internal_role AS ENUM ('SUPER_ADMIN', 'CSR');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // 2. internal_users
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS internal_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          role internal_role NOT NULL DEFAULT 'CSR',
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 3. admin_audit_logs
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS admin_audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          internal_user_id UUID NOT NULL REFERENCES internal_users(id),
          tenant_id UUID,
          action VARCHAR(255) NOT NULL,
          details JSONB DEFAULT '{}',
          ip_address VARCHAR(50),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 4. tenants patch
      const cols = ['vertical', 'plan', 'status', 'kyb_status'];
      for (const col of cols) {
        await this.db.execute(sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ${sql.raw(col)} TEXT`).catch(() => {});
      }

      // 5. Seed admin
      const ADMIN_USER_ID = '22222222-0001-4000-a000-000000000001';
      await this.db.execute(sql`
        INSERT INTO internal_users (id, email, password_hash, first_name, last_name, role)
        VALUES (
          ${ADMIN_USER_ID},
          'super-admin@paysurity.com',
          '$2b$12$seed.hash.not.for.auth.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          'Super', 'Admin',
          'SUPER_ADMIN'
        )
        ON CONFLICT (id) DO NOTHING
      `);

      return { success: true, message: 'Database schema hotpatched successfully.' };
    } catch (err) {
      return { success: false, error: err.message, stack: err.stack };
    }
  }
}
