---
description: How to implement a new requirement from the canonical set
---

# /implement-requirement — Build a Canonical Requirement

## Prerequisites
- Sprint 0 must be complete (NestJS API scaffold, Drizzle ORM, ConfigService, Auth, RBAC guard)
- The requirement's dependencies (per BUILD_SEQUENCE.md) must be DONE

## Steps

### 1. Read the Canonical Requirement
// turbo
Read `Requirements/Canonical/{VERTICAL_FILE}.md` and find the specific `REQ-{VERT}-{NNN}` section.

### 2. Gate 1 — Database Schema & Seed
- Create migration file: `apps/api/db/migrations/{NNN}_{vertical}.sql`
  - Copy SQL from canonical requirement EXACTLY (tables, CHECK constraints, RLS policies, indexes)
- Create seed file: `apps/api/db/seeds/{NNN}_{vertical}_seed.sql`
  - Copy seed SQL from canonical requirement EXACTLY (platform_config entries, BistroBeest data)
- Run migration: `cd apps/api && pnpm db:migrate`
- Run seed: `cd apps/api && pnpm db:seed`
- Verify: `pnpm db:migrate` and `pnpm db:seed` both exit code 0

### 3. Gate 2 — Service Layer
- Create service: `apps/api/src/modules/{vertical}/{vertical}.service.ts`
- Implement EVERY method from the canonical requirement's service layer section
- Every configurable value MUST use `this.configService.get('key')` — NEVER hardcoded
- All external API calls wrapped in circuit breaker (opossum)
- Throw only error codes from `API_ERROR_CODES.md`

### 4. Gate 3 — API Endpoints
- Create controller: `apps/api/src/modules/{vertical}/{vertical}.controller.ts`
- Create DTOs: `apps/api/src/modules/{vertical}/dto/`
- Add `@Roles()` decorator matching `RBAC_PERMISSION_MATRIX.md`
- Add `@ApiOperation`, `@ApiResponse` Swagger decorators on every route
- Register module in `app.module.ts`

### 5. Gate 4 — UI/UX Screens
- Check if requirement has human interactions (consult AESTHETIC_SYSTEM.md for the vertical)
- Create component: `apps/{portal}/src/pages/{vertical}/`
- Use ONLY components from `packages/shared-ui/`
- Verify: responsive at 1920px, 1024px, 375px
- Verify: axe-core returns 0 critical violations
- Add loading states (Skeleton), error states, empty states

### 6. Gate 5 — Integration Points
- Connect cross-vertical calls (e.g., order.close → tax.calculate → orc.charge)
- Register BullMQ batch jobs with cron from canonical spec
- Call NOT engine at lifecycle moments specified in canonical spec
- Fire webhooks via `webhookService.publish(event)` at lifecycle moments

### 7. Gate 6 — Tests
- Create `{vertical}.service.spec.ts` with tests for every canonical acceptance test
- Create `{vertical}.integration.spec.ts`
- Run: `cd apps/api && pnpm test`
- All tests MUST pass

### 8. Gate 7 — Documentation
- Create `apps/api/src/modules/{vertical}/README.md`
- Remove all TODO/FIXME/HACK comments
- Update `.env.example` if new env vars added

### 9. Status Update
- Update the requirement status to `DONE` only after ALL 7 gates pass
