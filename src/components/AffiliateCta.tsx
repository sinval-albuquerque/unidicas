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
  /** Preço atual (R$) — aceita número ou string. */
  preco?: number | string;
  /** Preço original riscado — aceita número ou string. */
  precoOriginal?: number | string;
  /** Marketplace. */
  marketplace?: string;
  /** URL da imagem. */
  imagem?: string;
}

function toNumber(v?: number | string): number | undefined {
  if (v === undefined || v === null) return undefined;
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : undefined;
}

function formatBRL(n?: number) {
  if (!n || !Number.isFinite(n)) return "";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

/**
 * Caixa de destaque para link de afiliado. Pode aparecer em 3 variantes:
 * - primary: card full-width destacado com borda lateral colorida
 * - sidebar: card lateral compacto
 * - inline: pílula simples
 */
export function AffiliateCta({
  variant = "primary",
  titulo = "Ver oferta",
  subtitulo,
  href,
  ctaLabel = "Ver oferta",
  produto,
  preco,
  precoOriginal,
  marketplace = "Mercado Livre",
  imagem,
}: AffiliateCtaProps) {
  const precoNum = toNumber(preco);
  const precoOriginalNum = toNumber(precoOriginal);
  const desconto =
    precoOriginalNum && precoNum && precoOriginalNum > precoNum
      ? Math.round(((precoOriginalNum - precoNum) / precoOriginalNum) * 100)
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
      <div className={`not-prose relative bg-bg rounded-xl border border-border shadow-soft overflow-hidden`}>
        <div className="flex items-center gap-1.5 bg-bg-alt px-4 py-2 border-b border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{marketplace}</span>
          {desconto > 0 && (
            <span className="ml-auto bg-danger/10 text-danger text-xs font-extrabold px-2 py-0.5 rounded-md">
              -{desconto}%
            </span>
          )}
        </div>

        <div className="p-4">
          {produto && (
            <h3 className="text-sm font-bold leading-snug text-text mb-2 line-clamp-2">
              {produto}
            </h3>
          )}

          <div className="flex items-baseline gap-2 mb-4">
            {precoNum !== undefined && (
              <span className="text-xl font-extrabold text-text">
                R$ {formatBRL(precoNum)}
              </span>
            )}
            {precoOriginalNum && precoOriginalNum > (precoNum ?? 0) && (
              <span className="text-xs text-text-muted line-through">
                R$ {formatBRL(precoOriginalNum)}
              </span>
            )}
          </div>

          <a
            href={href}
            target="_blank"
            rel={EXTERNAL_LINK_REL}
            className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg no-underline transition-all duration-200 text-sm"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    );
  }

  // === PRIMARY (full-width card) ===
  return (
    <aside
      className="not-prose my-8 bg-bg border border-border rounded-xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
              {marketplace ?? "Produto em destaque"}
            </p>
            {produto && (
              <h3 className="text-xl font-extrabold text-text">{produto}</h3>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-text-muted">Preço</p>
            {precoNum ? (
              <>
                <p className="text-2xl font-extrabold text-text">
                  R$ {formatBRL(precoNum)}
                </p>
                {precoOriginalNum && precoOriginalNum > precoNum && (
                  <p className="text-xs text-text-muted line-through">
                    de R$ {formatBRL(precoOriginalNum)}
                  </p>
                )}
                {desconto > 0 && (
                  <span className="inline-block mt-1 bg-danger text-white text-xs font-bold px-2 py-0.5 rounded">
                    -{desconto}%
                  </span>
                )}
              </>
            ) : (
              <p className="text-lg font-bold text-text-muted">Consulte</p>
            )}
          </div>
        </div>

        {subtitulo && (
          <div className="text-sm text-text-soft leading-relaxed mb-5">
            <p>{subtitulo}</p>
          </div>
        )}

        <a
          href={href}
          target="_blank"
          rel={EXTERNAL_LINK_REL}
          className="inline-flex items-center gap-2 bg-primary-dark hover:bg-primary text-white! font-bold px-5 py-2.5 rounded-lg no-underline transition"
        >
          {ctaLabel}
          <span aria-hidden>→</span>
        </a>
      </div>
    </aside>
  );
}
