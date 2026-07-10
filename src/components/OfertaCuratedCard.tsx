import type { Oferta } from "@/types/oferta";
import { EXTERNAL_LINK_REL } from "@/lib/constants";

/**
 * Card de oferta curada manualmente (vinda de src/content/ofertas/*.mdx).
 *
 * Mostra:
 *  - Imagem do produto
 *  - Badge de desconto (ex.: -26%) e tags (Frete Grátis, Liquida 7.7, etc.)
 *  - Marketplace
 *  - Preço original riscado + preço atual grande
 *  - Cupom se houver
 *  - CTA grande com link de afiliado rastreado
 */
export function OfertaCuratedCard({ oferta }: { oferta: Oferta }) {
  const desconto =
    oferta.precoOriginal && oferta.precoOriginal > oferta.preco
      ? Math.round(
          ((oferta.precoOriginal - oferta.preco) / oferta.precoOriginal) * 100,
        )
      : 0;
  const parcela =
    oferta.preco >= 12 ? Math.max(1, Math.floor(oferta.preco / 12)) : oferta.preco;

  return (
    <article className="bg-bg border border-border rounded-xl overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-w-0">
      <div className="relative aspect-[16/10] sm:aspect-auto sm:h-44 bg-bg-gray flex items-center justify-center">
        <span className="text-text-muted text-sm font-bold uppercase tracking-widest">
          {oferta.categoria}
        </span>
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 max-w-[65%]">
          {desconto > 0 && (
            <span className="bg-danger text-white text-[0.7rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
              -{desconto}%
            </span>
          )}
          {oferta.emDestaque && (
            <span className="bg-accent text-black text-[0.65rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
              Top
            </span>
          )}
          {oferta.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="bg-success-soft text-success text-[0.65rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide border border-success/30 whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="absolute bottom-2 right-2 bg-bg/90 backdrop-blur text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wide text-text-soft max-w-[55%] truncate">
          {oferta.marketplace}
        </span>
      </div>

      <div className="p-3.5 flex flex-col flex-1 min-w-0">
        <span className="text-[0.65rem] font-bold text-primary uppercase tracking-wide truncate">
          {oferta.categoria}
        </span>
        <h3 className="text-sm font-bold my-1.5 leading-snug min-h-[2.6rem] sm:min-h-[3.2rem] text-balance break-words-anywhere">
          {oferta.titulo}
        </h3>
        <p className="text-xs text-text-muted mb-2 flex-1 line-clamp-2 break-words-anywhere">
          {oferta.resumo}
        </p>

        {oferta.precoOriginal && (
          <span className="text-xs text-text-muted line-through whitespace-nowrap">
            de R$ {oferta.precoOriginal.toLocaleString("pt-BR")}
          </span>
        )}
        <div className="flex items-baseline gap-2 mb-1 min-w-0">
          <span className="text-xl sm:text-2xl font-extrabold text-text whitespace-nowrap">
            R$ {oferta.preco.toLocaleString("pt-BR")}
          </span>
        </div>
        <span className="text-[0.7rem] text-text-muted mb-2 break-words-anywhere">
          em até 12x de R$ {parcela.toLocaleString("pt-BR")} sem juros
        </span>

        {oferta.cupom && (
          <div className="bg-accent-soft border border-accent/40 rounded-md px-2.5 py-1.5 mb-3 text-[0.7rem] font-bold text-text truncate">
            <span aria-hidden>🎟️ </span>Cupom:{" "}
            <code className="font-mono">{oferta.cupom}</code>
          </div>
        )}

        <a
          href={oferta.linkAfiliado}
          rel={EXTERNAL_LINK_REL}
          target="_blank"
          className="mt-auto block text-center bg-success text-white py-2.5 rounded-lg font-bold text-sm hover:bg-success/90 transition whitespace-nowrap"
        >
          Pegar oferta →
        </a>
      </div>
    </article>
  );
}
