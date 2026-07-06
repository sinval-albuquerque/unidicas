"""
Converte public/brand/logo.svg em PNG e WebP com fundo transparente.
Saídas: public/brand/logo.png e public/brand/logo.webp
"""
from pathlib import Path
from io import BytesIO

from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM, renderPDF
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SVG_PATH = ROOT / "public" / "brand" / "logo.svg"
PNG_PATH = ROOT / "public" / "brand" / "logo.png"
WEBP_PATH = ROOT / "public" / "brand" / "logo.webp"
TMP_PNG = ROOT / "public" / "brand" / "_logo-render.png"

# Tamanho alvo: 560x260 (proporção ~2.15:1 que o componente <Logo/> espera)
TARGET_W = 560
TARGET_H = 260

drawing = svg2rlg(str(SVG_PATH))
if drawing is None:
    raise SystemExit(f"Falha ao ler {SVG_PATH}")

# Escala para o tamanho alvo mantendo a viewBox 100x100 do SVG
scale = TARGET_W / drawing.width
drawing.width = TARGET_W
drawing.height = TARGET_H
drawing.scale(scale, scale)

# Renderiza para PNG (fundo transparente porque o SVG não tem background)
renderPM.drawToFile(drawing, str(TMP_PNG), fmt="PNG", bg=None, configPIL={"transparent": True})

# Reabre com Pillow para garantir transparência e converter para WebP
img = Image.open(TMP_PNG).convert("RGBA")
img.save(PNG_PATH, "PNG", optimize=True)
img.save(WEBP_PATH, "WEBP", quality=92, method=6)

# Limpa temporário
TMP_PNG.unlink(missing_ok=True)

print(f"OK: {PNG_PATH.relative_to(ROOT)}  ({PNG_PATH.stat().st_size} bytes)")
print(f"OK: {WEBP_PATH.relative_to(ROOT)} ({WEBP_PATH.stat().st_size} bytes)")
print(f"   dimensões: {img.size[0]}x{img.size[1]}")
