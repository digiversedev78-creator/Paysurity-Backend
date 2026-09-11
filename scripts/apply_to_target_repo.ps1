# Apply this template pack to an EXISTING target repo (private OK).
# Creates branch, commits, pushes, opens PR.

$ErrorActionPreference = "Stop"

function Assert-Cmd($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) { throw "Missing required command: $name" }
}

Assert-Cmd git
Assert-Cmd gh
try { gh auth status | Out-Null } catch { throw "gh not authenticated. Run: gh auth login" }

$target = Read-Host "Target repo slug (owner/repo)"
if (-not $target) { throw "Target repo slug required." }

$branch = Read-Host "Branch name (default: bootstrap/enterprise-gates)"
if (-not $branch) { $branch = "bootstrap/enterprise-gates" }

$tempRoot = Join-Path $env:TEMP ("enterprise-pack-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

Write-Host "Cloning target repo..." -ForegroundColor Cyan
$targetDir = Join-Path $tempRoot "target"
gh repo clone $target $targetDir | Out-Null

Write-Host "Cloning template repo..." -ForegroundColor Cyan
$here = (Get-Location).Path
$tmplSlug = $null
try {
  $u = (git -C $here remote get-url origin 2>$null)
  if ($u -match "github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(\.git)?$") { $tmplSlug = "$($Matches.owner)/$($Matches.repo)" }
} catch {}
if (-not $tmplSlug) { $tmplSlug = "rwbgoachic/enterprise-build-template" }

$templateDir = Join-Path $tempRoot "template"
gh repo clone $tmplSlug $templateDir | Out-Null

cd $targetDir
$defaultBranch = gh repo view $target --json defaultBranchRef -q ".defaultBranchRef.name"
git checkout $defaultBranch
git pull

git checkout -b $branch

$paths = @(".github","scripts","Requirements","e2e","docs","AGENT_RUNBOOK.md","WHY_THIS_EXISTS_AND_DECISIONS.md","DOD_ENTERPRISE_CHECKLIST.md","README.md","AgentOutput","MANIFEST.txt",".gitignore")
foreach ($p in $paths) {
  $src = Join-Path $templateDir $p
  $dst = Join-Path $targetDir $p
  if (Test-Path $src) {
    if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
    Copy-Item -Recurse -Force $src $dst
  }
}

$pp = "Requirements\PROJECT_PROFILE.json"
if (Test-Path $pp) {
  $j = Get-Content $pp -Raw | ConvertFrom-Json
  $j.project_name = $target
  ($j | ConvertTo-Json -Depth 10) | Set-Content -Encoding UTF8 $pp
}

git add -A
git config user.name "enterprise-template"
git config user.email "enterprise-template@users.noreply.github.com"
git commit -m "chore: apply enterprise gates + canonical requirements pack (v2)"
git push -u origin $branch

gh pr create --repo $target --base $defaultBranch --head $branch `
  --title "Bootstrap enterprise gates (v2 pack)" `
  --body "Applies canonical requirements contract + CI gates (schema, MUST->E2E, E2E run, accessibility, security scans, budget cap optional) plus deploy stubs."

Write-Host "DONE: PR created. Next: enforce branch protection required checks." -ForegroundColor Green
