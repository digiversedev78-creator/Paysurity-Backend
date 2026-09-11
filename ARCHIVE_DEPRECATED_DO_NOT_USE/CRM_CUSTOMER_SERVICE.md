# Canonical Requirements: Customer CRM & Marketing
**Vertical:** CRM & Insights (CRM) | **Version:** v1.0-dev | **Date:** 2026-04-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md`  

---

## Overview

The PaySurity CRM formally replaces legacy "Manual Campaign Lists" with Sovereign Agentic Orchestrations. By integrating directly into ERP inventory streams, Predictive NLQ Analytics, and POS telemetry, the CRM functions as an autonomous entity triggering hyper-local promotional campaigns and maintaining accurate LTV tracking via strict ISO-20022 metadata.

---

## ADV-CRM-01: Zero-Knowledge Personas
**Priority:** Critical | **Compliance:** Merchant-Siloed Hashing

All Customer interactions within the CRM are bound by Zero-Knowledge schemas. Raw PII (e.g. Phone, Email) is strictly forbidden from plaintext CRM querying. Aliases ingested from the onboarding pipeline (`merchant_applications.owner_phone_hash`, etc.) or consumer interactions are mapped natively utilizing an infallible cryptographic one-way salt unique to each merchant.

---

## ADV-CRM-02: Agentic Auto-Pilot Orchestration
**Priority:** High | **Replacement For:** Legacy Manual E-Blast Campaigns

```typescript
/**
 * triggerAgenticCampaign(tenantId) — Autonomous Marketing.
 * Bypasses manual merchant creation. Continuously polls erp_stock_quants and payroll velocity.
 * If perishable inventory nears \`expiration_date\` OR Labor Pulse is inefficient,
 * the Agentic engine autonomously generates and transmits targeted promotions via the NOT engine.
 */
async function triggerAgenticCampaign(tenantId: string): Promise<CampaignResult>
```

---

## ADV-CRM-03: ISO 20022 Attribution Layer
**Priority:** Critical | **Ledger:** pacs.008

All marketing-driven redemptions or traffic spikes must execute full-lifecycle attribution against actual financial settlement. CRM metrics are mapped rigidly by extracting campaign attribution identifiers straight out of the `pacs.008` ISO 20022 transactional envelope at settlement, guaranteeing 100% mathematical ROI devoid of analytical estimations.

---

## ADV-CRM-04: Predictive LTV Scoring (Valuation)
**Priority:** Must | **Calculation:** Dynamic Financial Telemetry

Profile valuations are no longer based purely on gross volume. 
The system algorithmically assigns a Predictive LTV Score mapping directly against the ERP COGS arrays.

**Canonical Formula Definition:**
$$LTV = \\sum_{t=1}^{n} \\frac{(Revenue_t - COGS_t)}{(1 + d)^t}$$
*(Where $d$ is the discount rate and $t$ is the visit frequency).*

```typescript
/**
 * calculatePredictiveLTV(consumerId) — Executed periodically per profile.
 * Aggregates net margin (Revenue - COGS) over expected frequencies mapping to the discount rate.
 */
async function calculatePredictiveLTV(consumerId: string): Promise<number>
```

---

## ADV-CRM-05: Hyper-Local Geofencing Sentry 
**Priority:** High | **Telemetry:** Sovereign Edge

For designated high-propensity users, the CRM interacts with a Hyper-Local Geofencing Sentry.
- Triggers push telemetry instantly upon boundary-cross.
- **Privacy Lock:** Requires explicitly codified user opt-in natively managed through the Sovereign Alias handshake.
- Operates totally client-side tracking until crossing a polygon bounds, avoiding continuous location tracking uploads.

```typescript
/**
 * monitorGeofenceSovereign(consumerId, polygonBounds) — Edge Trigger
 * Fires sovereign CRM hooks strictly when opting-in clients transmit boundary conditions locally.
 */
async function monitorGeofenceSovereign(consumerId: string, polygonBounds: Array<Coordinate>): Promise<void>
```
