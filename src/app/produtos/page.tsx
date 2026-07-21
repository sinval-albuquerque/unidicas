import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/components/Sidebar";
import { ReviewList } from "@/components/ReviewList";
import {
  obterTodasReviews,
  obterReviewsEmDestaque,
  obterReviewsPorCategoria,
} from "@/lib/reviews";
import { obterTodasOfertas } from "@/lib/ofertas-content";
import { CATEGORIAS } from "@/lib/categorias";

import { EXTERNAL_LINK_REL } from "@/lib/constants";
import { MarketplaceBadge } from "@/components/MarketplaceBadge";

export const metadata = {
  title: "Catálogo de Produtos",
  description:
    "Todos os produtos analisados pela equipe Unidicas, com nota, preço e link para a melhor oferta.",
};

/** Catálogo geral de produtos (reviews + ofertas). */
export default function ProdutosPage() {
  const todos = obterTodasReviews();
  const destaques = obterReviewsEmDestaque();
  const ofertas = obterTodasOfertas();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Catálogo
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Todos os Produtos
        </h1>
        <p className="text-base text-text-soft max-w-2xl">
          {todos.length + ofertas.length} produtos entre reviews e ofertas. Filtre por
          categoria, ordene por nota ou use a busca para encontrar o que
          procura.
        </p>
      </header>

      {/* Filtro por categoria */}
      <nav className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/produtos"
          className="text-sm font-semibold px-3.5 py-1.5 rounded-full bg-primary text-white no-underline"
        >
          Todos ({todos.length + ofertas.length})
        </Link>
        {CATEGORIAS.map((c) => {
          const count = obterReviewsPorCategoria(c.slug).length;
          if (count === 0) return null;
          return (
            <Link
              key={c.slug}
              href={`/categorias/${c.slug}`}
              className="text-sm font-semibold px-3.5 py-1.5 rounded-full bg-bg-alt border border-border text-text-soft hover:border-primary hover:text-primary no-underline transition"
            >
              {c.nome} ({count})
            </Link>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {destaques.length > 0 && (
            <section>
              <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
                ⭐ Reviews em destaque
              </h2>
              <ReviewList reviews={destaques} />
            </section>
          )}

          <section>
            <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
              Reviews
            </h2>
            <ReviewList reviews={todos} />
          </section>

          {ofertas.length > 0 && (
            <section>
              <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border flex items-center gap-2">
                🔥 Ofertas
                <span className="text-sm font-normal text-text-muted font-mono">
                  ({ofertas.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ofertas.map((oferta) => {
                  const desconto = oferta.precoOriginal
                    ? Math.round(((oferta.precoOriginal - oferta.preco) / oferta.precoOriginal) * 100)
                    : 0;
                  return (
                    <article
                      key={oferta.slug}
                      className="bg-bg border border-border rounded-xl overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-w-0"
                    >
                      <a
                        href={oferta.linkAfiliado}
                        target="_blank"
                        rel={EXTERNAL_LINK_REL}
                        className="no-underline text-inherit flex flex-col flex-1"
                      >
                        <div className="relative aspect-16/10 sm:h-40 bg-bg-gray flex items-center justify-center overflow-hidden">
                          {oferta.imagem ? (
                            <Image
                              src={oferta.imagem}
                              alt={oferta.titulo}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-contain p-2"
                            />
                          ) : (
                            <span className="text-text-muted text-sm font-bold uppercase tracking-widest">
                              {oferta.categoria}
                            </span>
                          )}
                          <div className="absolute top-2 left-2 flex flex-col gap-1.5 max-w-[65%] z-10">
                            {desconto > 0 && (
                              <span className="bg-danger text-white text-[0.7rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
                                -{desconto}%
                              </span>
                            )}
                          </div>
                          <div className="absolute bottom-2 right-2 max-w-[55%] z-10">
                            <MarketplaceBadge nome={oferta.marketplace} size="sm" />
                          </div>
                        </div>

                        <div className="p-3.5 flex flex-col flex-1 min-w-0">
                          <span className="text-[0.65rem] font-bold text-primary uppercase tracking-wide truncate">
                            {oferta.categoria}
                          </span>
                          <h3 className="text-sm font-bold my-1.5 leading-snug text-text line-clamp-2 min-h-[2.6rem]">
                            {oferta.titulo}
                          </h3>

                          <div className="flex items-baseline gap-2 mt-auto pt-2">
                            {oferta.precoOriginal && (
                              <span className="text-xs text-text-muted line-through whitespace-nowrap">
                                de R$ {oferta.precoOriginal.toLocaleString("pt-BR")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl sm:text-2xl font-extrabold text-text whitespace-nowrap">
                              R$ {oferta.preco.toLocaleString("pt-BR")}
                            </span>
                          </div>

                          <span className="mt-3 block w-full text-center bg-success hover:bg-success/90 text-white py-2.5 rounded-lg font-bold text-sm transition whitespace-nowrap">
                            Pegar oferta →
                          </span>
                        </div>
                      </a>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
