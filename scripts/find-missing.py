#!/usr/bin/env python3
"""Para cada MLB alvo, busca em TODAS as páginas /ofertas/p[1-5]."""

import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ALVO = ["MLB54961556", "MLB1040287790", "MLB66517451"]

PATTERN_NORMAL = re.compile(r"https?://[^\s\"\\\'<>]+?mlstatic\.com/[^\s\"\\\'<>]+?\.(?:webp|jpg|jpeg|png)", re.IGNORECASE)
PATTERN_ESCAPED = re.compile(r"http2\\u002F\\u002Fmlstatic\\u002Fcom\\u002F[^\s\"\\\'<>]+?\.(?:webp|jpg|jpeg|png)", re.IGNORECASE)

def unescape(s):
    s = s.replace("\\u002F", "/").replace("\\/", "/")
    if not s.startswith("http"):
        s = "https://" + s
    return re.sub(r"-I(-W\d+)?\.(jpg|jpeg|png|webp)$", r"-O.\2", s, flags=re.IGNORECASE)


for mlb in ALVO:
    print(f"\n=== {mlb} ===")
    found_url = None
    for p in range(1, 6):
        path = ROOT / "scripts" / f"ofertas-p{p}.html"
        if not path.exists():
            continue
        html = path.read_text(encoding="utf-8", errors="ignore")
        imgs = []
        for m in PATTERN_NORMAL.finditer(html):
            imgs.append((m.start(), m.group(0)))
        for m in PATTERN_ESCAPED.finditer(html):
            imgs.append((m.start(), unescape(m.group(0))))
        imgs.sort()

        for m_pos in re.finditer(re.escape(mlb), html):
            pos = m_pos.start()
            candidates = [(p, img) for p, img in imgs if p > pos and p < pos + 5000]
            if candidates:
                _, img = candidates[0]
                # verifica se a URL não é propaganda
                if any(b in img.lower() for b in ("mercado-libre", "homesnw", "static/org")):
                    continue
                found_url = img
                print(f"  [p{p}] {img[:140]}")
                break
        if found_url:
            break
    if not found_url:
        print(f"  [FAIL] nao achou em 5 paginas")
