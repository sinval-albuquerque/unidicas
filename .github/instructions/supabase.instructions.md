---
applyTo:
  - "src/lib/supabase.ts"
  - "src/lib/ofertas-db.ts"
  - "src/lib/ofertas-admin.ts"
  - "scripts/**/*-supabase.mjs"
description: "Regras de uso do Supabase — quais clientes usar, onde, e o padrão de fallback."
---

# Supabase — regras de uso

## Clientes (`src/lib/supabase.ts`)

| Cliente         | Onde usar                                                                                 | RLS     |
| --------------- | ----------------------------------------------------------------------------------------- | ------- |
| `supabase`      | Server e Client Components (somente leitura)                                              | sim     |
| `supabaseAdmin` | **APENAS** Route Handlers, Server Actions e scripts admin (`node scripts/*-supabase.mjs`) | **não** |

- Sem env vars → ambos retornam `null`; o site cai no fallback MDX. **Não quebrar dev local**.
- **Nunca** importar `supabaseAdmin` em arquivos do client bundle (componentes com `"use client"`, `app/**/page.tsx` renderizado no browser, etc.).
- Em caso de dúvida, use `supabase` (anon). Só promova para `supabaseAdmin` quando a operação exigir bypass de RLS.
- Para criar um **novo** cliente admin (ex.: `src/lib/ofertas-admin.ts`), importe `supabaseAdmin` de `@/lib/supabase` — não chame `createClient` direto, para manter `persistSession: false` consistente.

## Padrão de consumo — leitura

Sempre envolver em `if (supabase) { try { ... } catch { log + fallback } }`. Modelo canônico em `obterOfertasAtivas` (`src/lib/ofertas-db.ts`). **Nunca** deixar uma query quebrar a página — sempre há MDX por baixo.

## Padrão de consumo — escrita

- Toda escrita no banco passa por `supabaseAdmin` em Route Handlers/Server Actions ou script.
- Use o script `scripts/migrate-ofertas-to-supabase.mjs` (ou `npm run ofertas:db:migrate`) para subir/atualizar `src/content/ofertas/*.mdx`. Upsert por `slug` — idempotente, pode rodar várias vezes.
- Schema é a **DDL versionada** em [`supabase/schema.sql`](../../supabase/schema.sql). `interface OfertaRow` em `src/lib/ofertas-db.ts` deve refletir 1:1 as colunas.

## Cache

- `/ofertas` tem `export const revalidate = 3600` (ISR 1h). Mudanças no banco levam até 1h para aparecer. Em emergência, forçar redeploy.
- Outras rotas que leem Supabase devem documentar seu `revalidate` ao lado de `export const revalidate = …`.

## Env vars

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (públicas), `SUPABASE_SERVICE_ROLE_KEY` (secreta, ignora RLS), `SUPABASE_ACCESS_TOKEN` (PAT `sbp_…` para DDL via Management API).
- Documentadas em `.env.example` (versionado, sem valores). `.env.local` é gitignored — não commitar.
- Sem env vars, a feature de Supabase é opcional. Não usar `process.env(...)!` (non-null assertion) sem fallback MDX real.
