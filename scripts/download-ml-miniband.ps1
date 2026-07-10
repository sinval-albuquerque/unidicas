#!/usr/bin/env pwsh
# Baixa 3 imagens do ML para a matéria kit-mini-band-beneficios
$ErrorActionPreference = "Stop"

$imagens = [ordered]@{
  "kit-mini-band-1" = "https://http2.mlstatic.com/D_Q_NP_2X_982791-MLA110468747005_042026-R.webp"
  "kit-mini-band-2" = "https://http2.mlstatic.com/D_Q_NP_603522-MLA109590758508_042026-R.webp"
  "kit-mini-band-3" = "https://http2.mlstatic.com/D_Q_NP_872439-MLA109591585312_042026-R.webp"
}

$destDir = "c:\Users\Sinval\Projetos\unidicas\public\reviews"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

$headers = @{
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  "Referer"    = "https://www.mercadolivre.com.br/"
  "Accept"     = "image/webp,image/*"
}

$ok = 0; $fail = 0
foreach ($k in $imagens.Keys) {
  $url  = $imagens[$k]
  $dest = Join-Path $destDir "$k.webp"
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -Headers $headers -ErrorAction Stop
    $size = (Get-Item $dest).Length
    $kb   = [math]::Round($size / 1KB, 1)
    Write-Host "  OK   $k.webp  ($kb KB)" -ForegroundColor Green
    $ok++
  } catch {
    Write-Host "  FAIL $k  -> $($_.Exception.Message)" -ForegroundColor Red
    $fail++
  }
}
Write-Host ""
Write-Host "Total: $ok OK, $fail FAIL" -ForegroundColor Cyan
