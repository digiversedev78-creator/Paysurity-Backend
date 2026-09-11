# Deferred Verticals — Registry
**Version:** v1.0-canonical  
**Date:** 2026-03-12  
**Source Docs:** 20_DEFERRED_VERTICALS.md  
**Status:** All items below are DEFERRED to Phase 2+ unless explicitly re-scoped by Product leadership

## Purpose
This document registers all PaySurity product capabilities and verticals that have been formally deferred from Phase 1 scope. Deferral means: requirements exist, feasibility is established, but no active development sprint is allocated until a scope change is formally approved.

---

## Deferred Verticals

### DEF-001: Dental Practice Management
**Proposed Vertical:** DentalPay / DentalEase  
**Deferral Reason:** Insufficient market research and dedicated QA resources for HIPAA compliance overlay.  
**Phase Gate:** Phase 2 — requires HIPAA BAA framework, dental-specific claims/billing integration, and patient payment plan workflows.  
**Dependencies:** HIPAA compliance module (not in scope), Insurance EDI 837/835 integration.

---

### DEF-002: Legal Practice / Law Firm Billing
**Proposed Vertical:** LegalPay  
**Deferral Reason:** IOLTA trust account compliance requires specialized banking partner agreements not yet in place.  
**Phase Gate:** Phase 2+ — requires IOLTA-compliant trust account segregation and state bar rules integration.  
**Dependencies:** IOLTA banking partner, trust accounting ledger (specialized double-entry rules).

---

### DEF-003: Chiropractic / Physical Therapy Practice
**Proposed Vertical:** ChiroPay  
**Deferral Reason:** Overlaps with Dental (healthcare compliance). Shared dependency on HIPAA framework.  
**Phase Gate:** Phase 2 alongside Dental — shared HIPAA BAA module gates both.  
**Dependencies:** Dental (DEF-001) HIPAA module, HSA/FSA payment rail integration.

---

### DEF-004: QR Loyalty Program (Standalone)
**Proposed Feature:** Standalone QR-code loyalty program sold independently of POS vertical.  
**Deferral Reason:** Standalone loyalty without POS integration has lower merchant value and complicates data model.  
**Phase Gate:** Phase 2 — re-evaluate as an add-on module once core POS loyalty integration (POSR-009, POS-005) is live and validated.  
**Dependencies:** Digital Wallets loyalty engine must be complete; QR attribution system from AFR-008 reused.

---

### DEF-005: Cash-In / Cash-Out via Retail Agents
**Proposed Feature:** Consumer wallet funding via retail agent locations (cash deposit / cash withdrawal).  
**Deferral Reason:** Requires money services business (MSB) regulatory filings per state, retail agent contracting, and cash reconciliation infrastructure not scoped for Phase 1.  
**Phase Gate:** Phase 2+ — MSB licensing is the primary blocker. Feature-flagged in wallet (REQ-WAL-002 notes).  
**Dependencies:** MSB license (state-by-state), retail agent network contracts, cash reconciliation ledger extension.

---

## Scope Change Process
To move any deferred item into active development:
1. Product Owner raises a formal Change Request (CR) in the project management system.
2. CR must include: business case, estimated sprint cost, regulatory impact assessment.
3. Super Admin (CTO/CPO level) approves CR.
4. Item is promoted to the appropriate canonical vertical document with a Phase Gate update.
5. This registry entry is updated to reflect the new status.
