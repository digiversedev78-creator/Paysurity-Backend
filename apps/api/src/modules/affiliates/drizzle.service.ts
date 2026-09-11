import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import * as schema from '@paysurity/database';
import { eq, and, or, asc, desc, like, gte, lte } from 'drizzle-orm';

interface CreateAffiliateDto {
  userId?: string;
  organizationId?: string;
  referralCode: string;
  status?: 'active' | 'inactive' | 'pending';
  commissionRate?: number;
  notes?: string;
}

interface UpdateAffiliateDto {
  userId?: string;
  organizationId?: string;
  referralCode?: string;
  status?: 'active' | 'inactive' | 'pending';
  commissionRate?: number;
  notes?: string;
}

interface FindAffiliatesDto {
  userId?: string;
  organizationId?: string;
  referralCode?: string;
  status?: 'active' | 'inactive' | 'pending';
  minCommissionRate?: number;
  maxCommissionRate?: number;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'referralCode' | 'status' | 'commissionRate';
  orderDirection?: 'asc' | 'desc';
}

type Affiliate = any;
type NewAffiliate = any;

@Injectable()
export class AffiliatesDrizzleService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<typeof schema>) {}

  async create(createAffiliateDto: CreateAffiliateDto): Promise<Affiliate> {
    const newAffiliate: NewAffiliate = {
      ...createAffiliateDto,
      status: (createAffiliateDto as any).status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertedAffiliates = await (this.db as any).insert((schema as any).affiliates).values(newAffiliate).returning();

    if (insertedAffiliates.length === 0) {
      throw new Error('Failed to create affiliate.');
    }
    return insertedAffiliates[0];
  }

  async findAll(params?: FindAffiliatesDto): Promise<Affiliate[]> {
    const whereConditions = [];

    if (params?.userId) {
      whereConditions.push(eq((schema as any).affiliates.userId, params.userId));
    }
    if (params?.organizationId) {
      whereConditions.push(eq((schema as any).affiliates.organizationId, params.organizationId));
    }
    if (params?.referralCode) {
      whereConditions.push(eq((schema as any).affiliates.referralCode, params.referralCode));
    }
    if (params?.status) {
      whereConditions.push(eq((schema as any).affiliates.status, params.status));
    }
    if (params?.minCommissionRate !== undefined) {
      whereConditions.push(gte((schema as any).affiliates.commissionRate, params.minCommissionRate));
    }
    if (params?.maxCommissionRate !== undefined) {
      whereConditions.push(lte((schema as any).affiliates.commissionRate, params.maxCommissionRate));
    }
    if (params?.search) {
      const searchValue = `%${params.search}%`;
      whereConditions.push(
        or(
          like((schema as any).affiliates.referralCode, searchValue),
          like((schema as any).affiliates.notes, searchValue)
        )
      );
    }

    const query = (this.db as any).select().from((schema as any).affiliates).where(and(...whereConditions));

    if (params?.orderBy) {
      const orderColumn = (schema as any).affiliates[params.orderBy];
      if (orderColumn) {
        query.orderBy(params.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn));
      }
    } else {
        query.orderBy(desc((schema as any).affiliates.createdAt)); // Default sort by creation date
    }

    if (params?.limit !== undefined) {
      query.limit(params.limit);
    }
    if (params?.offset !== undefined) {
      query.offset(params.offset);
    }

    return query;
  }

  async findOne(id: string): Promise<Affiliate | undefined> {
    const affiliate = await (this.db as any).select().from((schema as any).affiliates).where(eq((schema as any).affiliates.id, id)).limit(1);
    return affiliate[0];
  }

  async update(id: string, updateAffiliateDto: UpdateAffiliateDto): Promise<Affiliate> {
    const existingAffiliate = await this.findOne(id);
    if (!existingAffiliate) {
      throw new NotFoundException(`Affiliate with ID ${id} not found.`);
    }

    const updatedAffiliates = await (this.db as any).update((schema as any).affiliates)
      .set({
        ...updateAffiliateDto,
        updatedAt: new Date(),
      })
      .where(eq((schema as any).affiliates.id, id))
      .returning();

    if (updatedAffiliates.length === 0) {
      throw new Error('Failed to update affiliate.');
    }
    return updatedAffiliates[0];
  }

  async remove(id: string): Promise<Affiliate | undefined> {
    const deletedAffiliates = await (this.db as any).delete((schema as any).affiliates)
      .where(eq((schema as any).affiliates.id, id))
      .returning();

    if (deletedAffiliates.length === 0) {
      throw new NotFoundException(`Affiliate with ID ${id} not found.`);
    }
    return deletedAffiliates[0];
  }
}












