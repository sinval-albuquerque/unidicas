# Lê o arquivo e procura a posição do pickOfertaPrincipal + o sort/candidates
$path = "c:\Users\Sinval\Projetos\unidicas\src\app\materias\[slug]\page.tsx"
$content = Get-Content $path -Raw
$lines = $content -split "`n"
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match "candidates|keywords\.|c\.item\." -or $lines[$i] -match "for \(const c of") {
    Write-Host ("{0,3}: {1}" -f ($i + 1), $lines[$i])
  }
}
Write-Host ""
Write-Host "Total linhas: $($lines.Count)"
