# Canonical Requirements: AI Customer Experience Engine
**Vertical:** AI Experience (AI) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**LLM Provider:** Google Gemini API (via `GOOGLE_AI_API_KEY` in GCP Secret Manager)

---

## Database Schema

**Migration:** `db/migrations/040_ai_experience.sql`

```sql
-- AI sessions: one per consumer conversation on the merchant's site/channel
CREATE TABLE ai_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  location_id         UUID REFERENCES locations(id),      -- channel context (which location's menu)
  session_token       VARCHAR(255) NOT NULL UNIQUE,       -- opaque token given to the frontend
  channel             VARCHAR(30) NOT NULL
                      CHECK (channel IN ('WEB_WIDGET','MOBILE_APP','SMS_BOT','VOICE','KIOSK')),
  auth_state          VARCHAR(20) NOT NULL DEFAULT 'ANONYMOUS'
                      CHECK (auth_state IN ('ANONYMOUS','OTP_PENDING','AUTHENTICATED')),
  consumer_id         UUID REFERENCES consumers(id),      -- set after authentication
  loyalty_account_id  UUID REFERENCES loyalty_accounts(id),
  language_code       VARCHAR(5) NOT NULL DEFAULT 'en',   -- detected or chosen; BCP 47
  detected_language   VARCHAR(5),                         -- what the LLM detected from first message
  -- Active order context
  order_hold_id       UUID REFERENCES ai_order_holds(id), -- in-progress order being built
  last_activity_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ NOT NULL,               -- NOW() + ai.session_timeout_sec (config)
  turn_count          INTEGER NOT NULL DEFAULT 0,
  status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE','EXPIRED','COMPLETED','ABANDONED')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_sessions_token ON ai_sessions(session_token) WHERE status = 'ACTIVE';
CREATE INDEX idx_ai_sessions_consumer ON ai_sessions(consumer_id, status);

-- Session messages: full conversation history for context window + audit
CREATE TABLE ai_session_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  role          VARCHAR(10) NOT NULL CHECK (role IN ('USER','ASSISTANT','SYSTEM')),
  content       TEXT NOT NULL,           -- raw message text (or voice transcript)
  content_type  VARCHAR(20) NOT NULL DEFAULT 'TEXT'
                CHECK (content_type IN ('TEXT','VOICE_TRANSCRIPT','IMAGE_DESC','STRUCTURED')),
  llm_tokens_used INTEGER,              -- for cost tracking
  llm_model     VARCHAR(50),            -- e.g. 'gemini-1.5-flash', 'gemini-1.5-pro'
  llm_latency_ms INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE ai_session_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ai_session_messages USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_ai_messages_session ON ai_session_messages(session_id, created_at ASC);

-- OTP verifications for identity during AI session
CREATE TABLE ai_identity_otps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  phone_e164    VARCHAR(20) NOT NULL,
  otp_hash      VARCHAR(255) NOT NULL,   -- bcrypt hash of 6-digit OTP — never store plaintext
  -- AMBIGUITY #13 CLOSED: OTP expires after TIME WINDOW, not after first use.
  -- Consumer may need to glance at it twice. After expiry window, they must request a new code.
  -- Window duration: read from platform_config 'ai.identity_otp_expiry_sec' (default: 300s = 5min)
  expires_at    TIMESTAMPTZ NOT NULL,    -- = created_at + ai.identity_otp_expiry_sec
  used_at       TIMESTAMPTZ,            -- set when successfully validated
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts  INTEGER NOT NULL DEFAULT 3, -- read from config 'ai.identity_otp_max_attempts'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_otps_session ON ai_identity_otps(session_id, expires_at) WHERE used_at IS NULL;

-- Order holds: AI builds an order; holds it until consumer confirms
CREATE TABLE ai_order_holds (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  session_id        UUID NOT NULL REFERENCES ai_sessions(id),
  location_id       UUID NOT NULL REFERENCES locations(id),
  order_type        VARCHAR(20) NOT NULL DEFAULT 'AI_ORDER'  -- always AI_ORDER for AI-initiated
                    CHECK (order_type IN ('AI_ORDER','TAKEOUT','DELIVERY')),
  items             JSONB NOT NULL DEFAULT '[]',
  -- [{menu_item_id, item_name_snapshot, quantity, unit_price_cents, modifiers, notes}]
  special_instructions TEXT,
  estimated_total_cents INTEGER NOT NULL DEFAULT 0,
  loyalty_redemption_cents INTEGER NOT NULL DEFAULT 0,
  status            VARCHAR(20) NOT NULL DEFAULT 'BUILDING'
                    CHECK (status IN ('BUILDING','PENDING_CONFIRMATION','CONFIRMED','ABANDONED','CONVERTED')),
  confirmed_at      TIMESTAMPTZ,
  converted_order_id UUID REFERENCES orders(id),     -- set when hold → real order
  abandoned_reason  VARCHAR(50),
  hold_timeout_at   TIMESTAMPTZ NOT NULL,             -- = NOW() + ai.order_hold_timeout_sec (config)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE ai_order_holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ai_order_holds USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- AI analytics: session outcomes for continuous improvement
CREATE TABLE ai_session_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  session_id      UUID NOT NULL REFERENCES ai_sessions(id) UNIQUE,
  outcome         VARCHAR(30) NOT NULL
                  CHECK (outcome IN ('ORDER_PLACED','LOYALTY_REDEEMED','INFO_PROVIDED','ESCALATED','ABANDONED','ERROR')),
  order_value_cents INTEGER,
  loyalty_redeemed_cents INTEGER,
  turns_to_order  INTEGER,            -- how many turns before order was placed
  language_used   VARCHAR(5),
  channel         VARCHAR(30),
  required_escalation BOOLEAN NOT NULL DEFAULT FALSE,
  escalation_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE ai_session_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ai_session_analytics USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/040_ai_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable, min_value, max_value)
VALUES
  -- LLM model selection
  ('ai.llm.default_model',            'gemini-1.5-flash', 'string', 'Default Gemini model for AI sessions', FALSE, NULL, NULL),
  ('ai.llm.high_complexity_model',    'gemini-1.5-pro',   'string', 'Model for complex multi-step orders', FALSE, NULL, NULL),
  ('ai.llm.token_limit_per_turn',     '2048',  'integer', 'Max tokens per LLM response turn', FALSE, '512', '8192'),
  ('ai.llm.context_window_turns',     '20',    'integer', 'Number of prior turns to include in context', FALSE, '5', '50'),

  -- Session lifecycle
  ('ai.session_timeout_sec',          '900',   'integer', 'Session idle timeout in seconds (15 min)', TRUE, '300', '3600'),
  ('ai.max_turns_per_session',        '50',    'integer', 'Max conversation turns before session reset', FALSE, '10', '200'),
  ('ai.order_hold_timeout_sec',       '300',   'integer', 'Seconds AI holds unconfirmed order (5 min)', FALSE, '60', '600'),

  -- Identity / OTP
  ('ai.identity_otp_expiry_sec',      '300',   'integer', 'OTP expires after this many seconds (time window, NOT one-time use)', FALSE, '120', '600'),
  ('ai.identity_otp_max_attempts',    '3',     'integer', 'Max incorrect OTP attempts before new code required', FALSE, '2', '5'),
  ('ai.identity_otp_length',          '6',     'integer', 'OTP digit count', FALSE, '4', '8'),

  -- Language
  ('ai.supported_languages',          '["en","es","fr","zh","ar","hi","pt","de","ja","ko"]', 'json', 'Supported language codes (BCP 47)', FALSE, NULL, NULL),
  ('ai.language_detection_confidence','0.80',  'decimal', 'Min confidence to auto-switch language (0.0-1.0)', FALSE, '0.5', '1.0'),

  -- AMBIGUITY #6 CLOSED: AI_ORDER → KDS routing behavior
  ('ai.order.kds_routing',            'SAME_AS_DINE_IN', 'string', 'AI_ORDER routes to KDS identically to DINE_IN. source_channel=AI_ASSISTANT stored for analytics only; no KDS behavior difference.', FALSE, NULL, NULL),
  ('ai.order.default_order_type',     'TAKEOUT', 'string', 'Default order_type for AI orders unless delivery address provided', TRUE, NULL, NULL),
  ('ai.order.confirm_before_payment', 'true',  'boolean', 'AI must get explicit consumer confirmation before initiating payment', FALSE, NULL, NULL)
ON CONFLICT (key) DO NOTHING;
```

---

## REQ-AI-001: Multilingual AI Session & Identity Resolution

**Priority:** Must | **Actors:** Consumer, AI Engine, NOT Engine, LOY Service

---

#### Context & Business Intent

A consumer visits a BistroBeest merchant website, opens the AI chat widget, and speaks/types in any language. The AI automatically detects the language, responds in kind, identifies the consumer by phone number, authenticates them via OTP, and loads their loyalty context — all before the first order item is mentioned. If we fail at identity: the consumer can't redeem points. If we fail at multilingual: we lose the sale.

---

#### Service Layer: `src/modules/ai/ai-session.service.ts`

```typescript
/**
 * createSession(params) — Called when consumer opens chat widget.
 * Generates session_token (crypto.randomBytes(32).toString('hex')).
 * Sets expires_at = NOW() + config 'ai.session_timeout_sec'.
 * Returns: { session_token, welcome_message_in_language }
 * Welcome message: rendered from 'ai.welcome' template in detected/default language.
 */
async createSession(params: {
  tenantId: string;
  locationId: string;
  channel: AIChannel;
  detectedLanguage?: string;    // from browser navigator.language; AI will confirm
}): Promise<AISession>

/**
 * processMessage(sessionToken, userMessage) — Core turn handler.
 * Step 1: Validate session not expired (expires_at > NOW()). Touch last_activity_at.
 * Step 2: Check turn_count <= 'ai.max_turns_per_session' config.
 * Step 3: Language detection: if first turn, call Gemini with:
 *   prompt: "Detect the language of this message. Respond with only the BCP 47 code."
 *   If confidence >= config 'ai.language_detection_confidence': set session.language_code
 * Step 4: Build LLM context window (last N turns from ai_session_messages; N from config)
 * Step 5: Build system prompt (see SYSTEM PROMPT TEMPLATE section below)
 * Step 6: Call Gemini API with full context
 * Step 7: Parse LLM response for intent:
 *   - MENU_INQUIRY → query menu, respond with items
 *   - ADD_TO_ORDER → validate item exists, add to ai_order_holds
 *   - LOYALTY_CHECK → check auth_state; if ANONYMOUS → trigger OTP flow
 *   - REDEEM_LOYALTY → requires auth; call LOY service
 *   - CONFIRM_ORDER → requires auth if loyalty involved; call convertHoldToOrder()
 *   - ESCALATE → call escalateToHuman()
 * Step 8: Write ai_session_messages for user + assistant turns
 * Step 9: Return assistant response text
 */
async processMessage(sessionToken: string, userMessage: string): Promise<AIMessageResponse>

/**
 * initiateOTP(sessionToken, phone) — Triggered when consumer wants loyalty access.
 * 1. Generate 6-digit OTP (crypto.randomInt(100000, 999999))
 * 2. Hash with bcrypt (10 rounds)
 * 3. Write ai_identity_otps record (expires_at = NOW() + config 'ai.identity_otp_expiry_sec')
 *    OTP EXPIRES AFTER TIME WINDOW — not after first use (ambiguity #13)
 * 4. Send OTP via NOT engine: 'ai.identity_otp' TRANSACTIONAL SMS template
 * 5. Set session.auth_state = 'OTP_PENDING'
 * Returns: { expires_at, masked_phone: '+1 (312) 555-XXXX' }
 */
async initiateOTP(sessionToken: string, phone: string): Promise<OTPInitResult>

/**
 * verifyOTP(sessionToken, submittedCode) — Consumer enters the code they received.
 * 1. Load latest non-expired ai_identity_otps for session (expires_at > NOW() AND used_at IS NULL)
 * 2. Increment attempt_count; if >= max_attempts → invalidate otp; return OTP_MAX_ATTEMPTS error
 * 3. bcrypt.compare(submittedCode, otp_hash)
 * 4. If match: set used_at=NOW(), session.auth_state=AUTHENTICATED, resolve consumer_id
 *    Load loyalty_account for this tenant + phone → set session.loyalty_account_id
 *    Return: { authenticated: true, consumer_name, points_balance, tier_name }
 * 5. If no match: return { authenticated: false, attempts_remaining }
 * NOTE: OTP is still valid for re-attempt within time window if attempts_remaining > 0
 */
async verifyOTP(sessionToken: string, submittedCode: string): Promise<OTPVerifyResult>
```

---

#### System Prompt Template (stored in DB, not hardcoded)

```sql
-- The AI system prompt is a notification template, rendered per session
INSERT INTO notification_templates (tenant_id, template_key, channel, consent_class, language_code, body_template, version, is_active)
VALUES (
  NULL,  -- platform-level template (all tenants)
  'ai.system_prompt',
  'IN_APP',
  'TRANSACTIONAL',
  'en',
  'You are the AI assistant for {{merchant_name}}, a {{vertical}} located at {{location_address}}.
You help customers: browse the menu, place orders, check and redeem loyalty points, and get information.

IMPORTANT RULES:
1. Only discuss items on the current menu (provided below as JSON).
2. Never invent menu items, prices, or availability.
3. If the customer wants to redeem loyalty points, first verify their identity via OTP.
4. Respond ONLY in {{language_code}} (the customer''s language). Do NOT switch languages.
5. If you cannot help (complaint requiring manager, medical emergency, or out-of-scope request): say "Let me connect you with the team" and set intent=ESCALATE.
6. Maximum response length: {{max_response_words}} words. Be concise and warm.

CURRENT MENU (JSON):
{{menu_json}}

CUSTOMER CONTEXT:
- Auth state: {{auth_state}}
- Name: {{customer_name}} (or "Guest" if anonymous)
- Loyalty points: {{points_balance}} (worth {{points_dollar_value}})
- Tier: {{tier_name}}
- Current order: {{current_order_summary}}',
  1, TRUE
) ON CONFLICT DO NOTHING;
```

---

#### REQ-AI-002: AI-to-Sale Pipeline (Closes Ambiguity #6)

**Priority:** Must | **Actors:** Consumer, AI, Order Service, KDS, LOY Service, Payment Service

---

**AMBIGUITY #6 CLOSED:**  
`order_type = 'AI_ORDER'` and `source_channel = 'AI_ASSISTANT'`. KDS routing behavior is **identical to DINE_IN** — same station routing logic, same ticket format, same color thresholds. The `source_channel` value is stored for analytics only. KDS staff see the source on the ticket header as a visual label ("📱 AI Order") but there is no routing difference.

```typescript
/**
 * convertHoldToOrder(sessionToken) — Consumer confirms order in AI session.
 * Pre-conditions:
 *   - session.auth_state = AUTHENTICATED (if loyalty involved)
 *   - ai_order_holds.status = PENDING_CONFIRMATION
 *   - hold_timeout_at > NOW()
 *
 * 1. Validate all items still available (check menu_items.is_active)
 *    If any item OOS: respond "Unfortunately [Item] is no longer available — shall we remove it?"
 * 2. Apply loyalty redemption if requested (call LOY service; lock points)
 * 3. Request real-time tax: call TAX service with order items and location (same as POS checkout)
 * 4. Create orders record:
 *    order_type = 'AI_ORDER'
 *    source_channel = 'AI_ASSISTANT'
 *    consumer_id = session.consumer_id
 *    loyalty_account_id = session.loyalty_account_id
 *    status = 'OPEN'
 * 5. Create order_items from ai_order_holds.items
 * 6. Initiate payment:
 *    - If consumer has wallet with sufficient balance: confirm wallet payment
 *    - If consumer has saved card (card-on-file token): confirm via hosted fields token
 *    - Else: present payment link (consumer pays by card entry on secure hosted page)
 * 7. On payment success: fireToKDS() — same KDS routing as any other order
 * 8. Update ai_order_holds: status=CONVERTED, converted_order_id=order.id
 * 9. Update session: status=COMPLETED
 * 10. Write ai_session_analytics
 * 11. Return: { order_id, short_id, estimated_ready_minutes, loyalty_earned_preview }
 */
async convertHoldToOrder(sessionToken: string): Promise<AIOrderResult>
```

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `POST` | `/v1/ai/sessions` | None (public) | Create new AI session | — |
| `POST` | `/v1/ai/sessions/{token}/messages` | Session token | Send message, get response | — |
| `POST` | `/v1/ai/sessions/{token}/otp/initiate` | Session token (ANONYMOUS) | Request OTP | — |
| `POST` | `/v1/ai/sessions/{token}/otp/verify` | Session token (OTP_PENDING) | Submit OTP code | — |
| `GET` | `/v1/ai/sessions/{token}/order-hold` | Session token | Current order in progress | — |
| `POST` | `/v1/ai/sessions/{token}/confirm` | Session token (AUTHENTICATED if loyalty) | Convert hold to order | `order.created`, `payment.succeeded` |
| `POST` | `/v1/ai/sessions/{token}/escalate` | Session token | Request human handoff | `ai.escalated` |
| `GET` | `/v1/ai/analytics` | Merchant Admin | Session analytics dashboard | — |

---

#### REQ-AI-003: Escalation to Human

**Priority:** Must | **Actors:** Consumer, AI, OPS Agent, Location Manager

---

```typescript
/**
 * escalateToHuman(sessionToken, reason) — Called when AI cannot help.
 * 1. Write ai_session_analytics: outcome=ESCALATED
 * 2. Fire webhook: 'ai.escalated' (OPS engine receives this)
 * 3. OPS Agent notified via NOT engine to LOCATION_MANAGER channel
 * 4. Session: status stays ACTIVE; AI responds:
 *    "I'm looping in the team — someone will be with you in a moment."
 * 5. LOCATION_MANAGER sees escalation alert on POS screen:
 *    "AI Chat — Guest needs assistance" with full conversation history link
 * 6. Manager can: Join chat thread | Call consumer | Mark resolved
 * 7. If 5 minutes pass with no human response: re-attempt + escalate to BRAND_ADMIN
 */
async escalateToHuman(sessionToken: string, reason: string): Promise<void>
```

**Escalation triggers (code checks these, not the LLM):**
- LLM response contains `intent=ESCALATE` JSON marker
- Consumer explicitly says keywords: "manager", "complaint", "refund" (keyword list in DB)
- Session reaches `ai.max_turns_per_session` without order completion
- Payment failure after 2 attempts

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('ai.escalation.trigger_keywords', '["manager","complaint","refund","problem","wrong","terrible","disgusting","emergency","hurt","sick"]', 'json', 'Keywords that trigger hard escalation to human', TRUE),
  ('ai.escalation.human_response_timeout_sec', '300', 'integer', 'Seconds before escalation re-pings BRAND_ADMIN', FALSE, '60', '900')
ON CONFLICT (key) DO NOTHING;
```

---

#### Acceptance Tests

| Test ID | Scenario | Input | Expected |
|---|---|---|---|
| AI-001-T1 | Spanish-speaking consumer | "Hola, ¿qué tienen de cenar hoy?" | Language detected as 'es' ≥ 0.80 confidence; all subsequent responses in Spanish |
| AI-001-T2 | Anonymous order (no loyalty) | Order without phone | Order placed, payment initiated; no OTP required; source_channel=AI_ASSISTANT |
| AI-001-T3 | OTP time window | OTP sent; consumer waits 3 min, verifies | Succeeds if within 300s window; fails if > 300s |
| AI-001-T4 | OTP max attempts | Wrong code 3 times | OTP invalidated; consumer must request new code |
| AI-001-T5 | Loyalty redemption in AI | Authenticated consumer, 1000 pts | LOY.initiateRedemption called; discount applied before tax; confirmed in payment |
| AI-001-T6 | OOS item in hold | Item 86'd after added to hold | AI informs consumer; offers replacement from same category |
| AI-001-T7 | AI_ORDER KDS routing | AI order placed | Fires to KDS SAME as DINE_IN; ticket shows "📱 AI Order" label; routing identical |
| AI-001-T8 | Escalation keyword | Consumer types "I need a manager" | AI responds "looping in team"; ai.escalated webhook fires; LOCATION_MANAGER notified |
| AI-001-T9 | Session timeout | Session idle > 900s | Session expires; order hold abandoned; consumer sees "session expired" on next message |
| AI-001-T10 | Menu item confidence | Consumer asks "do you have pasta?" (not on menu) | AI responds "We don't have pasta — here's what we do have:" with similar items |
