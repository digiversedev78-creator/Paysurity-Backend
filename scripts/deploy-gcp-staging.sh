#!/bin/bash
set -e

# Configuration Variables
PROJECT_ID="paysurity-staging-12345"
REGION="us-central1"
INSTANCE_CONNECTION_NAME="$PROJECT_ID:$REGION:paysurity-db-instance"
REPO="paysurity-repo"
COMMIT_SHA=${1:-latest}

echo "=========================================================="
echo "🚀 Initiating GCP Cloud Run Deployments for PaySurity..."
echo "=========================================================="

# ─── 1. Deploy NestJS API ───────────────────────────────────────
echo "Deploying @paysurity/api to Cloud Run..."
gcloud run deploy api-staging \
  --image="us-central1-docker.pkg.dev/$PROJECT_ID/$REPO/api:$COMMIT_SHA" \
  --region="$REGION" \
  --platform="managed" \
  --allow-unauthenticated \
  --add-cloudsql-instances="$INSTANCE_CONNECTION_NAME" \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="DATABASE_URL=postgresql://paysurity:YOUR_DB_PASSWORD@localhost:5432/paysurity_staging?host=/cloudsql/$INSTANCE_CONNECTION_NAME" \
  --set-env-vars="JWT_SECRET=STAGING_JWT_SECURE_KEY" \
  --set-env-vars="PORT=4000" \
  --port="4000"

# ─── 2. Deploy Admin Portal ─────────────────────────────────────
echo "Deploying @paysurity/admin-portal to Cloud Run..."
gcloud run deploy admin-portal-staging \
  --image="us-central1-docker.pkg.dev/$PROJECT_ID/$REPO/admin-portal:$COMMIT_SHA" \
  --region="$REGION" \
  --platform="managed" \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_ENV=staging" \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://api-staging-xxxxxxx-uc.a.run.app" \
  --set-env-vars="PORT=4004" \
  --port="4004"

# ─── 3. Deploy Public Website (Investor Launchpad) ──────────────
echo "Deploying @paysurity/web to Cloud Run..."
# Because the Investor Launchpad directly queries the Postgres DB via Server Components,
# we also attach the Cloud SQL instance here.
gcloud run deploy public-website-staging \
  --image="us-central1-docker.pkg.dev/$PROJECT_ID/$REPO/public-website:$COMMIT_SHA" \
  --region="$REGION" \
  --platform="managed" \
  --allow-unauthenticated \
  --add-cloudsql-instances="$INSTANCE_CONNECTION_NAME" \
  --set-env-vars="DATABASE_URL=postgresql://paysurity:YOUR_DB_PASSWORD@localhost:5432/paysurity_staging?host=/cloudsql/$INSTANCE_CONNECTION_NAME" \
  --set-env-vars="NEXT_PUBLIC_ENV=staging" \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://api-staging-xxxxxxx-uc.a.run.app" \
  --set-env-vars="PORT=4003" \
  --port="4003"

# ─── 4. Deploy Merchant Dashboard ───────────────────────────────
echo "Deploying @paysurity/merchant-dashboard to Cloud Run..."
gcloud run deploy merchant-dashboard-staging \
  --image="us-central1-docker.pkg.dev/$PROJECT_ID/$REPO/merchant-dashboard:$COMMIT_SHA" \
  --region="$REGION" \
  --platform="managed" \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_ENV=staging" \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://api-staging-xxxxxxx-uc.a.run.app" \
  --set-env-vars="PORT=4001" \
  --port="4001"

echo "=========================================================="
echo "✅ All PaySurity services successfully deployed to Cloud Run!"
echo "=========================================================="
