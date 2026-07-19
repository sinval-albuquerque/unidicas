/**
 * Contratos de domínio do Unidicas.
 * Toda a lógica de reviews, categorias e comparações opera sobre estes tipos.
 */

/** Slug de categoria (ex: "notebooks", "fones"). */
export type CategoriaSlug = string;

/** Slug de seção (nível acima das categorias, ex: "tecnologia", "kits"). */
export type SecaoSlug = string;

/** Identificador de atributo comparável (ex: "bateria", "memoria"). */
export type AtributoId = string;

/**
 * Metadados de um atributo comparável dentro de uma categoria.
 * @property maiorMelhor - true quando o maior valor vence (ex: bateria em horas);
 *                         false quando o menor valor vence (ex: preço).
 */
export interface AtributoComparacao {
  id: AtributoId;
  label: string;
  unidade: string;
  maiorMelhor: boolean;
  icone?: string;
}

/** Definição completa de uma categoria de produto. */
export interface Categoria {
  slug: CategoriaSlug;
  nome: string;
  descricao: string;
  /** Seção pai (nível acima da categoria). Ver SECOES em src/lib/secoes.ts. */
  secao: SecaoSlug;
  atributos: AtributoComparacao[];
}

/**
 * Seção do site — agrupamento de nível superior das categorias.
 * Cada seção tem uma cor própria para diferenciar visualmente suas páginas.
 */
export interface Secao {
  slug: SecaoSlug;
  nome: string;
  descricao: string;
  /** Cor principal (hex) — usada em badges e bordas de destaque. */
  cor: string;
  /** Variação escura (hover/ativo). */
  corDark: string;
  /** Variação clara (fundo suave de badges). */
  corLight: string;
  /** Emoji representativo. */
  icone?: string;
}

/**
 * Frontmatter de um arquivo MDX de review.
 * `atributos` mapeia AtributoId -> valor numérico (para ranking automático).
 */
export interface ReviewFrontmatter {
  slug: string;
  titulo: string;
  produto: string;
  categoria: CategoriaSlug;
  mlbId?: string;
  nota: number;
  imagem: string;
  marketplace: string;
  preco: number;
  precoOriginal?: number;
  linkAfiliado: string;
  pros: string[];
  contras: string[];
  resumo: string;
  emDestaque: boolean;
  atributos: Record<AtributoId, number>;
}

/** Review completa = frontmatter + conteúdo MDX bruto. */
export interface Review extends ReviewFrontmatter {
  conteudo: string;
}

/** Resultado de "melhor produto por atributo". */
export interface MelhorPorAtributo {
  atributo: AtributoComparacao;
  review: Review;
  valor: number;
}

/** Linha de uma tabela comparativa (um atributo, valores por produto). */
export interface LinhaComparativa {
  atributo: AtributoComparacao;
  valores: { review: Review; valor: number; vencedor: boolean }[];
}

/** Tabela comparativa completa de uma categoria. */
export interface TabelaComparativa {
  categoria: Categoria;
  reviews: Review[];
  linhas: LinhaComparativa[];
}