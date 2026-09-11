#!/bin/bash
set -e

echo "================================================="
echo "   PaySurity GCP Automated Deployment Pipeline   "
echo "================================================="

# Retrieve the active GCP Project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "Error: No active GCP project set. Run 'gcloud config set project YOUR_PROJECT_ID'."
  exit 1
fi
echo "Target Project Set To: $PROJECT_ID"

# ---------------------------------------------------------
echo "--- Phase 1: Provisioning Cloud SQL Database ---"
if ! gcloud sql instances describe paysurity-prod-db-1 > /dev/null 2>&1; then
  echo "Creating Postgres 15 Cluster (paysurity-prod-db-1)..."
  gcloud sql instances create paysurity-prod-db-1 \
    --database-version=POSTGRES_15 \
    --cpu=2 \
    --memory=7680MB \
    --region=us-central1 \
    --network=default \
    --no-assign-ip \
    --enable-bin-log \
    --backup-start-time="06:00"
  
  echo "Initializing Database & Service User..."
  gcloud sql databases create paysurity_prod --instance=paysurity-prod-db-1
  gcloud sql users create paysurity_app --instance=paysurity-prod-db-1 --password="SECURE_PASSWORD_CHANGE_ME"
else
  echo "Cloud SQL instance paysurity-prod-db-1 already exists. Skipping creation."
fi

# ---------------------------------------------------------
echo "--- Phase 2: Configuring Artifact Registry ---"
if ! gcloud artifacts repositories describe paysurity-api-repo --location=us-central1 > /dev/null 2>&1; then
  echo "Creating paysurity-api-repo..."
  gcloud artifacts repositories create paysurity-api-repo --repository-format=docker --location=us-central1 --description="PaySurity Core API"
fi

if ! gcloud artifacts repositories describe paysurity-dashboard-repo --location=us-central1 > /dev/null 2>&1; then
  echo "Creating paysurity-dashboard-repo..."
  gcloud artifacts repositories create paysurity-dashboard-repo --repository-format=docker --location=us-central1 --description="PaySurity Dashboard"
fi

if ! gcloud artifacts repositories describe paysurity-public-repo --location=us-central1 > /dev/null 2>&1; then
  echo "Creating paysurity-public-repo..."
  gcloud artifacts repositories create paysurity-public-repo --repository-format=docker --location=us-central1 --description="PaySurity Public Website"
fi

# ---------------------------------------------------------
echo "--- Phase 3: Building and Pushing Docker Images ---"
echo "Authenticating local Docker to GCP Artifact Registry..."
gcloud auth configure-docker us-central1-docker.pkg.dev --quiet

echo "Building API Container..."
docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-api-repo/paysurity-api:prod-v1 -f apps/api/Dockerfile .
echo "Pushing API Container..."
docker push us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-api-repo/paysurity-api:prod-v1

echo "Building Dashboard Container..."
docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-dashboard-repo/paysurity-dashboard:prod-v1 -f Dockerfile.dashboard .
echo "Pushing Dashboard Container..."
docker push us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-dashboard-repo/paysurity-dashboard:prod-v1

echo "Building Public Website Container..."
docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-public-repo/paysurity-public:prod-v1 -f Dockerfile.public-website .
echo "Pushing Public Website Container..."
docker push us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-public-repo/paysurity-public:prod-v1

# ---------------------------------------------------------
echo "--- Phase 4: Deploying to Cloud Run ---"
echo "Deploying the PaySurity Core API..."
gcloud run deploy paysurity-api \
  --image=us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-api-repo/paysurity-api:prod-v1 \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=8080 \
  --vpc-connector=projects/$PROJECT_ID/locations/us-central1/connectors/default-vpc-connector \
  --set-env-vars="NODE_ENV=production,ALLOWED_ORIGINS=https://dashboard.paysurity.com,PCI_STRICT_MODE=true" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest"

echo "Deploying the Next.js Merchant Dashboard..."
gcloud run deploy paysurity-dashboard \
  --image=us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-dashboard-repo/paysurity-dashboard:prod-v1 \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=3000 \
  --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_API_URL=https://[YOUR_CLOUDRUN_API_URL_HERE]"

echo "Deploying the PaySurity Public Website..."
gcloud run deploy paysurity-public \
  --image=us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-public-repo/paysurity-public:prod-v1 \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_API_URL=https://[YOUR_CLOUDRUN_API_URL_HERE]"

echo "================================================="
echo "   Pipeline Execution Complete!                  "
echo "================================================="
