# GCP Launch Playbook: PaySurity Production Infrastructure

This playbook details the step-by-step commands required to provision, configure, and deploy the hardened PaySurity containers to Google Cloud Platform. This procedure assumes you have authenticated to the `gcloud` CLI and set your target project.

## Prerequisites

Ensure you are authenticated and your project is set:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
```

---

## 1. Provision the Production Database (Cloud SQL)

Provision a hardened PostgreSQL instance with private IP routing to ensure it is isolated from the public internet.

### Step 1.1: Create the Cloud SQL Instance (PostgreSQL 15)
```bash
gcloud sql instances create paysurity-prod-db-1 \
  --database-version=POSTGRES_15 \
  --cpu=2 \
  --memory=7680MB \
  --region=us-central1 \
  --network=default \
  --no-assign-ip \
  --enable-bin-log \
  --backup-start-time="06:00"
```

### Step 1.2: Initialize the Database and User
```bash
# Create the production database
gcloud sql databases create paysurity_prod --instance=paysurity-prod-db-1

# Create the application service user and generate a secure password
gcloud sql users create paysurity_app \
  --instance=paysurity-prod-db-1 \
  --password="[GENERATE_A_SECURE_RANDOM_PASSWORD]"
```

*Note: Extract the internal connection string `postgres://paysurity_app:[PASSWORD]@[PRIVATE_IP]:5432/paysurity_prod` for Secret Manager.*

---

## 2. Configure Artifact Registry

Create the Docker repositories to hold our optimized, multi-stage production container images.

### Step 2.1: Create Repositories
```bash
# API Repository
gcloud artifacts repositories create paysurity-api-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="PaySurity Core API Repository"

# Dashboard Repository
gcloud artifacts repositories create paysurity-dashboard-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="PaySurity Merchant Dashboard Repository"
```

### Step 2.2: Build and Push the Hardened Containers
Run these commands from the repository root:

```bash
# Configure docker auth
gcloud auth configure-docker us-central1-docker.pkg.dev

# API Build & Push
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/paysurity-api-repo/paysurity-api:prod-v1 -f apps/api/Dockerfile .
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/paysurity-api-repo/paysurity-api:prod-v1

# Dashboard Build & Push
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/paysurity-dashboard-repo/paysurity-dashboard:prod-v1 -f Dockerfile.dashboard .
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/paysurity-dashboard-repo/paysurity-dashboard:prod-v1
```

---

## 3. Secret Management

Instead of using plaintext environment variables, we map our `production.env.example` secrets directly into GCP Secret Manager.

### Step 3.1: Create Secrets
```bash
# Database URL
printf "postgres://paysurity_app:[PASSWORD]@[PRIVATE_IP]:5432/paysurity_prod" | \
gcloud secrets create DATABASE_URL --data-file=-

# JWT Secret
printf "[YOUR_CRYPTO_SECURE_JWT_SECRET]" | \
gcloud secrets create JWT_SECRET --data-file=-

# External Services
printf "[YOUR_STRIPE_SECRET_KEY]" | \
gcloud secrets create STRIPE_SECRET_KEY --data-file=-
```
*Note: Ensure the Cloud Run default service account has the `Secret Manager Secret Accessor` IAM role.*

---

## 4. Deploy to Cloud Run

Deploy the API and Dashboard, attaching them to the VPC connector (to access the private database) and mapping the required secrets locally.

### Step 4.1: Deploy the NestJS Core API
```bash
gcloud run deploy paysurity-api \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/paysurity-api-repo/paysurity-api:prod-v1 \
  --region=us-central1 \
  --allow-unauthenticated \
  --min-instances=1 \
  --max-instances=10 \
  --port=8080 \
  --vpc-connector=projects/YOUR_PROJECT_ID/locations/us-central1/connectors/default-vpc-connector \
  --set-env-vars="NODE_ENV=production,ALLOWED_ORIGINS=https://dashboard.paysurity.com,PCI_STRICT_MODE=true" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest"
```

### Step 4.2: Deploy the Next.js Merchant Dashboard
```bash
gcloud run deploy paysurity-dashboard \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/paysurity-dashboard-repo/paysurity-dashboard:prod-v1 \
  --region=us-central1 \
  --allow-unauthenticated \
  --min-instances=1 \
  --max-instances=10 \
  --port=3000 \
  --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_API_URL=https://[YOUR_CLOUDRUN_API_URL]"
```

---

## 5. Post-Deployment Verification

1. Verify the global `ThrottlerGuard` is intercepting high-velocity traffic by simulating rapid requests toward the API public endpoints. 
2. Trigger an unauthenticated WebSocket connection to the KDS Gateway; confirm an immediate rejection.
3. Validate database reads/writes reflect seamlessly across the environment with strict Tenant Isolation enabled via RLS mappings in PostgreSQL.
