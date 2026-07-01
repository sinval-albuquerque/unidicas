import type { Review } from "@/types/review";
import { ReviewCard } from "./ReviewCard";

/**
 * Grade de produtos para inserir DENTRO de uma matéria.
 * Mostra N produtos (1-3 colunas) com cards visuais completos.
 *
 * Uso no MDX (3 formas equivalentes):
 *
 *   <ProductGrid ids={["fone-bluetooth-anc", "fone-studio-qualidade"]} />
 *   <ProductGrid categoria="fones" limite={3} titulo="Melhores fones" />
 *   <ProductGrid reviews={minhaLista} />
 */
export function ProductGrid({
  ids,
  reviews,
  categoria,
  limite = 3,
  titulo,
}: {
  /** Slugs específicos para mostrar. */
  ids?: string[];
  /** Reviews pré-filtradas (alternativa a ids/categoria). */
  reviews?: Review[];
  /** Slug da categoria — pega os melhores por nota. */
  categoria?: string;
  /** Quantos produtos exibir quando usar `categoria` (padrão 3). */
  limite?: number;
  /** Título opcional acima do grid. */
  titulo?: string;
}) {
  if (reviews) {
    return (
      <Wrap titulo={titulo}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r.slug} review={r} />
          ))}
        </div>
      </Wrap>
    );
  }

  if (ids) {
    return (
      <ProductGridFromIds ids={ids} titulo={titulo} />
    );
  }

  if (categoria) {
    return (
      <ProductGridFromCategoria categoria={categoria} limite={limite} titulo={titulo} />
    );
  }

  return null;
}

// Sub-componentes server-side que usam fs/readFileSync
import { obterReviewPorSlug, obterReviewsPorCategoria } from "@/lib/reviews";

function ProductGridFromIds({ ids, titulo }: { ids: string[]; titulo?: string }) {
  const items = ids
    .map((slug) => obterReviewPorSlug(slug))
    .filter((r): r is Review => r !== undefined);
  if (items.length === 0) return null;
  return (
    <Wrap titulo={titulo}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((r) => (
          <ReviewCard key={r.slug} review={r} />
        ))}
      </div>
    </Wrap>
  );
}

function ProductGridFromCategoria({
  categoria,
  limite,
  titulo,
}: {
  categoria: string;
  limite: number;
  titulo?: string;
}) {
  const items = obterReviewsPorCategoria(categoria).slice(0, limite);
  if (items.length === 0) return null;
  return (
    <Wrap titulo={titulo}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((r) => (
          <ReviewCard key={r.slug} review={r} />
        ))}
      </div>
    </Wrap>
  );
}

function Wrap({ titulo, children }: { titulo?: string; children: React.ReactNode }) {
  return (
    <div className="not-prose my-8">
      {titulo && (
        <h3 className="text-lg font-extrabold text-text mb-4 pb-2 border-b-2 border-border">
          {titulo}
        </h3>
      )}
      {children}
    </div>
  );
}
