$ErrorActionPreference = "Continue"

$PROJECT_ID = "paysurity-platform-2026"
$REGION = "us-central1"
$REPO_NAME = "paysurity-swarm-repo"
$IMAGE_NAME = "us-central1-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/swarm-orchestrator:latest"
$SERVICE_ACCOUNT = "paysurity-swarm-worker@$PROJECT_ID.iam.gserviceaccount.com"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   PaySurity LangGraph Swarm Migration Protocol  " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Ensuring Artifact Registry Repository exists..." -ForegroundColor Yellow
$repoExists = gcloud artifacts repositories describe $REPO_NAME --location=$REGION --project=$PROJECT_ID 2>&1
if ($repoExists -match "NOT_FOUND" -or $repoExists -match "not found") {
    Write-Host "Creating Artifact Registry repository '$REPO_NAME'..."
    gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="Docker repository for LangGraph Swarm instances" --project=$PROJECT_ID
} else {
    Write-Host "Repository '$REPO_NAME' already exists." -ForegroundColor Green
}

Write-Host "`n[2/3] Offloading Docker Build to Google Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --project=$PROJECT_ID --config="cloudbuild-swarm.yaml" --machine-type=e2-highcpu-8 .

Write-Host "`n[3/3] Deploying Autonomous Swarm Orchestrator to Cloud Run Jobs..." -ForegroundColor Yellow
gcloud run jobs deploy paysurity-langgraph-orchestrator `
    --image=$IMAGE_NAME `
    --region=$REGION `
    --project=$PROJECT_ID `
    --max-retries=3 `
    --task-timeout=3600s `
    --memory=4096Mi `
    --cpu=2 `
    --service-account=$SERVICE_ACCOUNT `
    --set-secrets="GITHUB_PAT=GITHUB_PAT_SWARM:latest,GEMINI_API_KEY=gemini-api-key:latest"

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "   Swarm Orchestrator Successfully Migrated!     " -ForegroundColor Cyan
Write-Host "   To execute the swarm autonomously, run:       "
Write-Host "   gcloud run jobs execute paysurity-langgraph-orchestrator --region us-central1" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
