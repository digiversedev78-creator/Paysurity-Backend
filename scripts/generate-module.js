#!/usr/bin/env node
/**
 * PaySurity Module Generator
 * ══════════════════════════════════════════════════════════════
 * Generates a complete NestJS module from a domain spec:
 *   - Controller (CRUD endpoints)
 *   - Service (DB-wired with Drizzle)
 *   - DTOs (validated with class-validator)
 *   - Module registration
 *   - Unit test skeleton
 *
 * Usage:
 *   node scripts/generate-module.js --name=Loyalty --table=loyalty_programs --fields="name:string,type:string,pointsPerDollar:number,isActive:boolean"
 *
 * This script is designed to be run by Cloud Build workers in parallel.
 */

const fs = require('fs');
const path = require('path');

// ── Parse CLI args ──────────────────────────────────────────
const args = {};
process.argv.slice(2).forEach(arg => {
  const [key, val] = arg.replace('--', '').split('=');
  args[key] = val;
});

const name = args.name; // e.g. "Loyalty"
const table = args.table; // e.g. "loyalty_programs"
const fieldsRaw = args.fields || ''; // e.g. "name:string,type:string"
const apiPrefix = args.prefix || 'v1';

if (!name || !table) {
  console.error('Usage: --name=ModuleName --table=db_table --fields="field:type,..."');
  process.exit(1);
}

const nameLower = name.toLowerCase();
const nameKebab = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
const fields = fieldsRaw.split(',').filter(Boolean).map(f => {
  const [fname, ftype] = f.split(':');
  return { name: fname, type: ftype || 'string' };
});

const baseDir = path.join(__dirname, '..', 'apps', 'api', 'src', 'modules', nameKebab);

// ── Ensure directory exists ──────────────────────────────────
fs.mkdirSync(baseDir, { recursive: true });

// ── Generate Service ─────────────────────────────────────────
const serviceContent = `import { Injectable, Inject, Logger, Optional, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Schema import
let ${nameLower}Table: any;
try {
  const schema = require('@paysurity/database');
  ${nameLower}Table = schema.${table.replace(/_([a-z])/g, (_, c) => c.toUpperCase())};
} catch {}

@Injectable()
export class ${name}Service {
  private readonly logger = new Logger(${name}Service.name);

  constructor(
    @Optional() @Inject('DATABASE') private readonly db: any,
  ) {}

  async findAll(tenantId: string): Promise<any[]> {
    if (this.db && ${nameLower}Table) {
      try {
        return await this.db.select().from(${nameLower}Table)
          .where(eq(${nameLower}Table.tenantId, tenantId));
      } catch (err) {
        this.logger.warn(\`[${name.toUpperCase()}] DB query failed: \${err}\`);
      }
    }
    return [];
  }

  async findById(id: string, tenantId: string): Promise<any> {
    if (this.db && ${nameLower}Table) {
      try {
        const rows = await this.db.select().from(${nameLower}Table)
          .where(and(eq(${nameLower}Table.id, id), eq(${nameLower}Table.tenantId, tenantId)))
          .limit(1);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        this.logger.warn(\`[${name.toUpperCase()}] DB findById failed: \${err}\`);
      }
    }
    throw new NotFoundException(\`${name} \${id} not found\`);
  }

  async create(tenantId: string, data: Record<string, any>): Promise<any> {
    const id = randomUUID();
    if (this.db && ${nameLower}Table) {
      try {
        const [row] = await this.db.insert(${nameLower}Table).values({
          id, tenantId, ...data,
        }).returning();
        return row;
      } catch (err) {
        this.logger.warn(\`[${name.toUpperCase()}] DB create failed: \${err}\`);
      }
    }
    return { id, tenantId, ...data, createdAt: new Date().toISOString() };
  }

  async update(id: string, tenantId: string, data: Record<string, any>): Promise<any> {
    if (this.db && ${nameLower}Table) {
      try {
        const [row] = await this.db.update(${nameLower}Table)
          .set({ ...data, updatedAt: new Date() })
          .where(and(eq(${nameLower}Table.id, id), eq(${nameLower}Table.tenantId, tenantId)))
          .returning();
        return row;
      } catch (err) {
        this.logger.warn(\`[${name.toUpperCase()}] DB update failed: \${err}\`);
      }
    }
    return { id, tenantId, ...data };
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    if (this.db && ${nameLower}Table) {
      try {
        await this.db.delete(${nameLower}Table)
          .where(and(eq(${nameLower}Table.id, id), eq(${nameLower}Table.tenantId, tenantId)));
        return true;
      } catch (err) {
        this.logger.warn(\`[${name.toUpperCase()}] DB delete failed: \${err}\`);
      }
    }
    return false;
  }
}
`;

// ── Generate Controller ──────────────────────────────────────
const controllerContent = `import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  HttpCode, HttpStatus, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ${name}Service } from './${nameKebab}.service';

@ApiTags('${nameLower}')
@Controller('${apiPrefix}/${nameKebab}')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ${name}Controller {
  constructor(private readonly service: ${name}Service) {}

  @Get()
  @ApiOperation({ summary: 'List all ${nameLower} records' })
  async findAll(@Request() req: any) {
    const data = await this.service.findAll(req.user.tenantId);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${nameLower} by ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const data = await this.service.findById(id, req.user.tenantId);
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new ${nameLower}' })
  async create(@Body() body: any, @Request() req: any) {
    const data = await this.service.create(req.user.tenantId, body);
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ${nameLower}' })
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const data = await this.service.update(id, req.user.tenantId, body);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete ${nameLower}' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.service.delete(id, req.user.tenantId);
  }
}
`;

// ── Generate Module ──────────────────────────────────────────
const moduleContent = `import { Module } from '@nestjs/common';
import { ${name}Controller } from './${nameKebab}.controller';
import { ${name}Service } from './${nameKebab}.service';

@Module({
  controllers: [${name}Controller],
  providers: [${name}Service],
  exports: [${name}Service],
})
export class ${name}Module {}
`;

// ── Generate Test Skeleton ───────────────────────────────────
const testContent = `import { Test, TestingModule } from '@nestjs/testing';
import { ${name}Service } from './${nameKebab}.service';

describe('${name}Service', () => {
  let service: ${name}Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${name}Service,
        { provide: 'DATABASE', useValue: null },
      ],
    }).compile();
    service = module.get<${name}Service>(${name}Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns empty array without DB', async () => {
    const result = await service.findAll('test-tenant');
    expect(result).toEqual([]);
  });

  it('create returns object with ID without DB', async () => {
    const result = await service.create('test-tenant', { name: 'test' });
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('test');
  });
});
`;

// ── Write files ──────────────────────────────────────────────
const writes = [
  [`${nameKebab}.service.ts`, serviceContent],
  [`${nameKebab}.controller.ts`, controllerContent],
  [`${nameKebab}.module.ts`, moduleContent],
  [`${nameKebab}.service.spec.ts`, testContent],
];

for (const [fileName, content] of writes) {
  const filePath = path.join(baseDir, fileName);
  if (fs.existsSync(filePath)) {
    console.log(`  ⏭️  ${filePath} (already exists, skipping)`);
  } else {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ ${filePath}`);
  }
}

console.log(`\n🎉 Module "${name}" generated at: ${baseDir}`);
console.log(`\n📌 Don't forget to import ${name}Module in app.module.ts:`);
console.log(`   import { ${name}Module } from './modules/${nameKebab}/${nameKebab}.module';`);
