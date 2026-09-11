-- packages/database/seeds/000_run-all-seeds.sql

-- This master script runs all seed files in the correct dependency order for the PaySurity platform.
-- It's designed to populate a development or test database with essential reference data and
-- example tenant-specific configurations and transactional data.
-- Ensure that the database schema (migrations) has been applied before running this script.

-- SECTION 1: CORE REFERENCE DATA
-- These seeds populate foundational lookup tables that other entities depend on.
-- They generally do not have foreign key dependencies on core business entities within the system,
-- only on themselves (e.g., hierarchical structures) or are standalone.

-- Seed Currencies (e.g., USD, EUR, GBP)
-- Provides a list of supported currencies for transactions and accounts.
\ir 001_seed_currencies.sql

-- Seed Countries (e.g., US, CA, GB)
-- Provides a list of supported countries, often used for address validation or regional settings.
\ir 002_seed_countries.sql

-- Seed Payment Method Definitions (e.g., Credit Card, ACH, SEPA)
-- Defines the types of payment methods available across the platform.
\ir 003_seed_payment_method_definitions.sql

-- Seed Transaction Statuses (e.g., Pending, Approved, Declined, Refunded)
-- Defines the various states a payment transaction can be in.
\ir 004_seed_transaction_statuses.sql

-- Seed Notification Types (e.g., Payment Approved, Refund Issued, Chargeback Received)
-- Defines different types of notifications that can be sent to tenants or users.
\ir 005_seed_notification_types.sql


-- SECTION 2: TENANTS AND USERS
-- Seeds for the core organizational units (tenants) and their associated administrative users.
-- Tenants are central to the multi-tenant architecture.

-- Seed Tenants (e.g., PaySurity Demo Tenant, Alpha Corp)
-- Creates initial tenant accounts which are prerequisite for all tenant-specific data.
\ir 006_seed_tenants.sql

-- Seed Users (e.g., admin@paysurity.com, user@alphacorp.com)
-- Creates initial user accounts, typically linked to specific tenants.
\ir 007_seed_users.sql


-- SECTION 3: PAYMENT INFRASTRUCTURE & ACCOUNTS
-- Seeds for the external payment processing services and internal payment accounts managed by tenants.

-- Seed Payment Processors (e.g., Stripe, PayPal, Braintree)
-- Defines the third-party payment gateways integrated with PaySurity.
\ir 008_seed_payment_processors.sql

-- Seed Tenant Payment Methods (e.g., tenant's specific configuration for accepting Visa cards)
-- Links payment method definitions to specific tenant setups, including processor details.
-- Depends on 003_seed_payment_method_definitions.sql and 006_seed_tenants.sql
\ir 009_seed_payment_methods.sql

-- Seed Payment Accounts (e.g., tenant's merchant account with Stripe, settlement accounts)
-- Represents the actual accounts where funds are held or processed for a tenant.
-- Depends on 006_seed_tenants.sql, 001_seed_currencies.sql, and 008_seed_payment_processors.sql
\ir 010_seed_payment_accounts.sql


-- SECTION 4: TENANT-SPECIFIC CONFIGURATION & INTEGRATIONS
-- Seeds for various tenant-specific settings, API keys, webhook configurations, and customer data.
-- These are essential for tenants to operate and interact with the platform.

-- Seed Tenant API Keys (e.g., publishable and secret keys for a tenant)
-- Allows tenants to authenticate and interact with the PaySurity API.
-- Depends on 006_seed_tenants.sql and optionally 007_seed_users.sql (for creator/owner).
\ir 011_seed_api_keys.sql

-- Seed Tenant Configurations (e.g., default currency, specific processing rules)
-- Stores various configurable settings for each tenant.
-- Depends on 006_seed_tenants.sql and 001_seed_currencies.sql.
\ir 012_seed_tenant_configs.sql

-- Seed Webhook Endpoints (e.g., URLs where tenants receive notifications)
-- Defines where PaySurity should send event notifications to tenants.
-- Depends on 006_seed_tenants.sql and 005_seed_notification_types.sql.
\ir 013_seed_webhook_endpoints.sql

-- Seed Customers (e.g., example customers associated with a tenant)
-- Creates example customer profiles for tenants, which are linked to transactions.
-- Depends on 006_seed_tenants.sql.
\ir 014_seed_customers.sql


-- SECTION 5: TRANSACTIONAL DATA
-- Seeds for example payment transactions, refunds, chargebacks, and settlement records.
-- This data demonstrates the core functionality of the payment platform.

-- Seed Transactions (e.g., example credit card payments, ACH debits)
-- Populates the main transaction ledger.
-- Depends on 006_seed_tenants.sql, 014_seed_customers.sql, 009_seed_payment_methods.sql,
-- 001_seed_currencies.sql, 004_seed_transaction_statuses.sql, and 010_seed_payment_accounts.sql.
\ir 015_seed_transactions.sql

-- Seed Refunds (e.g., refunds issued for previous transactions)
-- Populates example refund records linked to existing transactions.
-- Depends on 015_seed_transactions.sql.
\ir 016_seed_refunds.sql

-- Seed Chargebacks (e.g., chargebacks received for previous transactions)
-- Populates example chargeback records linked to existing transactions.
-- Depends on 015_seed_transactions.sql.
\ir 017_seed_chargebacks.sql

-- Seed Settlements (e.g., records of payouts to tenant bank accounts)
-- Populates records of how transactions are grouped and settled to tenants.
-- Depends on 006_seed_tenants.sql, 010_seed_payment_accounts.sql, 001_seed_currencies.sql,
-- and potentially 015_seed_transactions.sql (for linking settled transactions).
\ir 018_seed_settlements.sql

-- End of master seed runner script.