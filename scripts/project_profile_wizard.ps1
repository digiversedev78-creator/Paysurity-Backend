cd (git rev-parse --show-toplevel)
$ErrorActionPreference = "Stop"

$profilePath = "Requirements\PROJECT_PROFILE.json"
$templatePath = "Requirements\PROJECT_PROFILE.template.json"

if (!(Test-Path $profilePath)) { Copy-Item $templatePath $profilePath -Force }
$profile = Get-Content $profilePath -Raw | ConvertFrom-Json

Write-Host "=== Project Profile Wizard ===" -ForegroundColor Magenta

$pn = Read-Host "Project name (current: $($profile.project_name))"
if ($pn) { $profile.project_name = $pn }

$web = Read-Host "Web app? (y/n) (current: $($profile.platforms.web))"
if ($web) { $profile.platforms.web = ($web.ToLower() -eq "y") }

$mob = Read-Host "Mobile app? (y/n) (current: $($profile.platforms.mobile))"
if ($mob) { $profile.platforms.mobile = ($mob.ToLower() -eq "y") }

$base = Read-Host "E2E base URL (current: $($profile.e2e.base_url))"
if ($base) { $profile.e2e.base_url = $base }

$acc = Read-Host "Accessibility gate enabled? (y/n) (current: $($profile.accessibility.enabled))"
if ($acc) { $profile.accessibility.enabled = ($acc.ToLower() -eq "y") }

$budgetEnf = Read-Host "Enforce budget cap in CI? (y/n) (current: $($profile.budget.enforce))"
if ($budgetEnf) { $profile.budget.enforce = ($budgetEnf.ToLower() -eq "y") }

if ($profile.budget.enforce) {
  $mc = Read-Host "Max cost USD (current: $($profile.budget.max_cost_usd))"
  if ($mc) { $profile.budget.max_cost_usd = [double]$mc }
  $ms = Read-Host "Max slices total (current: $($profile.budget.max_slices_total))"
  if ($ms) { $profile.budget.max_slices_total = [int]$ms }
}

($profile | ConvertTo-Json -Depth 10) | Set-Content -Encoding UTF8 $profilePath
Write-Host "Wrote $profilePath" -ForegroundColor Green
