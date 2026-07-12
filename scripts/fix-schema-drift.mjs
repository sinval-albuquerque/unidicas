#!/usr/bin/env node
/**
 * Ajusta drift entre o schema versionado e o estado real do banco:
 *  - Adiciona CHECKs (preco>=0, preco_original>=preco, nota 0..5) se faltarem.
 *  - Remove a policy duplicada "Ofertas visíveis publicamente" (roles={public})
 *    que o Supabase criou automaticamente; mantemos só a nossa
 *    "ofertas: leitura pública" (roles={anon, authenticated}).
 *
 * Idempotente. Roda com SUPABASE_ACCESS_TOKEN.
 *
 * Uso:
 *   npm run ofertas:db:fix-schema
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
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

const stmts = [
  // CHECKs (se já existirem com mesmo nome, o ADD pula — mas a constraint
  // não foi criada antes, então a primeira execução aplica).
  `alter table public.ofertas
     add constraint ofertas_preco_nonneg_chk check (preco >= 0)`,
  `alter table public.ofertas
     add constraint ofertas_preco_original_chk check (preco_original is null or preco_original >= preco)`,
  `alter table public.ofertas
     add constraint ofertas_nota_range_chk check (nota is null or (nota >= 0 and nota <= 5))`,
  // Remover policy duplicada/auto-criada (mantemos só a nossa).
  `drop policy if exists "Ofertas visíveis publicamente" on public.ofertas`,
];

for (const s of stmts) {
  const first = s.split("\n")[0].trim();
  process.stdout.write(`→ ${first} … `);
  try {
    const out = await sql(s);
    console.log("ok");
    if (Array.isArray(out) && out.length) console.log(JSON.stringify(out, null, 2));
  } catch (err) {
    console.log("❌");
    console.error(err.message);
  }
}

console.log("\n✅  Drift corrigido. Rode `npm run ofertas:db:verify-schema` para conferir.");
