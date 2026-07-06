import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { obterCategoria, CATEGORIAS } from "@/lib/categorias";
import { obterReviewsPorCategoria } from "@/lib/reviews";
import { obterMelhoresPorAtributo } from "@/lib/comparacoes";
import { obterSecao } from "@/lib/secoes";
import { SecaoBadge } from "@/components/SecaoBadge";
import { ReviewList } from "@/components/ReviewList";
import { BestByAttributeCard } from "@/components/BestByAttributeCard";
import { Sidebar } from "@/components/Sidebar";

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria: slug } = await params;
  const categoria = obterCategoria(slug);
  if (!categoria) return { title: "Categoria não encontrada" };
  return {
    title: categoria.nome,
    description: categoria.descricao,
  };
}

/** Página de categoria: hero, melhores por atributo, reviews, comparativo. */
export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria: slug } = await params;
  const categoria = obterCategoria(slug);
  if (!categoria) notFound();

  const reviews = obterReviewsPorCategoria(categoria.slug);
  const melhores = obterMelhoresPorAtributo(categoria, reviews);
  const secao = obterSecao(categoria.secao);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary no-underline">
          Início
        </Link>{" "}
        /{" "}
        {secao && (
          <>
            <Link href={`/secoes/${secao.slug}`} className="hover:text-primary no-underline">
              {secao.nome}
            </Link>{" "}
            /{" "}
          </>
        )}
        <span className="text-text">{categoria.nome}</span>
      </nav>

      <header
        className="mb-10 pb-6 border-b border-border pl-6"
        style={secao ? { borderLeft: `4px solid ${secao.cor}` } : undefined}
      >
        {secao && <SecaoBadge secao={secao} link size="md" className="mb-3" />}
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Categoria
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          {categoria.nome}
        </h1>
        <p className="text-base text-text-soft max-w-2xl mb-4">
          {categoria.descricao}
        </p>
        {reviews.length > 0 && (
          <Link
            href={`/categorias/${categoria.slug}/comparar`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary no-underline hover:underline"
          >
            Ver comparativo completo lado a lado →
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {melhores.length > 0 && (
            <section>
              <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
                Melhores por atributo
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {melhores.map((m) => (
                  <BestByAttributeCard key={m.atributo.id} melhor={m} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
              Reviews em {categoria.nome}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-text-muted text-center py-10">
                Nenhuma review publicada nesta categoria ainda.
              </p>
            ) : (
              <ReviewList reviews={reviews} />
            )}
          </section>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
