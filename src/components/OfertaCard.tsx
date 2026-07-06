import Link from "next/link";
import type { Review } from "@/types/review";
import { EXTERNAL_LINK_REL } from "@/lib/constants";
import { RatingBadge } from "./RatingBadge";

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
    <article className="bg-bg border border-border rounded-xl overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5 flex flex-col">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={review.imagem}
          alt={review.produto}
          loading="lazy"
          className="w-full h-44 object-cover bg-bg-gray"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {desconto > 0 && (
            <span className="bg-danger text-white text-[0.7rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
              -{desconto}%
            </span>
          )}
          {review.emDestaque && (
            <span className="bg-accent text-black text-[0.65rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
              Oferta
            </span>
          )}
        </div>
        <span className="absolute bottom-2 right-2 bg-bg/90 backdrop-blur text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wide text-text-soft">
          {review.marketplace}
        </span>
      </div>

      <div className="p-3.5 flex flex-col flex-1">
        <span className="text-[0.65rem] font-bold text-primary uppercase tracking-wide">
          {review.categoria}
        </span>
        <Link href={`/reviews/${review.slug}`} className="block">
          <h3 className="text-sm font-bold my-1.5 leading-snug hover:text-primary min-h-[2.6rem]">
            {review.titulo}
          </h3>
        </Link>
        <RatingBadge nota={review.nota} />

        <div className="flex items-baseline gap-2 mt-2 mb-1">
          {review.precoOriginal && (
            <span className="text-xs text-text-muted line-through">
              de R$ {review.precoOriginal.toLocaleString("pt-BR")}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-extrabold text-text">
            R$ {review.preco.toLocaleString("pt-BR")}
          </span>
        </div>
        <span className="text-[0.7rem] text-text-muted mb-3">
          em até 12x de R$ {parcela.toLocaleString("pt-BR")} sem juros
        </span>

        <a
          href={review.linkAfiliado}
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
