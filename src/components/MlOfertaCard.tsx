import type { MlItem } from "@/lib/ml";
import { EXTERNAL_LINK_REL } from "@/lib/constants";

/**
 * Card de oferta vindo do Mercado Livre.
 *
 * Diferente do `OfertaCard` (que renderiza `Review`), este aqui é mais
 * minimalista — sem rating, sem "pecas", só preço/desconto/frete.
 * É o "card Promobit-like" para items da API do ML.
 */
export function MlOfertaCard({ item }: { item: MlItem }) {
  const desconto = item.discountPercent ?? 0;
  const parcela = item.price >= 12 ? Math.floor(item.price / 12) : item.price;

  return (
    <article className="bg-bg border border-border rounded-xl overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5 flex flex-col">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumbnail}
          alt={item.title}
          loading="lazy"
          className="w-full h-44 object-contain bg-bg-gray p-3"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {desconto > 0 && (
            <span className="bg-danger text-white text-[0.7rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
              -{desconto}%
            </span>
          )}
          {item.freeShipping && (
            <span className="bg-success-soft text-success text-[0.65rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide border border-success/30">
              Frete grátis
            </span>
          )}
        </div>
        <span className="absolute bottom-2 right-2 bg-bg/90 backdrop-blur text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wide text-text-soft">
          Mercado Livre
        </span>
      </div>

      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="text-sm font-bold mb-2 leading-snug min-h-[2.6rem] line-clamp-2">
          {item.title}
        </h3>

        {item.originalPrice && (
          <span className="text-xs text-text-muted line-through">
            de R$ {item.originalPrice.toLocaleString("pt-BR")}
          </span>
        )}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-extrabold text-text">
            R$ {item.price.toLocaleString("pt-BR")}
          </span>
        </div>
        <span className="text-[0.7rem] text-text-muted mb-3">
          em até 12x de R$ {parcela.toLocaleString("pt-BR")} sem juros
        </span>

        <a
          href={item.affiliateUrl}
          rel={EXTERNAL_LINK_REL}
          target="_blank"
          className="mt-auto block text-center bg-success text-white py-2.5 rounded-lg font-bold text-sm hover:bg-success/90 transition"
        >
          Pegar oferta →
        </a>
      </div>
    </article>
  );
}
