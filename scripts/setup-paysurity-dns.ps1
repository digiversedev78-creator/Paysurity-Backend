##############################################################
#  PaySurity.com - GCP Cloud DNS Setup
#  Account: americaneaglelogsvc@gmail.com
#  Project: paysurity-platform-2026
#  Run: powershell -ExecutionPolicy Bypass -File scripts\setup-paysurity-dns.ps1
##############################################################

$PROJECT = "paysurity-platform-2026"
$DOMAIN  = "paysurity.com"
$ZONE    = "paysurity-com"

Write-Host "=== PaySurity.com Cloud DNS Setup ===" -ForegroundColor Cyan

# STEP 1: Authenticate
Write-Host "[1/6] Authenticating..." -ForegroundColor Yellow
gcloud auth login --account=americaneaglelogsvc@gmail.com
gcloud config set project $PROJECT
gcloud config set account americaneaglelogsvc@gmail.com
Write-Host "  Account: $(gcloud config get-value account 2>&1)"
Write-Host "  Project: $(gcloud config get-value project 2>&1)"

# STEP 2: Enable API
Write-Host "[2/6] Enabling Cloud DNS API..." -ForegroundColor Yellow
gcloud services enable dns.googleapis.com --project=$PROJECT

# STEP 3: Create zone if needed
Write-Host "[3/6] Checking managed zone..." -ForegroundColor Yellow
gcloud dns managed-zones describe $ZONE --project=$PROJECT 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Creating zone $ZONE..."
    gcloud dns managed-zones create $ZONE `
        --dns-name="$DOMAIN." `
        --description="PaySurity.com primary zone" `
        --project=$PROJECT `
        --dnssec-state=on
    Write-Host "  Zone created with DNSSEC on"
} else {
    Write-Host "  Zone already exists"
}

# STEP 4: Reserve static IP
Write-Host "[4/6] Checking static IP..." -ForegroundColor Yellow
gcloud compute addresses describe paysurity-lb-ip --global --project=$PROJECT 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Creating global static IP..."
    gcloud compute addresses create paysurity-lb-ip --global --project=$PROJECT
}
$LB_IP = gcloud compute addresses describe paysurity-lb-ip --global --project=$PROJECT --format="value(address)" 2>&1
Write-Host "  Load Balancer IP: $LB_IP"

# STEP 5: Add DNS Records
Write-Host "[5/6] Adding DNS records..." -ForegroundColor Yellow

function Set-DnsRecord {
    param($Name, $Type, $TTL, [string[]]$Data)
    Write-Host "  $Type $Name ..." -NoNewline
    gcloud dns record-sets describe $Name --type=$Type --zone=$ZONE --project=$PROJECT 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " exists, updating..." -NoNewline
        gcloud dns record-sets update $Name `
            --type=$Type --ttl=$TTL `
            --rrdatas=($Data -join ",") `
            --zone=$ZONE --project=$PROJECT 2>&1 | Out-Null
    } else {
        gcloud dns record-sets create $Name `
            --type=$Type --ttl=$TTL `
            --rrdatas=($Data -join ",") `
            --zone=$ZONE --project=$PROJECT 2>&1 | Out-Null
    }
    if ($LASTEXITCODE -eq 0) { Write-Host " OK" -ForegroundColor Green }
    else { Write-Host " FAILED" -ForegroundColor Red }
}

# A Records
Set-DnsRecord -Name "$DOMAIN."        -Type "A" -TTL 300 -Data @($LB_IP)
Set-DnsRecord -Name "www.$DOMAIN."    -Type "A" -TTL 300 -Data @($LB_IP)
Set-DnsRecord -Name "api.$DOMAIN."    -Type "A" -TTL 300 -Data @($LB_IP)
Set-DnsRecord -Name "dash.$DOMAIN."   -Type "A" -TTL 300 -Data @($LB_IP)
Set-DnsRecord -Name "portal.$DOMAIN." -Type "A" -TTL 300 -Data @($LB_IP)

# MX Records - Google Workspace
Set-DnsRecord -Name "$DOMAIN." -Type "MX" -TTL 3600 -Data @(
    "1 aspmx.l.google.com.",
    "5 alt1.aspmx.l.google.com.",
    "5 alt2.aspmx.l.google.com.",
    "10 alt3.aspmx.l.google.com.",
    "10 alt4.aspmx.l.google.com."
)

# SPF TXT
Set-DnsRecord -Name "$DOMAIN." -Type "TXT" -TTL 3600 -Data @(
    "`"v=spf1 include:_spf.google.com include:sendgrid.net ~all`""
)

# DMARC TXT
Set-DnsRecord -Name "_dmarc.$DOMAIN." -Type "TXT" -TTL 3600 -Data @(
    "`"v=DMARC1; p=quarantine; rua=mailto:dmarc@paysurity.com; pct=100`""
)

# CAA - only Google and Let's Encrypt can issue certs
Set-DnsRecord -Name "$DOMAIN." -Type "CAA" -TTL 3600 -Data @(
    "0 issue `"pki.goog`"",
    "0 issue `"letsencrypt.org`""
)

# STEP 6: Print nameservers
Write-Host ""
Write-Host "[6/6] === YOUR CLOUD DNS NAMESERVERS ===" -ForegroundColor Cyan
Write-Host "(GoDaddy already shows these - that is why it said redundant)" -ForegroundColor Green
Write-Host ""
gcloud dns managed-zones describe $ZONE --project=$PROJECT --format="value(nameServers)"
Write-Host ""
Write-Host "=== DNS RECORDS SUMMARY ===" -ForegroundColor Cyan
Write-Host "  A     paysurity.com          -> $LB_IP"
Write-Host "  A     www.paysurity.com      -> $LB_IP"
Write-Host "  A     api.paysurity.com      -> $LB_IP"
Write-Host "  A     dash.paysurity.com     -> $LB_IP"
Write-Host "  A     portal.paysurity.com   -> $LB_IP"
Write-Host "  MX    paysurity.com          -> Google Workspace (5 servers)"
Write-Host "  TXT   paysurity.com          -> SPF (Google + SendGrid)"
Write-Host "  TXT   _dmarc.paysurity.com   -> DMARC quarantine"
Write-Host "  CAA   paysurity.com          -> pki.goog + letsencrypt.org"
Write-Host "  DNSSEC: ENABLED"
Write-Host ""
Write-Host "=== NEXT STEPS ===" -ForegroundColor Yellow
Write-Host "1. GoDaddy 'redundant' = your domain already uses Google DNS = you are all set!"
Write-Host "2. Point the Load Balancer backend to your Cloud Run API service:"
Write-Host "   gcloud run services describe paysurity-api --region=us-central1 --project=$PROJECT"
Write-Host "3. Create SSL cert:"
Write-Host "   gcloud compute ssl-certificates create paysurity-ssl \"
Write-Host "     --domains=paysurity.com,www.paysurity.com,api.paysurity.com \"
Write-Host "     --global --project=$PROJECT"
Write-Host ""
Write-Host "=== SETUP COMPLETE ===" -ForegroundColor Green
