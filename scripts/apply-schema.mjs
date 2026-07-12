#!/usr/bin/env node
/**
 * Aplica `supabase/schema.sql` no projeto Supabase via PostgREST Management API
 * (endpoint `/pg/query`). Usa `SERVICE_ROLE_KEY` — server-only, ignora RLS.
 *
 * NÃO usa `pg` (sem `DATABASE_URL` no projeto). Funciona só com as chaves
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY que já estão no .env.local.
 *
 * Uso:
 *   npm run ofertas:db:apply-schema
 *   # ou
 *   node --env-file=.env.local scripts/apply-schema.mjs
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const token = process.env.SUPABASE_ACCESS_TOKEN; // sbp_… (Personal Access Token, https://supabase.com/dashboard/account/tokens)

if (!url || !token) {
  console.error(
    "❌  Faltam env vars: NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_ACCESS_TOKEN (sbp_…)",
  );
  process.exit(1);
}

// Extrai o project ref (ex.: "https://qhxskoyfzcnyhjqobafz.supabase.co" → "qhxskoyfzcnyhjqobafz")
const ref = new URL(url).hostname.split(".")[0];

const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
if (!fs.existsSync(schemaPath)) {
  console.error(`❌  Schema não encontrado: ${schemaPath}`);
  process.exit(1);
}
const sql = fs.readFileSync(schemaPath, "utf-8");

console.log(`🚀  Aplicando schema no projeto ${ref}…`);
console.log(`    ${schemaPath}  (${sql.length} bytes)`);

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();

if (!res.ok) {
  console.error(`❌  HTTP ${res.status} ${res.statusText}`);
  console.error(text);
  process.exit(1);
}

// Resposta do endpoint: pode vir como texto puro (quando retorna linhas) ou JSON.
// Tentamos parsear; se não der, exibimos o texto cru.
let parsed;
try {
  parsed = JSON.parse(text);
} catch {
  parsed = text;
}

console.log("✅  Schema aplicado (ou já estava em dia).\n");
console.log("Resposta do servidor:");
console.log(
  typeof parsed === "string"
    ? parsed.slice(0, 2000)
    : JSON.stringify(parsed, null, 2).slice(0, 2000),
);
