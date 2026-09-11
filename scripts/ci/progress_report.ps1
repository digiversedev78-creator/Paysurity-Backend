Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$p = "progress/progress.json"
if (-not (Test-Path $p)) { throw "Missing $p" }

$raw = Get-Content $p -Raw -Encoding UTF8
$j = $raw | ConvertFrom-Json

# update timestamp
$j.updatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss K")

# compute overall as avg of buckets (simple + stable)
$b = @($j.buckets)
if ($b.Count -gt 0) {
  $avg = ($b | ForEach-Object { [double]($_.pct) } | Measure-Object -Average).Average
  $j.overall = [Math]::Max(0, [Math]::Min(1, $avg))
} else {
  $j.overall = 0
}

# write back
($j | ConvertTo-Json -Depth 6) | Set-Content -Encoding UTF8 $p

# build summary markdown
$lines = @()
$lines += "## EBT Progress"
$lines += ""
$lines += ("Updated: **{0}**" -f $j.updatedAt)
$lines += ("Overall: **{0}%**" -f ([Math]::Round($j.overall*100)))
$lines += ""
$lines += "| Bucket | % | Notes |"
$lines += "|---|---:|---|"
foreach ($x in $j.buckets) {
  $pct = [Math]::Round(([double]$x.pct)*100)
  $note = ($x.notes + "") -replace "\r?\n","<br/>"
  $lines += ("| {0} | {1}% | {2} |" -f $x.label, $pct, $note)
}

$md = ($lines -join "`n")

# Actions Summary “UI”
if ($env:GITHUB_STEP_SUMMARY) {
  $md | Out-File -FilePath $env:GITHUB_STEP_SUMMARY -Encoding utf8 -Append
}

# Save PR comment body (workflow reads this file)
$md | Set-Content -Encoding UTF8 "progress/COMMENT.md"
