$domains = @('erp', 'inventory', 'auth')
$targetPath = "apps\api\src\domains"

if (Test-Path $targetPath) {
    Get-ChildItem -Path $targetPath | Where-Object { $_.Name -notin $domains } | Remove-Item -Recurse -Force
    Write-Host "Ghost domains deleted."
} else {
    Write-Host "Path $targetPath does not exist."
}
exit 0
