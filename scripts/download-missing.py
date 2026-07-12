#!/usr/bin/env python3
"""
Finaliza as 3 fotos faltantes, usando URLs REAIS do Mercado Livre:
- smartphone-galaxy-a07-256gb: Galaxy A07 preto
- iphone-16-256gb: iPhone 16 rosa
- bicicleta-spinning-mzy-15kg: spinning MZY 15kg

O projeto NÃO usa Unsplash — toda imagem é foto real do produto.
Baixa, salva em public/brand/produtos/ e atualiza frontmatter das MDX.
"""

import re
import urllib.error
import urllib.request
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "brand" / "produtos"
REVIEWS_DIR = ROOT / "src" / "content" / "reviews"

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

# slug -> URL real do produto no marketplace (Mercado Livre).
# O projeto NÃO usa Unsplash — toda imagem deve ser foto real.
PRODUTOS = {
    "smartphone-galaxy-a07-256gb":  "https://http2.mlstatic.com/D_NQ_NP_2X_895724-MLA91526198522_092025-F.webp",  # Galaxy A07 preto
    "iphone-16-256gb":             "https://http2.mlstatic.com/D_NQ_NP_2X_835348-MLA1040287790_082025-F.webp",  # iPhone 16 rosa
    "bicicleta-spinning-mzy-15kg":  "https://http2.mlstatic.com/D_Q_NP_2X_997574-MLA109633443994_042026-AB.webp",
}


def download(url: str, dest: Path, timeout: int = 60) -> int:
    headers = {"User-Agent": UA, "Accept": "image/webp,image/*"}
    if "mlstatic" in url:
        headers["Referer"] = "https://www.mercadolivre.com.br/"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        dest.write_bytes(r.read())
    return dest.stat().st_size


def update_frontmatter(mdx_path: Path, new_image_path: str) -> bool:
    text = mdx_path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return False
    end = text.find("\n---", 3)
    if end == -1:
        return False
    fm = text[: end + 4]
    body = text[end + 4 :]
    new_fm, n = re.subn(
        r'^imagem:\s*".*?"$',
        f'imagem: "{new_image_path}"',
        fm,
        count=1,
        flags=re.MULTILINE,
    )
    if n == 0:
        new_fm, n = re.subn(
            r"^imagem:\s*.*$",
            f'imagem: "{new_image_path}"',
            fm,
            count=1,
            flags=re.MULTILINE,
        )
    if n == 0:
        return False
    mdx_path.write_text(new_fm + body, encoding="utf-8")
    return True


def ext_from_url(url: str) -> str:
    m = re.search(r"\.(webp|jpg|jpeg|png)(?:\?|$)", url, re.IGNORECASE)
    return f".{m.group(1).lower()}" if m else ".webp"


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    failures = []
    updated = []

    for slug, ml_url in PRODUTOS.items():
        url = ml_url
        print(f"  --> {slug}  <-  ML real")

        ext = ext_from_url(url)
        dest = OUT_DIR / f"{slug}{ext}"
        try:
            size = download(url, dest)
            print(f"       OK ({size//1024} KB, ML)")
        except Exception as e:
            print(f"       ERR {e}")
            failures.append((slug, str(e)))
            continue

        mdx = REVIEWS_DIR / f"{slug}.mdx"
        if not mdx.exists():
            continue
        rel = f"/brand/produtos/{dest.name}"
        if update_frontmatter(mdx, rel):
            updated.append(slug)
            print(f"       MDX -> {rel}")

    print("\n=== RESUMO ===")
    print(f"Atualizados: {len(updated)}/{len(PRODUTOS)}")
    for s in updated:
        print(f"  + {s}")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
