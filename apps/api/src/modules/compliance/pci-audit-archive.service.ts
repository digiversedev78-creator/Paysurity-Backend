import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc, asc } from 'drizzle-orm';
const pciAuditArchives: any = {};

type PciAuditArchive = typeof pciAuditArchives.$inferSelect;
type CreatePciAuditArchiveDto = typeof pciAuditArchives.$inferInsert;
type UpdatePciAuditArchiveDto = Partial<typeof pciAuditArchives.$inferInsert>;

import * as fs from 'fs/promises';

@Injectable()
export class PciAuditArchiveService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<any>) {}

  async create(data: CreatePciAuditArchiveDto): Promise<PciAuditArchive> {
    const result = await (this.db as any).insert(pciAuditArchives).values(data).returning().execute();
    
    // Simulate real storage stream by dumping a local .json file
    const archivePath = '/tmp/archive';
    await fs.mkdir(archivePath, { recursive: true });
    await fs.writeFile(`${archivePath}/pci-audit-${result[0].id}.json`, JSON.stringify(result[0], null, 2));

    return result[0];
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    sortBy?: keyof PciAuditArchive;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PciAuditArchive[]> {
    const query = (this.db as any).select().from(pciAuditArchives);

    if (options?.sortBy) {
      const sortColumn = pciAuditArchives[options.sortBy as keyof typeof pciAuditArchives];
      if (sortColumn) {
        query.orderBy(options.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));
      }
    }

    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.offset) {
      query.offset(options.offset);
    }

    return query.execute();
  }

  async findOne(id: string): Promise<PciAuditArchive | undefined> {
    const result = await (this.db as any).select().from(pciAuditArchives).where(eq(pciAuditArchives.id, id)).execute();
    return result[0];
  }

  async update(id: string, data: UpdatePciAuditArchiveDto): Promise<PciAuditArchive | undefined> {
    const result = await (this.db as any).update(pciAuditArchives).set(data).where(eq(pciAuditArchives.id, id)).returning().execute();
    return result[0];
  }

  async remove(id: string): Promise<PciAuditArchive | undefined> {
    const result = await (this.db as any).delete(pciAuditArchives).where(eq(pciAuditArchives.id, id)).returning().execute();
    return result[0];
  }
}


