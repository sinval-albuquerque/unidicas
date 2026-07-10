#!/usr/bin/env python3
"""
Finaliza as 3 fotos faltantes:
- bicicleta-spinning-mzy-15kg: URL real do ML achada em /ofertas/p1
- smartphone-galaxy-a07-256gb: Unsplash especifica (Samsung preto)
- iphone-16-256gb: Unsplash especifica (iPhone rosa)

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

# slug -> URL ou None (None = tenta Unsplash)
PRODUTOS = {
    "smartphone-galaxy-a07-256gb":   None,  # Unsplash (Samsung preto)
    "iphone-16-256gb":              None,  # Unsplash (iPhone rosa)
    "bicicleta-spinning-mzy-15kg":   "https://http2.mlstatic.com/D_Q_NP_2X_997574-MLA109633443994_042026-AB.webp",
}

# URLs Unsplash otimizadas com queries ESPECIFICAS
UNSPLASH = {
    "smartphone-galaxy-a07-256gb":  "https://images.unsplash.com/photo-1592899677977-2c797cd0d648?w=600&q=80",  # Samsung preto
    "iphone-16-256gb":             "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80",  # iPhone rosa/violeta
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
        if ml_url:
            url = ml_url
            print(f"  --> {slug}  <-  ML real")
        else:
            url = UNSPLASH[slug]
            print(f"  --> {slug}  <-  Unsplash especifica")

        ext = ext_from_url(url)
        dest = OUT_DIR / f"{slug}{ext}"
        try:
            size = download(url, dest)
            src = "ML" if ml_url else "Unsplash"
            print(f"       OK ({size//1024} KB, {src})")
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
