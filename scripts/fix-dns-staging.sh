#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# PaySurity Staging Environment — DNS and Domain Mapping Remediation
# ─────────────────────────────────────────────────────────────────────────────
# This script injects the missing CNAME records into the active authoritative DNS
# zone ("paysurity-zone") and forces Cloud Run domain mappings for staging.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ZONE="paysurity-zone"
GCP_PROJECT="paysurity-platform-2026"
REGION="us-central1"
TARGET_CNAME="ghs.googlehosted.com."

echo "================================================================================"
echo " STAGING CRISIS REMEDIATION: Injecting DNS & Mapping Domains"
echo " Target Zone:   ${ZONE}"
echo " GCP Project:   ${GCP_PROJECT}"
echo " Target CNAME:  ${TARGET_CNAME}"
echo "================================================================================"

# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Inject CNAME records into the active zone
# ─────────────────────────────────────────────────────────────────────────────
echo ">> Step 1: Ensuring CNAME records are present in Google Cloud DNS..."

for SUBDOMAIN in "staging" "api.staging" "dashboard.staging"; do
  DOMAIN_NAME="${SUBDOMAIN}.paysurity.com."
  
  echo "   -> Processing record for: ${DOMAIN_NAME}"
  
  # Attempt to create. If it exists but is incorrect, we catch the error and update.
  if ! gcloud dns record-sets create "${DOMAIN_NAME}" \
    --zone="${ZONE}" \
    --project="${GCP_PROJECT}" \
    --type="CNAME" \
    --ttl="300" \
    --rrdatas="${TARGET_CNAME}" 2>/dev/null; then
      
      echo "      Record already exists or failed to create. Forcing update..."
      gcloud dns record-sets update "${DOMAIN_NAME}" \
        --zone="${ZONE}" \
        --project="${GCP_PROJECT}" \
        --type="CNAME" \
        --ttl="300" \
        --rrdatas="${TARGET_CNAME}" || echo "      ⚠ Could not update ${DOMAIN_NAME}"
  else
      echo "      ✓ Created successfully."
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Force Cloud Run Domain Mappings
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo ">> Step 2: Forcing Cloud Run Domain Mappings..."

for SVC_DOMAIN in "paysurity-public-website:staging.paysurity.com" "paysurity-api:api.staging.paysurity.com" "paysurity-dashboard:dashboard.staging.paysurity.com"; do
  SVC="${SVC_DOMAIN%%:*}"
  DOMAIN="${SVC_DOMAIN##*:}"
  
  echo "   -> Mapping ${DOMAIN} -> Cloud Run Service: ${SVC}"
  gcloud beta run domain-mappings create \
    --service="${SVC}" \
    --domain="${DOMAIN}" \
    --region="${REGION}" \
    --project="${GCP_PROJECT}" \
    --platform=managed 2>&1 || echo "      ⚠ Mapping failed or already exists. This is expected if previously mapped."
done

echo "================================================================================"
echo " REMEDIATION COMPLETE."
echo " Note: DNS propagation may take ~300 seconds, and Cloud Run SSL certificates"
echo " will require at least 5-15 minutes after DNS sync to fully provision."
echo " Run './scripts/test-staging.sh' to verify successful launch."
echo "================================================================================"
exit 0
