$ErrorActionPreference = "Stop"

# slug -> URL nova que o usuario passou
$imagens = [ordered]@{
  "samsung-galaxy-a36-5g-256gb-oferta" = "https://http2.mlstatic.com/D_NQ_NP_2X_697102-MLA99477666220_112025-F.webp"
  "iphone-16-256gb"                    = "https://http2.mlstatic.com/D_NQ_NP_2X_719634-MLA97473882481_112025-F.webp"
  "samsung-galaxy-a56-5g-256gb-oferta" = "https://http2.mlstatic.com/D_NQ_NP_2X_927393-MLA100014745899_122025-F.webp"
}

$destDir = "c:\Users\Sinval\Projetos\unidicas\public\reviews"
$headers = @{
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  "Referer"    = "https://www.mercadolivre.com.br/"
  "Accept"     = "image/webp,image/*"
}

# Variantes em ordem de preferencia
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

function Get-MD5([string]$path) {
  if (-not (Test-Path $path)) { return $null }
  $h = [System.Security.Cryptography.MD5]::Create()
  try {
    $stream = [System.IO.File]::OpenRead($path)
    try { return -join ($h.ComputeHash($stream) | ForEach-Object { $_.ToString("x2") }) } finally { $stream.Close() }
  } finally { $h.Dispose() }
}

foreach ($k in $imagens.Keys) {
  $url = $imagens[$k]
  $info = Parse-ImageUrl -url $url
  if (-not $info) { Write-Host "  SKIP $k" -ForegroundColor Yellow; continue }

  $dest = Join-Path $destDir "$k.webp"
  $currentHash = Get-MD5 $dest
  $currentSize = if (Test-Path $dest) { (Get-Item $dest).Length } else { 0 }
  Write-Host "-- $k  (atual: $currentSize B, MD5 $currentHash)"

  # Tenta variantes da maior pra menor
  $bestSize = 0
  $bestVariant = $null
  $bestTmp = $null
  foreach ($v in $variants) {
    $testUrl = "https://http2.mlstatic.com/$($info.prefix)_$($info.num)-$($info.id)_$($info.date)$v.webp"
    $tmp = [System.IO.Path]::GetTempFileName()
    try {
      Invoke-WebRequest -Uri $testUrl -OutFile $tmp -Headers $headers -ErrorAction Stop
      $size = (Get-Item $tmp).Length
      $hash = Get-MD5 $tmp
      Write-Host ("    {0,-4} {1,7:N1} KB  MD5 {2}" -f $v, ($size/1KB), $hash.Substring(0,12)) -ForegroundColor Gray
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
    $newHash = Get-MD5 $bestTmp
    $moved = $false
    if ($newHash -ne $currentHash) {
      Move-Item $bestTmp $dest -Force
      Write-Host ("  -> MUDOU: $($info.prefix)-$($info.num)/$bestVariant, agora $bestSize B (era $currentSize B)") -ForegroundColor Green
      $moved = $true
    } else {
      Remove-Item $bestTmp -ErrorAction SilentlyContinue
      Write-Host "  -> IGUAL: ja tinha essa imagem" -ForegroundColor DarkCyan
    }
  } else {
    Write-Host "  -> SKIP, nenhuma variante respondeu" -ForegroundColor Red
  }
}
