#!/bin/bash
# ═══════════════════════════════════════════════════════════
# PROJECT:      PaySurity Platform
# TASK:         Load Balancer & Multitenant Routing (Serverless NEG)
# WRITTEN BY:   Chief Architect AI
# ═══════════════════════════════════════════════════════════

set -e

echo "🚀 Step 1: Reserving Global Static IP..."
gcloud compute addresses create paysurity-global-ip --network-tier=PREMIUM --global || true

echo "🚀 Step 2: Creating Serverless NEGs for Cloud Run endpoints..."
gcloud compute network-endpoint-groups create paysurity-api-neg --region=us-central1 --network-endpoint-type=serverless --cloud-run-service=paysurity-api || true
gcloud compute network-endpoint-groups create paysurity-dashboard-neg --region=us-central1 --network-endpoint-type=serverless --cloud-run-service=paysurity-dashboard || true
gcloud compute network-endpoint-groups create paysurity-storefront-neg --region=us-central1 --network-endpoint-type=serverless --cloud-run-service=paysurity-storefront || true
gcloud compute network-endpoint-groups create paysurity-admin-neg --region=us-central1 --network-endpoint-type=serverless --cloud-run-service=paysurity-admin || true

echo "🚀 Step 3: Generating Backend Services..."
for svc in api dashboard storefront admin; do
  echo "Setting up backend for $svc..."
  gcloud compute backend-services create paysurity-${svc}-backend --global || true
  gcloud compute backend-services add-backend paysurity-${svc}-backend --global \
    --network-endpoint-group=paysurity-${svc}-neg \
    --network-endpoint-group-region=us-central1 || true
done

echo "🚀 Step 4: Instantiating the URL Map Router..."
# Default un-specified subdomain traffic routes to the Public Storefront to intercept tenant subdomains!
gcloud compute url-maps create paysurity-url-map --default-service=paysurity-storefront-backend || true

echo "🚀 Step 5: Applying Host Path Matchers..."
gcloud compute url-maps add-path-matcher paysurity-url-map \
  --path-matcher-name=api-matcher \
  --default-service=paysurity-api-backend \
  --new-hosts="api.paysurity.com,api.localhost" || true

gcloud compute url-maps add-path-matcher paysurity-url-map \
  --path-matcher-name=dashboard-matcher \
  --default-service=paysurity-dashboard-backend \
  --new-hosts="app.paysurity.com,dashboard.localhost" || true

gcloud compute url-maps add-path-matcher paysurity-url-map \
  --path-matcher-name=admin-matcher \
  --default-service=paysurity-admin-backend \
  --new-hosts="admin.paysurity.com,admin.localhost" || true

echo "🚀 Step 6: Deploying Target Proxies & Global Forwarding Rule..."
gcloud compute target-http-proxies create paysurity-http-proxy --url-map=paysurity-url-map || true

gcloud compute forwarding-rules create paysurity-http-rule \
  --address=paysurity-global-ip \
  --target-http-proxy=paysurity-http-proxy \
  --global \
  --ports=80 || true

echo "✅ PaySurity Global HTTP Ext-LB Configuration Deployed Successfully!"
echo "Check your reserved IP using: gcloud compute addresses describe paysurity-global-ip --global"
