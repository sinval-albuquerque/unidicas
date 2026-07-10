# Baixa HTML da página do produto e extrai URL da imagem REAL (D_Q_NP com MLB ID)
param(
    [string]$Mlb
)

$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
$urls = @(
    "https://www.mercadolivre.com.br/p/$Mlb"
    "https://www.mercadolivre.com.br/p/MLB$Mlb"
)

# padrao da URL de imagem do ML: D_Q_NP_2X_HASH-MLA_NNN_DATE-SUFFIX.webp
# queremos um que contenha o MLB ID exato no path (depois do prefixo MLA)

foreach ($u in $urls) {
    $tmp = [System.IO.Path]::GetTempFileName()
    try {
        Invoke-WebRequest -Uri $u -Headers @{"User-Agent"=$ua; "Accept"="text/html"} -UseBasicParsing -TimeoutSec 20 -OutFile $tmp -ErrorAction Stop
        $html = [System.IO.File]::ReadAllText($tmp, [System.Text.Encoding]::UTF8)
        if ($html.Length -lt 1000) { continue }

        # todas URLs D_Q_NP (normal e escapada)
        $all1 = [regex]::Matches($html, 'https?://[^\s"\\<>]*?D_Q_NP[^\s"\\<>]+?\.(?:webp|jpg|jpeg|png)', 'IgnoreCase')
        $all2 = [regex]::Matches($html, 'http2\\u002F\\u002Fmlstatic\\u002Fcom\\u002F[^\s"\\<>]+?D_Q_NP[^\s"\\<>]+?\.(?:webp|jpg|jpeg|png)', 'IgnoreCase')

        $candidates = @()
        foreach ($m in $all1) { $candidates += $m.Value }
        foreach ($m in $all2) {
            $v = $m.Value -replace '\\u002F', '/' -replace '\\/', '/'
            if (-not $v.StartsWith('http')) { $v = "https://" + $v }
            $candidates += $v
        }

        # queremos a URL cujo path contém -MLA$Mlb- ou -MLB$Mlb- (o ID do produto)
        # ou cujo hash é diferente da propaganda padrão
        $scored = @()
        foreach ($c in $candidates) {
            $score = 0
            # bonus se contém o ID exato do produto
            if ($c -match "MLA?$Mlb-") { $score += 100 }
            # bonus se é D_Q_NP_2X (formato de imagem real)
            if ($c -match 'D_Q_NP_2X_') { $score += 50 }
            # bonus se é .webp (formato moderno)
            if ($c.EndsWith('.webp')) { $score += 10 }
            # penalidade se for a propaganda "cuecas boxer"
            if ($c -match 'cuecas|boxer|lupo') { $score -= 200 }
            # penalidade se for logo
            if ($c -match 'mercado-libre|homesnw') { $score -= 200 }
            $scored += @{ url = $c; score = $score }
        }

        $best = $scored | Sort-Object -Property @{Expression="score"; Descending=$true} | Select-Object -First 1
        if ($best -and $best.score -gt -50) {
            $u2 = $best.url -replace '-I(-W\d+)?\.(jpg|jpeg|png|webp)$', '-O.$1'
            Write-Output $u2
            Remove-Item $tmp -Force
            return
        }
    } catch {
    } finally {
        if (Test-Path $tmp) { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
    }
}
Write-Output "FAIL"

