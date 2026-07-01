import Link from "next/link";
import type { Review } from "@/types/review";
import { EXTERNAL_LINK_REL } from "@/lib/constants";
import { RatingBadge } from "./RatingBadge";

/** Card de review reutilizável com CTA de oferta. */
export function ReviewCard({ review }: { review: Review }) {
  const desconto = review.precoOriginal
    ? Math.round(((review.precoOriginal - review.preco) / review.precoOriginal) * 100)
    : 0;

  return (
    <article className="bg-bg border border-border rounded-xl overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5 flex flex-col">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={review.imagem}
          alt={review.produto}
          className="w-full h-40 object-cover bg-bg-gray"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {review.emDestaque && (
            <span className="bg-accent text-black text-[0.65rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
              Destaque
            </span>
          )}
          {desconto > 0 && (
            <span className="bg-danger text-white text-[0.65rem] font-extrabold px-2 py-0.5 rounded">
              -{desconto}%
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 flex flex-col flex-1">
        <span className="text-[0.65rem] font-bold text-primary uppercase tracking-wide">
          {review.categoria}
        </span>
        <Link href={`/reviews/${review.slug}`} className="block">
          <h3 className="text-sm font-bold my-1.5 leading-snug min-h-[2.6rem] hover:text-primary">
            {review.titulo}
          </h3>
        </Link>
        <RatingBadge nota={review.nota} />
        <p className="text-xs text-text-muted my-2 flex-1">{review.resumo}</p>

        <div className="flex items-baseline gap-2 mb-2.5">
          <span className="text-lg font-extrabold">
            R$ {review.preco.toLocaleString("pt-BR")}
          </span>
          {review.precoOriginal && (
            <span className="text-xs text-text-muted line-through">
              R$ {review.precoOriginal.toLocaleString("pt-BR")}
            </span>
          )}
        </div>

        <a
          href={review.linkAfiliado}
          rel={EXTERNAL_LINK_REL}
          target="_blank"
          className="block text-center bg-success text-white py-2 rounded-lg font-bold text-sm hover:bg-success/90 transition"
        >
          Ver produto →
        </a>
      </div>
    </article>
  );
}