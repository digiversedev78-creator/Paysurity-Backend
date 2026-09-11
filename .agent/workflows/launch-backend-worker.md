---
description: How to launch a parallel backend worker for a specific vertical
---

# /launch-backend-worker — Start a Backend Agentic Coder

## Context
This workflow is used by the ORCHESTRATOR (human) to launch a new Antigravity session
that will build a specific backend module. Copy the prompt below, customize the placeholders,
and paste it into a new Antigravity conversation.

## Launch Prompt (copy this into a new Antigravity session)

```markdown
# Worker Assignment: BACKEND-{SPRINT}-{VERTICAL}

You are a senior backend engineer building the {VERTICAL_NAME} module for the PaySurity platform.

## Critical: Read These Files First (in this order)
1. `Requirements/Canonical/{VERTICAL_FILE}.md` — your canonical requirement (DB schema, service methods, API endpoints, acceptance tests)
2. `Requirements/Canonical/DEV_IMPLEMENTATION_STANDARD.md` — 9 implementation rules
3. `Requirements/Canonical/TECH_STACK.md` — NestJS, Drizzle, PostgreSQL, Redis, BullMQ
4. `Requirements/Canonical/RBAC_PERMISSION_MATRIX.md` — which roles can access which endpoints
5. `Requirements/Canonical/API_ERROR_CODES.md` — the ONLY error codes you may throw
6. `Requirements/Canonical/STATE_MACHINES.md` — state transitions for your entities
7. `DEFINITION_OF_DONE.md` — the 7 gates. You own Gates 1, 2, 3, 5.

## What You Must Create

### Gate 1: Database
- `packages/database/migrations/0{NN}_{vertical}.sql` — copy SQL EXACTLY from canonical
- `packages/database/seeds/0{NN}_{vertical}_seed.sql` — copy seed SQL EXACTLY
- `packages/database/schema/{vertical}.ts` — Drizzle ORM schema matching migration

### Gate 2: Service Layer
- `apps/api/src/modules/{vertical}/{vertical}.service.ts`
- `apps/api/src/modules/{vertical}/{vertical}.module.ts`
- Every method from canonical spec. Every configurable value via ConfigService.get().
- External API calls wrapped in opossum circuit breaker.

### Gate 3: API Controller
- `apps/api/src/modules/{vertical}/{vertical}.controller.ts`
- `apps/api/src/modules/{vertical}/dto/*.ts` — Zod schemas for every request/response
- @Roles() decorators per RBAC_PERMISSION_MATRIX.md
- @ApiOperation, @ApiResponse Swagger decorators on every route

### Gate 5: Integration
- Wire cross-vertical calls to the correct services (import + inject)
- Register BullMQ jobs with cron from canonical spec
- Call notificationsService at correct lifecycle moments
- Fire webhooks via webhookService.publish() at appropriate moments

## Anti-Collision Rules
- ✅ You MAY create/modify files under `apps/api/src/modules/{vertical}/`
- ✅ You MAY create your migration and seed files
- ✅ You MAY create your Drizzle schema file
- ❌ You may NOT modify `app.module.ts` (orchestrator merges imports)
- ❌ You may NOT modify files in another module's directory
- ❌ You may NOT modify shared packages (guards, middleware, config)
- ❌ You may NOT use any error code not in API_ERROR_CODES.md
- ❌ You may NOT hardcode any value that should be in platform_config

## When Done
Run the /verify-requirement workflow and report gate-by-gate status.
```

## Vertical Reference Table

| VERTICAL | VERTICAL_FILE | VERTICAL_NAME |
|---|---|---|
| orc | ORC_PAYMENT_ORCHESTRATION.md | Payment Orchestration |
| posr | POSR_POS_RESTAURANT.md | Restaurant POS |
| posg | POSG_POS_GROCERY.md | Grocery POS |
| pos-retail | POS_RETAIL.md | Retail POS |
| tax | TAX_ENGINE.md | Tax Engine |
| loy | LOY_LOYALTY_ENGINE.md | Loyalty Engine |
| wal | WAL_DIGITAL_WALLETS.md | Digital Wallets |
| pay | PAY_PAYROLL.md | Payroll Engine |
| not | NOT_NOTIFICATION_ENGINE.md | Notification Engine |
| ai | AI_EXPERIENCE.md | AI Experience |
| agg | AGG_ORDER_AGGREGATION.md | Order Aggregation |
| mer | MER_MERCHANT_SERVICES_ONBOARDING.md | Merchant Onboarding |
| sub | SUB_SUBSCRIPTION_BILLING.md | Subscription Billing |
| afr | AFR_AFFILIATES_RESELLERS.md | Affiliates & Resellers |
| frn | FRN_FRANCHISE_MANAGEMENT.md | Franchise Management |
| ops | OPS_MANAGEMENT.md | Operations Management |
| api | API_PLATFORM.md | API Platform |
| com | COM_COMPLIANCE_LEGAL.md | Compliance & Legal |
| sec | SEC_SECURITY_PRIVACY.md | Security & Privacy |
| eco | ECO_ECOMMERCE.md | E-Commerce |
| web | WEB_MOB_WEBSITE_MOBILE.md | Website & Mobile |
