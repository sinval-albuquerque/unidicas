import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { OfertaCuratedCard } from "@/components/OfertaCuratedCard";
import { OfertaCard } from "@/components/OfertaCard";
import { OfertaSidebar } from "@/components/OfertaSidebar";
import { obterOfertasAtivas } from "@/lib/ofertas-db";
import { obterTodasReviews } from "@/lib/reviews";
import { scrapingPrecosLive } from "@/lib/scrape-ofertas";
import {
  AFILIADO_ML_PERFIL_URL,
  OFERTAS_ML_LABEL,
} from "@/lib/ofertas";
import { SITE_NAME } from "@/lib/constants";
import type { Oferta } from "@/types/oferta";

/**
 * Página /ofertas — SSR DINÂMICO.
 *
 * A cada requisição:
 *  1. Obtém metadados das ofertas (título, imagem, link) do MDX/Supabase
 *  2. Busca PREÇOS ATUALIZADOS via scraping ao vivo da listagem /c/ofertas
 *  3. Mescla os preços frescos com os dados editoriais
 *
 * Se o scraping falhar (ML fora do ar), usa os preços salvos — site nunca quebra.
 *
 * Cache:
 *  - O fetch da listagem do ML tem cache de 2 min (next.revalidate: 120)
 *  - A página em si NÃO tem cache (sem ISR) — cada visita vê dados frescos
 *
 * Por que não usar /items/API nem /p/MLB...?
 *  - /items/ → 403 de datacenter (produtos catalog)
 *  - /p/MLB... → account-verification (anti-bot)
 *  - /c/ofertas → ✅ 200 de QUALQUER IP, sempre funciona
 */

export const metadata: Metadata = {
  title: "Ofertas em destaque",
  description:
    "Ofertas curadas com link de afiliado Mercado Livre (Unidicas) — descontos verificados e rastreados.",
  alternates: { canonical: "/ofertas" },
  openGraph: {
    title: "Ofertas em destaque — Unidicas",
    description:
      "As melhores ofertas verificadas pelo Unidicas, com link de afiliado Mercado Livre.",
    type: "website",
  },
};

export default async function OfertasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";

  // 1. Obtém dados base das ofertas (MDX → Supabase fallback)
  const ofertasCuradas = await obterOfertasAtivas();

  // 2. Scrape preços ao vivo — ML + Amazon
  const precosLive = await scrapingPrecosLive(ofertasCuradas);

  // 3. Mescla preços frescos nos dados das ofertas
  const hoje = new Date().toISOString().split("T")[0];
  const ofertasComPrecosLive: Oferta[] = ofertasCuradas.map((oferta) => {
    // Tenta encontrar preço por mlbId (ML) ou asin (Amazon)
    const id = oferta.mlbId ?? oferta.asin;
    if (!id) return oferta;

    const live = precosLive.get(id);
    if (!live) return oferta;

    return {
      ...oferta,
      preco: live.preco,
      precoOriginal: live.precoOriginal ?? oferta.precoOriginal,
      verificadoEm: hoje,
    };
  });

  // 3.5. Filtra pela query de busca (se houver)
  const ofertasFiltradas: Oferta[] = query
    ? ofertasComPrecosLive.filter((o) => {
        const haystack = [
          o.titulo,
          o.produto,
          o.resumo,
          o.categoria,
          o.marketplace,
          ...(o.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
    : ofertasComPrecosLive;

  // 4. Reviews com desconto (fallback, igual antes)
  const reviews = obterTodasReviews()
    .filter((r) => r.precoOriginal && r.precoOriginal > r.preco)
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 6);

  // Pega a primeira oferta em destaque para o hero
  const ofertaHero = (query ? ofertasFiltradas : ofertasComPrecosLive).find(
    (o) => o.emDestaque,
  );

  return (
    <div className="bg-bg">
      {/* ===== Breadcrumb ===== */}
      <div className="border-b border-border bg-bg-alt">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-[0.65rem] sm:text-xs uppercase tracking-widest font-bold text-text-soft overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-primary no-underline shrink-0">
            {SITE_NAME}
          </Link>
          <span className="text-text-muted shrink-0">/</span>
          <span className="text-text truncate">Ofertas</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* ===== Hero estilo JC ===== */}
        <header className="mb-10">
          <span className="inline-flex items-center gap-1 text-[0.65rem] sm:text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/30 mb-4">
            🔥 Ofertas verificadas
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            {query
              ? `Resultados para “${q}”`
              : "Ofertas do dia — Mercado Livre & Amazon"}
          </h1>
          {query && (
            <p className="text-base text-text-soft max-w-2xl">
              {ofertasFiltradas.length === 0
                ? `Nenhuma oferta encontrada para “${q}”.`
                : `${ofertasFiltradas.length} oferta${
                    ofertasFiltradas.length === 1 ? "" : "s"
                  } encontrada${ofertasFiltradas.length === 1 ? "" : "s"} para “${q}”.`}
              {" "}
              <Link
                href="/ofertas"
                className="text-primary font-semibold no-underline hover:underline"
              >
                Ver todas as ofertas
              </Link>
            </p>
          )}
        </header>

        {/* ===== Conteúdo principal + Sidebar ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Coluna principal */}
          <div className="lg:col-span-8 min-w-0">
            {/* Oferta em destaque — hero card */}
            {ofertaHero && (
              <Link
                href={`/ofertas/${ofertaHero.slug}`}
                className="group block bg-bg border border-border rounded-2xl overflow-hidden mb-8 no-underline hover:shadow-floating transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  <div className="md:col-span-5 relative aspect-4/3 md:aspect-auto md:min-h-55 bg-bg-gray flex items-center justify-center p-4">
                    {ofertaHero.imagem ? (
                      <Image
                        src={ofertaHero.imagem}
                        alt={ofertaHero.titulo}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-contain p-3"
                      />
                    ) : (
                      <span className="text-text-muted text-sm font-bold uppercase">
                        {ofertaHero.produto}
                      </span>
                    )}
                    {ofertaHero.precoOriginal && (
                      <div className="absolute top-3 left-3 bg-danger text-white px-2.5 py-1.5 rounded-lg text-sm font-extrabold shadow-md">
                        -
                        {Math.round(
                          ((ofertaHero.precoOriginal - ofertaHero.preco) /
                            ofertaHero.precoOriginal) *
                            100,
                        )}
                        %
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-7 p-5 md:p-6 flex flex-col justify-center">
                    <span className="inline-block text-[0.6rem] font-bold text-primary uppercase tracking-wide mb-1">
                      {ofertaHero.marketplace}
                    </span>
                    <h2 className="text-lg md:text-xl font-extrabold text-text group-hover:text-primary transition leading-snug mb-2">
                      {ofertaHero.titulo}
                    </h2>
                    <p className="text-sm text-text-soft line-clamp-2 mb-3">
                      {ofertaHero.resumo}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl md:text-2xl font-extrabold text-primary">
                        R$ {ofertaHero.preco.toLocaleString("pt-BR")}
                      </span>
                      {ofertaHero.precoOriginal && (
                        <span className="text-sm text-text-muted line-through">
                          R$ {ofertaHero.precoOriginal.toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* ===== Grade de ofertas ===== */}
            {ofertasFiltradas.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-5 border-b border-border pb-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-text">
                      {query ? "Resultados da busca" : "Ofertas selecionadas"}
                    </h2>
                    <p className="text-sm text-text-soft mt-1">
                      {ofertasFiltradas.length} ofertas com preços
                      verificados
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {ofertasFiltradas.map((oferta) => (
                    <OfertaCuratedCard key={oferta.slug} oferta={oferta} />
                  ))}
                </div>
              </section>
            )}

            {/* ===== Fallback: reviews com desconto ===== */}
            {ofertasFiltradas.length === 0 && reviews.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-5 border-b border-border pb-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-text">
                      {query ? "Resultados da busca" : "Ofertas selecionadas"}
                    </h2>
                    <p className="text-sm text-text-soft mt-1">
                      {ofertasFiltradas.length} ofertas com preços
                      verificados
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {ofertasFiltradas.map((oferta) => (
                    <OfertaCuratedCard key={oferta.slug} oferta={oferta} />
                  ))}
                </div>
              </section>
            )}

            {/* ===== Fallback: reviews com desconto ===== */}
            {ofertasFiltradas.length === 0 && reviews.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-5 border-b border-border pb-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-text">
                      Reviews em promoção
                    </h2>
                    <p className="text-sm text-text-soft mt-1">
                      Produtos analisados que estão com desconto
                    </p>
                  </div>
                  <Link
                    href="/produtos"
                    className="text-sm font-semibold text-primary hover:underline shrink-0"
                  >
                    Ver todos →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {reviews.map((review) => (
                    <OfertaCard key={review.slug} review={review} />
                  ))}
                </div>
              </section>
            )}

            {/* ===== Vazio ===== */}
            {ofertasComPrecosLive.length === 0 && reviews.length === 0 && (
              <p className="text-text-soft">
                Nenhuma oferta no momento. Confira a lista oficial do{" "}
                {OFERTAS_ML_LABEL} acima.
              </p>
            )}

            {/* ===== Rodapé de transparência ===== */}
            <footer className="mt-10 pt-6 border-t border-border text-sm text-text-soft">
              <p>
                <strong>Transparência:</strong> este site usa links de afiliado{" "}
                <a
                  href={AFILIADO_ML_PERFIL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold underline"
                >
                  {OFERTAS_ML_LABEL} (unidicasofertas)
                </a>
                . Ao comprar por eles, o Unidicas recebe uma comissão, sem
                alterar o preço para você.
              </p>
            </footer>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-24">
              <OfertaSidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
