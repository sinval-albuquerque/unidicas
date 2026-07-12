#!/usr/bin/env node
/**
 * Smoke test: a chave `anon` consegue SELECT nas ofertas ativas?
 * (deve retornar as 4 linhas; se RLS estiver mal configurada, retorna 0
 *  ou 401/403).
 *
 * Uso:
 *   npm run ofertas:db:smoke-anon
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("❌  Faltam env vars: NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const res = await fetch(`${url}/rest/v1/ofertas?select=slug,titulo,preco,ativo&ativo=eq.true&order=em_destaque.desc,preco.asc&limit=10`, {
  headers: {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
  },
});

const text = await res.text();
console.log(`HTTP ${res.status}`);
if (!res.ok) {
  console.error(text);
  process.exit(1);
}

const rows = JSON.parse(text);
console.log(`✅  ${rows.length} oferta(s) visíveis para a chave anon.`);
console.table(rows);

if (rows.length === 0) {
  console.error("❌  Esperava ≥1 linha. RLS provavelmente bloqueando.");
  process.exit(1);
}
