#!/usr/bin/env python3
"""Tenta API ML para pegar URLs de imagem dos 3 produtos faltantes."""
import urllib.request
import urllib.error
import urllib.parse
import json
import time

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

def get(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": UA, "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.reason}"
    except Exception as e:
        return f"ERR {e}"


for q in ["Galaxy A07 256GB preto", "iPhone 16 256GB rosa", "Bicicleta Spinning MZY 15kg"]:
    print(f"\n== search: {q} ==")
    r = get(f"https://api.mercadolibre.com/sites/MLB/search?q={urllib.parse.quote(q)}&condition=new&limit=3")
    if isinstance(r, str):
        print("  ", r)
    else:
        for x in r.get("results", [])[:3]:
            print(f"  {x['id']}: {x['title'][:60]}")
            print(f"    thumb: {x['thumbnail']}")
            print(f"    permalink: {x.get('permalink', '')[:90]}")
    time.sleep(0.5)
