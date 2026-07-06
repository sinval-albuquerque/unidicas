import type { Secao, SecaoSlug } from "@/types/review";
import { CATEGORIAS } from "./categorias";

/**
 * Seções do Unidicas — agrupamento de nível superior das categorias.
 * Cada seção tem uma cor própria que diferencia visualmente suas páginas
 * (badges e bordas de destaque).
 *
 * Para adicionar uma seção: inclua um objeto aqui e, em `categorias.ts`,
 * defina `secao: "<slug>"` nas categorias que pertencem a ela.
 */
export const SECOES: Secao[] = [
  {
    slug: "tecnologia",
    nome: "Tecnologia",
    descricao:
      "Notebooks, celulares, fones, smartwatches e gadgets — o melhor da tecnologia para o seu dia.",
    cor: "#1e40af",
    corDark: "#1e3a8a",
    corLight: "#eff6ff",
    icone: "💻",
  },
  {
    slug: "ferramentas-de-construcao",
    nome: "Ferramentas de Construção",
    descricao:
      "Ferramentas, equipamentos e acessórios para obra, reforma e trabalho manual.",
    cor: "#d97706",
    corDark: "#b45309",
    corLight: "#fef3c7",
    icone: "🔨",
  },
  {
    slug: "esportes-e-fitness",
    nome: "Esportes e Fitness",
    descricao:
      "Equipamentos, vestuário e acessórios para treino, esporte e vida ativa.",
    cor: "#15803d",
    corDark: "#166534",
    corLight: "#dcfce7",
    icone: "🏋️",
  },
  {
    slug: "kits",
    nome: "Kits",
    descricao:
      "Kits completos de qualquer categoria — cozinha, escritório, viagem e muito mais.",
    cor: "#7c3aed",
    corDark: "#6d28d9",
    corLight: "#ede9fe",
    icone: "📦",
  },
];

/** Mapa slug -> Secao para acesso O(1). */
export const SECAO_POR_SLUG: Record<SecaoSlug, Secao> = Object.fromEntries(
  SECOES.map((s) => [s.slug, s]),
);

/** Retorna a seção pelo slug ou undefined. */
export function obterSecao(slug: SecaoSlug): Secao | undefined {
  return SECAO_POR_SLUG[slug];
}

/** Lista de slugs válidos (para validação de rotas dinâmicas). */
export const SLUGS_SECOES_VALIDOS: SecaoSlug[] = SECOES.map((s) => s.slug);

/** Retorna as categorias que pertencem a uma seção. */
export function obterCategoriasPorSecao(slug: SecaoSlug) {
  return CATEGORIAS.filter((c) => c.secao === slug);
}

/** Retorna a seção de uma categoria (via slug da categoria). */
export function obterSecaoDaCategoria(categoriaSlug: CategoriaSlugLike): Secao | undefined {
  const cat = CATEGORIAS.find((c) => c.slug === categoriaSlug);
  return cat ? SECAO_POR_SLUG[cat.secao] : undefined;
}

// Alias local para evitar import circular de tipos
type CategoriaSlugLike = string;