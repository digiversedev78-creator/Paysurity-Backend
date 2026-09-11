cd "C:\Projects\PaySurity"
Write-Host "🚀 Firing Launch Day QA Suite..." -ForegroundColor Magenta
npx playwright test tests/launch-day-smoke.spec.js --project=chromium
