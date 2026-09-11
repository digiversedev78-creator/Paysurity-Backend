import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { auditLogs } from '@paysurity/database/src/schema/audit_logs';
import { desc, eq } from 'drizzle-orm';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/paysurity'
});
const db = drizzle(pool);

// Query abstractor to enforce RLS
const withRLS = (queryBuilder: any, tenantId: string) => {
  if (!tenantId) throw new Error('Strict RLS Violation: missing tenantId');
  return queryBuilder.where(eq(auditLogs.tenantId, tenantId));
};

export async function GET(req: NextRequest) {
  try {
    // In production, context is populated from auth middleware JWTs
    const tenantId = req.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000000';
    const adminId = req.headers.get('x-admin-id');
    
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized: missing admin context' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    
    const baseQuery = db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(pageSize);
    const logs = await withRLS(baseQuery, tenantId);

    return NextResponse.json({ data: logs, total: logs.length });
  } catch (error: any) {
    console.error('Audit log fetch error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized: missing tenant context' }, { status: 401 });
    }

    const body = await req.json();
    const { action, userId, details } = body;

    if (!action || !userId) {
      return NextResponse.json({ error: 'Validation Error: missing action or userId' }, { status: 400 });
    }

    const newLog = await db.insert(auditLogs).values({
      tenantId,
      action,
      userId,
      details: details ? JSON.stringify(details) : null,
      // timestamp is defaultNow() in UTC
    }).returning();

    return NextResponse.json({ data: newLog[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Audit log insert error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
