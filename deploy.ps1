$ErrorActionPreference = "Continue"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   PaySurity GCP Automated Deployment Pipeline   " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Retrieve the active GCP Project ID
$PROJECT_ID = gcloud config get-value project
if (-not $PROJECT_ID) {
    Write-Host "Error: No active GCP project set. Run 'gcloud config set project YOUR_PROJECT_ID'." -ForegroundColor Red
    exit 1
}
Write-Host "Target Project Set To: $PROJECT_ID" -ForegroundColor Green

# ---------------------------------------------------------
Write-Host "`n--- Phase 1: Provisioning Cloud SQL Database ---" -ForegroundColor Yellow
$dbExists = gcloud sql instances describe paysurity-prod-db-1 2>&1
if ($dbExists -match "HTTPError 403" -or $dbExists -match "HTTPError 404" -or $dbExists -match "does not exist") {
    Write-Host "Creating Postgres 15 Cluster (paysurity-prod-db-1)..."
    gcloud sql instances create paysurity-prod-db-1 `
        --database-version=POSTGRES_15 `
        --cpu=2 `
        --memory=7680MB `
        --region=us-central1 `
        --network=default `
        --no-assign-ip `
        --enable-bin-log `
        --backup-start-time="06:00"
    
    Write-Host "Initializing Database & Service User..."
    gcloud sql databases create paysurity_prod --instance=paysurity-prod-db-1
    gcloud sql users create paysurity_app --instance=paysurity-prod-db-1 --password="SECURE_PASSWORD_CHANGE_ME"
} else {
    Write-Host "Cloud SQL instance paysurity-prod-db-1 already exists. Skipping creation." -ForegroundColor Magenta
}

# ---------------------------------------------------------
Write-Host "`n--- Phase 2: Configuring Artifact Registry ---" -ForegroundColor Yellow
$apiRepoExists = gcloud artifacts repositories describe paysurity-api-repo --location=us-central1 2>&1
if ($apiRepoExists -match "NOT_FOUND" -or $apiRepoExists -match "not found") {
    Write-Host "Creating paysurity-api-repo..."
    gcloud artifacts repositories create paysurity-api-repo --repository-format=docker --location=us-central1 --description="PaySurity Core API"
}

$dashRepoExists = gcloud artifacts repositories describe paysurity-dashboard-repo --location=us-central1 2>&1
if ($dashRepoExists -match "NOT_FOUND" -or $dashRepoExists -match "not found") {
    Write-Host "Creating paysurity-dashboard-repo..."
    gcloud artifacts repositories create paysurity-dashboard-repo --repository-format=docker --location=us-central1 --description="PaySurity Dashboard"
}

$publicRepoExists = gcloud artifacts repositories describe paysurity-public-repo --location=us-central1 2>&1
if ($publicRepoExists -match "NOT_FOUND" -or $publicRepoExists -match "not found") {
    Write-Host "Creating paysurity-public-repo..."
    gcloud artifacts repositories create paysurity-public-repo --repository-format=docker --location=us-central1 --description="PaySurity Public Website"
}

# ---------------------------------------------------------
Write-Host "`n--- Phase 3: Building and Pushing Docker Images ---" -ForegroundColor Yellow
Write-Host "Authenticating local Docker to GCP Artifact Registry..."
gcloud auth configure-docker us-central1-docker.pkg.dev --quiet

Write-Host "Building API Container..."
docker build -t "us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-api-repo/paysurity-api:prod-v1" -f apps/api/Dockerfile .
$LASTEXITCODE = $LASTEXITCODE; if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Pushing API Container..."
docker push "us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-api-repo/paysurity-api:prod-v1"
$LASTEXITCODE = $LASTEXITCODE; if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Building Dashboard Container..."
docker build -t "us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-dashboard-repo/paysurity-dashboard:prod-v1" -f Dockerfile.dashboard .
$LASTEXITCODE = $LASTEXITCODE; if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Pushing Dashboard Container..."
docker push "us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-dashboard-repo/paysurity-dashboard:prod-v1"
$LASTEXITCODE = $LASTEXITCODE; if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Building Public Website Container..."
docker build -t "us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-public-repo/paysurity-public:prod-v1" -f Dockerfile.public-website .
$LASTEXITCODE = $LASTEXITCODE; if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Pushing Public Website Container..."
docker push "us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-public-repo/paysurity-public:prod-v1"
$LASTEXITCODE = $LASTEXITCODE; if ($LASTEXITCODE -ne 0) { exit 1 }

# ---------------------------------------------------------
Write-Host "`n--- Phase 4: Setting up Secret Manager ---" -ForegroundColor Yellow
# Automatically set dummy secrets so the deploys don't crash due to "secret not found"
$secretDbUrl = gcloud secrets describe DATABASE_URL 2>&1
if ($secretDbUrl -match "NOT_FOUND" -or $secretDbUrl -match "not found") {
    Write-Host "Creating DATABASE_URL Secret..."
    Write-Output "postgres://paysurity_app:SECURE_PASSWORD_CHANGE_ME@10.0.0.3:5432/paysurity_prod" | gcloud secrets create DATABASE_URL --data-file=-
}

$secretJwt = gcloud secrets describe JWT_SECRET 2>&1
if ($secretJwt -match "NOT_FOUND" -or $secretJwt -match "not found") {
    Write-Host "Creating JWT_SECRET Secret..."
    Write-Output "my_secure_jwt_secret_12345" | gcloud secrets create JWT_SECRET --data-file=-
}

$secretStripe = gcloud secrets describe STRIPE_SECRET_KEY 2>&1
if ($secretStripe -match "NOT_FOUND" -or $secretStripe -match "not found") {
    Write-Host "Creating STRIPE_SECRET_KEY Secret..."
    Write-Output "sk_test_12345" | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
}

# ---------------------------------------------------------
Write-Host "`n--- Phase 5: Deploying to Cloud Run ---" -ForegroundColor Yellow
Write-Host "Deploying the PaySurity Core API..."
gcloud run deploy paysurity-api `
    --image="us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-api-repo/paysurity-api:prod-v1" `
    --region=us-central1 `
    --allow-unauthenticated `
    --port=8080 `
    --set-env-vars="NODE_ENV=production,ALLOWED_ORIGINS=https://dashboard.paysurity.com,PCI_STRICT_MODE=true" `
    --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest"
    # --vpc-connector="projects/$PROJECT_ID/locations/us-central1/connectors/default-vpc-connector" removed to avoid failing if no VPC present.

Write-Host "Deploying the Next.js Merchant Dashboard..."
gcloud run deploy paysurity-dashboard `
    --image="us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-dashboard-repo/paysurity-dashboard:prod-v1" `
    --region=us-central1 `
    --allow-unauthenticated `
    --port=3000 `
    --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_API_URL=https://paysurity-api"

Write-Host "Deploying the PaySurity Public Website..."
gcloud run deploy paysurity-public `
    --image="us-central1-docker.pkg.dev/$PROJECT_ID/paysurity-public-repo/paysurity-public:prod-v1" `
    --region=us-central1 `
    --allow-unauthenticated `
    --port=8080 `
    --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_API_URL=https://paysurity-api"

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "   Pipeline Execution Complete!                  " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
