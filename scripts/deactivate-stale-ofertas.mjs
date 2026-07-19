#!/usr/bin/env node
/**
 * Desativa no Supabase qualquer oferta cujo `slug` NÃO tenha MDX correspondente
 * em `src/content/ofertas/`. Roda automaticamente como parte de `migrate-ofertas`.
 *
 * Por que existe:
 *   - Se um MDX é deletado (ex.: tinha MLB ID falso), a oferta deve sumir
 *     do `/ofertas` sem precisar de SQL manual.
 *   - Idempotente: se o slug já está `ativo = false`, não faz nada.
 *
 * Uso:
 *   npm run ofertas:db:cleanup
 *   # ou:
 *   node --env-file=.env.local scripts/deactivate-stale-ofertas.mjs
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

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

function slugsDosMdx() {
  if (!fs.existsSync(OFERTAS_DIR)) return new Set();
  return new Set(
    fs
      .readdirSync(OFERTAS_DIR)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, "")),
  );
}

async function main() {
  const slugsMdx = slugsDosMdx();
  console.log(`📂  ${slugsMdx.size} MDX encontrado(s) em src/content/ofertas/.`);

  const { data: rows, error } = await supabase
    .from("ofertas")
    .select("slug, ativo");
  if (error) {
    console.error("❌  Erro ao listar ofertas:", error);
    process.exit(1);
  }
  if (!rows) {
    console.log("ℹ️  Nenhuma oferta no banco.");
    return;
  }

  const stale = rows.filter((r) => !slugsMdx.has(r.slug));
  if (stale.length === 0) {
    console.log("✅  Banco já está em sincronia com os MDX.");
    return;
  }

  console.log(`⚠️  ${stale.length} oferta(s) sem MDX correspondente:`);
  for (const r of stale) console.log(`     · ${r.slug} (ativo=${r.ativo})`);

  const { error: upErr } = await supabase
    .from("ofertas")
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .in(
      "slug",
      stale.map((r) => r.slug),
    );

  if (upErr) {
    console.error("❌  Erro ao desativar:", upErr);
    process.exit(1);
  }
  console.log(`✅  ${stale.length} oferta(s) desativada(s).`);
}

main().catch((err) => {
  console.error("❌  Erro fatal:", err);
  process.exit(1);
});
