# PaySurity Platform — Terminology Reference & Status Report
**Last Updated:** 2026-03-19T05:55:00-05:00

---

## ✅ Canonical Terminology (Use This Everywhere)

### Hierarchy: Platform → SaaS Product → Tenant(s)

```
PaySurity Platform (the parent company / infrastructure layer)
│
├── BistroBeast          ← SaaS for Restaurants / Food Service
│   ├── House of Biryani                (Tenant — South Indian/Pakistani, Columbus OH)
│   └── Tawakkul Restaurant             (Tenant — Middle Eastern)
│
├── AEL Solutions        ← SaaS for Logistics / Freight / Delivery
│   └── American Eagle Logistics Service / AELS  (Tenant)
│
├── GrocerEase           ← SaaS for Grocery Stores  [Phase = TBD]
│   └── [Tenants: TBD]
│
├── PaySurity Payroll    ← Payroll SaaS for merchants AND non-merchants
│   └── [Tenants: any business that purchases payroll SaaS]
│
├── PaySurity Digital Wallets ← Multi-tenant digital wallet product
│   └── [Tenants: merchants + consumers]
│
├── PaySurity eCom       ← E-Commerce SaaS
│   └── [Tenants: online retailers]
│
└── PaySurity Affiliates ← Affiliate / MLM Commission Tracking SaaS
    └── [Tenants: affiliate program operators]
```

---

## ❌ Terminology Errors to Avoid

| Wrong | Correct |
|---|---|
| "AEL Solutions (it rents out logistics solutions)" as a tenant | AEL Solutions is a **SaaS brand/product** — AELS (American Eagle Logistics Service) is the **tenant** |
| "Merchant Funnels" as a catch-all | Use: **PaySurity SaaS Products** or **PaySurity Verticals** |
| "PayFactor" as a standalone product | PayFactor is a **feature/integration within AEL Solutions** |
| "Loyalty" as a global module | Loyalty is **tenant-configurable** — defined during tenant onboarding per vertical |
| Treating POSR and GrocerEase as separate codebases | GrocerEase **reuses POSR (Point of Sale - Restaurant)** screens/code — assets tagged `@reusable:grocerease` |

---

## 📊 Platform Market Readiness — March 19, 2026

### Infrastructure
| Component | Ready |
|---|---|
| Cloud SQL (PostgreSQL) | ✅ 85% |
| Cloud Run (API) | ❌ 503 — fix deploying |
| Auth / JWT / RBAC | 70% |
| Multi-tenant UUID architecture | 80% |
| Dockerfile (fixed) | 90% |

---

### BistroBeast (Restaurant SaaS)
| Capability | % |
|---|---|
| Menu Management | 65% |
| POS Order Flow (dine-in, BOPIS, delivery) | 40% |
| Table Management | 50% |
| Kitchen Display System (KDS) | 30% |
| Catering Orders (incl. paan bulk rules) | 72% |
| Staff Scheduling / Payroll integration | 30% |
| HOB Microsite (houseofbiryanirestaurant.food) | **80%** |
| Tawakkul Restaurant microsite | 40% |
| Loyalty (tenant-configurable) | 25% |
| Analytics / Reports | 35% |
| **VERTICAL TOTAL** | **~47%** |

---

### AEL Solutions (Logistics SaaS)
| Capability | % |
|---|---|
| PayFactor Driver Advance API (4 endpoints) | 70% |
| HMAC-SHA256 Webhook Security | 70% |
| JWT / JWKS Integration | 70% |
| Escrow + Settlement Model | 65% |
| AELS Tenant Provisioning | 20% |
| Driver Management | 30% |
| Dispatch Board | 20% |
| AEL Microsite | 65% |
| Production Credentials Issued | ❌ 0% (blocked on API) |
| **VERTICAL TOTAL** | **~45%** |

---

### GrocerEase (Grocery SaaS) — Phase TBD
| Capability | % | POSR Reuse |
|---|---|---|
| Inventory Management | 35% | — |
| POS / Checkout | 30% | ✅ POSR screens reusable |
| Product Catalog | 35% | ✅ POSR screens reusable |
| Scale Device Integration | 20% | — |
| EBT/SNAP payment support | 5% | — |
| Reports & Analytics | 30% | ✅ POSR screens reusable |
| Supplier / Purchase Orders | 35% | — |
| **VERTICAL TOTAL** | **~27%** |

---

### PaySurity Payroll (Payroll SaaS — merchants & non-merchants)
| Capability | % |
|---|---|
| Employee Management | 30% |
| Payroll Run Engine | 25% |
| Pay Stubs / PDF Generation | 20% |
| Tax Document (W2, 1099) | 20% |
| Direct Deposit Integration | 15% |
| Compliance Reporting | 20% |
| **VERTICAL TOTAL** | **~22%** |

---

### PaySurity Digital Wallets
| Capability | % |
|---|---|
| Wallet Balance | 40% |
| Top-Up / Funding | 35% |
| Peer-to-Peer Transfers | 20% |
| Transaction History | 40% |
| Spending Limits | 25% |
| Statements | 25% |
| **VERTICAL TOTAL** | **~31%** |

---

### PaySurity eCom (E-Commerce SaaS)
| Capability | % |
|---|---|
| Product Catalog | 35% |
| Cart / Checkout Flow | 30% |
| Order Management | 35% |
| Returns / Refunds | 30% |
| Product Reviews | 25% |
| Consumer Storefront | 40% |
| **VERTICAL TOTAL** | **~32%** |

---

### PaySurity Affiliates (Affiliate / MLM SaaS)
| Capability | % |
|---|---|
| Affiliate Tracking | 35% |
| Commission Calculation Engine | 30% |
| MLM / Multi-level Payouts | 25% |
| Fraud Detection | 30% |
| Affiliate Portal UI | 20% |
| Payout Reporting | 25% |
| **VERTICAL TOTAL** | **~28%** |

---

### Loyalty (Cross-vertical, Tenant-Configurable)
> **Architecture:** Loyalty programs are NOT a fixed global module. Each tenant defines their own loyalty rules during onboarding. The platform provides the loyalty engine — tenants configure: point earn rates, redemption rules, tier names, reward catalog.

| Capability | % |
|---|---|
| Loyalty Engine (earn/redeem points) | 25% |
| Tenant Onboarding Config UI | 10% |
| Tenant-specific Tier Config | 10% |
| Reward Catalog (per tenant) | 15% |
| Points Ledger / History | 25% |
| **MODULE TOTAL** | **~17%** |

---

## 🎯 Platform-Wide Summary

| SaaS Product | Market Ready |
|---|---|
| BistroBeast | 47% |
| AEL Solutions | 45% |
| GrocerEase | 27% |
| PaySurity Payroll | 22% |
| PaySurity Digital Wallets | 31% |
| PaySurity eCom | 32% |
| PaySurity Affiliates | 28% |
| Loyalty Engine | 17% |
| **Platform Average** | **~31%** |

> [!IMPORTANT]
> All percentages assume API is live. Currently API = 503. Fix deploying via Cloud Build. Once API is live, effective market readiness jumps ~15% across all verticals.

---

## 🐝 Swarm Worker Pool Assignment (50 Pools)
*See `scripts/swarm-orchestrator-50pools.js` for live execution*
