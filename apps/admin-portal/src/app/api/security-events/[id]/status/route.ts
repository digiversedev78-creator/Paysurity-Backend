import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and } from 'drizzle-orm';
import { securityEvents } from '@paysurity/database/src/schema/security';
import { UpdateSecurityEventStatusDto } from '../dto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/paysurity'
});
const db = drizzle(pool);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateSecurityEventStatusDto = await req.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json({ error: 'Validation Error: missing status' }, { status: 400 });
    }

    const updatedEvent = await db.update(securityEvents)
      .set({ outcome: status })
      .where(and(
        eq(securityEvents.id, parseInt(params.id, 10)),
        eq(securityEvents.tenantId, parseInt(tenantId, 10))
      ))
      .returning();

    if (!updatedEvent.length) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json({ data: updatedEvent[0] });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
