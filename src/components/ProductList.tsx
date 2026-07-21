import type { Review } from "@/types/review";
import { RatingBadge } from "./RatingBadge";
import { EXTERNAL_LINK_REL } from "@/lib/constants";
import { obterReviewPorSlug, obterReviewsPorCategoria } from "@/lib/reviews";

/**
 * Lista compacta de produtos para inserir DENTRO de uma matéria.
 * Mais leve visualmente que o ProductGrid — ideal para comparativos textuais.
 *
 * Uso no MDX (3 formas equivalentes):
 *
 *   <ProductList ids={["smartphone-galaxy-a36-256gb", "iphone-16-256gb"]} />
 *   <ProductList categoria="notebooks" limite={5} titulo="Top 5 notebooks" />
 *   <ProductList reviews={minhaLista} />
 */
export function ProductList({
  ids,
  reviews,
  categoria,
  limite = 5,
  titulo,
}: {
  ids?: string[];
  reviews?: Review[];
  categoria?: string;
  limite?: number;
  titulo?: string;
}) {
  let items: Review[] = [];

  if (reviews) {
    items = reviews;
  } else if (ids) {
    items = ids
      .map((slug) => obterReviewPorSlug(slug))
      .filter((r): r is Review => r !== undefined);
  } else if (categoria) {
    items = obterReviewsPorCategoria(categoria).slice(0, limite);
  }

  if (items.length === 0) return null;

  return (
    <div className="not-prose my-8">
      {titulo && (
        <h3 className="text-lg font-extrabold text-text mb-4 pb-2 border-b-2 border-border">
          {titulo}
        </h3>
      )}
      <ol className="space-y-3">
        {items.map((r, i) => {
          const desconto = r.precoOriginal
            ? Math.round(((r.precoOriginal - r.preco) / r.precoOriginal) * 100)
            : 0;
          return (
            <li
              key={r.slug}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-bg border border-border rounded-lg p-4"
            >
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-white text-sm font-extrabold flex items-center justify-center">
                {i + 1}
              </span>
              <div
                aria-hidden
                className="shrink-0 w-20 h-20 rounded-lg bg-bg-gray flex items-center justify-center"
              >
                <span className="text-[0.55rem] text-text-muted font-bold uppercase tracking-widest">
                  {r.categoria}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-primary font-bold">
                  {r.marketplace}
                </p>
                <p className="text-sm font-extrabold text-text leading-snug">
                  {r.titulo}
                </p>
                <p className="text-xs text-text-soft mt-1 line-clamp-2">
                  {r.resumo}
                </p>
                <div className="mt-1.5">
                  <RatingBadge nota={r.nota} />
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 shrink-0">
                <p className="text-lg font-extrabold text-text">
                  R$ {r.preco.toLocaleString("pt-BR")}
                </p>
                {desconto > 0 && (
                  <span className="bg-danger text-white text-[0.65rem] font-extrabold px-1.5 py-0.5 rounded">
                    -{desconto}%
                  </span>
                )}
                <a
                  href={r.linkAfiliado}
                  target="_blank"
                  rel={EXTERNAL_LINK_REL}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg no-underline transition whitespace-nowrap"
                >
                  Ver oferta →
                </a>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
