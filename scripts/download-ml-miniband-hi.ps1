#!/usr/bin/env pwsh
# Tenta baixar versões MAIORES das 3 imagens do ML (substitui o -R por -F)
# A diferença é que o -F é a versão "full" que tem tamanho maior de verdade.
# O Mercado Livre armazena o nome do produto no nome do arquivo quando vem de /D_NP_NP/

$ErrorActionPreference = "Stop"

# slug -> URL grande (versão -F ou -O)
$imagens = [ordered]@{
  "kit-mini-band-1" = "https://http2.mlstatic.com/D_NQ_NP_982791-MLA110468747005_042026-O.webp"
  "kit-mini-band-2" = "https://http2.mlstatic.com/D_NQ_NP_603522-MLA109590758508_042026-O.webp"
  "kit-mini-band-3" = "https://http2.mlstatic.com/D_NQ_NP_872439-MLA109591585312_042026-O.webp"
}

$destDir = "c:\Users\Sinval\Projetos\unidicas\public\reviews"

$headers = @{
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  "Referer"    = "https://www.mercadolivre.com.br/"
  "Accept"     = "image/webp,image/*"
}

foreach ($k in $imagens.Keys) {
  $url  = $imagens[$k]
  $dest = Join-Path $destDir "$k.webp"
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -Headers $headers -ErrorAction Stop
    $size = (Get-Item $dest).Length
    $kb   = [math]::Round($size / 1KB, 1)
    Write-Host "  OK   $k.webp  ($kb KB)" -ForegroundColor Green
  } catch {
    Write-Host "  FAIL $k  -> $($_.Exception.Message)" -ForegroundColor Red
  }
}
