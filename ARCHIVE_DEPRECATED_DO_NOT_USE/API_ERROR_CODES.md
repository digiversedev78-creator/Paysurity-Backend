# PaySurity Platform — API Error Code Catalog
**Document:** API_ERROR_CODES.md | **Version:** v1.0 | **Date:** 2026-03-12  
**Authority:** API Platform team — every error code used in any service MUST be registered here first

> **Rule:** No service may invent an error code not in this catalog.  
> When adding a new code: add here first, then implement.  
> Error response envelope (always): `{ "error": { "code": "MACHINE_CODE", "message": "...", "trace_id": "..." } }`

---

## Response Envelope

```typescript
// packages/shared-types/src/api/ErrorResponse.ts
interface ErrorResponse {
  error: {
    code: string;          // machine-readable code from this catalog
    message: string;       // human-readable (may be shown to end user)
    trace_id: string;      // X-Trace-Id — always include for support tickets
    details?: Record<string, unknown>; // field-level validation errors, retry_after, etc.
  };
}

// HTTP status is always set on the response; code in body is additional precision
// Example: HTTP 422 + body { code: "BELOW_MIN_THRESHOLD", ... }
```

---

## Error Code Catalog

### Authentication & Authorization

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `UNAUTHENTICATED` | 401 | AUTH | Authentication required | — |
| `TOKEN_EXPIRED` | 401 | AUTH | Access token has expired; refresh required | `{ expires_at }` |
| `TOKEN_INVALID` | 401 | AUTH | Token signature invalid or malformed | — |
| `MFA_REQUIRED` | 403 | AUTH | This action requires MFA verification | `{ action, mfa_methods: ["totp","push"] }` |
| `MFA_INVALID` | 403 | AUTH | MFA code incorrect or expired | `{ attempts_remaining }` |
| `FORBIDDEN` | 403 | AUTH | Insufficient role for this action | `{ required_role, current_role }` |
| `LOCK_LEVEL_VIOLATION` | 403 | MENU | Menu item is governed at a higher level and cannot be modified | `{ menu_item_id, lock_level, set_by_role }` |
| `TENANT_SUSPENDED` | 403 | AUTH | Merchant account suspended; contact support | — |
| `TENANT_RESTRICTED` | 403 | AUTH | Merchant account restricted due to overdue balance | `{ overdue_since, amount_due_cents }` |
| `TENANT_TERMINATED` | 403 | AUTH | Merchant account terminated; data read-only for 30 days | — |
| `SESSION_EXPIRED` | 401 | AUTH | AI session has expired; start a new session | `{ expired_at }` |
| `IP_NOT_ALLOWLISTED` | 403 | AUTH | Request IP not in allowed list for this API key | `{ ip }` |

---

### Resource Lifecycle

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `NOT_FOUND` | 404 | RESOURCE | Resource not found | `{ resource_type, id }` |
| `ALREADY_EXISTS` | 409 | RESOURCE | Resource with this identifier already exists | `{ conflict_field }` |
| `DUPLICATE_ORDER` | 409 | ORDER | Order with this idempotency key already exists | `{ existing_order_id }` |
| `INVALID_STATE_TRANSITION` | 422 | RESOURCE | Cannot transition from current status to requested status | `{ current_status, requested_status, allowed_transitions: [] }` |
| `RESOURCE_LOCKED` | 423 | RESOURCE | Resource is locked by another operation | `{ locked_by, retry_after_ms }` |

---

### Validation

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `VALIDATION_ERROR` | 422 | VALIDATION | Request body validation failed | `{ fields: [{field, message}] }` |
| `INVALID_PHONE_FORMAT` | 422 | VALIDATION | Phone must be E.164 format (+1XXXXXXXXXX) | `{ provided_value }` |
| `INVALID_CURRENCY` | 422 | VALIDATION | Currency code not supported | `{ provided, supported: ["USD"] }` |
| `AMOUNT_MUST_BE_POSITIVE` | 422 | VALIDATION | Amount in cents must be a positive integer | — |
| `DATE_RANGE_INVALID` | 422 | VALIDATION | start_date must be before end_date | `{ start_date, end_date }` |
| `MISSING_REQUIRED_FIELD` | 422 | VALIDATION | Required field missing | `{ field }` |

---

### Payment & Gateway

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `PAYMENT_DECLINED` | 402 | PAYMENT | Payment declined by card issuer | `{ decline_code: "INSUFFICIENT_FUNDS" | "HARD_DECLINE" | "SOFT_DECLINE" | ... }` |
| `INSUFFICIENT_FUNDS` | 402 | PAYMENT | Card declined: insufficient funds | — |
| `HARD_DECLINE` | 402 | PAYMENT | Card declined: contact your card issuer | — |
| `EXPIRED_CARD` | 402 | PAYMENT | Card has expired | — |
| `INVALID_CVV` | 402 | PAYMENT | CVV does not match | — |
| `GATEWAY_TIMEOUT` | 504 | PAYMENT | Payment gateway did not respond in time; retry safe with same idempotency key | `{ retry_after_ms }` |
| `GATEWAY_ERROR` | 502 | PAYMENT | Payment gateway returned an unexpected error | `{ gateway_error_code }` |
| `VOID_AFTER_CAPTURE` | 422 | PAYMENT | Cannot void a captured payment; use refund instead | `{ payment_intent_id }` |
| `REFUND_EXCEEDS_CAPTURED` | 422 | PAYMENT | Refund amount exceeds remaining captured balance | `{ max_refundable_cents }` |
| `TENDER_MISMATCH` | 422 | PAYMENT | Sum of tenders does not equal order total | `{ order_total_cents, tenders_total_cents, delta_cents }` |
| `OFFLINE_QUEUE_FULL` | 503 | PAYMENT | Terminal offline queue at capacity; cannot accept new orders | `{ max_queue_depth }` |

---

### Loyalty

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `LOYALTY_ACCOUNT_NOT_FOUND` | 404 | LOYALTY | No loyalty account found for this phone number | — |
| `INSUFFICIENT_BALANCE` | 422 | LOYALTY | Loyalty point balance insufficient for this redemption | `{ current_balance_pts, requested_pts }` |
| `BELOW_MIN_THRESHOLD` | 422 | LOYALTY | Redemption amount below minimum threshold | `{ min_threshold_pts, requested_pts }` |
| `ABOVE_MAX_REDEMPTION` | 422 | LOYALTY | Redemption exceeds maximum per transaction | `{ max_redemption_pts, requested_pts }` |
| `DAILY_REDEMPTION_LIMIT` | 422 | LOYALTY | Daily redemption limit reached | `{ limit_pts, used_today_pts, resets_at }` |
| `ACCOUNT_FRAUD_HOLD` | 403 | LOYALTY | Loyalty account is on fraud hold; contact merchant | — |
| `POINTS_EXPIRED` | 422 | LOYALTY | Points have expired and cannot be redeemed | `{ expired_at }` |
| `EARNING_RULE_NOT_FOUND` | 500 | LOYALTY | No active earning rule found for this merchant; contact support | — |

---

### Orders & KDS

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `ORDER_NOT_OPEN` | 422 | ORDER | Order is not in OPEN status; cannot add items | `{ current_status }` |
| `ORDER_ALREADY_FULFILLED` | 422 | ORDER | Order has already been fulfilled | `{ fulfilled_at }` |
| `ITEM_OUT_OF_STOCK` | 422 | ORDER | Item is currently unavailable (86'd) | `{ menu_item_id, item_name }` |
| `ITEM_NOT_ON_MENU` | 422 | ORDER | Item not found on this location's active menu | `{ menu_item_id }` |
| `MODIFIER_REQUIRED` | 422 | ORDER | Required modifier group has no selection | `{ modifier_group_id, group_name }` |
| `SPLIT_MAX_EXCEEDED` | 422 | ORDER | Cannot split check more than configured maximum | `{ max_ways }` |
| `VOID_REQUIRES_MANAGER` | 403 | ORDER | Voiding a fired order requires manager authorization | `{ manager_pin_required: true }` |
| `KDS_STATION_OFFLINE` | 503 | KDS | KDS station device is not reachable | `{ station_id, last_seen_at }` |
| `HOLD_EXPIRED` | 422 | ORDER | AI order hold has expired; rebuild the order | `{ expired_at }` |

---

### Aggregation

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `INVALID_WEBHOOK_SIGNATURE` | 401 | AGGREGATION | Webhook signature verification failed | — |
| `PLATFORM_NOT_CONNECTED` | 422 | AGGREGATION | Delivery platform not connected for this location | `{ platform, location_id }` |
| `MENU_SYNC_IN_PROGRESS` | 409 | AGGREGATION | Menu sync already running for this platform | `{ sync_job_id }` |
| `ITEM_MAPPING_NOT_FOUND` | 422 | AGGREGATION | No platform ↔ PaySurity item mapping found | `{ platform, platform_item_id }` |
| `ACK_TIMEOUT_RISK` | 503 | AGGREGATION | System cannot guarantee acknowledgment within platform SLA | `{ platform, sla_sec }` |

---

### Notifications

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `CONSENT_NOT_GIVEN` | 422 | NOTIFICATION | Consumer has not opted in for this notification class | `{ consent_class, phone }` |
| `CONSUMER_STOPPED` | 422 | NOTIFICATION | Consumer has opted out via STOP; cannot send SMS | `{ stopped_at }` |
| `RATE_LIMIT_NOTIFICATION` | 429 | NOTIFICATION | Notification rate limit reached for this consumer | `{ limit_type, resets_at }` |

---

### Payroll

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `PAYROLL_ALREADY_APPROVED` | 422 | PAYROLL | Payroll run has already been approved; cannot recalculate | `{ approved_at, approved_by }` |
| `PAYROLL_ACH_CUTOFF_PASSED` | 422 | PAYROLL | Cannot cancel — ACH file already submitted | `{ submitted_at }` |
| `EMPLOYEE_RATE_BELOW_MINIMUM` | 422 | PAYROLL | Employee hourly rate below applicable minimum wage | `{ provided_rate_cents, min_wage_cents, jurisdiction }` |
| `EMPLOYEE_NOT_CLOCKED_IN` | 422 | PAYROLL | Employee must be clocked in to perform this action | — |
| `CLOCK_IN_ALREADY_ACTIVE` | 409 | PAYROLL | Employee already has an active clock-in | `{ clocked_in_at, location_id }` |

---

### Tax

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `TAX_PROVIDER_UNAVAILABLE` | 503 | TAX | TaxJar not reachable; fallback rate applied | `{ fallback_provider, fallback_rate_bps }` |
| `TAX_CALCULATION_NOT_FOUND` | 404 | TAX | No tax calculation found for this order | — |
| `TAX_ALREADY_COMMITTED` | 409 | TAX | Tax transaction already committed to TaxJar | `{ taxjar_transaction_id }` |
| `TAX_EXEMPTION_EXPIRED` | 422 | TAX | Consumer's tax exemption certificate has expired | `{ expired_at }` |
| `NEXUS_NOT_REGISTERED` | 422 | TAX | Merchant has nexus in this state but is not yet registered | `{ state }` |

---

### Franchise

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `GOVERNANCE_VIOLATION` | 403 | FRANCHISE | Cannot modify this item; brand governance lock applies | `{ lock_level, item_id }` |
| `AGREEMENT_EXPIRED` | 422 | FRANCHISE | Franchise agreement has expired | `{ expired_at }` |
| `FRANCHISEE_DATA_RESTRICTED` | 403 | FRANCHISE | Data export not permitted under current data rights model | `{ data_rights_model }` |
| `ROYALTY_ALREADY_COLLECTED` | 409 | FRANCHISE | Royalty for this period already collected | `{ collected_at }` |

---

### Platform & Infrastructure

| Code | HTTP | Category | Message | Details |
|---|---|---|---|---|
| `RATE_LIMIT_EXCEEDED` | 429 | PLATFORM | Too many requests | `{ limit, window_sec, retry_after }` |
| `INTERNAL_ERROR` | 500 | PLATFORM | An unexpected error occurred | `{ trace_id }` — never expose stack traces |
| `SERVICE_UNAVAILABLE` | 503 | PLATFORM | Service temporarily unavailable | `{ retry_after_ms }` |
| `CONFIG_NOT_FOUND` | 500 | PLATFORM | Required configuration key not found; contact support | `{ key }` |
| `IDEMPOTENCY_KEY_REQUIRED` | 422 | PLATFORM | Idempotency-Key header required for this endpoint | — |
| `IDEMPOTENCY_CONFLICT` | 409 | PLATFORM | Idempotency key already used with different request body | `{ original_request_at }` |
| `WEBHOOK_DELIVERY_FAILED` | 502 | PLATFORM | Webhook endpoint returned non-2xx; will retry | `{ endpoint_url, attempt, next_retry_at }` |

---

## Error Response Examples

```json
// 422 Loyalty redemption below minimum
{
  "error": {
    "code": "BELOW_MIN_THRESHOLD",
    "message": "Minimum redemption is 500 points ($5.00). You requested 200 points.",
    "trace_id": "abc123-def456",
    "details": {
      "min_threshold_pts": 500,
      "requested_pts": 200
    }
  }
}

// 402 Card declined
{
  "error": {
    "code": "PAYMENT_DECLINED",
    "message": "Your card was declined. Please try a different card or payment method.",
    "trace_id": "abc123-def456",
    "details": {
      "decline_code": "INSUFFICIENT_FUNDS"
    }
  }
}

// 403 Menu lock violation
{
  "error": {
    "code": "LOCK_LEVEL_VIOLATION",
    "message": "This item's price is governed by brand admin and cannot be changed at the location level.",
    "trace_id": "abc123-def456",
    "details": {
      "menu_item_id": "uuid",
      "lock_level": "LOCKED_PRICE",
      "set_by_role": "BRAND_ADMIN"
    }
  }
}

// 503 TaxJar unavailable — fallback applied (not an error to the caller; informational)
{
  "error": {
    "code": "TAX_PROVIDER_UNAVAILABLE",
    "message": "Tax provider temporarily unavailable. An estimated rate has been applied.",
    "trace_id": "abc123-def456",
    "details": {
      "fallback_provider": "OVERRIDE_TABLE",
      "fallback_rate_bps": 1025
    }
  }
}
```
