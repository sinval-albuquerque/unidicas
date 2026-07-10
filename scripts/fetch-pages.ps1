$pages = 1,2,3,4,5
$baseOut = "c:\Users\Sinval\Projetos\unidicas\scripts"
foreach ($p in $pages) {
    $url = "https://www.mercadolivre.com.br/ofertas?page=$p"
    $out = Join-Path $baseOut ("ofertas-p" + $p + ".html")
    try {
        Invoke-WebRequest -Uri $url -Headers @{"User-Agent"="Mozilla/5.0"} -UseBasicParsing -OutFile $out -TimeoutSec 30 -ErrorAction Stop
        $size = (Get-Item $out).Length
        Write-Host ("p" + $p + ": " + $size + " bytes")
    } catch {
        Write-Host ("p" + $p + ": FAIL " + $_.Exception.Message)
    }
}
