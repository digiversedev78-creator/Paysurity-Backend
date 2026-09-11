Write-Host "Syncing Paysurity Monorepo to V1 Architecture..." -ForegroundColor Cyan
$RepoRoot = "C:\Projects\PaySurity"
Set-Location -Path $RepoRoot
Write-Host "Flushing node_modules and pnpm cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
pnpm store prune
Write-Host "Bootstrapping workspace dependencies..." -ForegroundColor Yellow
pnpm install --frozen-lockfile
Write-Host "Sync Complete." -ForegroundColor Green
