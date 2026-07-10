#!/usr/bin/env pwsh
# Baixa a maior versao disponivel de cada imagem do ML.

$ErrorActionPreference = "Continue"

$produtos = [ordered]@{
  "kit-mini-band-1"                = "https://http2.mlstatic.com/D_NQ_NP_2X_982791-MLA110468747005_042026-R.webp"
  "kit-mini-band-2"                = "https://http2.mlstatic.com/D_NQ_NP_2X_603522-MLA109590758508_042026-R.webp"
  "kit-mini-band-3"                = "https://http2.mlstatic.com/D_NQ_NP_2X_872439-MLA109591585312_042026-R.webp"
  "fone-soundcore-p30i-anker-anc"   = "https://http2.mlstatic.com/D_Q_NP_765871-MLA110158216168_042026-R.webp"
  "fone-xiaomi-redmi-buds-6-play"   = "https://http2.mlstatic.com/D_NQ_NP_2X_962148-MLA110999062523_042026-F.webp"
  "bicicleta-ergometrica-sevenfit"  = "https://http2.mlstatic.com/D_NQ_NP_2X_679526-MLA100501405537_122025-F.webp"
  "bicicleta-spinning-mzy-15kg"     = "https://http2.mlstatic.com/D_NQ_NP_2X_705668-MLA108607870865_032026-F.webp"
  "furadeira-parafusadeira-the-black-tools" = "https://http2.mlstatic.com/D_NQ_NP_2X_656939-MLB113107136338_072026-F.webp"
  "smartphone-galaxy-a17-5g-128gb"  = "https://http2.mlstatic.com/D_NQ_NP_2X_755351-MLA99597188918_122025-F.webp"
  "samsung-galaxy-a36-5g-256gb-oferta"     = "https://http2.mlstatic.com/D_NQ_NP_2X_697102-MLA99477666220_112025-F.webp"
  "samsung-galaxy-a56-5g-256gb-oferta"     = "https://http2.mlstatic.com/D_NQ_NP_2X_927393-MLA100014745899_122025-F.webp"
}

$destDir = "c:\Users\Sinval\Projetos\unidicas\public\reviews"
$headers = @{
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  "Referer"    = "https://www.mercadolivre.com.br/"
  "Accept"     = "image/webp,image/*"
}

$variants = @("-O", "-W", "-F", "-AB", "-2X", "-V", "-R")

function Parse-ImageUrl([string]$url) {
  $baseUrl = $url -replace "\?.*$", ""
  $baseUrl = $baseUrl -replace "-[A-Z]\.webp$", ".webp"
  $m = [regex]::Match($baseUrl, '((?:D_NQ_NP|D_Q_NP)(?:_\d+X)?)_([0-9]+)-(MLA[0-9]+)_([0-9]+)')
  if (-not $m.Success) { return $null }
  return @{
    prefix = $m.Groups[1].Value
    num    = $m.Groups[2].Value
    id     = $m.Groups[3].Value
    date   = $m.Groups[4].Value
  }
}

foreach ($k in $produtos.Keys) {
  $url = $produtos[$k]
  $info = Parse-ImageUrl -url $url
  if (-not $info) {
    Write-Host "  SKIP  $k (URL nao parseada)" -ForegroundColor DarkYellow
    continue
  }
  Write-Host ("-- {0}  ({1} {2} {3})" -f $k, $info.prefix, $info.num, $info.date)

  $bestSize = 0
  $bestVariant = $null
  $bestTmp = $null
  foreach ($v in $variants) {
    $testUrl = "https://http2.mlstatic.com/$($info.prefix)_$($info.num)-$($info.id)_$($info.date)$v.webp"
    $tmp = [System.IO.Path]::GetTempFileName()
    try {
      Invoke-WebRequest -Uri $testUrl -OutFile $tmp -Headers $headers -ErrorAction Stop
      $size = (Get-Item $tmp).Length
      Write-Host ("    {0,-4} {1,7:N1} KB" -f $v, ($size/1KB)) -ForegroundColor Gray
      if ($size -gt $bestSize) {
        $bestSize = $size
        $bestVariant = $v
        if ($bestTmp) { Remove-Item $bestTmp -ErrorAction SilentlyContinue }
        $bestTmp = $tmp
      } else {
        Remove-Item $tmp -ErrorAction SilentlyContinue
      }
    } catch {
      Write-Host ("    {0,-4} FAIL" -f $v) -ForegroundColor DarkYellow
      Remove-Item $tmp -ErrorAction SilentlyContinue
    }
  }
  if ($bestTmp -and $bestSize -gt 0) {
    $dest = Join-Path $destDir "$k.webp"
    Move-Item $bestTmp $dest -Force
    Write-Host ("  -> $k.webp = $bestVariant  ($([math]::Round($bestSize/1KB,1)) KB)") -ForegroundColor Green
  } else {
    Write-Host "  -> SKIP, nenhuma variante respondeu" -ForegroundColor Red
  }
}
