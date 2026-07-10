Add-Type -AssemblyName "System.Drawing"

$dir = "c:\Users\Sinval\Projetos\unidicas\public\reviews"
$files = Get-ChildItem $dir -File | Where-Object { $_.Name -like "kit-mini-band-*" -or $_.Name -in @("bicicleta-ergometrica-sevenfit.webp", "bicicleta-spinning-mzy-15kg.webp", "fone-soundcore-p30i-anker-anc.webp", "fone-xiaomi-redmi-buds-6-play.webp", "fone-dapon-h02d-bluetooth.webp", "smartphone-galaxy-a17-5g-128gb.webp", "furadeira-parafusadeira-the-black-tools.webp", "samsung-galaxy-a36-5g-256gb-oferta.webp", "samsung-galaxy-a56-5g-256gb-oferta.webp") } | Sort-Object Name

foreach ($f in $files) {
  try {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $w = $img.Width
    $h = $img.Height
    $ratio = [math]::Round($w / $h, 3)
    Write-Host ("{0,-50}  {1,5}x{2,-5}  ratio={3}" -f $f.Name, $w, $h, $ratio)
    $img.Dispose()
  } catch {
    Write-Host "  FAIL: $($_.Name)" -ForegroundColor Red
  }
}
