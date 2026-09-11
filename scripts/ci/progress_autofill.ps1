Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$progressPath = "progress/progress.json"
$mapPath      = "progress/progress_map.json"

if (-not (Test-Path $progressPath)) { throw "Missing $progressPath" }
if (-not (Test-Path $mapPath)) { throw "Missing $mapPath" }

$progress = (Get-Content $progressPath -Raw -Encoding UTF8) | ConvertFrom-Json
$map      = (Get-Content $mapPath      -Raw -Encoding UTF8) | ConvertFrom-Json

function Try-LoadJson([string]$p){
  try { return ((Get-Content $p -Raw -Encoding UTF8) | ConvertFrom-Json) } catch { return $null }
}
function Score-Audit([object]$j){
  if(-not $j){ return 0 }
  if(($j.PSObject.Properties.Name -contains "isPlaceholder") -and $j.isPlaceholder){ return 0 }
  $s = 0
  if($j.PSObject.Properties.Name -contains "buckets"){ $s += 5 }
  if($j.PSObject.Properties.Name -contains "requirements"){ $s += 5 }
  if($j.PSObject.Properties.Name -contains "items"){ $s += 4 }
  if($j.PSObject.Properties.Name -contains "summary"){ $s += 2 }
  return $s
}

# Find candidate audit files (best-effort)
$cands = @()
foreach($g in $map.audit_candidates_glob){
  $cands += (Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -like ($g -replace "\*\*","*") })
}
$cands = $cands | Select-Object -Unique

$best = $null
$bestScore = 0
foreach($f in $cands){
  $j = Try-LoadJson $f.FullName
  $sc = Score-Audit $j
  if($sc -gt $bestScore){
    $bestScore = $sc
    $best = [pscustomobject]@{ Path=$f.FullName; Json=$j }
  }
}

if(-not $best){
  foreach($b in $progress.buckets){ if(-not $b.notes){ $b.notes = "" } }
  $progress.updatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss K")
  ($progress | ConvertTo-Json -Depth 8) | Set-Content -Encoding UTF8 $progressPath
  Write-Host "No audit/status JSON found; leaving progress.json as-is." -ForegroundColor Yellow
  exit 0
}

# Compute bucket % using a few common shapes
# Shape A: { buckets: {key:{complete,total}} } or { buckets:[{key,complete,total}] }
# Shape B: { requirements:[{bucket/status}]} or { items:[{bucket/status}] }
$a = $best.Json
$bucketTotals = @{}
$bucketDone   = @{}

function Add-Stat([string]$key,[int]$done,[int]$total){
  if(-not $bucketTotals.ContainsKey($key)){ $bucketTotals[$key]=0; $bucketDone[$key]=0 }
  $bucketTotals[$key] += $total
  $bucketDone[$key]   += $done
}

if($a -and ($a.PSObject.Properties.Name -contains "buckets")){
  $b = $a.buckets
  if($b -is [System.Collections.IDictionary]){
    foreach($k in $b.Keys){
      $x = $b[$k]
      if($x -and ($x.PSObject.Properties.Name -contains "total")){
        Add-Stat $k ([int]$x.complete) ([int]$x.total)
      }
    }
  } else {
    foreach($x in @($b)){
      if($x -and ($x.PSObject.Properties.Name -contains "key") -and ($x.PSObject.Properties.Name -contains "total")){
        Add-Stat ($x.key + "") ([int]$x.complete) ([int]$x.total)
      }
    }
  }
}

$items = @()
if($a -and ($a.PSObject.Properties.Name -contains "requirements")){ $items += @($a.requirements) }
if($a -and ($a.PSObject.Properties.Name -contains "items")){ $items += @($a.items) }

if($items.Count -gt 0){
  foreach($it in $items){
    $bucket = ""
    if($it.PSObject.Properties.Name -contains "bucket"){ $bucket = $it.bucket + "" }
    elseif($it.PSObject.Properties.Name -contains "domain"){ $bucket = $it.domain + "" }
    elseif($it.PSObject.Properties.Name -contains "area"){ $bucket = $it.area + "" }

    $status = ""
    if($it.PSObject.Properties.Name -contains "status"){ $status = ($it.status + "").ToLowerInvariant() }
    elseif($it.PSObject.Properties.Name -contains "state"){ $status = ($it.state + "").ToLowerInvariant() }
    elseif($it.PSObject.Properties.Name -contains "result"){ $status = ($it.result + "").ToLowerInvariant() }

    if(-not $bucket){ continue }

    $done = 0
    if($status -match "done|complete|implemented|pass|success"){ $done = 1 }
    Add-Stat $bucket $done 1
  }
}

# Apply to progress buckets using map matching (so audit bucket names can differ)
foreach($pb in $progress.buckets){
  $key = $pb.key + ""
  $labels = @()
  foreach($m in ($map.buckets | Where-Object { $_.key -eq $key })){
    $labels += @($m.match)
  }

  $total = 0
  $done  = 0

  foreach($k in $bucketTotals.Keys){
    $hit = $false
    foreach($t in $labels){
      if(($k + "").ToUpperInvariant().Contains(($t + "").ToUpperInvariant())){ $hit = $true; break }
    }
    if($hit){
      $total += [int]$bucketTotals[$k]
      $done  += [int]$bucketDone[$k]
    }
  }

  if($total -gt 0){
    $pb.pct = [Math]::Max(0,[Math]::Min(1, ($done / [double]$total)))
    $pb.notes = ("Auto from: {0}" -f $best.Path)
  } else {
    if(-not $pb.notes){ $pb.notes = "" }
  }
}

$progress.updatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss K")
($progress | ConvertTo-Json -Depth 8) | Set-Content -Encoding UTF8 $progressPath
Write-Host ("Auto-filled progress from: " + $best.Path) -ForegroundColor Green


