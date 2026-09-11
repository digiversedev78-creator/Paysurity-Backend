param(
  [Parameter(Mandatory=$false)]
  [string]$dkimContent = ""
)

$project = "paysurity-platform-2026"
$zone = "paysurity-com"

if ($dkimContent -ne "") {
    Write-Host "Creating Record 1 (DKIM)..."
    gcloud dns record-sets create resend._domainkey.paysurity.com. --type="TXT" --zone="$zone" --project="$project" --rrdatas="`"$dkimContent`"" --ttl=300
    Write-Host "DKIM record created successfully."
} else {
    Write-Host "Creating Record 2 (SPF - MX)..."
    gcloud dns record-sets create send.paysurity.com. --type="MX" --zone="$zone" --project="$project" --rrdatas="10 feedback-smtp.us-east-1.amazonses.com." --ttl=300

    Write-Host "Creating Record 3 (SPF - TXT)..."
    gcloud dns record-sets create send.paysurity.com. --type="TXT" --zone="$zone" --project="$project" --rrdatas="`"v=spf1 include:amazonses.com ~all`"" --ttl=300

    Write-Host "Creating Record 4 (DMARC)..."
    gcloud dns record-sets create _dmarc.paysurity.com. --type="TXT" --zone="$zone" --project="$project" --rrdatas="`"v=DMARC1; p=none;`"" --ttl=300
    
    Write-Host "Records 2, 3, and 4 applied to GCP Cloud DNS for paysurity.com."
}
