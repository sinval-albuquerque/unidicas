import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { ReviewList } from "@/components/ReviewList";
import {
  obterTodasReviews,
  obterReviewsEmDestaque,
  obterReviewsPorCategoria,
} from "@/lib/reviews";
import { CATEGORIAS } from "@/lib/categorias";
import { BestByAttributeCard } from "@/components/BestByAttributeCard";
import { obterMelhoresPorAtributo } from "@/lib/comparacoes";

export const metadata = {
  title: "Catálogo de Produtos",
  description:
    "Todos os produtos analisados pela equipe Unidicas, com nota, preço e link para a melhor oferta.",
};

/** Catálogo geral de produtos (todas as reviews) com sidebar e filtro. */
export default function ProdutosPage() {
  const todos = obterTodasReviews();
  const destaques = obterReviewsEmDestaque();

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
          {todos.length} produtos analisados de forma independente. Filtre por
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
          Todos ({todos.length})
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
                ⭐ Em destaque
              </h2>
              <ReviewList reviews={destaques} />
            </section>
          )}

          <section>
            <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
              Catálogo completo
            </h2>
            <ReviewList reviews={todos} />
          </section>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
