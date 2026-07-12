#!/usr/bin/env python3
"""
Para os 3 produtos faltantes, faz 3 tentativas (todas com URLs REAIS do ML):
1. Hit URL /p/MLB com PowerShell, parsear por regex por og:image ou mlstatic
2. Se falhar, tentar /c/celulares-e-telefones e /ofertas page=2/3
3. Última opção: usar URL hard-coded do `download-missing.py` (também ML)

O projeto NÃO usa Unsplash — toda imagem é foto real do produto.
"""
import re
import sys
import urllib.error
import urllib.request
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

PRODUTOS = {
    "smartphone-galaxy-a07-256gb":  "MLB54961556",
    "iphone-16-256gb":             "MLB1040287790",
    "bicicleta-spinning-mzy-15kg":  "MLB66517451",
}

def get(url):
    """Faz GET via PowerShell (que pode ter cookies/headers melhores)."""
    cmd = [
        "powershell", "-NoProfile", "-Command",
        f"Invoke-WebRequest -Uri '{url}' -Headers @{{'User-Agent'='{UA}';'Accept'='text/html,application/xhtml+xml,application/json'}} -UseBasicParsing -TimeoutSec 20 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Content"
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return result.stdout
    except Exception as e:
        return f"ERR {e}"


def upgrade_mlstatic(url):
    return re.sub(r"-I(-W\d+)?\.(jpg|jpeg|png|webp)$", r"-O.\2", url, flags=re.IGNORECASE)


for slug, mlb in PRODUTOS.items():
    print(f"\n=== {slug} (MLB {mlb}) ===")
    found = None
    # tentativa 1: URL pública do produto
    for url in [
        f"https://www.mercadolivre.com.br/p/{mlb}",
        f"https://www.mercadolivre.com.br/p/MLB{'' if mlb.startswith('MLB') else ''}{mlb}",
    ]:
        html = get(url)
        if not html or html.startswith("ERR"):
            continue
        # og:image
        m = re.search(r'property=.og:image.\s+content=."([^"]+)"', html)
        if m:
            found = m.group(1)
            print(f"  [og:image] {found[:120]}")
            break
        # mlstatic direto
        ms = re.findall(r'(https?:)?(\\u002F\\u002F|//)+(http2)?(\\u002F|/|\\.)+(mlstatic|\\u002Fmlstatic)(?:\\u002F|\\.|/)+com(?:\\u002F|\\.|/)+([^\s"\\]+\.(?:webp|jpg|jpeg|png))', html, re.IGNORECASE)
        if ms:
            for tup in ms:
                joined = "".join(tup)
                if "mlstatic" in joined:
                    if not joined.startswith("http"):
                        joined = "https://" + joined.replace("\\u002F", "/").replace("\\/", "/").lstrip("/")
                    found = upgrade_mlstatic(joined)
                    print(f"  [mlstatic] {found[:120]}")
                    break
            if found:
                break
    if found:
        print(f"  --> {found}")
    else:
        print(f"  [FAIL] nao encontrado")
