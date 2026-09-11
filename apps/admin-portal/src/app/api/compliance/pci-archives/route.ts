import { NextRequest, NextResponse } from 'next/server';
import { db } from '@paysurity/database'; // assuming this exists
import { pci_audit_archives } from '@paysurity/database/schema/compliance';
import { eq, and, gte, lte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const complianceStatus = searchParams.get('complianceStatus');
    const auditPeriodStartGte = searchParams.get('auditPeriodStartGte');
    const auditPeriodEndLte = searchParams.get('auditPeriodEndLte');

    const conditions = [eq(pci_audit_archives.tenantId, tenantId)];
    if (complianceStatus) {
      conditions.push(eq(pci_audit_archives.complianceStatus, complianceStatus));
    }
    if (auditPeriodStartGte) {
      conditions.push(gte(pci_audit_archives.auditPeriodStart, new Date(auditPeriodStartGte)));
    }
    if (auditPeriodEndLte) {
      conditions.push(lte(pci_audit_archives.auditPeriodEnd, new Date(auditPeriodEndLte)));
    }

    const archives = await db
      .select()
      .from(pci_audit_archives)
      .where(and(...conditions))
      .orderBy(pci_audit_archives.createdAt);

    return NextResponse.json(archives, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    const userId = req.headers.get('x-user-id');
    if (!tenantId || !userId) {
      return NextResponse.json({ error: 'Missing tenant_id or user_id' }, { status: 400 });
    }

    const body = await req.json();
    const id = randomUUID();

    const result = await db.insert(pci_audit_archives).values({
      id,
      tenantId,
      auditPeriodStart: new Date(body.auditPeriodStart),
      auditPeriodEnd: new Date(body.auditPeriodEnd),
      reportGeneratedDate: new Date(body.reportGeneratedDate),
      complianceStatus: body.complianceStatus,
      reportUrl: body.reportUrl,
      summary: body.summary,
      archivedByUserId: body.archivedByUserId || userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
