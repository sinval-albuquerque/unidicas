/**
 * Metadados e conteúdo das matérias do Unidicas.
 */
export interface MateriaFrontmatter {
  slug: string;
  titulo: string;
  resumo: string;
  data: string;
  imagem?: string;
  destaque?: boolean;
  /** Slug da categoria (em src/lib/categorias.ts). Exibe badge e breadcrumb. */
  categoria?: string;
  /** <title> custom para SEO (max ~60 chars). Default: titulo. */
  metaTitle?: string;
  /** <meta name="description"> para SEO (max ~155 chars). Default: resumo. */
  metaDescription?: string;
  /** <meta name="keywords"> opcional. */
  metaKeywords?: string[];
}

export interface Materia extends MateriaFrontmatter {
  conteudo: string;
}
