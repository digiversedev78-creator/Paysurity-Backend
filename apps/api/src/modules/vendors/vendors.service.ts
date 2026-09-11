/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-013 -- Vendor Management
 * FILE TYPE:    SERVICE
 * MODULE:       (schema as any).vendors
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-071
 * GENERATED:    2026-03-17T13:08:22.227Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, NotFoundException, ConflictException,
  Inject } from '@nestjs/common';
import { CreateVendorDto, UpdateVendorDto, VendorQueryDto, VendorStatus } from './dto/vendor.dto';
import * as schema from '@paysurity/database';
import { eq, and, like, or, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AuditLogService } from '../audit-log/audit-log.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VendorsService {
  constructor(
    @Inject('DATABASE') private db: NodePgDatabase<any>,
    private auditLogService: AuditLogService,
  ) {}

  async create(tenantId: string, userId: string, createVendorDto: CreateVendorDto) {
    const { contactEmail, ...vendorData } = createVendorDto;

    // Check for duplicate email within the tenant
    if (contactEmail) {
      const existingVendor = await (this.db as any).query?.(schema as any).vendors?.findFirst?.({
        where: and(eq((schema as any).vendors.tenantId, tenantId), eq((schema as any).vendors.email, contactEmail)),
      });
      if (existingVendor) {
        throw new ConflictException(`Vendor with email '${contactEmail}' already exists for this tenant.`);
      }
    }

    const newVendorId = uuidv4();
    const result = await (this.db as any).insert((schema as any).vendors).values({
      id: newVendorId,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...vendorData,
      email: contactEmail || null,
    }).returning();

    if (!result || result.length === 0) {
      throw new Error('Failed to create vendor.');
    }

    (this.auditLogService as any).logAuditAction({
      tenantId,
      actorId: userId,
      action: 'CREATE_VENDOR',
      targetId: newVendorId,
      details: createVendorDto as any,
    });

    return result[0];
  }

  async findAll(tenantId: string, query: VendorQueryDto) {
    const { status, search, limit = 10, offset = 0 } = query;

    const whereConditions = [
      eq((schema as any).vendors.tenantId, tenantId),
    ];

    if (status) {
      whereConditions.push(eq((schema as any).vendors.status as any, status));
    }

    if (search) {
      whereConditions.push(or(
        like((schema as any).vendors.name, `%${search}%`),
        like((schema as any).vendors.email, `%${search}%`),
      ) as any);
    }

    const allVendors = await (this.db as any).select().from((schema as any).vendors).where(and(...whereConditions)).limit(limit).offset(offset);

    const totalCountResult = await (this.db as any).select({
      count: sql<number>`count(*)`
    }).from((schema as any).vendors).where(and(...whereConditions));

    const total = totalCountResult[0]?.count ?? 0;

    return {
      data: allVendors,
      meta: {
        total,
        limit,
        offset,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const results = await (this.db as any).select().from((schema as any).vendors).where(and(eq((schema as any).vendors.id, id), eq((schema as any).vendors.tenantId, tenantId))).limit(1);
    const vendor = results?.[0];

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID '${id}' not found for this tenant.`);
    }
    return vendor;
  }

  async update(tenantId: string, userId: string, id: string, updateVendorDto: UpdateVendorDto) {
    const existingVendor = await this.findOne(tenantId, id);

    const { contactEmail, ...updateData } = updateVendorDto;

    // Check for duplicate email if email is being updated
    if (contactEmail && contactEmail !== existingVendor.email) {
      const dupeResults = await (this.db as any).select().from((schema as any).vendors).where(and(eq((schema as any).vendors.tenantId, tenantId), eq((schema as any).vendors.email, contactEmail), sql`${(schema as any).vendors.id} != ${id}`)).limit(1);
      if (dupeResults?.length) {
        throw new ConflictException(`Vendor with email '${contactEmail}' already exists for this tenant.`);
      }
    }

    const result = await (this.db as any).update((schema as any).vendors).set({
      ...updateData,
      email: contactEmail === undefined ? existingVendor.email : contactEmail || null,
      updatedAt: new Date(),
    })
    .where(and(eq((schema as any).vendors.id, id), eq((schema as any).vendors.tenantId, tenantId)))
    .returning();

    if (!result || result.length === 0) {
      throw new NotFoundException(`Vendor with ID '${id}' not found or no changes made for this tenant.`);
    }

    (this.auditLogService as any).logAuditAction({
      tenantId,
      actorId: userId,
      action: 'UPDATE_VENDOR',
      targetId: id,
      details: updateVendorDto as any,
    });

    return result[0];
  }

  async remove(tenantId: string, userId: string, id: string) {
    const existingVendor = await this.findOne(tenantId, id);

    const result = await (this.db as any).delete((schema as any).vendors)
      .where(and(eq((schema as any).vendors.id, id), eq((schema as any).vendors.tenantId, tenantId)))
      .returning();

    if (!result || result.length === 0) {
      throw new NotFoundException(`Vendor with ID '${id}' not found or already deleted for this tenant.`);
    }

    (this.auditLogService as any).logAuditAction({
      tenantId,
      actorId: userId,
      action: 'DELETE_VENDOR',
      targetId: id,
      details: { vendorName: existingVendor.name },
    });

    return { message: `Vendor with ID '${id}' successfully deleted.` };
  }
}




