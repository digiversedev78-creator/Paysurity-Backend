import { pgTable, uuid, text, timestamp, integer, jsonb, varchar, index } from 'drizzle-orm/pg-core';
export const cateringOrders = pgTable('catering_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: text('tenant_id').notNull(),
    merchantId: uuid('merchant_id').notNull(),
    customerName: text('customer_name').notNull(),
    email: text('email').notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    eventDate: timestamp('event_date', { withTimezone: true }).notNull(),
    eventType: text('event_type').notNull(),
    guestCount: integer('guest_count').notNull(),
    items: jsonb('items').notNull().$type(),
    totalBasePrice: integer('total_base_price').notNull().default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    totalDisplayPrice: integer('total_display_price').notNull().default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    depositAmount: integer('deposit_amount').notNull().default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    depositPaidAt: timestamp('deposit_paid_at', { withTimezone: true }),
    status: varchar('status', { enum: ['pending', 'confirmed', 'cancelled'] }).notNull().default('pending'),
    specialInstructions: text('special_instructions'),
    advanceNoticeHours: integer('advance_notice_hours').notNull().default(48),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
    return {
        tenantIdIdx: index('catering_orders_tenant_id_idx').on(table.tenantId),
        merchantIdIdx: index('catering_orders_merchant_id_idx').on(table.merchantId),
        eventDateIdx: index('catering_orders_event_date_idx').on(table.eventDate),
        statusIdx: index('catering_orders_status_idx').on(table.status),
    };
});
//# sourceMappingURL=catering_orders.js.map