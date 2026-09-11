# Multi-Tenant Edge Routing — Tenant Identity Manifest
**Purpose:** Defines the 4 active pre-launch tenant identities that drive edge routing on the platform.
**Architecture:** GCP Multi-Tenant Edge Routing + Serverless Postgres Isolated Partitions
**How it works:** The platform routes every inbound request to the correct tenant dashboard, payroll ledger, or storefront entirely based on the incoming DNS header or validated JWT `tenant_id` claim. This file defines the routing targets — the 4 identities that the edge layer resolves to.

> [!NOTE]
> **Why this file IS the architecture:** Each entry below defines a unique DNS origin + JWT tenant scope. The edge router uses these to enforce the tenant boundary at the network layer before any application code runs. Adding a new tenant = adding a new entry here + provisioning the DB partition via the Super Admin Console.
> For authentication and session architecture, see `SEC_SECURITY_PRIVACY.md`.
> For DB schema isolation (RLS policies), see `DEV_IMPLEMENTATION_STANDARD.md`.

## THE TENANT BOUNDARY DIRECTIVE
The platform mathematically identifies which Tenant Dashboard, Payroll Ledger, or E-Commerce Storefront to render entirely based on the incoming DNS header or strictly validated JWT Claims. There is no cross-contamination.

---


### TENANT #1: House of Biryani
**Vertical:** Food & Beverage (F&B / Quick Service Restaurant)
**Consumer Storefront DNS:** `houseofbiryanirestaurant.com`
**Tenant Admin Login:** `admin@houseofbiryanirestaurant.com`
**POS Configuration:** 
- Table Management disabled. 
- Deep integration with `apps/kds` (Kitchen Display System WebSocket tunnel).
- Menu heavily weighted on modifiers (Spice Level, Extra Meat).
**Payroll Module:** Highly active (Tip-pooling rules enforced, Waitstaff time-tracking).

---

### TENANT #2: Tawakkul Restaurant
**Vertical:** Food & Beverage (Dine-In / Family Restaurant)
**Consumer Storefront DNS:** Pending formal domain (`tawakkul.paysurity.com` staging endpoint)
**Tenant Admin Login:** `admin@tawakkul.paysurity.com`
**POS Configuration:**
- Full Dine-In Table Management grid required.
- Waitstaff hand-held tablet optimized UI.
**Digital Wallet:** Basic loyalty points aggregation.

---

### TENANT #3: GGrand Tobacco Hub
**Vertical:** High-Risk Retail / Age-Gated Goods
**Consumer Storefront DNS:** `ggrandtobaccohub.com`
**Tenant Admin Login:** `admin@ggrandtobaccohub.com`
**POS Configuration:**
- `BarcodeParserService` heavily active (for parsing cartons vs. singles natively).
- Strict ID-parsing module via physical scanner for age-verification.
- Inventory velocity tracking (carton depletion).
**Payroll Module:** Standard shift clock-in/out (No tips).
**Compliance Edge:** Strict MCC Coding (5993) to prevent FluidPay Gateway shadow-bans. Heavy risk-management via PaySurity Super Admin logic.

---

### TENANT #4: Ashiana Collections
**Vertical:** Apparel / Fashion Retail
**Consumer Storefront DNS:** `ashianacollections.com`
**Tenant Admin Login:** `admin@ashianacollections.com`
**POS Configuration:**
- Variable pricing and heavy SKU variants (Size, Color).
- Customer CRM integration (Purchase History, "Clienteling").
**Consumer Storefront:** High-fidelity E-Commerce focus via the `apps/consumer-storefront` application. Visually driven. Checkout integrated tightly with Digital Wallets.

---

## The Master Provisioning Action
All four identities have been documented in the orchestration matrix. The Super Admin Console (`paysurity-admin-111328865246.us-central1.run.app`) will natively inject these four profiles into the underlying `paysurity-dev` PostgreSQL database. 

When an employee of **GGrand Tobacco** logs into the POS system, the backend literally builds an isolated SQL tunnel so they physically cannot access **Tawakkul's** inventory data, fulfilling the absolute Definition of Done for multi-tenancy.
