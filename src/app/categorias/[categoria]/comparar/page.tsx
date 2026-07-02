import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIAS, obterCategoria } from "@/lib/categorias";
import { obterReviewsPorCategoria } from "@/lib/reviews";
import { obterTabelaComparativa, obterMelhoresPorAtributo } from "@/lib/comparacoes";
import { ComparisonTable } from "@/components/ComparisonTable";
import { BestByAttributeCard } from "@/components/BestByAttributeCard";
import { AttributeRanking } from "@/components/AttributeRanking";

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
    title: `Comparar ${categoria.nome}`,
    description: `Tabela comparativa completa de ${categoria.nome.toLowerCase()}.`,
  };
}

/** Página de comparação: tabela + ranking por atributo + vencedor por atributo. */
export default async function CompararCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria: slug } = await params;
  const categoria = obterCategoria(slug);
  if (!categoria) notFound();

  const reviews = obterReviewsPorCategoria(categoria.slug);
  const tabela = obterTabelaComparativa(categoria.slug, reviews);
  const melhores = obterMelhoresPorAtributo(categoria, reviews);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary no-underline">
          Início
        </Link>{" "}
        /{" "}
        <Link
          href={`/categorias/${categoria.slug}`}
          className="hover:text-primary no-underline"
        >
          {categoria.nome}
        </Link>{" "}
        / <span className="text-text">Comparar</span>
      </nav>

      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Comparativo
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Comparativo: {categoria.nome}
        </h1>
        <p className="text-base text-text-soft max-w-2xl">
          {categoria.descricao} Compare os {reviews.length}{" "}
          {reviews.length === 1 ? "produto" : "produtos"} lado a lado e veja o
          vencedor de cada atributo.
        </p>
      </header>

      {reviews.length === 0 ? (
        <p className="text-text-muted text-center py-10">
          Nenhum produto cadastrado nesta categoria ainda.
        </p>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
              Tabela comparativa
            </h2>
            {tabela && <ComparisonTable tabela={tabela} />}
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
              Vencedor por atributo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {melhores.map((m) => (
                <BestByAttributeCard key={m.atributo.id} melhor={m} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
              Ranking por atributo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoria.atributos.map((atributo) => (
                <AttributeRanking
                  key={atributo.id}
                  atributo={atributo}
                  reviews={reviews}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
