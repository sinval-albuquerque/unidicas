import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Review, ReviewFrontmatter, CategoriaSlug } from "@/types/review";

/**
 * Camada de acesso a dados: lê arquivos MDX de `src/content/reviews`.
 * Usa gray-matter para parsear o frontmatter.
 */

const REVIEWS_DIR = path.join(process.cwd(), "src", "content", "reviews");

/** Lê todos os arquivos .mdx e retorna Reviews parseadas. */
export function obterTodasReviews(): Review[] {
  if (!fs.existsSync(REVIEWS_DIR)) return [];

  const arquivos = fs.readdirSync(REVIEWS_DIR).filter((f) => f.endsWith(".mdx"));

  return arquivos
    .map((arquivo) => {
      const caminhoCompleto = path.join(REVIEWS_DIR, arquivo);
      const conteudoBruto = fs.readFileSync(caminhoCompleto, "utf-8");
      const { data, content } = matter(conteudoBruto);
      const frontmatter = data as Partial<ReviewFrontmatter>;

      // Validação mínima — descarta arquivos malformados silenciosamente.
      if (!frontmatter.slug || !frontmatter.titulo) return null;

      return {
        slug: frontmatter.slug,
        titulo: frontmatter.titulo,
        mlbId: frontmatter.mlbId,
        produto: frontmatter.produto ?? frontmatter.titulo,
        categoria: frontmatter.categoria ?? "sem-categoria",
        nota: frontmatter.nota ?? 0,
        imagem: frontmatter.imagem ?? "",
        marketplace: frontmatter.marketplace ?? "",
        preco: frontmatter.preco ?? 0,
        precoOriginal: frontmatter.precoOriginal,
        linkAfiliado: frontmatter.linkAfiliado ?? "#",
        pros: frontmatter.pros ?? [],
        contras: frontmatter.contras ?? [],
        resumo: frontmatter.resumo ?? "",
        emDestaque: frontmatter.emDestaque ?? false,
        atributos: frontmatter.atributos ?? {},
        conteudo: content,
      } as Review;
    })
    .filter((r): r is Review => r !== null);
}

/** Reviews marcadas como emDestaque, ordenadas por nota decrescente. */
export function obterReviewsEmDestaque(): Review[] {
  return obterTodasReviews()
    .filter((r) => r.emDestaque)
    .sort((a, b) => b.nota - a.nota);
}

/** Reviews de uma categoria específica, ordenadas por nota decrescente. */
export function obterReviewsPorCategoria(categoria: CategoriaSlug): Review[] {
  return obterTodasReviews()
    .filter((r) => r.categoria === categoria)
    .sort((a, b) => b.nota - a.nota);
}

/** Review por slug, ou undefined. */
export function obterReviewPorSlug(slug: string): Review | undefined {
  return obterTodasReviews().find((r) => r.slug === slug);
}