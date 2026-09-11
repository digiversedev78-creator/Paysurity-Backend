import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, desc } from 'drizzle-orm';
import { securityEvents } from '@paysurity/database/src/schema/security';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/paysurity'
});
const db = drizzle(pool);

const withRLS = (queryBuilder: any, tenantId: string) => {
  if (!tenantId) throw new Error('Strict RLS Violation: missing tenantId');
  return queryBuilder.where(eq(securityEvents.tenantId, parseInt(tenantId, 10)));
};

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit') || '10';
    const limit = parseInt(limitParam, 10);

    const baseQuery = db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(limit);
    const events = await withRLS(baseQuery, tenantId);

    return NextResponse.json({ data: events });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
