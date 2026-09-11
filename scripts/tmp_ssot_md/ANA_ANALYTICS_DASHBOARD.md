# Canonical Requirements: Merchant Analytics Dashboard
**Vertical:** Analytics & Merchant Insights (ANA) | **Version:** v1.0-dev | **Date:** 2026-03-24
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding
**Target Application:** `apps/merchant-dashboard` — Dashboard page
**Target Service:** `apps/api/src/modules/analytics/analytics.service.ts`
**Actors:** `BRAND_ADMIN`, `LOCATION_MANAGER`

> [!NOTE]
> This vertical was identified as entirely missing from the canonical set during the V4.2 audit.
> The merchant dashboard frontend (`dashboard/page.tsx`) has four live API fetch calls for KPI data.
> The backend analytics service is 10 lines with no class body — causing HTTP 404 on all dashboard panels.
> This document canonicalizes the requirement for the first time.

---

## Context

The Merchant Dashboard is the primary daily-use screen for merchant owners and managers. It is the first screen they see after login and the primary justification for the merchant's subscription. If this screen is blank or shows errors, the product has failed its most basic value proposition.

The four KPI panels required are derived from the frontend implementation in `apps/merchant-dashboard/src/app/dashboard/page.tsx` (which was implemented correctly — the backend was never built).

---

## Database Schema

No new tables required. This service reads from existing tables:
- `orders` — for revenue, order count, order status breakdown
- `order_items` — for top items by revenue
- `payment_intents` — for payment method breakdown
- `loyalty_accounts` — for active member count
- `employees` — for staff count context

All queries must respect `tenant_id` RLS filtering. All date aggregations must use configurable timezone from `merchant_config.timezone` (never hardcoded to UTC).

---

## Requirement: Dashboard KPI Endpoints

**File:** `apps/api/src/modules/analytics/analytics.service.ts`
**Module:** `apps/api/src/modules/analytics/analytics.module.ts`
**Controller:** `apps/api/src/modules/analytics/analytics.controller.ts`

> [!IMPORTANT]
> `AnalyticsModule` MUST be imported in `app.module.ts`. As of V4.2 audit it is not — causing all dashboard routes to return HTTP 404.

### PaySurity Advantage: Agentic NLQ Studio (ADV-ANA-01)
Replaces all hardcoded static REST SQL endpoints with conversational AI synthesis.

```typescript
/**
 * synthesizeIntelligence(tenantId, query, contextVector) — Agentic NLQ Studio.
 * Deprecates standard getDashboardKpis() and getRevenueTrend().
 * Processes dynamic merchant inquiries (e.g. "Why is margin down today?")
 * Queries the federated Drizzle schemas securely, generating conversational intelligence + visualized data structures autonomously.
 */
async function synthesizeIntelligence(tenantId: string, query: string, contextVector: any): Promise<NLQResponse>
```

### PaySurity Advantage: Predictive Labor Pulse (ADV-ANA-03)
Structurally bridges POS data velocity with live `PAY_PAYROLL.md` clock-in telemetry.

```typescript
/**
 * calculateLaborPulse(tenantId, locationId) — Forecasts operational efficiency.
 * Cross-references live order.velocity metrics against active employee_shifts.
 * Triggers automated efficiency alerts if Labor vs Revenue ratios invert detrimentally.
 */
async function calculateLaborPulse(tenantId: string, locationId: string): Promise<LaborPulseMetric>
```

### PaySurity Advantage: Anomaly Defense AI (ADV-ANA-04)
Real-time monitoring for business telemetry.

```typescript
/**
 * monitorTelemetryTriage(tenantId) — Real-time Anomaly Detection.
 * Scans continuous event streams for chargeback velocity, refund grouping, or theft anomalies natively on the dashboard.
 */
async function monitorTelemetryTriage(tenantId: string): Promise<Array<AnomalyAlert>>
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/dashboard/nlq-synthesis` | Zero-Login Crypto Pre-Shared Trust | Submits NLQ agentic studio query |
| `GET` | `/v1/dashboard/labor-pulse` | Zero-Login Crypto Pre-Shared Trust | Fetches dynamic POS-Payroll predictive metric |
| `GET` | `/v1/dashboard/defense-triage` | Zero-Login Crypto Pre-Shared Trust | Fetches real-time fraud telemetry and anomaly alerts |

---

## App Module Registration

```typescript
// apps/api/src/app.module.ts — ADD THIS:
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // ... existing imports ...
    AnalyticsModule,   // ← ADD: unlocks all /v1/dashboard/* routes
  ],
})
```

> [!CAUTION]
> Without this registration, all four endpoints return HTTP 404 regardless of implementation completeness.

---

## Acceptance Tests

| Test | Input | Expected |
|---|---|---|
| `GET /v1/dashboard/kpis` with valid JWT | Bearer token for BistroBeest | 200 JSON with `revenue_today_cents`, `order_count_today`, `avg_order_value_cents`, `active_loyalty_members` |
| `GET /v1/dashboard/kpis` with wrong tenant JWT | Bearer token for different tenant | Returns only that tenant's data — no cross-tenant leakage |
| `GET /v1/dashboard/revenue-trend?period=daily` | 7-day range | 7 rows; days with 0 orders have `revenue_cents: 0` (not omitted) |
| `GET /v1/dashboard/order-status` | Date range with cancellations | All status categories present; percentages sum to 100% |
| `GET /v1/dashboard/recent-orders` | No limit param | 10 orders returned; ordered by `created_at DESC` |
| Analytics module not registered | `app.module.ts` missing import | All endpoints return 404 — this is the current broken state |
| Revenue uses merchant timezone | Merchant in CST; midnight CST = different UTC | Revenue is attributed to correct calendar date per merchant timezone |

---
