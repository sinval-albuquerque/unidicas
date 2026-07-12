#!/usr/bin/env node
/**
 * Verifica estado do schema da tabela `ofertas`:
 *  - colunas + tipos
 *  - RLS habilitada?
 *  - policies existentes
 *  - contagem de linhas e amostra
 * Server-only — usa SUPABASE_ACCESS_TOKEN (Management API).
 *
 * Uso:
 *   npm run ofertas:db:verify-schema
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!url || !token) {
  console.error("❌  Faltam env vars: NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

const ref = new URL(url).hostname.split(".")[0];

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

function table(rows, cols) {
  console.table(rows, cols);
}

const checks = [
  {
    name: "Colunas da tabela `public.ofertas`",
    sql: `select column_name, data_type, is_nullable, column_default
          from information_schema.columns
          where table_schema = 'public' and table_name = 'ofertas'
          order by ordinal_position;`,
    cols: ["column_name", "data_type", "is_nullable"],
  },
  {
    name: "Constraints (CHECK/UNIQUE/FK) em `public.ofertas`",
    sql: `select conname, contype,
                  pg_get_constraintdef(oid) as definition
          from pg_constraint
          where conrelid = 'public.ofertas'::regclass
          order by contype, conname;`,
    cols: ["conname", "contype", "definition"],
  },
  {
    name: "Índices de `public.ofertas`",
    sql: `select indexname, indexdef
          from pg_indexes
          where schemaname = 'public' and tablename = 'ofertas'
          order by indexname;`,
    cols: ["indexname", "indexdef"],
  },
  {
    name: "RLS habilitada?",
    sql: `select relname, relrowsecurity, relforcerowsecurity
          from pg_class where relname = 'ofertas';`,
    cols: ["relname", "relrowsecurity", "relforcerowsecurity"],
  },
  {
    name: "Policies em `public.ofertas`",
    sql: `select policyname, roles, cmd, qual
          from pg_policies
          where schemaname = 'public' and tablename = 'ofertas'
          order by policyname;`,
    cols: ["policyname", "roles", "cmd", "qual"],
  },
  {
    name: "Triggers em `public.ofertas`",
    sql: `select trigger_name, event_manipulation, action_timing, action_statement
          from information_schema.triggers
          where event_object_schema = 'public' and event_object_table = 'ofertas'
          order by trigger_name;`,
    cols: ["trigger_name", "event_manipulation", "action_timing"],
  },
  {
    name: "Linhas atuais",
    sql: `select slug, preco, preco_original, em_destaque, ativo
          from public.ofertas
          order by em_destaque desc, preco asc;`,
    cols: ["slug", "preco", "preco_original", "em_destaque", "ativo"],
  },
  {
    name: "Contagem de ativos vs total",
    sql: `select
            count(*) as total,
            count(*) filter (where ativo) as ativos,
            count(*) filter (where em_destaque) as em_destaque
          from public.ofertas;`,
    cols: ["total", "ativos", "em_destaque"],
  },
];

let failed = 0;
for (const c of checks) {
  console.log(`\n— ${c.name} —`);
  try {
    const rows = await sql(c.sql);
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log("   (nenhuma linha)");
    } else {
      table(rows, c.cols);
    }
  } catch (err) {
    failed++;
    console.error(`   ❌ ${err.message}`);
  }
}

console.log();
if (failed === 0) {
  console.log("✅  Auditoria concluída sem erros.");
} else {
  console.log(`⚠️  ${failed} check(s) falharam.`);
  process.exit(1);
}
