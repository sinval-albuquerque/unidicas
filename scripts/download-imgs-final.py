#!/usr/bin/env python3
"""
Baixa as 13 imagens REAIS dos produtos (a partir dos HTMLs /ofertas e
/c/celulares-e-telefones) e atualiza o frontmatter das MDX.

Para os 3 produtos que nao aparecem nos HTMLs (MLB54961556, MLB1040287790,
MLB66517451), tenta URLs candidatas; se nao conseguir, mantem a imagem
Unsplash (ja esta no MDX).
"""

import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Optional, Tuple

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "brand" / "produtos"
REVIEWS_DIR = ROOT / "src" / "content" / "reviews"

# slug -> URL real encontrada nos HTMLs (válida) OU lista de candidatas
PRODUTOS = {
    "smartphone-galaxy-a36-256gb":   "https://http2.mlstatic.com/D_Q_NP_2X_715950-MLA96109896729_102025-AB.webp",
    "smartphone-galaxy-a56-256gb":   "https://http2.mlstatic.com/D_Q_NP_2X_612560-MLA99968162739_112025-AB.webp",
    "smartphone-galaxy-a07-256gb":   None,  # nao achou
    "smartphone-galaxy-a17-5g-128gb":"https://http2.mlstatic.com/D_Q_NP_755351-MLA99597188918_122025-P.webp",
    "smartphone-galaxy-a57-5g-128gb":"https://http2.mlstatic.com/D_Q_NP_674017-MLA111971718964_062026-P.webp",
    "smartphone-moto-g35-256gb":     "https://http2.mlstatic.com/D_Q_NP_2X_679526-MLA100501405537_122025-AB.webp",
    "iphone-16-256gb":              None,  # nao achou
    "fone-xiaomi-redmi-buds-6-play":"https://http2.mlstatic.com/D_Q_NP_962148-MLA110999062523_042026-P.webp",
    "fone-soundcore-p30i-anker-anc":"https://http2.mlstatic.com/D_Q_NP_765871-MLA110158216168_042026-P.webp",
    "fone-dapon-h02d-bluetooth":     "https://http2.mlstatic.com/D_Q_NP_969271-MLA95133174731_102025-P.webp",
    "bicicleta-ergometrica-sevenfit":"https://http2.mlstatic.com/D_Q_NP_2X_806507-MLA92874967013_092025-AB.webp",
    "bicicleta-spinning-mzy-15kg":   None,  # nao achou
    "furadeira-parafusadeira-the-black-tools": "https://http2.mlstatic.com/D_Q_NP_2X_792011-MLA96077651979_102025-AB.webp",
}

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def download(url: str, dest: Path, timeout: int = 60) -> int:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Referer": "https://www.mercadolivre.com.br/",
            "Accept": "image/webp,image/*",
        },
    )
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

    for slug, url in PRODUTOS.items():
        if not url:
            print(f"  [---] {slug}: sem URL disponivel, mantem Unsplash")
            failures.append((slug, "sem URL"))
            continue
        ext = ext_from_url(url)
        dest = OUT_DIR / f"{slug}{ext}"
        print(f"  --> {slug}  <-  {url[:90]}")
        try:
            size = download(url, dest)
            print(f"       OK  {dest.name} ({size//1024} KB)")
        except urllib.error.HTTPError as e:
            print(f"       ERR HTTP {e.code}: {e.reason}")
            failures.append((slug, f"HTTP {e.code}"))
            continue
        except Exception as e:
            print(f"       ERR {e}")
            failures.append((slug, str(e)))
            continue

        mdx = REVIEWS_DIR / f"{slug}.mdx"
        if not mdx.exists():
            print(f"       WARN MDX nao existe, so salvei a imagem")
            continue
        rel = f"/brand/produtos/{dest.name}"
        if update_frontmatter(mdx, rel):
            updated.append(slug)
            print(f"       MDX -> {rel}")

    print("\n========== RESUMO ==========")
    print(f"Atualizados: {len(updated)}/{len(PRODUTOS)}")
    for s in updated:
        print(f"  + {s}")
    print(f"Falhas (mantem Unsplash): {len(failures)}")
    for s, err in failures:
        print(f"  ! {s}: {err}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
