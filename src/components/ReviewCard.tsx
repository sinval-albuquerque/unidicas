import Link from "next/link";
import type { Review } from "@/types/review";
import { EXTERNAL_LINK_REL } from "@/lib/constants";
import { RatingBadge } from "./RatingBadge";
import { obterCategoria } from "@/lib/categorias";

/** Card de review reutilizavel com CTA de oferta. Estilo Linear/Stripe. */
export function ReviewCard({ review }: { review: Review }) {
  const desconto = review.precoOriginal
    ? Math.round(((review.precoOriginal - review.preco) / review.precoOriginal) * 100)
    : 0;

  const categoria = obterCategoria(review.categoria as never);

  return (
    <article className="group bg-bg border border-border rounded-2xl overflow-hidden hover-lift flex flex-col shadow-soft hover:shadow-floating">
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={review.imagem}
          alt={review.produto}
          className="w-full h-44 object-cover bg-bg-gray transition duration-500 group-hover:scale-[1.05]"
        />

        {/* Badges no canto superior */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {review.emDestaque && (
            <span className="bg-accent text-bg-dark text-[0.65rem] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-soft">
              ★ Destaque
            </span>
          )}
          {desconto > 0 && (
            <span className="bg-danger text-white text-[0.65rem] font-extrabold px-2.5 py-1 rounded-full shadow-soft">
              -{desconto}%
            </span>
          )}
        </div>

        {/* Nota no canto inferior direito */}
        <div className="absolute bottom-3 right-3">
          <RatingBadge nota={review.nota} compact />
        </div>

        {/* Overlay gradient sutil para legibilidade dos badges */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        {categoria && (
          <Link
            href={`/categorias/${categoria.slug}`}
            className="text-[0.65rem] font-bold text-primary uppercase tracking-widest hover:text-primary-dark no-underline"
          >
            {categoria.nome}
          </Link>
        )}
        <Link href={`/reviews/${review.slug}`} className="block mt-1.5">
          <h3 className="text-base font-bold leading-snug min-h-[2.6rem] text-text group-hover:text-primary transition">
            {review.titulo}
          </h3>
        </Link>

        <p className="text-xs text-text-soft mt-2 mb-4 flex-1 line-clamp-2 leading-relaxed">
          {review.resumo}
        </p>

        {/* Preco + desconto */}
        <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-border">
          <span className="text-2xl font-extrabold text-text">
            R$ {review.preco.toLocaleString("pt-BR")}
          </span>
          {review.precoOriginal && (
            <span className="text-xs text-text-muted line-through">
              R$ {review.precoOriginal.toLocaleString("pt-BR")}
            </span>
          )}
          {review.marketplace && (
            <span className="ml-auto text-[0.65rem] font-semibold text-text-muted uppercase">
              {review.marketplace}
            </span>
          )}
        </div>

        <a
          href={review.linkAfiliado}
          rel={EXTERNAL_LINK_REL}
          target="_blank"
          className="block text-center bg-success hover:bg-success-dark text-white py-2.5 rounded-xl font-bold text-sm transition shadow-soft hover:shadow-elevated"
        >
          Ver oferta →
        </a>
      </div>
    </article>
  );
}
