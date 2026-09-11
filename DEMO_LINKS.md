# PaySurity Demo Pipeline — Progress Log

## Demo Links Registry

| # | Feature | URL | RTM Epic | Status | Committed |
|:--|:--------|:----|:---------|:-------|:----------|
| 1 | Merchant KYB Onboarding | `http://localhost:4001/onboarding` | Epic 2 — Merchant Journey | ✅ Live | Phase 7.2 |
| 2 | Employee Hub | `http://localhost:4001/dashboard/employees` | Epic 4 — Employee Journey | ✅ Live | Phase 7.5 |
| 3 | Gift Cards Management | `http://localhost:4001/dashboard/gift-cards` | Epic 5 — Customer Experience | ✅ Live | Phase 7.5 |
| 4 | Kitchen Display System (KDS) | `http://localhost:4001/dashboard/kds` | Epic 3 — POS Verticals | ✅ Live | Phase 7.5 |
| 5 | Settlement Batch View | `http://localhost:4001/dashboard/settlements` | Epic 1 — Money Flow | ✅ Live | Phase 7.6 |
| 6 | Payroll Run Dashboard | `http://localhost:4001/dashboard/payroll` | Epic 4 — Employee Journey | ✅ Live | Phase 7.6 |
| 7 | God View — Audit & Security Dashboard | `http://localhost:4004/` | Epic 6 — Admin Portal | ✅ Live | Phase 7.7 |
| 8 | KYB Merchant Underwriting Queue | `http://localhost:4004/merchants` | Epic 6 — Admin Portal | ✅ Live | Phase 7.7 |
| 9 | Security Event Log | `http://localhost:4004/security` | Epic 6 — Admin Portal | ✅ Live | Phase 7.7 |

---

## Phase 7.5 Build Log

### Loop 1 — Employee Hub
**Date:** 2026-04-07
**RTM Row:** `Shifts & Clock-In/Out` + `Employee Schedules & Self-Service` (both 🟡 → 🟢)
**API Endpoints Wired:**
- `GET /employees` — list employees
- `GET /employees/:id/schedules` — per-employee upcoming shifts
- `POST /employees` — add new employee

**Files Modified:**
- `apps/merchant-dashboard/src/app/dashboard/employees/page.tsx` — full rebuild
  - Dark PaySurity theme (zinc-950 bg, blue/emerald accents)
  - Stats row: Total Staff, Full-Time, Part-Time, Departments
  - Searchable + filterable by department  
  - Schedule drawer: slides in from right, shows upcoming shifts with elapsed time
  - Add Employee modal with validation
  - Graceful fallback to seed data if API unreachable

---

### Loop 2 — Gift Cards Management
**Date:** 2026-04-07
**RTM Row:** `Gift Cards` (🟡 → 🟢)
**API Endpoints Wired:**
- `GET /gift-cards` — list all gift cards
- `POST /gift-cards` — issue a gift card
- `POST /gift-cards/:id/redeem` — redeem from a gift card
- `POST /gift-cards/:id/add-funds` — add funds (UI scaffolded)
- `PATCH /gift-cards/:id/deactivate` — deactivation

**Files Created:**
- `apps/merchant-dashboard/src/app/dashboard/gift-cards/page.tsx`
  - Stats: Total Issued, Outstanding Balance, Active Cards, Redeemed %
  - Gift card visual cards with balance progress bars
  - Color-coded by balance level (green → amber → red)
  - Expiry warnings for cards expiring within 30 days
  - Issue modal with quick-amount buttons ($10/$25/$50/$100/$200)
  - Redeem modal with balance validation
  - Search by code or email, filter by status

---

### Loop 3 — Kitchen Display System (KDS)
**Date:** 2026-04-07
**RTM Row:** `Kitchen Display System (KDS)` (🟡 → 🟢)
**API Endpoints Wired:**
- `GET /kds/tickets` — list open tickets (polls every 15s)
- `PATCH /kds/tickets/:id/bump` — remove ticket from display
- `PATCH /kds/tickets/:id/start` — mark as in-progress

**Files Created:**
- `apps/merchant-dashboard/src/app/dashboard/kds/page.tsx`
  - Sticky top bar with live NEW / COOKING / READY counters
  - Station filter: ALL / KITCHEN / BAR / EXPO / GRILL
  - Ticket cards with live elapsed timers (tick every 1s)
  - "OVERDUE" alert for tickets >10 minutes
  - Priority RUSH badges
  - Per-line-item cook status (○/◑/●)
  - Modifier display (allergies, cooking preferences)
  - Start → Ready → BUMP! workflow
  - Auto-refreshes every 15 seconds

---

## Demo Hub Entry Point

`http://localhost:4001/investor-demo`

Links bar now contains:
- 🏢 Merchant KYB
- 👥 Employees
- 🎁 Gift Cards
- 🔥 KDS

---

## Next Pipeline Targets (Recommended)

| Priority | Feature | RTM Epic | Effort |
|:---------|:--------|:---------|:-------|
| 🔴 P1 | Shifts Weekly Schedule View | Epic 3 | Medium |
| 🔴 P1 | Disputes Management | Epic 1 | Medium |
| 🔴 P1 | Settlement Batch View | Epic 1 | Low |
| 🔴 P1 | Vendor Management | Epic 2 | Medium |
| 🔴 P2 | Payroll Run Dashboard | Epic 4 | High |
