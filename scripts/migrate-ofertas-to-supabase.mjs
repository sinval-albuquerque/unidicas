#!/usr/bin/env node
/**
 * Migra `src/content/ofertas/*.mdx` para a tabela `ofertas` do Supabase.
 *
 * Uso:
 *   node scripts/migrate-ofertas-to-supabase.mjs
 *
 * Requer `.env.local` com:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Estratégia: upsert por `slug` (idempotente — pode rodar várias vezes).
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
// Node 20+ carrega .env.local nativamente:
//   node --env-file=.env.local scripts/migrate-ofertas-to-supabase.mjs
// (Não usamos `dotenv` para evitar mais uma dep.)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌  Faltam variáveis no .env.local: NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const OFERTAS_DIR = path.join(process.cwd(), "src", "content", "ofertas");

function parseOfertas() {
  if (!fs.existsSync(OFERTAS_DIR)) {
    console.error(`❌  Pasta não encontrada: ${OFERTAS_DIR}`);
    process.exit(1);
  }
  const files = fs.readdirSync(OFERTAS_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(OFERTAS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    if (!data.slug || !data.titulo) {
      console.warn(`⚠️  Ignorando ${file} (sem slug ou titulo).`);
      return null;
    }
    return {
      slug: data.slug,
      titulo: data.titulo,
      produto: data.produto ?? data.titulo,
      categoria: data.categoria ?? "outros",
      mlb_id: data.mlbId ?? null,
      asin: data.asin ?? null,
      preco: Number(data.preco ?? 0),
      preco_original: data.precoOriginal == null ? null : Number(data.precoOriginal),
      imagem: data.imagem ?? "",
      marketplace: data.marketplace ?? "Mercado Livre",
      link_afiliado: data.linkAfiliado ?? "#",
      cupom: data.cupom ?? null,
      expira_em: data.expiraEm ?? null,
      tags: data.tags ?? [],
      em_destaque: Boolean(data.emDestaque),
      nota: data.nota == null ? null : Number(data.nota),
      resumo: data.resumo ?? "",
      conteudo: content,
      verificado_em: data.verificadoEm ?? null,
      ativo: true,
      updated_at: new Date().toISOString(),
    };
  }).filter(Boolean);
}

async function main() {
  const rows = parseOfertas();
  console.log(`📦  ${rows.length} oferta(s) encontrada(s) no MDX.`);

  const { error } = await supabase
    .from("ofertas")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    console.error("❌  Erro no upsert:", error);
    process.exit(1);
  }
  console.log("✅  Migração concluída. Rode `SELECT slug, titulo, preco FROM ofertas;` no Supabase para conferir.");
}

main().catch((err) => {
  console.error("❌  Erro fatal:", err);
  process.exit(1);
});
