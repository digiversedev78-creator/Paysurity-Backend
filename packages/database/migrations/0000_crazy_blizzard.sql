CREATE TYPE "public"."internal_role" AS ENUM('SUPER_ADMIN', 'CSR');--> statement-breakpoint
CREATE TYPE "public"."support_ticket_status" AS ENUM('OPEN', 'PENDING', 'ESCALATED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."system_health_status" AS ENUM('GREEN', 'YELLOW', 'RED');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"tenant_id" uuid,
	"is_active" boolean DEFAULT true,
	"roles" text[] DEFAULT '{}',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"internal_user_id" uuid NOT NULL,
	"tenant_id" uuid,
	"action" varchar(255) NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"ip_address" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "csr_specialties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"internal_user_id" uuid NOT NULL,
	"vertical" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "internal_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone" varchar(20),
	"role" "internal_role" DEFAULT 'CSR' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "internal_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"csr_id" uuid,
	"status" "support_ticket_status" DEFAULT 'OPEN' NOT NULL,
	"issue_context" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_health_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component" varchar(100) NOT NULL,
	"ping_latency_ms" integer NOT NULL,
	"status" "system_health_status" NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "merchant_applications" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(255),
	"status" varchar(50) DEFAULT 'Draft' NOT NULL,
	"application_name" varchar(255) DEFAULT '' NOT NULL,
	"sales_partner" varchar(255),
	"template" varchar(255),
	"principal_email" varchar(255) DEFAULT '' NOT NULL,
	"principal_phone" varchar(50) DEFAULT '' NOT NULL,
	"first_name" varchar(150) DEFAULT '' NOT NULL,
	"last_name" varchar(150) DEFAULT '' NOT NULL,
	"title" varchar(100) DEFAULT '' NOT NULL,
	"equity_ownership_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"principal_address" text DEFAULT '' NOT NULL,
	"principal_suite" varchar(100),
	"principal_city" varchar(100) DEFAULT '' NOT NULL,
	"principal_state" varchar(50) DEFAULT '' NOT NULL,
	"principal_zip_code" varchar(20) DEFAULT '' NOT NULL,
	"ssn" varchar(255) DEFAULT '' NOT NULL,
	"dob" varchar(50) DEFAULT '' NOT NULL,
	"driver_license_number" varchar(255) DEFAULT '' NOT NULL,
	"driver_license_state" varchar(50) DEFAULT '' NOT NULL,
	"beneficial_owners" jsonb DEFAULT '[]'::jsonb,
	"dba_name" varchar(255) DEFAULT '' NOT NULL,
	"legal_business_name" varchar(255) DEFAULT '' NOT NULL,
	"federal_tax_id" varchar(255) DEFAULT '' NOT NULL,
	"business_type" varchar(100) DEFAULT '' NOT NULL,
	"sells_cbd_products" boolean DEFAULT false,
	"mcc_sic" varchar(100),
	"merchandise_sold" text DEFAULT '' NOT NULL,
	"average_ticket_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"average_monthly_volume" numeric(15, 2) DEFAULT '0' NOT NULL,
	"highest_ticket_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"amex_monthly_volume" numeric(15, 2) DEFAULT '0' NOT NULL,
	"ebt_processing_cash" boolean DEFAULT false,
	"ebt_processing_food" boolean DEFAULT false,
	"business_website_url" varchar(500),
	"customer_service_email" varchar(255),
	"customer_service_phone" varchar(50),
	"business_address" text DEFAULT '' NOT NULL,
	"business_suite" varchar(100),
	"business_city" varchar(100) DEFAULT '' NOT NULL,
	"business_state" varchar(50) DEFAULT '' NOT NULL,
	"business_zip" varchar(20) DEFAULT '' NOT NULL,
	"business_telephone" varchar(50),
	"business_fax" varchar(50),
	"statement_type" varchar(50),
	"years_in_business" integer DEFAULT 0 NOT NULL,
	"months_in_business" integer,
	"bank_routing_number" varchar(255) DEFAULT '' NOT NULL,
	"bank_account_number" varchar(255) DEFAULT '' NOT NULL,
	"owner_selfie_url" varchar(500),
	"bank_statement_url_1" varchar(500),
	"bank_statement_url_2" varchar(500),
	"bank_statement_url_3" varchar(500),
	"driver_license_front_url" varchar(500),
	"driver_license_back_url" varchar(500),
	"articles_of_incorporation_url" varchar(500),
	"fein_document_url" varchar(500),
	"municipality_licensure_url" varchar(500),
	"reviewed_by" varchar(255),
	"review_notes" text,
	"risk_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"first_name" varchar(150),
	"last_name" varchar(150),
	"email" varchar(255),
	"phone" varchar(50),
	"company" varchar(255),
	"monthly_volume" varchar(100),
	"intent" varchar(100),
	"notes" text,
	"source" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loyalty_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"tenant_id" uuid,
	"points" integer DEFAULT 0,
	"total_earned" integer DEFAULT 0,
	"total_redeemed" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loyalty_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" text,
	"points_per_dollar" numeric(10, 4) DEFAULT '1',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loyalty_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"points_expiry_days" numeric DEFAULT '365',
	"redemption_rate" numeric(10, 4) DEFAULT '0.01',
	"minimum_redeem_points" numeric DEFAULT '100',
	"is_enabled" boolean DEFAULT true,
	"config" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "loyalty_config_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"email" text,
	"phone" varchar(30),
	"date_of_birth" timestamp,
	"address_line1" text,
	"address_line2" text,
	"city" varchar(100),
	"state" varchar(50),
	"postal_code" varchar(20),
	"country" varchar(3) DEFAULT 'US',
	"total_order_count" integer DEFAULT 0,
	"total_spent_cents" integer DEFAULT 0,
	"loyalty_points" integer DEFAULT 0,
	"marketing_opt_in" boolean DEFAULT true,
	"segment" varchar(50) DEFAULT 'NEW',
	"tags" text[] DEFAULT '{}',
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gift_card_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gift_card_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"transaction_type" varchar(20) NOT NULL,
	"order_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gift_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(30) NOT NULL,
	"initial_balance_cents" integer NOT NULL,
	"current_balance_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"recipient_email" text,
	"purchased_by_customer_id" uuid,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "gift_cards_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "microsite_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"merchant_id" uuid,
	"domain" text,
	"hero_color" varchar(7),
	"hero_image_url" text,
	"description" text,
	"address" text,
	"phone" text,
	"social_links" jsonb,
	"seo_meta" jsonb,
	"paysurity_margin_pct" numeric(5, 4) DEFAULT '0.20' NOT NULL,
	"processing_fee_pct" numeric(5, 4) DEFAULT '0.05' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"pos_sync_enabled" boolean DEFAULT false NOT NULL,
	"last_pos_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "microsite_settings_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "microsite_page_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"merchant_id" text,
	"page_path" text NOT NULL,
	"visitor_ip_hash" text,
	"referrer" text,
	"user_agent_hash" text,
	"session_id" text,
	"visited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "menu_item_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"width" integer,
	"height" integer,
	"file_size_bytes" integer,
	"source" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"order_id" uuid,
	"customer_id" uuid,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(40) DEFAULT 'PENDING',
	"gateway" varchar(50) DEFAULT 'FLUIDPAY',
	"processor_ref" varchar(200),
	"card_last4" varchar(4),
	"card_brand" varchar(20),
	"tender_type" varchar(30) DEFAULT 'CARD',
	"partner_ref_id" varchar(255),
	"commodity_code" varchar(100),
	"product_code" varchar(100),
	"unit_cost" numeric(10, 2),
	"metadata" jsonb,
	"captured_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refund_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"order_id" uuid,
	"customer_id" uuid,
	"requested_amount_cents" integer NOT NULL,
	"approved_amount_cents" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"reason" varchar(100),
	"status" varchar(40) DEFAULT 'PENDING',
	"approved_by" uuid,
	"approved_at" timestamp,
	"completed_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"batch_id" varchar(100),
	"status" varchar(40) DEFAULT 'PENDING',
	"gross_amount_cents" integer DEFAULT 0,
	"fees_amount_cents" integer DEFAULT 0,
	"net_amount_cents" integer DEFAULT 0,
	"currency" varchar(3) DEFAULT 'USD',
	"transaction_count" integer DEFAULT 0,
	"period_start" timestamp,
	"period_end" timestamp,
	"processor_ref" varchar(200),
	"metadata" jsonb,
	"settled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payfactor_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"merchant_id" uuid,
	"amount" numeric(18, 2),
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'pending',
	"processor_reference" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" text,
	"key_hash" text NOT NULL,
	"prefix" text NOT NULL,
	"scopes" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"last_used_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"product_id" uuid,
	"name" text,
	"quantity" integer DEFAULT 1,
	"unit_price" numeric(18, 2),
	"total_price" numeric(18, 2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid,
	"session_id" varchar(200),
	"store_id" uuid,
	"items" jsonb DEFAULT '[]'::jsonb,
	"coupon_code" varchar(50),
	"subtotal_cents" integer DEFAULT 0,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecom_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid,
	"store_id" uuid,
	"order_number" varchar(50),
	"status" varchar(40) DEFAULT 'PENDING',
	"fulfillment_type" varchar(30) DEFAULT 'SHIP',
	"subtotal_cents" integer DEFAULT 0,
	"shipping_cents" integer DEFAULT 0,
	"tax_cents" integer DEFAULT 0,
	"discount_cents" integer DEFAULT 0,
	"total_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"shipping_address" jsonb,
	"billing_address" jsonb,
	"payment_intent_id" varchar(200),
	"payment_status" varchar(40) DEFAULT 'UNPAID',
	"notes" text,
	"metadata" jsonb,
	"placed_at" timestamp DEFAULT now(),
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"carrier" varchar(50),
	"tracking_number" varchar(100),
	"service_level" varchar(50),
	"shipping_label_url" text,
	"estimated_delivery" timestamp,
	"status" varchar(40) DEFAULT 'PENDING',
	"shipment_cost_cents" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"logo_url" text,
	"banner_url" text,
	"currency" varchar(3) DEFAULT 'USD',
	"timezone" varchar(60) DEFAULT 'America/Chicago',
	"is_active" boolean DEFAULT true,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "stores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"store_id" uuid,
	"parent_id" uuid,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200),
	"description" text,
	"image_url" text,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"customer_id" uuid,
	"rating" integer NOT NULL,
	"title" varchar(200),
	"body" text,
	"is_verified_purchase" boolean DEFAULT false,
	"is_approved" boolean DEFAULT false,
	"helpful_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sku" varchar(100),
	"barcode" varchar(100),
	"option_values" jsonb,
	"price" numeric(12, 2),
	"quantity_on_hand" integer DEFAULT 0,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sku" varchar(100),
	"barcode" varchar(100),
	"name" varchar(500) NOT NULL,
	"description" text,
	"category_id" uuid,
	"store_id" uuid,
	"price" numeric(12, 2) NOT NULL,
	"compare_at_price" numeric(12, 2),
	"cost_price" numeric(12, 2),
	"image_url" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"tags" text[] DEFAULT '{}',
	"weight" numeric(8, 3),
	"track_inventory" boolean DEFAULT true,
	"quantity_on_hand" integer DEFAULT 0,
	"allow_backorder" boolean DEFAULT false,
	"is_digital" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"taxable" boolean DEFAULT true,
	"tax_code" varchar(50),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "floor_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"table_number" varchar(20) NOT NULL,
	"section_id" uuid,
	"capacity" integer DEFAULT 4,
	"status" varchar(30) DEFAULT 'AVAILABLE',
	"pos_x" integer DEFAULT 0,
	"pos_y" integer DEFAULT 0,
	"shape_type" varchar(20) DEFAULT 'rect',
	"width" integer DEFAULT 80,
	"height" integer DEFAULT 80,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "table_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"table_id" uuid NOT NULL,
	"customer_id" uuid,
	"guest_name" varchar(200),
	"guest_phone" varchar(30),
	"party_size" integer DEFAULT 1,
	"reserved_at" timestamp NOT NULL,
	"status" varchar(30) DEFAULT 'PENDING',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kds_stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"station_type" varchar(50) DEFAULT 'KITCHEN',
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"categories" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kds_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"table_id" uuid,
	"station" varchar(50) DEFAULT 'KITCHEN',
	"status" varchar(30) DEFAULT 'NEW',
	"priority" integer DEFAULT 0,
	"items" jsonb NOT NULL,
	"notes" text,
	"fired_at" timestamp,
	"ready_at" timestamp,
	"bumped_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catering_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"merchant_id" uuid NOT NULL,
	"customer_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"event_date" timestamp with time zone NOT NULL,
	"event_type" text NOT NULL,
	"guest_count" integer NOT NULL,
	"items" jsonb NOT NULL,
	"total_base_price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_display_price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"deposit_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"deposit_paid_at" timestamp with time zone,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"special_instructions" text,
	"advance_notice_hours" integer DEFAULT 48 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paan_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"merchant_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"event_date" timestamp NOT NULL,
	"quantity" integer NOT NULL,
	"paan_types" jsonb NOT NULL,
	"deposit_pct" numeric(4, 2) DEFAULT '0.25' NOT NULL,
	"deposit_amount" numeric(10, 2) NOT NULL,
	"deposit_paid_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "paan_orders_quantity_gte_50" CHECK ("paan_orders"."quantity" >= 50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "price_engine_config" (
	"tenant_id" text PRIMARY KEY NOT NULL,
	"paysurity_margin_pct" numeric(5, 4) DEFAULT '0.20' NOT NULL,
	"processing_fee_pct" numeric(5, 4) DEFAULT '0.05' NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"warehouse_id" uuid,
	"sku" varchar(100),
	"barcode" varchar(100),
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"partner_ref_id" varchar(255),
	"commodity_code" varchar(100),
	"product_code" varchar(100),
	"unit_cost" numeric(10, 2) DEFAULT '0',
	"unit_price" numeric(10, 2) DEFAULT '0',
	"quantity_on_hand" integer DEFAULT 0,
	"quantity_reserved" integer DEFAULT 0,
	"reorder_point" integer DEFAULT 0,
	"reorder_quantity" integer DEFAULT 0,
	"unit_of_measure" varchar(30) DEFAULT 'EACH',
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"warehouse_id" uuid,
	"movement_type" varchar(40) NOT NULL,
	"quantity_change" integer NOT NULL,
	"unit_cost" numeric(10, 2),
	"reference" varchar(100),
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"address" text,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"po_number" varchar(50),
	"status" varchar(40) DEFAULT 'DRAFT',
	"total_amount" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"expected_delivery" timestamp,
	"received_at" timestamp,
	"line_items" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact_name" varchar(200),
	"email" text,
	"phone" varchar(30),
	"address_line1" text,
	"address_line2" text,
	"city" varchar(100),
	"state" varchar(50),
	"postal_code" varchar(20),
	"country" varchar(3) DEFAULT 'US',
	"tax_id" varchar(100),
	"payment_terms" varchar(50) DEFAULT 'NET30',
	"currency" varchar(3) DEFAULT 'USD',
	"notes" text,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"customer_id" uuid,
	"rma_number" varchar(50),
	"status" varchar(40) DEFAULT 'REQUESTED',
	"reason" varchar(100),
	"reason_notes" text,
	"refund_amount" numeric(12, 2),
	"refund_method" varchar(50),
	"line_items" jsonb,
	"inspection_notes" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"balance_cents" integer DEFAULT 0,
	"issued_reason" varchar(100),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clock_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"event_type" varchar(30) NOT NULL,
	"event_time" timestamp DEFAULT now(),
	"location_lat" numeric(9, 6),
	"location_lng" numeric(9, 6),
	"device_id" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employee_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"shift_type" varchar(50) DEFAULT 'REGULAR',
	"notes" text,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" text NOT NULL,
	"phone" varchar(30),
	"role" varchar(80),
	"department" varchar(100),
	"hourly_rate" numeric(10, 2),
	"salary" numeric(12, 2),
	"employment_type" varchar(50) DEFAULT 'FULL_TIME',
	"status" varchar(50) DEFAULT 'ACTIVE',
	"hire_date" timestamp,
	"termination_date" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shift_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"start_hour" integer NOT NULL,
	"start_minute" integer DEFAULT 0,
	"duration_minutes" integer NOT NULL,
	"days_of_week" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"planned_duration_minutes" integer,
	"actual_duration_minutes" integer,
	"status" varchar(30) DEFAULT 'SCHEDULED',
	"break_minutes" integer DEFAULT 0,
	"overtime_minutes" integer DEFAULT 0,
	"station_id" uuid,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bnpl_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"installment_count" integer DEFAULT 4,
	"installment_amount" numeric(12, 2) NOT NULL,
	"paid_installments" integer DEFAULT 0,
	"status" varchar(30) DEFAULT 'ACTIVE',
	"origin_order_id" uuid,
	"next_payment_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"transaction_type" varchar(50) NOT NULL,
	"status" varchar(30) DEFAULT 'PENDING',
	"external_ref" varchar(200),
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"user_id" uuid NOT NULL,
	"wallet_type" varchar(40) DEFAULT 'CONSUMER',
	"currency" varchar(3) DEFAULT 'USD',
	"balance_cents" integer DEFAULT 0,
	"pending_cents" integer DEFAULT 0,
	"status" varchar(30) DEFAULT 'ACTIVE',
	"kyc_status" varchar(30) DEFAULT 'PENDING',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"billing_cycle_days" integer DEFAULT 30,
	"trial_days" integer DEFAULT 0,
	"features" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"plan_id" uuid,
	"plan_name" varchar(100),
	"status" varchar(30) DEFAULT 'ACTIVE',
	"billing_cycle_days" integer DEFAULT 30,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancelled_at" timestamp,
	"trial_end_at" timestamp,
	"dunning_attempts" integer DEFAULT 0,
	"payment_method_id" varchar(200),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"transaction_id" uuid,
	"customer_id" uuid,
	"order_id" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"reason" text NOT NULL,
	"evidence_url" text,
	"status" varchar(50) DEFAULT 'PENDING',
	"resolution" text,
	"resolved_by" uuid,
	"resolved_at" timestamp,
	"chargeback_due_date" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_run_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"regular_hours" numeric(8, 2) DEFAULT '0',
	"overtime_hours" numeric(8, 2) DEFAULT '0',
	"gross_pay" numeric(12, 2) NOT NULL,
	"federal_tax" numeric(12, 2) DEFAULT '0',
	"state_tax" numeric(12, 2) DEFAULT '0',
	"fica_tax" numeric(12, 2) DEFAULT '0',
	"other_deductions" numeric(12, 2) DEFAULT '0',
	"net_pay" numeric(12, 2) NOT NULL,
	"payment_method" varchar(30) DEFAULT 'DIRECT_DEPOSIT',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"pay_date" timestamp,
	"status" varchar(40) DEFAULT 'DRAFT',
	"total_gross_pay" numeric(14, 2) DEFAULT '0',
	"total_net_pay" numeric(14, 2) DEFAULT '0',
	"total_tax_withheld" numeric(14, 2) DEFAULT '0',
	"employee_count" integer DEFAULT 0,
	"notes" text,
	"approved_by" uuid,
	"approved_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_internal_user_id_internal_users_id_fk" FOREIGN KEY ("internal_user_id") REFERENCES "public"."internal_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "csr_specialties" ADD CONSTRAINT "csr_specialties_internal_user_id_internal_users_id_fk" FOREIGN KEY ("internal_user_id") REFERENCES "public"."internal_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_csr_id_internal_users_id_fk" FOREIGN KEY ("csr_id") REFERENCES "public"."internal_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "microsite_settings_tenant_id_idx" ON "microsite_settings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "microsite_settings_merchant_id_idx" ON "microsite_settings" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "microsite_page_visits_tenant_id_idx" ON "microsite_page_visits" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_id_idx" ON "menu_item_images" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "menu_item_id_idx" ON "menu_item_images" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_menu_item_id_idx" ON "menu_item_images" USING btree ("tenant_id","menu_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "catering_orders_tenant_id_idx" ON "catering_orders" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "catering_orders_merchant_id_idx" ON "catering_orders" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "catering_orders_event_date_idx" ON "catering_orders" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "catering_orders_status_idx" ON "catering_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "paan_orders_tenant_id_idx" ON "paan_orders" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "paan_orders_merchant_id_idx" ON "paan_orders" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "paan_orders_event_date_idx" ON "paan_orders" USING btree ("event_date");