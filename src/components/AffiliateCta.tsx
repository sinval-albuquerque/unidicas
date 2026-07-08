import { EXTERNAL_LINK_REL } from "@/lib/constants";

interface AffiliateCtaProps {
  /** Variante visual. "primary" = full width destacado; "sidebar" = card lateral; "inline" = pílula. */
  variant?: "primary" | "sidebar" | "inline";
  /** Título da caixa. */
  titulo?: string;
  /** Subtítulo (opcional). */
  subtitulo?: string;
  /** URL de afiliado. */
  href: string;
  /** Texto do botão. */
  ctaLabel?: string;
  /** Nome do produto. */
  produto?: string;
  /** Preço atual (R$). */
  preco?: number;
  /** Preço original riscado. */
  precoOriginal?: number;
  /** Marketplace. */
  marketplace?: string;
  /** URL da imagem. */
  imagem?: string;
}

function formatBRL(n?: number) {
  if (!n || !Number.isFinite(n)) return "";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

/**
 * Caixa de destaque para link de afiliado. Pode aparecer em 3 variantes:
 * - primary: box hero, full-width, com imagem + preço + CTA grande
 * - sidebar: card lateral sticky, com imagem menor
 * - inline: pílula compacta
 */
export function AffiliateCta({
  variant = "primary",
  titulo = "Ver oferta",
  subtitulo,
  href,
  ctaLabel = "Ver oferta →",
  produto,
  preco,
  precoOriginal,
  marketplace = "Mercado Livre",
  imagem,
}: AffiliateCtaProps) {
  const desconto =
    precoOriginal && preco && precoOriginal > preco
      ? Math.round(((precoOriginal - preco) / precoOriginal) * 100)
      : 0;

  // === INLINE ===
  if (variant === "inline") {
    return (
      <a
        href={href}
        target="_blank"
        rel={EXTERNAL_LINK_REL}
        className="not-prose inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-bg-dark font-bold rounded-full px-4 py-2 text-sm no-underline transition shadow-soft hover:shadow-elevated my-2"
      >
        <span aria-hidden>🔥</span>
        {produto ? `Ver ${produto} ` : ctaLabel}
      </a>
    );
  }

  // === SIDEBAR ===
  if (variant === "sidebar") {
    return (
      <div className="not-prose relative bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-floating overflow-hidden hover-lift">
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-accent text-bg-dark text-[0.65rem] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest z-10">
          ★ Oferta
        </div>

        {imagem && (
          <div className="aspect-[16/10] bg-white/10 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagem}
              alt={produto ?? "Produto"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-5">
          <p className="text-xs uppercase tracking-widest text-white/70 font-bold mb-2">
            {titulo}
          </p>
          {produto && (
            <h3 className="text-base font-extrabold leading-tight mb-3 line-clamp-2">
              {produto}
            </h3>
          )}

          <div className="flex items-baseline gap-2 mb-4">
            {preco !== undefined && (
              <span className="text-2xl font-extrabold">
                R$ {formatBRL(preco)}
              </span>
            )}
            {precoOriginal && precoOriginal > (preco ?? 0) && (
              <span className="text-xs text-white/60 line-through">
                R$ {formatBRL(precoOriginal)}
              </span>
            )}
            {desconto > 0 && (
              <span className="ml-auto bg-danger text-white text-xs font-extrabold px-2 py-1 rounded-md">
                -{desconto}%
              </span>
            )}
          </div>

          <a
            href={href}
            target="_blank"
            rel={EXTERNAL_LINK_REL}
            className="block text-center bg-accent hover:bg-accent/90 text-bg-dark font-extrabold py-3 rounded-xl no-underline transition shadow-soft hover:shadow-elevated"
          >
            {ctaLabel}
          </a>

          <p className="text-[0.65rem] text-white/60 text-center mt-2">
            Link afiliado • {marketplace}
          </p>
        </div>
      </div>
    );
  }

  // === PRIMARY (full-width hero) ===
  return (
    <div className="not-prose relative bg-gradient-to-br from-primary via-primary to-primary-dark text-white rounded-2xl shadow-pop overflow-hidden">
      {/* Brilho decorativo */}
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
      />

      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 p-6 md:p-8">
        {/* Texto */}
        <div className="md:col-span-3 flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 bg-accent text-bg-dark text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-4 self-start">
            🔥 {titulo}
          </div>

          {produto && (
            <h3 className="text-xl md:text-2xl font-extrabold leading-tight mb-3">
              {produto}
            </h3>
          )}

          {subtitulo && (
            <p className="text-white/80 text-sm md:text-base mb-5 leading-relaxed">
              {subtitulo}
            </p>
          )}

          <div className="flex flex-wrap items-baseline gap-3 mb-5">
            {preco !== undefined && (
              <span className="text-3xl md:text-4xl font-extrabold">
                R$ {formatBRL(preco)}
              </span>
            )}
            {precoOriginal && precoOriginal > (preco ?? 0) && (
              <span className="text-base text-white/60 line-through">
                R$ {formatBRL(precoOriginal)}
              </span>
            )}
            {desconto > 0 && (
              <span className="bg-danger text-white text-sm font-extrabold px-3 py-1 rounded-md">
                -{desconto}% OFF
              </span>
            )}
          </div>

          <a
            href={href}
            target="_blank"
            rel={EXTERNAL_LINK_REL}
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-bg-dark font-extrabold text-base px-6 py-3.5 rounded-xl no-underline transition shadow-soft hover:shadow-elevated self-start"
          >
            {ctaLabel}
            <span aria-hidden>→</span>
          </a>

          <p className="text-[0.65rem] text-white/60 mt-3">
            Link de afiliado • {marketplace} • Preço e estoque sujeitos a alteração
          </p>
        </div>

        {/* Imagem */}
        {imagem && (
          <div className="md:col-span-2 flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-[280px] bg-white/10 rounded-2xl overflow-hidden shadow-pop">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagem}
                alt={produto ?? "Produto"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
