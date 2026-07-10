#!/usr/bin/env pwsh
# Baixa imagens do Mercado Livre para public/reviews/<slug>.webp
$ErrorActionPreference = "Stop"

$imagens = [ordered]@{
  "samsung-galaxy-a36-5g-256gb-oferta"      = "https://http2.mlstatic.com/D_NQ_NP_2X_697102-MLA99477666220_112025-F.webp"
  "samsung-galaxy-a56-5g-256gb-oferta"      = "https://http2.mlstatic.com/D_NQ_NP_2X_927393-MLA100014745899_122025-F.webp"
  "smartphone-galaxy-a17-5g-128gb"          = "https://http2.mlstatic.com/D_NQ_NP_2X_755351-MLA99597188918_122025-F.webp"
  "bicicleta-ergometrica-sevenfit"          = "https://http2.mlstatic.com/D_NQ_NP_2X_679526-MLA100501405537_122025-F.webp"
  "bicicleta-spinning-mzy-15kg"             = "https://http2.mlstatic.com/D_NQ_NP_2X_705668-MLA108607870865_032026-F.webp"
  "fone-soundcore-p30i-anker-anc"           = "https://http2.mlstatic.com/D_Q_NP_765871-MLA110158216168_042026-R.webp"
  "fone-xiaomi-redmi-buds-6-play"           = "https://http2.mlstatic.com/D_NQ_NP_2X_962148-MLA110999062523_042026-F.webp"
  "furadeira-parafusadeira-the-black-tools" = "https://http2.mlstatic.com/D_NQ_NP_2X_656939-MLB113107136338_072026-F.webp"
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
