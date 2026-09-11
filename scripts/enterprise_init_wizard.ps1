cd (git rev-parse --show-toplevel)
$ErrorActionPreference = "Stop"

function Assert-Cmd($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) { throw "Missing required command: $name" }
}

Write-Host "=== Enterprise Init Wizard (v2) ===" -ForegroundColor Magenta
Assert-Cmd git
Assert-Cmd gh

try { gh auth status | Out-Null } catch { throw "gh not authenticated. Run: gh auth login" }

$url = (git remote get-url origin 2>$null)
if (-not $url) { throw "No git remote origin found." }
if ($url -notmatch "github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(\.git)?$") { throw "Could not parse GitHub repo from origin: $url" }
$repoSlug = "$($Matches.owner)/$($Matches.repo)"
Write-Host "Repo: $repoSlug" -ForegroundColor Green

try {
  gh api -X PUT "repos/$repoSlug/environments/staging" | Out-Null
  gh api -X PUT "repos/$repoSlug/environments/production" | Out-Null
  Write-Host "Created environments: staging, production" -ForegroundColor Green
} catch {
  Write-Host "Warning: could not create environments via API. Configure manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next (manual, one-time):" -ForegroundColor Cyan
Write-Host "1) Settings -> Branches -> protect main; require PR + required checks."
Write-Host "2) Settings -> Environments -> production -> required reviewers (if available)."
Write-Host "3) Run: .\scripts\project_profile_wizard.ps1"
