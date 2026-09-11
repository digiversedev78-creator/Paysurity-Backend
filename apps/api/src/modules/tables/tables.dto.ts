/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-012 -- Table & Seating Management
 * FILE TYPE:    DTO
 * MODULE:       tables
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-058
 * GENERATED:    2026-03-17T13:07:31.497Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsString, IsNumber, IsEnum, IsOptional, Min, Max, IsUUID, IsDefined, IsInt, 
  Length} from 'class-validator';
import { Type } from 'class-transformer';

// Drizzle Schema Definitions (Assumed to be in db/schema.ts, included here for context)
// In a real project, these would be imported from a shared schema file.
import { pgTable, uuid, varchar, integer, pgEnum, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const tableStatusEnum = pgEnum('table_status', ['available', 'occupied', 'reserved', 'maintenance']);
export const tableShapeEnum = pgEnum('table_shape', ['rectangle', 'circle', 'square', 'oval']);

export const locations = pgTable('locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  address: varchar('address', { length: 512 }),
  // other location fields...
});

export const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  locationId: uuid('location_id').notNull().references(() => locations.id, { onDelete: 'cascade' }),
  tableNumber: varchar('table_number', { length: 50 }).notNull(), // e.g., "Table 1", "A1", "Bar Seat 3"
  capacity: integer('capacity').notNull(),
  status: tableStatusEnum('status').notNull().default('available'),
  shape: tableShapeEnum('shape').notNull().default('rectangle'),
  xPos: real('x_pos').notNull().default(0), // for seating layout
  yPos: real('y_pos').notNull().default(0), // for seating layout
  width: real('width').notNull().default(1), // for seating layout
  height: real('height').notNull().default(1), // for seating layout
});

export const tablesRelations = relations(tables, ({ one }) => ({
  location: one(locations, {
    fields: [tables.locationId],
    references: [locations.id],
  }),
}));

// End Drizzle Schema Definitions

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

export enum TableShape {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  SQUARE = 'square',
  OVAL = 'oval',
}

export class CreateTableDto {
  @IsUUID()
  @IsDefined()
  locationId: string;

  @IsString()
  @Length(1, 50)
  @IsDefined()
  tableNumber: string;

  @IsInt()
  @Min(1)
  @Max(200)
  @IsDefined()
  capacity: number;

  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus = TableStatus.AVAILABLE;

  @IsEnum(TableShape)
  @IsOptional()
  shape?: TableShape = TableShape.RECTANGLE;

  @IsNumber()
  @IsOptional()
  xPos?: number = 0;

  @IsNumber()
  @IsOptional()
  yPos?: number = 0;

  @IsNumber()
  @Min(0.1)
  @IsOptional()
  width?: number = 1;

  @IsNumber()
  @Min(0.1)
  @IsOptional()
  height?: number = 1;
}

export class UpdateTableDto {
  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsString()
  @Length(1, 50)
  @IsOptional()
  tableNumber?: string;

  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  capacity?: number;

  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;

  @IsEnum(TableShape)
  @IsOptional()
  shape?: TableShape;

  @IsNumber()
  @IsOptional()
  xPos?: number;

  @IsNumber()
  @IsOptional()
  yPos?: number;

  @IsNumber()
  @Min(0.1)
  @IsOptional()
  width?: number;

  @IsNumber()
  @Min(0.1)
  @IsOptional()
  height?: number;
}

export class TableQueryParamsDto {
  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  capacityMin?: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  capacityMax?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
