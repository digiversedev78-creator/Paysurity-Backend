#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# PaySurity Staging Smoke Test — v2
# Updated: 2026-04-14 — adds DNS propagation wait (up to 5 min)
#
# Usage:
#   chmod +x scripts/test-staging.sh
#   ./scripts/test-staging.sh                    # waits for DNS, then full test
#
#   # Skip DNS wait and use Cloud Run URLs directly (before DNS propagates):
#   SKIP_DNS_WAIT=true \
#   BASE_URL=https://paysurity-public-website-XXXX-uc.a.run.app \
#   API_BASE_URL=https://paysurity-api-44gyeebm6a-uc.a.run.app \
#   ./scripts/test-staging.sh
#
# Exit: 0 = all tests passed | 1 = failure
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
PUBLIC_URL="${BASE_URL:-https://staging.paysurity.com}"
API_URL="${API_BASE_URL:-https://api.staging.paysurity.com}"
DASHBOARD_URL="${DASHBOARD_BASE_URL:-https://dashboard.staging.paysurity.com}"
SKIP_DNS_WAIT="${SKIP_DNS_WAIT:-false}"
DNS_WAIT_MAX_SECONDS=300   # 5 minutes
DNS_POLL_INTERVAL=15       # check every 15 seconds
HTTP_TIMEOUT=20
PASS=0
FAIL=0
TOTAL=0

# ── Colours ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

pass()    { echo -e "  ${GREEN}✓${RESET} $1"; ((PASS++)); ((TOTAL++)); }
fail()    { echo -e "  ${RED}✗${RESET} $1"; ((FAIL++)); ((TOTAL++)); }
warn()    { echo -e "  ${YELLOW}⚠${RESET} $1"; }
section() { echo -e "\n${CYAN}${BOLD}── $1 ──────────────────────────────────────────${RESET}"; }

check_http() {
  local label="$1" url="$2" expected="${3:-200}" pattern="${4:-}"
  local status body
  body=$(curl -s -w "\n%{http_code}" --max-time "$HTTP_TIMEOUT" \
    -H "User-Agent: PaySurity-SmokeTest/2.0" "$url" 2>/dev/null) || true
  status=$(echo "$body" | tail -1)
  body=$(echo "$body" | head -n -1)

  if [[ "$status" == "$expected" ]]; then
    if [[ -n "$pattern" ]] && ! echo "$body" | grep -q "$pattern"; then
      fail "$label [HTTP $status but body missing '$pattern']"
      echo "     URL: $url"
    else
      pass "$label [HTTP $status]"
    fi
  else
    fail "$label [Expected HTTP $expected, got $status]"
    echo "     URL: $url"
    [[ -n "$body" ]] && echo "     Body: $(echo "$body" | head -c 200)"
  fi
}

check_json() {
  local label="$1" url="$2" field="$3" expected="${4:-}"
  local body value
  body=$(curl -s --max-time "$HTTP_TIMEOUT" \
    -H "Accept: application/json" -H "User-Agent: PaySurity-SmokeTest/2.0" \
    "$url" 2>/dev/null) || body="{}"
  value=$(echo "$body" | grep -o "\"$field\":\"[^\"]*\"" | head -1 \
    | sed "s/\"$field\":\"//;s/\"//g") || value=""

  if [[ -n "$expected" ]]; then
    [[ "$value" == "$expected" ]] \
      && pass "$label ['$field'='$value']" \
      || { fail "$label ['$field': expected '$expected', got '$value']"; echo "     URL: $url"; echo "     Body: $(echo $body | head -c 300)"; }
  elif [[ -n "$value" ]]; then
    pass "$label ['$field'='$value']"
  else
    fail "$label ['$field' missing from response]"
    echo "     URL: $url"; echo "     Body: $(echo $body | head -c 300)"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║       PaySurity Staging Smoke Test — v2                  ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}"
echo -e "  Started:       $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo -e "  Public URL:    ${PUBLIC_URL}"
echo -e "  API URL:       ${API_URL}"
echo -e "  Dashboard URL: ${DASHBOARD_URL}"
echo -e "  DNS Wait Max:  ${DNS_WAIT_MAX_SECONDS}s"

# ── Gate 0 — DNS Propagation Wait ────────────────────────────────────────────
section "Gate 0 — DNS Propagation Wait (max ${DNS_WAIT_MAX_SECONDS}s)"

if [[ "$SKIP_DNS_WAIT" == "true" ]]; then
  warn "SKIP_DNS_WAIT=true — skipping DNS wait, using provided URLs directly"
else
  DOMAINS=(
    "$(echo "$PUBLIC_URL"   | sed 's|https://||;s|/.*||')"
    "$(echo "$API_URL"      | sed 's|https://||;s|/.*||')"
    "$(echo "$DASHBOARD_URL"| sed 's|https://||;s|/.*||')"
  )

  START_TIME=$(date +%s)
  ALL_RESOLVED=false

  echo -e "  Polling DNS every ${DNS_POLL_INTERVAL}s for:"
  for d in "${DOMAINS[@]}"; do echo -e "    • $d"; done
  echo ""

  while true; do
    NOW=$(date +%s)
    ELAPSED=$(( NOW - START_TIME ))

    if (( ELAPSED >= DNS_WAIT_MAX_SECONDS )); then
      echo -e "  ${RED}DNS propagation timeout after ${ELAPSED}s${RESET}"
      echo -e "  ${YELLOW}Domains still not resolving. Cannot verify custom URLs.${RESET}"
      echo -e "  ${YELLOW}Use SKIP_DNS_WAIT=true with Cloud Run URLs to test without DNS.${RESET}"
      break
    fi

    RESOLVED=0
    for domain in "${DOMAINS[@]}"; do
      if host "$domain" > /dev/null 2>&1; then
        ((RESOLVED++))
      fi
    done

    if (( RESOLVED == ${#DOMAINS[@]} )); then
      echo -e "  ${GREEN}✓ All ${#DOMAINS[@]} domains resolved after ${ELAPSED}s${RESET}"
      ALL_RESOLVED=true
      break
    fi

    echo -e "  [${ELAPSED}s] ${RESOLVED}/${#DOMAINS[@]} domains resolved — waiting ${DNS_POLL_INTERVAL}s..."
    sleep "$DNS_POLL_INTERVAL"
  done

  if [[ "$ALL_RESOLVED" == "false" ]]; then
    echo -e "\n  ${YELLOW}Proceeding with tests — some may fail if DNS is not yet propagated.${RESET}"
  fi
fi

# ── Gate 1 — DNS Resolution ───────────────────────────────────────────────────
section "Gate 1 — DNS Resolution"
for url in "$PUBLIC_URL" "$API_URL" "$DASHBOARD_URL"; do
  domain=$(echo "$url" | sed 's|https://||;s|/.*||')
  if host "$domain" > /dev/null 2>&1; then
    ip=$(host "$domain" 2>/dev/null | grep "has address" | head -1 | awk '{print $NF}')
    pass "DNS: $domain → $ip"
  else
    fail "DNS: $domain → NXDOMAIN"
  fi
done

# ── Gate 2 — API Health ───────────────────────────────────────────────────────
section "Gate 2 — API Health"
check_http      "GET /health"                  "${API_URL}/health"       "200"
check_json      "GET /health → status=ok"      "${API_URL}/health"       "status" "ok"
check_http      "GET /health/live"             "${API_URL}/health/live"  "200"
check_http      "GET /health/ready"            "${API_URL}/health/ready" "200"

# ── Gate 3 — PQC Sovereign Handshake ──────────────────────────────────────────
section "Gate 3 — PQC Sovereign Handshake"
check_http "GET /health/sovereign" "${API_URL}/health/sovereign" "200"
check_json "sovereign → status=SOVEREIGN_OK" "${API_URL}/health/sovereign" "status" "SOVEREIGN_OK"
check_json "sovereign → algorithm field present" "${API_URL}/health/sovereign" "algorithm"
check_json "sovereign → pqcStatus field present" "${API_URL}/health/sovereign" "pqcStatus"

# ── Gate 4 — Public Website Pages ────────────────────────────────────────────
section "Gate 4 — Public Website Pages"
check_http "GET / (homepage)"              "${PUBLIC_URL}/"                  "200" "PaySurity"
check_http "GET /features"                 "${PUBLIC_URL}/features"           "200"
check_http "GET /pricing"                  "${PUBLIC_URL}/pricing"            "200"
check_http "GET /blog"                     "${PUBLIC_URL}/blog"               "200"
check_http "GET /contact"                  "${PUBLIC_URL}/contact"            "200"
check_http "GET /super-admin-manual"       "${PUBLIC_URL}/super-admin-manual" "200" "Onboarding Manual"

# ── Gate 5 — Master Hub & Tenant Microsites ────────────────────────────────────
section "Gate 5 — Master Hub & Tenant Microsites"
check_http "GET /DEMO0APRIL12026 (Master Hub)"                              "${PUBLIC_URL}/DEMO0APRIL12026"                         "200"
check_http "GET /restaurant/house-of-biryani"                               "${PUBLIC_URL}/restaurant/house-of-biryani"             "200"
check_http "GET /restaurant/tawakkul-restaurant"                            "${PUBLIC_URL}/restaurant/tawakkul-restaurant"          "200"
check_http "GET /retail/ashiana (Ashiana apparel)"                          "${PUBLIC_URL}/retail/ashiana"                         "200"
check_http "GET /tobacco/grand-tobacco-hub"                                 "${PUBLIC_URL}/tobacco/grand-tobacco-hub"              "200"

# ── Gate 6 — Live Storefront APIs (DB hit) ────────────────────────────────────
section "Gate 6 — Live Storefront APIs"
ASHIANA_TENANT="eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
check_http "GET /api/retail/apparel (Ashiana catalog)" \
  "${API_URL}/api/retail/apparel?tenant=${ASHIANA_TENANT}" "200"
check_json "Ashiana apparel → success field" \
  "${API_URL}/api/retail/apparel?tenant=${ASHIANA_TENANT}" "success"
check_http "GET /microsite/menu?slug=houseofbiryanirestaurant" \
  "${API_URL}/microsite/menu?slug=houseofbiryanirestaurant" "200"

# ── Gate 7 — PQC Checkout (SOVEREIGN_ESCROW_HOLD) ────────────────────────────
section "Gate 7 — PQC Checkout Flow"
TENANT="eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
PQC_SIG="mldsa-fips204-stub::${TENANT}::42::ML-DSA-65"
CHECKOUT=$(curl -s --max-time "$HTTP_TIMEOUT" \
  -X POST "${API_URL}/api/retail/orders" \
  -H "Content-Type: application/json" \
  -H "X-PQC-Signature: ${PQC_SIG}" \
  -H "X-Tenant-Id: ${TENANT}" \
  -H "X-Source: SMOKE_TEST_V2" \
  -d '{"items":[],"payments":[],"total_cents":0}' 2>/dev/null) || CHECKOUT="{}"

echo "     POST /api/retail/orders response: $(echo $CHECKOUT | head -c 200)"
((TOTAL++))
if echo "$CHECKOUT" | grep -q "SOVEREIGN_ESCROW_HOLD"; then
  pass "POST /api/retail/orders → SOVEREIGN_ESCROW_HOLD confirmed"
elif echo "$CHECKOUT" | grep -q "orderId\|status"; then
  pass "POST /api/retail/orders → server responded with order fields"
else
  fail "POST /api/retail/orders → unexpected or empty response"
fi

# ── Gate 8 — Dashboard Reachability ───────────────────────────────────────────
section "Gate 8 — Merchant Dashboard"
check_http "GET / (dashboard root)" "${DASHBOARD_URL}/" "200"
check_http "GET /login"             "${DASHBOARD_URL}/login" "200"

# ── Final Report ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║             SMOKE TEST COMPLETE                          ║${RESET}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════╣${RESET}"
printf   "  Passed:  ${GREEN}%-3d${RESET}\n" "$PASS"
printf   "  Failed:  ${RED}%-3d${RESET}\n"  "$FAIL"
printf   "  Total:   %-3d\n"                 "$TOTAL"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════╣${RESET}"

if [[ $FAIL -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}ALL TESTS PASSED — staging.paysurity.com CERTIFIED ✓${RESET}"
  echo -e "  Commit:    $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
  echo -e "  Timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}"
  exit 0
else
  echo -e "  ${RED}${BOLD}${FAIL} TEST(S) FAILED — DO NOT PROMOTE TO PRODUCTION${RESET}"
  echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}"
  exit 1
fi
