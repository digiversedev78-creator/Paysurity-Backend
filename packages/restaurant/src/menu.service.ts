import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// CRITICAL RULE: NEVER import from @paysurity/database, @paysurity/auth, drizzle-orm/node-postgres, @app/*, src/*
// This means we cannot import 'sql' from 'drizzle-orm' or similar.
// We MUST assume 'sql' is globally available or implicitly provided by the framework context
// where NodePgDatabase is injected, to satisfy Rule #8 "Use raw sql`` template literals for all database queries".
// A 'declare const sql: any;' is used to satisfy TypeScript.
declare const sql: any;

// Assuming AuditLogService is available via a relative path that doesn't violate Rule #3.
// If this path is wrong or violates rules, it needs adjustment based on actual project structure.
import { AuditLogService } from '../audit-log/audit-log.service';

// Define table and column names as constants for consistency and to minimize magic strings.
// We cannot define full Drizzle schemas as we cannot import pgTable, etc. from 'drizzle-orm/pg-core'.
const TABLE_RESTAURANTS = 'restaurants';
const TABLE_MENUS = 'menus';
const TABLE_MENU_CATEGORIES = 'menu_categories';
const TABLE_MENU_ITEMS = 'menu_items';
const TABLE_PRICE_HISTORY = 'price_history';
const TABLE_MODIFIER_GROUPS = 'modifier_groups';
const TABLE_MODIFIERS = 'modifiers';
const TABLE_ITEM_MODIFIER_GROUPS = 'item_modifier_groups';
const TABLE_ITEM_SCHEDULES = 'item_schedules';

// Interface definitions for DTOs to provide some type safety to returned data.
interface Menu {
  id: string;
  tenantId: string;
  restaurantId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface Category {
  id: string;
  tenantId: string;
  menuId: string;
  name: string;
  description: string | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface MenuItem {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  currentPrice: number;
  isEbtEligible: boolean;
  is86d: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  modifierGroups?: ModifierGroupWithModifiers[]; // For fetching item details
}

interface ModifierGroup {
  id: string;
  tenantId: string;
  name: string;
  selectionType: 'single' | 'multiple'; // e.g., 'size_choice', 'add_extra'
  minSelection: number;
  maxSelection: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface Modifier {
  id: string;
  tenantId: string;
  modifierGroupId: string;
  name: string;
  priceOffset: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface ModifierGroupWithModifiers extends ModifierGroup {
  modifiers: Modifier[];
  itemModifierGroupId: string; // ID from the join table for this specific item-modifier group association
  itemModifierGroupOrderIndex: number;
}

interface PriceHistory {
  id: string;
  tenantId: string;
  itemId: string;
  oldPrice: number;
  newPrice: number;
  changeDate: Date;
  userId: string;
}

interface ItemSchedule {
  id: string;
  tenantId: string;
  itemId: string;
  startTime: string; // HH:MM:SS
  endTime: string;   // HH:MM:SS
  price: number;
  dayOfWeek: number[]; // e.g., [0, 1, 2] for Sun, Mon, Tue
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

@Injectable()
export class MenuService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getMenu(tenantId: string) {
    const taxRes = await this.db.execute(sql`SELECT rate FROM tax_nexus WHERE tenant_id = ${tenantId} LIMIT 1`);
    const taxRate = taxRes?.rows?.[0]?.rate || 0.0825;

    const result = await this.db.execute(sql`
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.current_price AS "priceCents",
        mc.name AS category
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.tenant_id = ${tenantId} AND mi.is_active = true
      ORDER BY mc.order_index ASC, mi.name ASC
    `);
    
    // Map to Match UI format
    const items = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price_cents: row.priceCents || row.price_cents,
      category: row.category || 'Uncategorized',
      emoji: '🍽️'
    }));

    return { items, taxRate };
  }
}
