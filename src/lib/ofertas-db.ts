/**
 * Camada de acesso a dados das ofertas.
 *
 * Fonte primária: Supabase (tabela `ofertas`).
 * Fallback: MDX local em `src/content/ofertas/*.mdx` (lido por `ofertas-content.ts`).
 *
 * Por que o fallback existe:
 * - Em dev local sem `.env.local` preenchido, o site continua funcionando.
 * - Se o Supabase cair em produção, retornamos as últimas ofertas estáticas.
 * - Mantém compatibilidade com o deploy atual.
 *
 * O `page.tsx` de `/ofertas` usa `obterOfertasAtivas()` que:
 *  1. Tenta Supabase.
 *  2. Se falhar, cai para MDX.
 *
 * O cache da página é controlado por `export const revalidate = 3600` em page.tsx.
 */

import { supabase } from "@/lib/supabase";
import { obterTodasOfertas as obterTodasOfertasMdx } from "@/lib/ofertas-content";
import type { Oferta, OfertaFrontmatter } from "@/types/oferta";

/** Linha do Supabase (snake_case). */
interface OfertaRow {
  id: string;
  slug: string;
  titulo: string;
  produto: string;
  categoria: string;
  preco: number;
  preco_original: number | null;
  imagem: string;
  marketplace: string;
  link_afiliado: string;
  cupom: string | null;
  expira_em: string | null;
  tags: string[] | null;
  em_destaque: boolean;
  nota: number | null;
  resumo: string;
  conteudo: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

function rowToOferta(row: OfertaRow): Oferta {
  return {
    slug: row.slug,
    titulo: row.titulo,
    produto: row.produto,
    categoria: row.categoria,
    preco: Number(row.preco),
    precoOriginal: row.preco_original == null ? undefined : Number(row.preco_original),
    imagem: row.imagem,
    marketplace: row.marketplace,
    linkAfiliado: row.link_afiliado,
    cupom: row.cupom ?? undefined,
    expiraEm: row.expira_em ?? undefined,
    tags: row.tags ?? [],
    emDestaque: row.em_destaque,
    nota: row.nota == null ? undefined : Number(row.nota),
    resumo: row.resumo,
    conteudo: row.conteudo,
  };
}

/**
 * Retorna todas as ofertas ativas, ordenadas:
 *  1. `em_destaque` primeiro
 *  2. Maior desconto absoluto (preco_original - preco) primeiro
 *  3. Slug alfabético
 *
 * Tenta Supabase; se não configurado/erro, retorna MDX.
 */
export async function obterOfertasAtivas(): Promise<Oferta[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("ofertas")
        .select("*")
        .eq("ativo", true)
        .order("em_destaque", { ascending: false })
        .order("preco", { ascending: true });

      if (!error && data) {
        return (data as OfertaRow[]).map(rowToOferta);
      }
      console.warn(
        "[ofertas-db] Supabase indisponível, usando MDX como fallback.",
        error?.message,
      );
    } catch (err) {
      console.warn(
        "[ofertas-db] Erro ao consultar Supabase, usando MDX como fallback.",
        err,
      );
    }
  }
  return obterTodasOfertasMdx();
}

/** Retorna apenas ofertas em destaque. */
export async function obterOfertasEmDestaqueDb(): Promise<Oferta[]> {
  const todas = await obterOfertasAtivas();
  return todas.filter((o) => o.emDestaque);
}
