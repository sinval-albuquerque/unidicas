import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Oferta, OfertaFrontmatter } from "@/types/oferta";

const OFERTAS_DIR = path.join(process.cwd(), "src", "content", "ofertas");

/**
 * Lê todos os arquivos .mdx de `src/content/ofertas/`.
 * Arquivos sem slug ou titulo são descartados silenciosamente.
 *
 * Ordenação:
 * 1. `emDestaque: true` primeiro
 * 2. Maior desconto absoluto (precoOriginal - preco) primeiro
 * 3. Empatados: slug alfabético para determinismo
 */
export function obterTodasOfertas(): Oferta[] {
  if (!fs.existsSync(OFERTAS_DIR)) return [];

  return fs
    .readdirSync(OFERTAS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const fullPath = path.join(OFERTAS_DIR, file);
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data, content } = matter(raw);
      const fm = data as Partial<OfertaFrontmatter>;

      if (!fm.slug || !fm.titulo) return null;

      // Aviso (não erro) se linkAfiliado não tem matt_word
      if (fm.linkAfiliado && !fm.linkAfiliado.includes("matt_word=")) {
        console.warn(
          `[ofertas] '${fm.slug}' não tem matt_word no linkAfiliado — comissão não será rastreada.`,
        );
      }

      return {
        slug: fm.slug,
        titulo: fm.titulo,
        categoria: fm.categoria ?? "outros",
        preco: fm.preco ?? 0,
        precoOriginal: fm.precoOriginal,
        imagem: fm.imagem ?? "",
        marketplace: fm.marketplace ?? "Mercado Livre",
        linkAfiliado: fm.linkAfiliado ?? "#",
        cupom: fm.cupom,
        expiraEm: fm.expiraEm,
        tags: fm.tags ?? [],
        emDestaque: fm.emDestaque ?? false,
        resumo: fm.resumo ?? "",
        conteudo: content,
      } as Oferta;
    })
    .filter((o): o is Oferta => o !== null)
    .sort((a, b) => {
      if (a.emDestaque !== b.emDestaque) return a.emDestaque ? -1 : 1;
      const descA = (a.precoOriginal ?? a.preco) - a.preco;
      const descB = (b.precoOriginal ?? b.preco) - b.preco;
      if (descA !== descB) return descB - descA;
      return a.slug.localeCompare(b.slug);
    });
}

/** Retorna ofertas filtradas por categoria. */
export function obterOfertasPorCategoria(categoria: string): Oferta[] {
  return obterTodasOfertas().filter((o) => o.categoria === categoria);
}

/** Retorna uma oferta pelo slug. */
export function obterOfertaPorSlug(slug: string): Oferta | undefined {
  return obterTodasOfertas().find((o) => o.slug === slug);
}
