import Link from "next/link";
import Image from "next/image";
import type { Review } from "@/types/review";
import { EXTERNAL_LINK_REL } from "@/lib/constants";
import { RatingBadge } from "./RatingBadge";
import { MarketplaceBadge } from "./MarketplaceBadge";
import { obterCategoria } from "@/lib/categorias";

/** Card de review reutilizavel com CTA de oferta. Estilo Linear/Stripe. */
export function ReviewCard({ review }: { review: Review }) {
  const desconto = review.precoOriginal
    ? Math.round(((review.precoOriginal - review.preco) / review.precoOriginal) * 100)
    : 0;

  const categoria = obterCategoria(review.categoria as never);

  return (
    <article className="group bg-bg border border-border rounded-2xl overflow-hidden hover-lift flex flex-col shadow-soft hover:shadow-floating min-w-0">
      <div className="relative aspect-[16/10] sm:aspect-auto sm:h-44 bg-bg-gray flex items-center justify-center overflow-hidden">
        {review.imagem ? (
          <Image
            src={review.imagem}
            alt={review.titulo}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 transition group-hover:scale-[1.02]"
          />
        ) : (
          <span className="text-text-muted text-sm font-bold uppercase tracking-widest">
            {review.categoria}
          </span>
        )}

        {/* Badges no canto superior — max-w impede estourar canto */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5 max-w-[60%] z-10">
          {review.emDestaque && (
            <span className="bg-accent text-bg-dark text-[0.65rem] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-soft whitespace-nowrap">
              ★ Destaque
            </span>
          )}
          {desconto > 0 && (
            <span className="bg-danger text-white text-[0.65rem] font-extrabold px-2.5 py-1 rounded-full shadow-soft whitespace-nowrap">
              -{desconto}%
            </span>
          )}
        </div>

        {/* Nota no canto inferior direito */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10">
          <RatingBadge nota={review.nota} compact />
        </div>

        {/* Overlay gradient sutil para legibilidade dos badges */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-[1]" />
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
        {categoria && (
          <Link
            href={`/categorias/${categoria.slug}`}
            className="text-[0.65rem] font-bold text-primary uppercase tracking-widest hover:text-primary-dark no-underline truncate"
          >
            {categoria.nome}
          </Link>
        )}
        <Link href={`/reviews/${review.slug}`} className="block mt-1.5 min-w-0">
          <h3 className="text-base font-bold leading-snug min-h-[2.6rem] sm:min-h-[3.2rem] text-text group-hover:text-primary transition text-balance break-words-anywhere">
            {review.titulo}
          </h3>
        </Link>

        <p className="text-xs sm:text-sm text-text-soft mt-2 mb-4 flex-1 line-clamp-2 leading-relaxed">
          {review.resumo}
        </p>

        {/* Preco + desconto — flex-wrap para nao estourar em mobile. */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5 mb-4 pb-4 border-b border-border min-w-0">
          <span className="text-xl sm:text-2xl font-extrabold text-text whitespace-nowrap">
            R$ {review.preco.toLocaleString("pt-BR")}
          </span>
          {review.precoOriginal && (
            <span className="text-xs text-text-muted line-through whitespace-nowrap">
              R$ {review.precoOriginal.toLocaleString("pt-BR")}
            </span>
          )}
          {review.marketplace && (
            <span className="ml-auto shrink-0 max-w-full truncate">
              <MarketplaceBadge
                nome={review.marketplace}
                link={review.linkAfiliado}
                asLink
                size="sm"
              />
            </span>
          )}
        </div>

        <a
          href={review.linkAfiliado}
          rel={EXTERNAL_LINK_REL}
          target="_blank"
          className="block text-center bg-success hover:bg-success-dark text-white py-2.5 rounded-xl font-bold text-sm transition shadow-soft hover:shadow-elevated whitespace-nowrap"
        >
          Ver oferta →
        </a>
      </div>
    </article>
  );
}
