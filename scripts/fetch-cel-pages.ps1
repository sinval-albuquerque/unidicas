$pages = 1,2,3
$baseOut = "c:\Users\Sinval\Projetos\unidicas\scripts"
foreach ($p in $pages) {
    $url = "https://www.mercadolivre.com.br/c/celulares-e-telefones?page=$p"
    $out = Join-Path $baseOut ("cel-p" + $p + ".html")
    try {
        Invoke-WebRequest -Uri $url -Headers @{"User-Agent"="Mozilla/5.0"} -UseBasicParsing -OutFile $out -TimeoutSec 30 -ErrorAction Stop
        $size = (Get-Item $out).Length
        Write-Host ("cel-p" + $p + ": " + $size + " bytes")
    } catch {
        Write-Host ("cel-p" + $p + ": FAIL " + $_.Exception.Message)
    }
}
