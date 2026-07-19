import type { ReactNode } from "react";
import { EXTERNAL_LINK_REL } from "@/lib/constants";

function toNumber(v?: number | string): number | undefined {
  if (v === undefined || v === null) return undefined;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : undefined;
}

interface ProductCalloutProps {
  /** Nome do produto. */
  title: string;
  /** URL de afiliado (compra). */
  href: string;
  /** Preço atual (número ou string). */
  price?: number | string;
  /** Preço original (riscado, número ou string). */
  originalPrice?: number | string;
  /** Nome do marketplace. */
  marketplace?: string;
  /** Imagem do produto (opcional). */
  image?: string;
  /** "featured" = caixa grande; "compact" = caixa lateral; "inline" = inline discreto. */
  variant?: "featured" | "compact" | "inline";
  /** Texto customizado do botão. */
  ctaLabel?: string;
  /** Conteúdo descritivo (children do MDX). */
  children: ReactNode;
}

/**
 * Caixa de produto para inserir DENTRO de uma matéria.
 * Uso no MDX:
 *   <ProductCallout
 *     title="iPhone 15"
 *     href="https://..."
 *     price={6499}
 *     marketplace="Amazon"
 *     image="https://..."
 *   >
 *     Descrição do produto no meio da matéria.
 *   </ProductCallout>
 */
export function ProductCallout({
  title,
  href,
  price,
  originalPrice,
  marketplace,
  image,
  variant = "featured",
  ctaLabel = "Ver oferta",
  children,
}: ProductCalloutProps) {
  const priceNum = toNumber(price);
  const originalPriceNum = toNumber(originalPrice);
  const desconto =
    originalPriceNum && priceNum
      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
      : 0;

  if (variant === "inline") {
    return (
      <a
        href={href}
        target="_blank"
        rel={EXTERNAL_LINK_REL}
        className="not-prose inline-flex items-center gap-2 bg-primary-light border border-primary/20 hover:border-primary text-primary font-semibold rounded-full px-3 py-1.5 text-sm no-underline transition my-1"
      >
        <span aria-hidden>🛒</span>
        {title}
        {priceNum !== undefined && (
          <span className="text-text-soft font-normal">
            · R$ {priceNum.toLocaleString("pt-BR")}
          </span>
        )}
        <span aria-hidden>→</span>
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <aside className="not-prose my-6 flex gap-4 items-center bg-bg border border-border rounded-xl p-4">
        {image && (
          <div
            aria-hidden
            className="shrink-0 w-20 h-20 rounded-lg bg-bg-gray flex items-center justify-center"
          >
            <span className="text-[0.55rem] text-text-muted font-bold uppercase tracking-widest">
              {marketplace ?? "img"}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-primary font-bold">
            {marketplace ?? "Produto em destaque"}
          </p>
          <p className="text-base font-extrabold text-text truncate">{title}</p>
          {priceNum !== undefined && (
            <p className="text-sm font-bold text-success">
              R$ {priceNum.toLocaleString("pt-BR")}
              {originalPriceNum && (
                <span className="text-xs text-text-muted line-through ml-2 font-normal">
                  R$ {originalPriceNum.toLocaleString("pt-BR")}
                </span>
              )}
            </p>
          )}
        </div>
        <a
          href={href}
          target="_blank"
          rel={EXTERNAL_LINK_REL}
          className="shrink-0 bg-primary-dark hover:bg-primary text-white! text-sm font-bold px-4 py-2 rounded-lg no-underline transition"
        >
          {ctaLabel}
        </a>
      </aside>
    );
  }

  // featured (default)
  return (
    <aside className="not-prose my-8 bg-bg border border-border rounded-xl overflow-hidden">
      {image && (
        <div className="aspect-[16/7] overflow-hidden bg-bg-gray flex items-center justify-center">
          <span className="text-text-muted text-xs font-extrabold uppercase tracking-widest">
            {marketplace ?? "Produto em destaque"}
          </span>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
              {marketplace ?? "Produto em destaque"}
            </p>
            <h3 className="text-xl font-extrabold text-text">{title}</h3>
          </div>
          {priceNum !== undefined && (
            <div className="text-right shrink-0">
              <p className="text-xs text-text-muted">Preço</p>
              <p className="text-2xl font-extrabold text-text">
                R$ {priceNum.toLocaleString("pt-BR")}
              </p>
              {originalPriceNum && (
                <p className="text-xs text-text-muted line-through">
                  de R$ {originalPriceNum.toLocaleString("pt-BR")}
                </p>
              )}
              {desconto > 0 && (
                <span className="inline-block mt-1 bg-danger text-white text-xs font-bold px-2 py-0.5 rounded">
                  -{desconto}%
                </span>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-text-soft leading-relaxed mb-5">
          {children}
        </div>

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
