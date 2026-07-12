#!/usr/bin/env node
/**
 * Audita a tabela `ofertas` no Supabase.
 * Server-only — usa SUPABASE_SERVICE_ROLE_KEY (ignora RLS).
 *
 * Uso:
 *   npm run ofertas:db:verify
 *   # ou
 *   node --env-file=.env.local scripts/verify-ofertas.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "❌  Faltam env vars: NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data, error, count } = await supabase
    .from("ofertas")
    .select(
      "slug, titulo, preco, preco_original, em_destaque, ativo, updated_at",
      { count: "exact" },
    )
    .order("em_destaque", { ascending: false })
    .order("preco", { ascending: true });

  if (error) {
    console.error("❌  Erro ao consultar ofertas:", error);
    process.exit(1);
  }

  console.log(`📊  Total: ${count ?? data?.length ?? 0} linha(s) na tabela.\n`);

  if (!data || data.length === 0) {
    console.log("⚠️  Tabela vazia. Rode `npm run ofertas:db:migrate` para popular.");
    return;
  }

  const cols = ["slug", "titulo", "preco", "preco_original", "em_destaque", "ativo", "updated_at"];
  const rows = data.map((r) => ({
    ...r,
    preco_original: r.preco_original ?? "—",
    em_destaque: r.em_destaque ? "⭐" : " ",
    ativo: r.ativo ? "✓" : "✗",
  }));
  console.table(rows, cols);

  // Sanidade
  const semLink = data.filter(
    (r) => !r.slug || r.slug.length === 0,
  );
  if (semLink.length) {
    console.warn(`⚠️  ${semLink.length} linha(s) sem slug válido.`);
  } else {
    console.log("✅  Todos os slugs válidos.");
  }
}

main().catch((err) => {
  console.error("❌  Erro fatal:", err);
  process.exit(1);
});
