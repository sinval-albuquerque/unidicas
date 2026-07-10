$urls = @(
  "http://localhost:3000/",
  "http://localhost:3000/materias",
  "http://localhost:3000/materias/kit-mini-band-beneficios"
)
foreach ($u in $urls) {
  try {
    $r = (Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 60).Content
    Write-Host "=== $u ===" -ForegroundColor Cyan
    $matches = [regex]::Matches($r, 'kit-mini-band-1\.webp|kit-mini-band-2\.webp|kit-mini-band-3\.webp')
    Write-Host ("  Total matches: {0}" -f $matches.Count) -ForegroundColor Yellow
    foreach ($m in $matches) {
      $idx = [Math]::Max(0, $m.Index - 50)
      $end = [Math]::Min($r.Length, $m.Index + 200)
      $ctx = $r.Substring($idx, $end - $idx).Replace("`n", " ")
      Write-Host "  - $ctx" -ForegroundColor Green
    }
  } catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
  }
}
