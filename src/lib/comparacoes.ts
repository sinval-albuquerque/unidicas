import type {
  AtributoComparacao,
  Categoria,
  CategoriaSlug,
  LinhaComparativa,
  MelhorPorAtributo,
  Review,
  TabelaComparativa,
} from "@/types/review";
import { obterCategoria } from "@/lib/categorias";
import { obterReviewsPorCategoria } from "@/lib/reviews";

/**
 * Lógica de comparação entre produtos de uma categoria.
 * Todas as funções são PURAS e testáveis isoladamente.
 */

/**
 * Ordena reviews por um atributo, respeitando a regra maiorMelhor.
 * Empate: desempata por nota geral decrescente, depois por menor preço.
 */
export function ordenarPorAtributo(
  reviews: Review[],
  atributo: AtributoComparacao,
): Review[] {
  const comValor = reviews.filter((r) => atributo.id in r.atributos);
  const direcao = atributo.maiorMelhor ? -1 : 1;

  return [...comValor].sort((a, b) => {
    const va = a.atributos[atributo.id];
    const vb = b.atributos[atributo.id];
    if (va !== vb) return (va - vb) * direcao;
    // Desempate 1: nota geral (maior primeiro)
    if (b.nota !== a.nota) return b.nota - a.nota;
    // Desempate 2: menor preço primeiro
    return a.preco - b.preco;
  });
}

/** Retorna o vencedor de um atributo dentro de uma lista de reviews. */
export function obterMelhorPorAtributo(
  reviews: Review[],
  atributo: AtributoComparacao,
): MelhorPorAtributo | undefined {
  const ordenadas = ordenarPorAtributo(reviews, atributo);
  const vencedor = ordenadas[0];
  if (!vencedor) return undefined;
  return {
    atributo,
    review: vencedor,
    valor: vencedor.atributos[atributo.id],
  };
}

/** Retorna o vencedor de cada atributo da categoria. */
export function obterMelhoresPorAtributo(categoria: Categoria, reviews: Review[]): MelhorPorAtributo[] {
  return categoria.atributos
    .map((atributo) => obterMelhorPorAtributo(reviews, atributo))
    .filter((m): m is MelhorPorAtributo => m !== undefined);
}

/** Constrói a tabela comparativa completa de uma categoria. */
export function obterTabelaComparativa(
  categoriaSlug: CategoriaSlug,
  reviews?: Review[],
): TabelaComparativa | undefined {
  const categoria = obterCategoria(categoriaSlug);
  if (!categoria) return undefined;

  const lista = reviews ?? obterReviewsPorCategoria(categoriaSlug);

  const linhas: LinhaComparativa[] = categoria.atributos.map((atributo) => {
    const ordenadas = ordenarPorAtributo(lista, atributo);
    const vencedorId = ordenadas[0]?.slug;
    const valores = ordenadas.map((review) => ({
      review,
      valor: review.atributos[atributo.id] ?? 0,
      vencedor: review.slug === vencedorId,
    }));
    return { atributo, valores };
  });

  return { categoria, reviews: ordenadasPorNota(lista), linhas };
}

/** Helper: ordena por nota decrescente (não muta a entrada). */
function ordenadasPorNota(reviews: Review[]): Review[] {
  return [...reviews].sort((a, b) => b.nota - a.nota);
}