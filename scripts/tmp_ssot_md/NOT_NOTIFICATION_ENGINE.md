# Canonical Requirements: Notification & Communications Engine
**Vertical:** Notification Engine (NOT) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**Providers:** Twilio (SMS), SendGrid (Email), Expo Push (Push), FCM/APNs (direct fallback)

---

## Database Schema

**Migration:** `db/migrations/025_notification_engine.sql`

```sql
-- Consumer notification preferences and consent (TCPA/CAN-SPAM compliance)
CREATE TABLE notification_consents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  consumer_id         UUID REFERENCES consumers(id),
  phone_e164          VARCHAR(20) CHECK (phone_e164 ~ '^\+[1-9]\d{7,14}$'),
  email               VARCHAR(255),
  -- Consent classes: TRANSACTIONAL requires no opt-in; SERVICE requires no opt-in;
  -- MARKETING requires explicit opt-in (TCPA); MARKETING_EMAIL requires CAN-SPAM-compliant opt-in
  consent_sms_transactional   BOOLEAN NOT NULL DEFAULT TRUE,   -- always allowed (order confirms, OTP)
  consent_sms_service         BOOLEAN NOT NULL DEFAULT TRUE,   -- always allowed (loyalty updates, alerts)
  consent_sms_marketing       BOOLEAN NOT NULL DEFAULT FALSE,  -- REQUIRES explicit opt-in — TCPA
  consent_email_transactional BOOLEAN NOT NULL DEFAULT TRUE,
  consent_email_service       BOOLEAN NOT NULL DEFAULT TRUE,
  consent_email_marketing     BOOLEAN NOT NULL DEFAULT FALSE,  -- REQUIRES explicit opt-in — CAN-SPAM
  consent_push_marketing      BOOLEAN NOT NULL DEFAULT FALSE,  -- OS-level permission required first
  sms_marketing_opted_in_at   TIMESTAMPTZ,   -- timestamp of opt-in (required for TCPA audit)
  sms_marketing_opted_in_via  VARCHAR(50),   -- 'POS_RECEIPT', 'WEB_CHECKOUT', 'AI_SESSION', 'KEYWORD_JOIN'
  email_marketing_opted_in_at TIMESTAMPTZ,
  sms_stop_received_at        TIMESTAMPTZ,   -- when consumer texted STOP — blocks ALL SMS immediately
  sms_stop_keyword            VARCHAR(20),   -- 'STOP', 'CANCEL', 'QUIT', 'UNSUBSCRIBE', 'END'
  sms_start_received_at       TIMESTAMPTZ,   -- when consumer texted START (re-opts in)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, phone_e164),
  UNIQUE(tenant_id, email)
);
ALTER TABLE notification_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notification_consents
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_consents_phone ON notification_consents(phone_e164);
CREATE INDEX idx_consents_email ON notification_consents(email);

-- Notification templates: versioned, multi-channel, multi-language
CREATE TABLE notification_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id),  -- NULL = platform-level template (all tenants)
  template_key    VARCHAR(100) NOT NULL,         -- e.g. 'order.confirmation', 'loyalty.points_earned'
  channel         VARCHAR(20) NOT NULL CHECK (channel IN ('SMS','EMAIL','PUSH','IN_APP')),
  consent_class   VARCHAR(30) NOT NULL
                  CHECK (consent_class IN ('TRANSACTIONAL','SERVICE','MARKETING')),
  language_code   VARCHAR(5) NOT NULL DEFAULT 'en', -- BCP 47: 'en', 'es', 'fr', 'zh', 'ar', 'hi'
  subject         TEXT,                          -- email only; NULL for SMS/push
  body_template   TEXT NOT NULL,                 -- Handlebars syntax {{variable_name}}
  version         INTEGER NOT NULL DEFAULT 1,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  approved_by     UUID REFERENCES users(id),     -- marketing templates require approval
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, template_key, channel, language_code, version)
);
-- No RLS on platform-level templates (tenant_id IS NULL rows must be globally readable)
CREATE INDEX idx_templates_lookup ON notification_templates(template_key, channel, language_code, is_active);

-- Notification log: every delivery attempt
CREATE TABLE notification_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  template_key      VARCHAR(100) NOT NULL,
  channel           VARCHAR(20) NOT NULL,
  consent_class     VARCHAR(30) NOT NULL,
  recipient_phone   VARCHAR(20),
  recipient_email   VARCHAR(255),
  recipient_push_token VARCHAR(500),
  recipient_consumer_id UUID REFERENCES consumers(id),
  status            VARCHAR(20) NOT NULL DEFAULT 'QUEUED'
                    CHECK (status IN ('QUEUED','SENDING','DELIVERED','FAILED','BOUNCED','SPAM_REPORT','UNSUBSCRIBED')),
  provider_message_id VARCHAR(255),   -- Twilio SID, SendGrid message_id, Expo ticket ID
  provider_response JSONB,           -- full provider response for debugging
  render_data       JSONB,           -- variable values used to render the template
  sent_at           TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  failed_at         TIMESTAMPTZ,
  failure_reason    TEXT,
  retry_count       INTEGER NOT NULL DEFAULT 0,
  next_retry_at     TIMESTAMPTZ,
  -- Quiet hours tracking
  held_for_quiet_hours BOOLEAN NOT NULL DEFAULT FALSE,
  quiet_hours_released_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notification_log
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_notif_log_status ON notification_log(status, next_retry_at) WHERE status IN ('QUEUED','SENDING');
CREATE INDEX idx_notif_log_consumer ON notification_log(recipient_consumer_id, created_at DESC);
CREATE INDEX idx_notif_log_template ON notification_log(tenant_id, template_key, created_at DESC);

-- Rate limit counters (managed in Redis — this table is the persistent fallback / daily reset)
CREATE TABLE notification_rate_limits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  consumer_key    VARCHAR(255) NOT NULL,  -- phone_e164 or email
  consent_class   VARCHAR(30) NOT NULL,
  period          VARCHAR(10) NOT NULL CHECK (period IN ('DAY','WEEK','MONTH')),
  period_date     DATE NOT NULL,         -- the specific day/week-start/month-start
  count           INTEGER NOT NULL DEFAULT 0,
  UNIQUE(tenant_id, consumer_key, consent_class, period, period_date)
);
```

**Seed:** `db/seeds/025_notification_seed.sql`

```sql
-- Ambiguity #19 CLOSED: expiry warning notifications — platform brand sends, not merchant brand
-- i.e. the "From" name on the notification is the MERCHANT brand (BistroBeest Rewards)
-- because the consumer doesn't know what PaySurity is
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('notification.sender.sms_from_name',     'BistroBeest',  'string',  'SMS "from" display name (merchant brand — set per merchant_config)', TRUE),
  ('notification.sender.email_from_name',   'BistroBeest Rewards', 'string', 'Email from name (merchant brand)', TRUE),
  ('notification.expiry_warning.sender',    'MERCHANT_BRAND', 'string', 'Who sends expiry warnings: MERCHANT_BRAND | PAYSURITY_PLATFORM. Always MERCHANT_BRAND.', FALSE),
  ('notification.marketing.max_per_day',    '3',    'integer', 'Max marketing messages per consumer per day', FALSE),
  ('notification.marketing.max_per_week',   '10',   'integer', 'Max marketing messages per consumer per week', FALSE),
  ('notification.quiet_hours_start',        '22',   'integer', 'Quiet hours start (consumer local time, 24h)', TRUE),
  ('notification.quiet_hours_end',          '7',    'integer', 'Quiet hours end (consumer local time, 24h)', TRUE),
  ('notification.sms.provider',             'twilio', 'string', 'SMS provider: twilio', FALSE),
  ('notification.sms.10dlc_message_service_sid', '', 'string', 'Twilio Messaging Service SID (10DLC registered)', FALSE),
  ('notification.email.provider',           'sendgrid', 'string', 'Email provider: sendgrid', FALSE),
  ('notification.email.transactional_ip_pool','transactional', 'string', 'SendGrid IP pool name for transactional', FALSE),
  ('notification.email.marketing_ip_pool',  'marketing', 'string', 'SendGrid IP pool name for marketing', FALSE),
  ('notification.push.provider',            'expo', 'string', 'Push provider: expo (routes to FCM/APNs)', FALSE),
  ('notification.retry.max_attempts',       '6',    'integer', 'Max delivery retry attempts before FAILED', FALSE),
  ('notification.dedup_window_seconds',     '300',  'integer', 'Suppress duplicate notification within 5 min window', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Twilio STOP keywords (TCPA mandated — non-negotiable list)
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('notification.tcpa.stop_keywords', '["STOP","CANCEL","QUIT","UNSUBSCRIBE","END","STOPALL"]', 'json', 'TCPA STOP keyword list — triggers immediate SMS block', FALSE),
  ('notification.tcpa.stop_response', 'You have been unsubscribed and will receive no further marketing texts. Reply START to re-subscribe.', 'string', 'Auto-response on STOP — TCPA required', FALSE),
  ('notification.tcpa.start_response', 'You have re-subscribed to marketing texts. Reply STOP to unsubscribe.', 'string', 'Auto-response on START', FALSE)
ON CONFLICT (key) DO NOTHING;

-- BistroBeest sender config override
INSERT INTO merchant_config (tenant_id, config_key, value, set_by)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'notification.sender.sms_from_name', 'BistroBeest', 'usr00001-0000-0000-0000-000000000001'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'notification.sender.email_from_name', 'BistroBeest Rewards', 'usr00001-0000-0000-0000-000000000001'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'notification.quiet_hours_start', '22', 'usr00001-0000-0000-0000-000000000001'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'notification.quiet_hours_end', '7', 'usr00001-0000-0000-0000-000000000001')
ON CONFLICT (tenant_id, config_key) DO UPDATE SET value = EXCLUDED.value;
```

---

## REQ-NOT-001: Multi-Channel Notification Dispatch with Channel Fallback

**Priority:** Must | **Actors:** System, Consumer, BullMQ Queue

---

#### Context & Business Intent

Every notification is dispatched through a channel-fallback cascade. A PUSH notification that fails due to no app install falls through to SMS. An SMS that fails due to carrier rejection falls through to email. All routing decisions and wait times between fallback attempts are read from `platform_config` — never from code. This ensures Merchant Admins can tune behavior without a code deployment.

---

#### Service Layer: `src/modules/notifications/notification.service.ts`

```typescript
/**
 * send(params) — The single entry point for ALL notifications in the platform.
 * Called by: Order Service, Loyalty Service, Dispute Service, AI, OPS, Payroll, Billing.
 * NEVER called with a hardcoded message — always a template_key + render data.
 *
 * Execution:
 * 1. Resolve consumer consent from notification_consents
 *    If consent_class = MARKETING and consent_sms_marketing = FALSE → SKIP (not an error)
 *    If phone exists in sms_stop_received_at → SKIP all SMS channels (TCPA)
 * 2. Check quiet hours (consumer's local timezone — derived from location or consumer profile)
 *    If within quiet hours AND class = MARKETING or SERVICE → hold until quiet_hours_end
 *    If class = TRANSACTIONAL → send immediately regardless of quiet hours
 * 3. Check rate limits (Redis counter; fall back to notification_rate_limits table if Redis miss)
 *    MARKETING only: if daily/weekly limit hit → SKIP
 * 4. Resolve template: lookup notification_templates by (template_key, channel, language_code)
 *    Language: from consumer profile; fallback to 'en' if not found
 * 5. Check deduplication: hash(tenant_id + consumer_key + template_key + render_data_hash)
 *    If identical notification sent within dedup_window_seconds → SKIP
 * 6. Render template with Handlebars using render_data
 * 7. Write notification_log row (status=QUEUED)
 * 8. Enqueue BullMQ job: 'notification.dispatch' with notification_log.id
 * Returns: notification_log.id (caller does not await delivery)
 */
async send(params: {
  tenantId: string;
  templateKey: string;
  consumerId?: string;
  recipientPhone?: string;         // accepts E.164 only (Rule 7 enforced here too)
  recipientEmail?: string;
  recipientPushToken?: string;
  consentClass: 'TRANSACTIONAL' | 'SERVICE' | 'MARKETING';
  channel: 'SMS' | 'EMAIL' | 'PUSH' | 'AUTO';  // AUTO = try push → SMS → email
  renderData: Record<string, string | number | boolean>;
  referenceId?: string;            // optional: order_id, dispute_id, etc. for correlation
}): Promise<string>  // returns notification_log.id

/**
 * dispatchJob(notificationLogId) — BullMQ job handler.
 * Reads notification_log, calls channel-specific provider.
 * On success: status=DELIVERED, provider_message_id saved
 * On failure: status=QUEUED with retry backoff (delays from platform_config)
 * On final failure (max retries): status=FAILED, fallback to next channel if AUTO mode
 */
async dispatchJob(notificationLogId: string): Promise<void>
```

---

#### Provider Integration Contracts

**Twilio SMS:**
```typescript
// packages/integrations/twilio/twilio.client.ts
// Auth: AccountSid + AuthToken from GCP Secret Manager
// Endpoint: POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
// Body: { From: messagingServiceSid, To: phone_e164, Body: rendered_template }
// Success: response.status = 'queued' | 'sent'
// Delivery status: Twilio calls our webhook POST /webhooks/twilio/status
//   → updates notification_log.status = 'DELIVERED' | 'FAILED'
// STOP handling: Twilio calls POST /webhooks/twilio/stop
//   → sets notification_consents.sms_stop_received_at = NOW()
//   → blocks ALL future SMS for this phone across ALL tenants (platform-wide STOP)
```

**SendGrid Email:**
```typescript
// packages/integrations/sendgrid/sendgrid.client.ts
// Auth: API Key from GCP Secret Manager
// Endpoint: POST https://api.sendgrid.com/v3/mail/send
// Body: { personalizations: [{to, dynamic_template_data}], from, template_id, ip_pool_name }
// ip_pool_name: read from platform_config ('notification.email.transactional_ip_pool')
// Bounce/spam: SendGrid calls POST /webhooks/sendgrid/events
//   → BOUNCE: notification_log.status = 'BOUNCED'; flag email as invalid
//   → SPAM_REPORT: block all marketing email to this address; set consent_email_marketing=FALSE
//   → UNSUBSCRIBE: sets consent_email_marketing=FALSE; audit event written
```

**Expo Push:**
```typescript
// packages/integrations/expo-push/expo.client.ts
// Endpoint: POST https://exp.host/--/api/v2/push/send
// Body: { to: expoPushToken, title, body, data: {template_key, reference_id} }
// Tickets returned → check receipt after 15min via GET /--/api/v2/push/getReceipts
// Receipt DeviceNotRegistered → remove push token from consumer profile
// Receipt MessageRateExceeded → retry after 1 hour
```

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook Fired |
|---|---|---|---|---|
| `GET` | `/v1/notifications/consent/{phone}` | Merchant Admin | Check consent status for a phone | — |
| `POST` | `/v1/notifications/consent` | Consumer (self), POS | Record consent opt-in | `consent.updated` |
| `DELETE` | `/v1/notifications/consent/{phone}/marketing` | Consumer (self) | Opt out of marketing | `consent.optout` |
| `GET` | `/v1/notifications/log` | Merchant Admin | Delivery log with filters | — |
| `GET` | `/v1/notifications/templates` | Merchant Admin | List templates for this tenant | — |
| `POST` | `/v1/notifications/templates` | Merchant Admin | Create custom template | — |
| `PATCH` | `/v1/notifications/templates/{id}` | Merchant Admin | Update template | — |
| `POST` | `/v1/notifications/send` | Internal Service, API Key | Programmatic send | — |
| `POST` | `/webhooks/twilio/status` | Twilio (no auth — IP allowlist) | Delivery status callback | — |
| `POST` | `/webhooks/twilio/stop` | Twilio | STOP keyword received | — |
| `POST` | `/webhooks/sendgrid/events` | SendGrid (webhook key) | Bounce/spam/unsub events | — |

---

#### UI/UX — Notification Center (Merchant Portal)

**Consent Management Tab:**  
> Search bar: enter phone or email → shows consent card:  
> "Maria Lopez (+1 312 555 9876)"  
> ✅ Transactional SMS | ✅ Service SMS | ❌ Marketing SMS (opted out 2026-02-10)  
> ✅ Transactional Email | ✅ Service Email | ✅ Marketing Email (opted in 2025-11-05)  
> "Re-invite to marketing SMS" button → launches compliant double opt-in flow (sends SMS with KEYWORD to reply)

**Delivery Log Tab:**  
> Table: Template | Channel | Recipient | Status | Sent At | Provider ID  
> Filter by: date range, channel, status, template  
> Click row → full detail: rendered body, provider response, retry history  

**Template Manager Tab:**  
> List of templates with: Key | Channels | Languages | Last modified  
> Edit → Handlebars editor with live preview pane showing rendered output  
> "Test Send" button → sends to merchant admin's own phone/email

---

#### Acceptance Tests

| Test ID | Scenario | Input | Expected |
|---|---|---|---|
| NOT-001-T1 | TRANSACTIONAL SMS — no consent required | Order confirmation to +13125559876 | Sent immediately regardless of marketing consent; log=DELIVERED |
| NOT-001-T2 | MARKETING SMS — no consent | Marketing template to consumer with sms_marketing=FALSE | Skipped; log NOT written (not an error); no SMS sent |
| NOT-001-T3 | STOP keyword received | Twilio webhook: consumer texted "STOP" | sms_stop_received_at set; ALL future SMS blocked; auto-response "You have been unsubscribed..." |
| NOT-001-T4 | Quiet hours — SERVICE | Notification at 11 PM consumer local time | Held; released at 7 AM; log shows held_for_quiet_hours=TRUE |
| NOT-001-T5 | Quiet hours — TRANSACTIONAL | Order ready notification at 11 PM | Sent immediately regardless of quiet hours |
| NOT-001-T6 | Rate limit hit | 4th marketing SMS in same day (limit=3) | 4th skipped; log entry with reason RATE_LIMIT_EXCEEDED |
| NOT-001-T7 | Deduplication | Same points_earned notification sent twice in 5 min | Second suppressed; log shows DEDUPLICATED |
| NOT-001-T8 | Push → SMS fallback | Consumer has no push token; push fails | Falls through to SMS within fallback_wait_seconds (config) |
| NOT-001-T9 | Spanish template | Consumer language='es'; 'order.confirmation' template | Spanish template served; English fallback if 'es' not found |
| NOT-001-T10 | Expiry warning branding | 60-day loyalty expiry warning | From name = BistroBeest Rewards (merchant brand); NOT PaySurity (ambiguity #19 CLOSED) |
