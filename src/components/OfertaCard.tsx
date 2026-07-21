import Link from "next/link";
import Image from "next/image";
import type { Review } from "@/types/review";
import { EXTERNAL_LINK_REL } from "@/lib/constants";
import { RatingBadge } from "./RatingBadge";
import { MarketplaceBadge } from "./MarketplaceBadge";

/**
 * Card de oferta — visual "Promobit-like" (claro, badge de desconto,
 * preço destacado, marketplace e CTA grande).
 *
 * Diferente do ReviewCard: este é mais "vitrine de oferta" e menos
 * "review editorial". Usado na página /ofertas.
 */
export function OfertaCard({ review }: { review: Review }) {
  const desconto = review.precoOriginal
    ? Math.round(
        ((review.precoOriginal - review.preco) / review.precoOriginal) * 100,
      )
    : 0;
  const parcela =
    review.preco >= 12 ? Math.max(1, Math.floor(review.preco / 12)) : review.preco;

  return (
    <article className="bg-bg border border-border rounded-xl overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-w-0">
      <div className="relative aspect-16/10 sm:aspect-auto sm:h-44 bg-bg-gray flex items-center justify-center overflow-hidden">
        {review.imagem ? (
          <Image
            src={review.imagem}
            alt={review.titulo}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2"
          />
        ) : (
          <span className="text-text-muted text-sm font-bold uppercase tracking-widest">
            {review.categoria}
          </span>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 max-w-[65%] z-10">
          {desconto > 0 && (
            <span className="bg-danger text-white text-[0.7rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
              -{desconto}%
            </span>
          )}
          {review.emDestaque && (
            <span className="bg-accent text-black text-[0.65rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
              Oferta
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2 max-w-[55%] z-10">
          <MarketplaceBadge
            nome={review.marketplace}
            link={review.linkAfiliado}
            asLink
            size="sm"
          />
        </div>
      </div>

      <div className="p-3.5 flex flex-col flex-1 min-w-0">
        <span className="text-[0.65rem] font-bold text-primary uppercase tracking-wide truncate">
          {review.categoria}
        </span>
        <Link href={`/reviews/${review.slug}`} className="block min-w-0">
          <h3 className="text-sm font-bold my-1.5 leading-snug hover:text-primary min-h-[2.6rem] sm:min-h-[3.2rem] text-balance break-words-anywhere">
            {review.titulo}
          </h3>
        </Link>
        <RatingBadge nota={review.nota} />

        <div className="flex items-baseline gap-2 mt-2 mb-1 min-w-0">
          {review.precoOriginal && (
            <span className="text-xs text-text-muted line-through whitespace-nowrap">
              de R$ {review.precoOriginal.toLocaleString("pt-BR")}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-1 min-w-0">
          <span className="text-xl sm:text-2xl font-extrabold text-text whitespace-nowrap">
            R$ {review.preco.toLocaleString("pt-BR")}
          </span>
        </div>
        <span className="text-[0.7rem] text-text-muted mb-3 break-words-anywhere">
          em até 12x de R$ {parcela.toLocaleString("pt-BR")} sem juros
        </span>

        <a
          href={review.linkAfiliado}
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
