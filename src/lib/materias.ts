import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Materia, MateriaFrontmatter } from "@/types/materia";

const MATERIAS_DIR = path.join(process.cwd(), "src", "content", "materias");

export function obterTodasMaterias(): Materia[] {
  if (!fs.existsSync(MATERIAS_DIR)) return [];

  return fs
    .readdirSync(MATERIAS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const fullPath = path.join(MATERIAS_DIR, file);
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data, content } = matter(raw);
      const frontmatter = data as Partial<MateriaFrontmatter>;

      if (!frontmatter.slug || !frontmatter.titulo || !frontmatter.resumo || !frontmatter.data) {
        return null;
      }

      return {
        slug: frontmatter.slug,
        titulo: frontmatter.titulo,
        resumo: frontmatter.resumo,
        data: frontmatter.data,
        imagem: frontmatter.imagem,
        destaque: frontmatter.destaque ?? false,
        conteudo: content,
      } as Materia;
    })
    .filter((item): item is Materia => item !== null)
    .sort((a, b) => b.data.localeCompare(a.data));
}

export function obterMateriaPorSlug(slug: string): Materia | undefined {
  return obterTodasMaterias().find((materia) => materia.slug === slug);
}
