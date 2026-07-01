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
}

export interface Materia extends MateriaFrontmatter {
  conteudo: string;
}
