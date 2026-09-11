# PaySurity Platform — RBAC Permission Matrix
**Document:** RBAC_PERMISSION_MATRIX.md | **Version:** v1.0 | **Date:** 2026-03-12  
**Authority:** Security Architecture — enforced at API layer (NestJS guards), backed by DB RLS

> **Rule:** RBAC is enforced at **two layers simultaneously**:  
> 1. **NestJS `@Roles()` guard** — checks role on JWT before controller executes  
> 2. **PostgreSQL RLS** — filters rows by `tenant_id` and optionally `brand_id` / `location_id`  
> A gap in either layer is a security incident. Both must be implemented for every resource.

---

## Role Definitions

| Role | Scope | Who Holds It |
|---|---|---|
| `PAYSURITY_ADMIN` | Platform-wide (all tenants) | PaySurity internal operations team |
| `ENTERPRISE_ADMIN` | One holding company (all brands + locations) | Owner/operator of multi-brand franchise group |
| `ENTERPRISE_FINANCE` | One holding company (financial data only, read) | CFO, external accountant of the holding company |
| `BRAND_ADMIN` | One brand (all locations in brand) | Brand operations manager |
| `LOCATION_MANAGER` | One location | General manager of a single restaurant/store |
| `SERVER` | One location (own orders only) | Wait staff |
| `CASHIER` | One location (own transactions only) | POS cashier |
| `KITCHEN_STAFF` | One location (KDS only) | Cook, line staff |
| `PAYROLL_ADMIN` | One entity/brand (payroll) | HR/payroll manager |
| `API_KEY_MERCHANT` | One tenant (scoped by key permissions) | Developer integrating via API |
| `API_KEY_RESELLER` | One reseller portfolio | Reseller developer |
| `CONSUMER` | Own data only | End consumer |
| `EXTERNAL_ACCOUNTANT` | Read-only financials for granted tenant | Third-party accountant |
| `FRANCHISE_OWNER` | Own franchise location(s) only | External franchisee |

---

## Permission Symbol Key

| Symbol | Meaning |
|---|---|
| ✅ | Full access |
| 🟡 | Scoped access (see note) |
| ❌ | No access — enforced at API + RLS |
| 🔒 | Requires additional factor (MFA, manager PIN, explicit approval) |
| — | Not applicable |

---

## Resource: Orders

| Action | PAYSURITY_ADMIN | ENTERPRISE_ADMIN | BRAND_ADMIN | LOCATION_MGR | SERVER | CASHIER | KITCHEN | CONSUMER | API_KEY_MERCHANT |
|---|---|---|---|---|---|---|---|---|---|
| Create | ✅ | ✅ | 🟡 brand | ✅ location | ✅ own | ✅ own | ❌ | ✅ own | 🟡 scoped |
| Read (any) | ✅ | ✅ | 🟡 brand | 🟡 location | 🟡 own-orders | 🟡 own-shift | 🟡 KDS view | 🟡 own | 🟡 scoped |
| Update status | ✅ | ✅ | 🟡 brand | ✅ location | Limited¹ | Limited¹ | 🟡 KDS items | ❌ | 🟡 scoped |
| Void/Cancel | ✅ | ✅ | 🟡 brand | 🔒 manager PIN | ❌ | ❌ | ❌ | ❌ | ❌ |
| Apply discount | ✅ | ✅ | 🟡 brand | 🔒 manager PIN | ❌ | ❌ | ❌ | ❌ | ❌ |
| Comp item | ✅ | ✅ | 🟡 brand | 🔒 manager PIN | ❌ | ❌ | ❌ | ❌ | ❌ |
| Export | ✅ | ✅ | 🟡 brand | 🟡 location | ❌ | ❌ | ❌ | ❌ | 🟡 scoped |

¹ Server/Cashier can: add items to own open orders, fire own orders to KDS, close own orders. Cannot void or discount.

---

## Resource: Payments

| Action | PAYSURITY_ADMIN | ENTERPRISE_ADMIN | ENTERPRISE_FINANCE | BRAND_ADMIN | LOCATION_MGR | CASHIER | CONSUMER | API_KEY_MERCHANT |
|---|---|---|---|---|---|---|---|---|
| Create (charge) | ✅ | ✅ | ❌ | 🟡 brand | ✅ location | ✅ own | ✅ own | 🟡 scoped |
| Read own | ✅ | ✅ | ✅ | 🟡 brand | 🟡 location | 🟡 own-shift | ✅ own | 🟡 scoped |
| Issue refund | ✅ | 🔒 | ❌ | 🔒 brand | 🔒 manager PIN | ❌ | ❌ | 🔒 scoped |
| Void | ✅ | 🔒 | ❌ | 🔒 brand | 🔒 manager PIN | ❌ | ❌ | ❌ |
| Read gateway_configurations | ✅ | ❌² | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update bank account | ✅ | 🔒 MFA | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

² Merchants see only `settlement_account_last4` — never raw credentials

---

## Resource: Disputes

| Action | PAYSURITY_ADMIN | ENTERPRISE_ADMIN | ENTERPRISE_FINANCE | BRAND_ADMIN | LOCATION_MGR | CONSUMER | API_KEY_MERCHANT |
|---|---|---|---|---|---|---|---|
| View disputes | ✅ | ✅ | ✅ read | 🟡 brand | 🟡 location | ❌ | 🟡 scoped |
| Submit evidence | ✅ | ✅ | ❌ | 🟡 brand | 🟡 location | ❌ | 🟡 scoped |
| Mark resolved (override) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Resource: Menu Items

| Action | PAYSURITY_ADMIN | ENTERPRISE_ADMIN | BRAND_ADMIN | LOCATION_MGR | SERVER | API_KEY_MERCHANT |
|---|---|---|---|---|---|---|
| Create item | ✅ | ✅ | 🟡 brand | 🟡 LOCAL items only | ❌ | 🟡 scoped |
| Update item (open) | ✅ | ✅ | 🟡 brand | 🟡 LOCAL items only | ❌ | 🟡 scoped |
| Update item (LOCKED_PRICE) | ✅ | ✅ | ✅ brand-level | ❌ BLOCKED | ❌ | ❌ |
| Update item (LOCKED_ITEM) | ✅ | ✅ | ✅ brand-level | ❌ BLOCKED | ❌ | ❌ |
| 86 (OOS) item | ✅ | ✅ | ✅ | ✅ location | ❌ | 🟡 scoped |
| Restore from OOS | ✅ | ✅ | ✅ | ✅ location | ❌ | 🟡 scoped |
| Set lock level | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Resource: Loyalty Program Config

| Action | PAYSURITY_ADMIN | ENTERPRISE_ADMIN | BRAND_ADMIN | LOCATION_MGR | CONSUMER |
|---|---|---|---|---|---|
| View program config | ✅ | ✅ | 🟡 brand | ❌ | ❌ |
| Update earning rules | ✅ | ✅ | 🟡 brand | ❌ | ❌ |
| Create/update tiers | ✅ | ✅ | 🟡 brand | ❌ | ❌ |
| View own account | ✅ | ✅ | 🟡 brand | 🟡 location | ✅ own only |
| Enroll consumer | ✅ | ✅ | ✅ | ✅ | ✅ self-enroll |
| Issue manual points (adjust) | ✅ | 🔒 | ❌ | 🔒 manager + reason | ❌ |
| View fraud events | ✅ | ❌ | ❌ | ❌ | ❌ |
| Clear fraud hold | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Resource: Payroll

| Action | PAYSURITY_ADMIN | ENTERPRISE_ADMIN | PAYROLL_ADMIN | LOCATION_MGR | EMPLOYEE | API_KEY_MERCHANT |
|---|---|---|---|---|---|---|
| View payroll runs | ✅ | ✅ | 🟡 entity | 🟡 location | ❌ | ❌ |
| View own pay stubs | ✅ | ✅ | 🟡 entity | 🟡 own location's employees | ✅ own only | ❌ |
| Calculate draft | ✅ | ✅ | 🔒 PAYROLL_ADMIN | ❌ | ❌ | ❌ |
| Approve payroll | ✅ | 🔒 MFA | 🔒 MFA | ❌ | ❌ | ❌ |
| Add employee | ✅ | ✅ | 🟡 entity | 🟡 location | ❌ | ❌ |
| Edit employee bank info | ✅ | 🔒 | 🔒 | ❌ | 🔒 own (MFA) | ❌ |
| Clock in/out | ✅ | ✅ | ✅ | ✅ | ✅ own | ❌ |

---

## Resource: Franchise Hierarchy (FRN)

| Action | PAYSURITY_ADMIN | ENTERPRISE_ADMIN | BRAND_ADMIN | LOCATION_MGR | FRANCHISE_OWNER |
|---|---|---|---|---|---|
| Create brand | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create location | ✅ | ✅ | ✅ within brand | ❌ | ❌ |
| View all brands | ✅ | ✅ | ❌¹ | ❌ | ❌ |
| View all locations in brand | ✅ | ✅ | ✅ own brand | 🟡 own location | 🟡 own locations |
| View royalty data | ✅ | ✅ (own royalties) | 🟡 brand-level | ❌ | ✅ own deductions |
| Manage royalty agreements | ✅ | ✅ | ❌ | ❌ | ❌ |
| View cross-brand analytics | ✅ | ✅ | ❌¹ | ❌ | ❌ |
| FRN audit log | ✅ | ✅ | 🟡 brand events | ❌ | ❌ |

¹ Unless explicitly granted cross-brand read by ENTERPRISE_ADMIN

---

## Resource: Subscription & Billing (SUB)

| Action | PAYSURITY_ADMIN | ENTERPRISE_ADMIN | ENTERPRISE_FINANCE | BRAND_ADMIN | LOCATION_MGR |
|---|---|---|---|---|---|
| View invoices | ✅ | ✅ | ✅ | ❌ | ❌ |
| Download invoice PDF | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upgrade tier | ✅ | 🔒 MFA | ❌ | ❌ | ❌ |
| Downgrade tier | ✅ | 🔒 MFA | ❌ | ❌ | ❌ |
| Update payment method | ✅ | 🔒 MFA | ❌ | ❌ | ❌ |
| Flag invoice dispute | ✅ | ✅ | ✅ | ❌ | ❌ |
| Grant PaySurity billing exceptions | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Resource: Platform Config

| Action | PAYSURITY_ADMIN | ENTERPRISE_ADMIN | BRAND_ADMIN | LOCATION_MGR | API_KEY |
|---|---|---|---|---|---|
| Read platform_config | ✅ | Read own only | Read own only | Read own only | Read scoped |
| Write platform_config | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read merchant_config | ✅ | ✅ | 🟡 brand config | 🟡 location config | Read scoped |
| Write merchant_config (if overridable) | ✅ | ✅ | 🟡 brand-scoped | 🟡 location-scoped | ❌ |

---

## RLS Policy Implementation Guide

```sql
-- Pattern for brand-scoped access (Brand Admin sees only their brand's data)
-- Set in middleware per request:
-- SET LOCAL "app.current_tenant_id" = '{tenant_id}';
-- SET LOCAL "app.current_brand_id" = '{brand_id}';     -- NULL for ENTERPRISE_ADMIN
-- SET LOCAL "app.current_location_id" = '{location_id}'; -- NULL for BRAND_ADMIN+

-- Example: Brand-scoped RLS on orders
CREATE POLICY brand_scoped_orders ON orders
  USING (
    tenant_id = current_setting('app.current_tenant_id')::UUID
    AND (
      current_setting('app.current_brand_id', TRUE) IS NULL   -- ENTERPRISE_ADMIN: see all
      OR location_id IN (
        SELECT id FROM locations
        WHERE brand_id = current_setting('app.current_brand_id')::UUID
      )
    )
    AND (
      current_setting('app.current_location_id', TRUE) IS NULL  -- BRAND_ADMIN: see all in brand
      OR location_id = current_setting('app.current_location_id')::UUID
    )
  );
```

---

## MFA Requirements

The following actions require MFA re-verification even with a valid session (MFA step-up):

| Action | MFA Type |
|---|---|
| Approve payroll run | TOTP or Push |
| Update bank settlement account | TOTP or Push |
| Upgrade/downgrade subscription tier | TOTP |
| Grant ENTERPRISE_ADMIN role to another user | TOTP + email confirmation |
| Issue refund > $500 | TOTP |
| Suspend a merchant account (PAYSURITY_ADMIN) | TOTP + dual authorization (two admins) |
| Export full customer data (for CCPA portability) | TOTP |

MFA step-up implemented as: frontend re-prompts for TOTP code → backend validates → issues a short-lived (5-min) elevation token → elevation token required in request header for the specific action only.

---

## API Key Permission Scopes

When creating an API key in the merchant portal, the Merchant Admin selects from these scopes:

| Scope Name | Resources Accessible |
|---|---|
| `orders:read` | GET /v1/orders (own tenant only) |
| `orders:write` | POST /v1/orders, PATCH status |
| `menu:read` | GET /v1/menu |
| `menu:write` | PATCH /v1/menu/items, 86 |
| `loyalty:read` | GET /v1/loyalty/accounts, balance |
| `loyalty:write` | POST /v1/loyalty/earn, redemptions |
| `payments:read` | GET /v1/payments |
| `payments:refund` | POST /v1/payments/{id}/refunds — requires explicit grant |
| `webhooks:manage` | POST/DELETE /v1/webhooks |
| `reports:read` | GET /v1/reports (async export) |
| `franchise:read` | GET /v1/franchise (Enterprise API key only) |
| `franchise:write` | Full hierarchy management (Enterprise API key only) |
