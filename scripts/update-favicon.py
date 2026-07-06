"""Processa o logo enviado e gera favicon.ico + icon.png com fundo transparente.

Entrada: src/app/logo unidicas.PNG
Saídas:
  - src/app/icon.png          (512x512, fundo transparente, PNG)
  - src/app/favicon.ico       (multi-tamanho: 16, 32, 48, 64, 128, 256)
"""

from PIL import Image

SRC = r"C:\Users\Sinval\Projetos\unidicas\src\app\logo unidicas.PNG"
ICON_PNG = r"C:\Users\Sinval\Projetos\unidicas\src\app\icon.png"
FAVICON_ICO = r"C:\Users\Sinval\Projetos\unidicas\src\app\favicon.ico"

# Limiar: pixels mais brancos que isso viram transparentes
WHITE_THRESHOLD = 245


def remove_white_bg(im: Image.Image) -> Image.Image:
    """Converte fundo branco (ou quase-branco) em transparente."""
    im = im.convert("RGBA")
    pixels = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
                pixels[x, y] = (r, g, b, 0)
    return im


def main() -> None:
    print(f"Carregando {SRC} ...")
    src = Image.open(SRC)
    print(f"  tamanho original: {src.size}, modo: {src.mode}")

    # 1) Gera icon.png em 512x512 com fundo transparente
    icon = remove_white_bg(src)
    icon_512 = icon.resize((512, 512), Image.LANCZOS)
    icon_512.save(ICON_PNG, format="PNG", optimize=True)
    print(f"  -> {ICON_PNG} (512x512)")

    # 2) Gera favicon.ico com múltiplos tamanhos (fundo transparente)
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    favicon_frames = [icon.resize(s, Image.LANCZOS) for s in sizes]
    favicon_frames[0].save(
        FAVICON_ICO,
        format="ICO",
        sizes=sizes,
        append_images=favicon_frames[1:],
    )
    print(f"  -> {FAVICON_ICO} {sizes}")


if __name__ == "__main__":
    main()
