$ErrorActionPreference = "Continue"

$PROJECT_ID = "paysurity-platform-2026"
$REGION = "us-central1"
$REPO_NAME = "paysurity-ui-repo"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   PaySurity UI Production Deployment Protocol   " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Ensuring Artifact Registry Repository exists..." -ForegroundColor Yellow
$repoExists = gcloud artifacts repositories describe $REPO_NAME --location=$REGION --project=$PROJECT_ID 2>&1
if ($repoExists -match "NOT_FOUND" -or $repoExists -match "not found") {
    Write-Host "Creating Artifact Registry repository '$REPO_NAME'..."
    gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="Docker repository for PaySurity UI"
} else {
    Write-Host "Repository '$REPO_NAME' already exists." -ForegroundColor Green
}

Write-Host "`n[2/2] Triggering Cloud Build Deployment (Build & Deploy Dashboard)..." -ForegroundColor Yellow
gcloud builds submit --project=$PROJECT_ID --config="cloudbuild-ui.yaml" --machine-type=e2-highcpu-8 .

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "   PaySurity UI Deployment Complete!       " -ForegroundColor Cyan
Write-Host "   Fetch your URLs using:                        "
Write-Host "   gcloud run services describe paysurity-admin-portal --platform managed --region us-central1 --format='value(status.url)'" -ForegroundColor Green
Write-Host "   gcloud run services describe paysurity-merchant-dashboard --platform managed --region us-central1 --format='value(status.url)'" -ForegroundColor Green
Write-Host "   gcloud run services describe paysurity-public-website --platform managed --region us-central1 --format='value(status.url)'" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
