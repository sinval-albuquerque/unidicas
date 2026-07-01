import type { Review } from "@/types/review";

/**
 * Função pura de filtragem de reviews por termo de busca.
 * Busca em título, produto, categoria e resumo (case-insensitive).
 * Não muta a entrada — retorna novo array.
 */
export function filtrarReviews(reviews: Review[], termo: string): Review[] {
  const q = termo.trim().toLowerCase();
  if (!q) return reviews;

  return reviews.filter((r) => {
    const campos = [r.titulo, r.produto, r.categoria, r.resumo].join(" ").toLowerCase();
    return campos.includes(q);
  });
}