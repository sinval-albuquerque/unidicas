$destDir = "c:\Users\Sinval\Projetos\unidicas\public\reviews"
Write-Host "=== Arquivos em public/reviews/ ===" -ForegroundColor Cyan
Get-ChildItem $destDir -File | Sort-Object Name | ForEach-Object {
  $kb = [math]::Round($_.Length / 1KB, 1)
  $color = if ($_.Length -lt 5KB) { "Yellow" } elseif ($_.Length -lt 10KB) { "DarkYellow" } else { "Green" }
  Write-Host ("  {0,-50} {1,8:N1} KB" -f $_.Name, $kb) -ForegroundColor $color
}

# Inspeciona os 2 suspeitos (P30i 0.5KB e Buds 4.4KB)
$suspeitos = @("fone-soundcore-p30i-anker-anc.webp", "fone-xiaomi-redmi-buds-6-play.webp")
foreach ($nome in $suspeitos) {
  $path = Join-Path $destDir $nome
  if (Test-Path $path) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $n = [Math]::Min(40, $bytes.Length)
    $hex = -join ($bytes[0..($n-1)] | ForEach-Object { $_.ToString("X2") + " " })
    Write-Host ""
    Write-Host "=== $nome ===" -ForegroundColor Yellow
    Write-Host "  Tamanho: $($bytes.Length) bytes"
    Write-Host "  Primeiros bytes (hex): $hex"
  }
}
