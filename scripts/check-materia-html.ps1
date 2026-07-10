$url = "http://localhost:3000/materias/kit-mini-band-beneficios"
$headers = @{ "Cache-Control" = "no-cache" }
try {
  $r = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 -Headers $headers).Content
} catch {
  Write-Host "FAIL: $($_.Exception.Message)"
  exit 1
}

Write-Host "Tamanho HTML: $($r.Length)" -ForegroundColor Cyan

$patterns = @("Bicicleta Ergométrica", "Sevenfit", "Oferta selecionada", "Oferta em destaque", "Ver oferta agora", "MLB42978348")
foreach ($p in $patterns) {
  $count = ([regex]::Matches($r, [regex]::Escape($p), "IgnoreCase")).Count
  $color = if ($count -gt 0) { "Red" } else { "Green" }
  Write-Host ("  [{0,3}] '{1}'" -f $count, $p) -ForegroundColor $color
}

# Procura também a oferta via raw search
Write-Host ""
Write-Host "Posicoes de 'Bicicleta':" -ForegroundColor Yellow
$ms = [regex]::Matches($r, "Bicicleta", "IgnoreCase")
foreach ($m in $ms) {
  $idx = [Math]::Max(0, $m.Index - 60)
  $len = [Math]::Min(180, $r.Length - $idx)
  $ctx = $r.Substring($idx, $len).Replace([char]10, " ")
  Write-Host "  $($m.Index): $ctx" -ForegroundColor Gray
}
