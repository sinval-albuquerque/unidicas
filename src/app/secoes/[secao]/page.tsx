import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { obterSecao, SECOES, obterCategoriasPorSecao } from "@/lib/secoes";
import { obterReviewsPorCategoria } from "@/lib/reviews";
import { obterOfertasAtivas } from "@/lib/ofertas-db";
import { OfertaCuratedCard } from "@/components/OfertaCuratedCard";
import { SecaoBadge } from "@/components/SecaoBadge";
import { Sidebar } from "@/components/Sidebar";

export function generateStaticParams() {
  return SECOES.map((s) => ({ secao: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ secao: string }>;
}): Promise<Metadata> {
  const { secao: slug } = await params;
  const secao = obterSecao(slug);
  if (!secao) return { title: "Seção não encontrada" };
  return {
    title: secao.nome,
    description: secao.descricao,
  };
}

/** Página de seção: hero colorido + categorias da seção + reviews em destaque. */
export default async function SecaoPage({
  params,
}: {
  params: Promise<{ secao: string }>;
}) {
  const { secao: slug } = await params;
  const secao = obterSecao(slug);
  if (!secao) notFound();

  const categorias = obterCategoriasPorSecao(secao.slug);

  // Reviews em destaque de todas as categorias da seção
  const reviewsSecao = categorias.flatMap((c) => obterReviewsPorCategoria(c.slug));
  const destaques = reviewsSecao.filter((r) => r.emDestaque).slice(0, 3);
  const destaquesFinal = destaques.length > 0 ? destaques : reviewsSecao.slice(0, 3);

  // Ofertas ativas de todas as categorias da seção
  const slugsCategorias = new Set(categorias.map((c) => c.slug));
  const todasOfertas = await obterOfertasAtivas();
  const ofertasSecao = todasOfertas
    .filter((o) => slugsCategorias.has(o.categoria))
    .sort(
      (a, b) =>
        (b.precoOriginal && b.precoOriginal > b.preco ? b.precoOriginal - b.preco : 0) -
        (a.precoOriginal && a.precoOriginal > a.preco ? a.precoOriginal - a.preco : 0),
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary no-underline">
          Início
        </Link>{" "}
        /{" "}
        <Link href="/secoes" className="hover:text-primary no-underline">
          Seções
        </Link>{" "}
        / <span className="text-text">{secao.nome}</span>
      </nav>

      {/* Hero — borda esquerda colorida + badge (cor só em destaque) */}
      <header
        className="mb-10 pb-6 border-b border-border pl-6"
        style={{ borderLeft: `4px solid ${secao.cor}` }}
      >
        <SecaoBadge secao={secao} size="md" className="mb-3" />
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          {secao.nome}
        </h1>
        <p className="text-base text-text-soft max-w-2xl">{secao.descricao}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Categorias da seção */}
          <section>
            <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
              Categorias em {secao.nome}
            </h2>
            {categorias.length === 0 ? (
              <p className="text-text-muted text-center py-10">
                Nenhuma categoria publicada nesta seção ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categorias.map((c) => {
                  const reviews = obterReviewsPorCategoria(c.slug);
                  return (
                    <Link
                      key={c.slug}
                      href={`/categorias/${c.slug}`}
                      className="group block bg-bg border border-border rounded-xl p-5 hover:shadow-md transition no-underline"
                      style={{ borderTop: `3px solid ${secao.cor}` }}
                    >
                      <h3 className="text-lg font-extrabold text-text group-hover:text-primary mb-1.5">
                        {c.nome}
                      </h3>
                      <p className="text-sm text-text-soft mb-3 leading-relaxed line-clamp-2">
                        {c.descricao}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xs text-text-muted">
                          {reviews.length}{" "}
                          {reviews.length === 1 ? "review" : "reviews"}
                        </span>
                        <span className="text-sm font-semibold text-primary group-hover:underline">
                          Ver →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Ofertas da seção */}
          {ofertasSecao.length > 0 && (
            <section>
              <div className="flex items-end justify-between mb-4 pb-2 border-b-2 border-border">
                <h2 className="text-xl font-extrabold tracking-tight">
                  Ofertas em {secao.nome}
                </h2>
                <Link
                  href="/ofertas"
                  className="text-sm font-semibold text-primary hover:underline no-underline shrink-0"
                >
                  Ver todas →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ofertasSecao.slice(0, 6).map((oferta) => (
                  <OfertaCuratedCard key={oferta.slug} oferta={oferta} />
                ))}
              </div>
            </section>
          )}

          {/* Reviews em destaque da seção */}
          {destaquesFinal.length > 0 && (
            <section>
              <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
                Em destaque
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {destaquesFinal.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/reviews/${r.slug}`}
                    className="group block bg-bg border border-border rounded-xl overflow-hidden hover:shadow-md transition no-underline"
                  >
                    <div className="w-full h-32 bg-bg-gray flex items-center justify-center">
                      <span className="text-text-muted text-xs font-bold uppercase tracking-widest">
                        {r.categoria}
                      </span>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold leading-snug group-hover:text-primary line-clamp-2">
                        {r.titulo}
                      </h3>
                      <p className="text-xs text-text-muted mt-1">
                        ⭐ {r.nota.toFixed(1)} · R$ {r.preco.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <Sidebar />
      </div>
    </div>
  );
}