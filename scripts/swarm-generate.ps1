# PaySurity Swarm Module Generator
# ══════════════════════════════════════════════════════════════
# Generates ALL remaining NestJS modules in parallel.
# Run this from the project root.
#
# Each line generates a complete module (service + controller + module + test)
# that is auto-wired to Drizzle ORM.
# ══════════════════════════════════════════════════════════════

Write-Host "🚀 PaySurity Swarm Generator — Starting parallel module generation..." -ForegroundColor Cyan
Write-Host ""

$jobs = @()

# ── Already exist (skip) ─────────────────────────────────────
# Auth, Payment, Merchant, Orders, Loyalty, Tax, Subscription, Payroll,
# Notification, Analytics, Settlement, Wallet, Employee, Inventory,
# Affiliate, Mastercard, EventBus, Health, Launch, Ops, Aggregator,
# AIFeedback, Currency, RefundWorkflow

# ── Modules to generate ─────────────────────────────────────
$modules = @(
    @{ name="CustomerCrm";    table="customers";          fields="firstName:string,lastName:string,email:string,phone:string,loyaltyPoints:number" },
    @{ name="MenuManager";    table="menu_items";         fields="name:string,category:string,priceCents:number,description:string,isActive:boolean" },
    @{ name="Location";       table="locations";          fields="name:string,addressStreet:string,addressCity:string,addressState:string,timezone:string" },
    @{ name="LoyaltyMember";  table="loyalty_programs";   fields="name:string,type:string,pointsPerDollar:number,redeemThreshold:number" },
    @{ name="SettlementBatch"; table="settlement_batches"; fields="batchDate:date,status:string,transactionCount:number,grossAmountCents:number" },
    @{ name="Document";       table="documents";          fields="fileName:string,fileType:string,category:string,uploadedBy:string" },
    @{ name="Notification";   table="notifications";      fields="type:string,title:string,message:string,isRead:boolean,channel:string" },
    @{ name="AuditLog";       table="audit_logs";         fields="action:string,entityType:string,entityId:string,userId:string,details:json" },
    @{ name="FeatureFlag";    table="feature_flags";      fields="key:string,isEnabled:boolean,rolloutPercent:number,description:string" },
    @{ name="Webhook";        table="webhooks";           fields="url:string,events:string,secret:string,isActive:boolean,failures:number" }
)

foreach ($mod in $modules) {
    $name = $mod.name
    $table = $mod.table
    $fields = $mod.fields

    Write-Host "  ⚡ Generating: $name (table: $table)" -ForegroundColor Yellow

    $job = Start-Job -ScriptBlock {
        param($rootDir, $name, $table, $fields)
        Set-Location $rootDir
        node scripts/generate-module.js --name=$name --table=$table --fields=$fields 2>&1
    } -ArgumentList (Get-Location).Path, $name, $table, $fields

    $jobs += $job
}

Write-Host ""
Write-Host "⏳ Waiting for $($jobs.Count) parallel generators..." -ForegroundColor Cyan

# Wait for all jobs
$jobs | Wait-Job | Out-Null

# Collect results
foreach ($job in $jobs) {
    $output = Receive-Job $job
    Write-Host $output
    Remove-Job $job
}

Write-Host ""
Write-Host "✅ All modules generated! Don't forget to import them in app.module.ts" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Add the new modules to apps/api/src/app.module.ts"
Write-Host "  2. Run: cd packages/database && npx drizzle-kit generate"
Write-Host "  3. Run: cd packages/database && npx tsx src/migrate.ts"
Write-Host "  4. Start API: cd apps/api && npm run start:dev"
