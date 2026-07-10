param([string]$Url, [string]$Out)
$ErrorActionPreference = "Stop"
$headers = @{
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  "Referer"    = "https://www.mercadolivre.com.br/"
  "Accept"     = "image/webp,image/*"
}
$tmp = [System.IO.Path]::GetTempFileName()
try {
  Invoke-WebRequest -Uri $Url -OutFile $tmp -Headers $headers -ErrorAction Stop
  $bytes = [System.IO.File]::ReadAllBytes($tmp)
  $n = [Math]::Min(40, $bytes.Length)
  $hex = -join ($bytes[0..($n-1)] | ForEach-Object { $_.ToString("X2") + " " })
  Write-Host "URL:     $Url" -ForegroundColor Cyan
  Write-Host "Tamanho: $($bytes.Length) bytes"
  Write-Host "Hex:     $hex"
  if ($bytes.Length -lt 5KB) {
    Write-Host "SUSPEITO: muito pequeno, pode ser placeholder/transparent" -ForegroundColor Yellow
  } else {
    # Salva no destino
    [System.IO.File]::Copy($tmp, $Out, $true)
    Write-Host "Salvo em: $Out" -ForegroundColor Green
  }
} finally {
  Remove-Item $tmp -ErrorAction SilentlyContinue
}
