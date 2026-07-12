# Unidicas

Site de reviews de produtos (afiliados). Stack: **Next.js 16 (App Router) + TypeScript + Tailwind v4 + MDX**. Conteúdo primário é estático (MDX em `src/content/`); Supabase opcional para a vitrine de `/ofertas` (com fallback MDX).

> **Este NÃO é o Next.js que você conhece.** A versão em uso tem breaking changes. Antes de escrever qualquer código Next, leia os guias em `node_modules/next/dist/docs/` e atente aos avisos de deprecation.

## Comandos

| Script               | O que faz                                              |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | Sobe o dev server (Turbopack)                          |
| `npm run build`      | Build de produção                                      |
| `npm run start`      | Sobe o servidor de produção                            |
| `npm run lint`       | ESLint (config em `eslint.config.mjs`)                 |
| `npm test`           | Vitest rodando uma vez (jsdom, testes em `src/tests/`) |
| `npm run test:watch` | Vitest em modo watch                                   |
| `npm run typecheck`  | `tsc --noEmit`                                         |

## Estrutura

- `src/content/reviews/*.mdx` — reviews (frontmatter + MDX)
- `src/content/materias/*.mdx` — matérias e guias
- `src/content/ofertas/*.mdx` — ofertas curadas para `/ofertas` (frontmatter com `linkAfiliado` rastreado)
- `src/lib/categorias.ts` — **single source of truth** de categorias e atributos comparáveis
- `src/lib/secoes.ts` — agrupamento de categorias (cor, ícone)
- `src/lib/reviews.ts` — leitura de MDX de reviews com `gray-matter`
- `src/lib/ofertas-content.ts` — leitura de MDX de ofertas com `gray-matter`
- `src/lib/ofertas-db.ts` — leitura de ofertas no Supabase (com fallback MDX)
- `src/lib/supabase.ts` — clientes `supabase` (anon, RLS) e `supabaseAdmin` (service_role, server-only)
- `src/lib/comparacoes.ts` — funções **puras** de ranking (testadas em `src/tests/comparacoes.test.ts`)
- `src/lib/search.ts` — busca textual sobre as reviews
- `src/app/<secao>/<categoria>/...` — rotas dinâmicas (App Router)
- `src/components/` — UI de cards, tabelas, badges
- `src/types/review.ts`, `src/types/oferta.ts` — contratos de domínio

## Banco de dados — Supabase (opcional)

- **Cliente:** `src/lib/supabase.ts` exporta `supabase` (anon, respeita RLS) e `supabaseAdmin` (service_role, **ignora RLS**). Sem env vars, ambos retornam `null` e o site cai no fallback MDX — não quebra.
- **`supabaseAdmin` é perigoso:** usar **somente** em Route Handlers, Server Actions ou scripts admin (ex.: `scripts/migrate-ofertas-to-supabase.mjs`). Nunca importar em arquivos que vão para o client bundle.
- **Env vars (não commitar):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Não há `.env.example` versionado — copiar de `.env.local` (gitignored).
- **Tabela em uso hoje:** `ofertas` (snake_case: `preco_original`, `link_afiliado`, `em_destaque`, `expira_em`, `ativo`, `tags`, `nota`, `resumo`, `conteudo`). Schema não está versionado no repo — `interface OfertaRow` em [`src/lib/ofertas-db.ts`](src/lib/ofertas-db.ts) é a referência do shape.
- **Padrão de consumo:** `if (supabase) { try { ... } catch { log + fallback } }` (modelo: `obterOfertasAtivas` em [`src/lib/ofertas-db.ts`](src/lib/ofertas-db.ts)). Nunca deixar uma query do Supabase quebrar a página — sempre há MDX por baixo.
- **Migração MDX → Supabase:** `node scripts/migrate-ofertas-to-supabase.mjs` (requer `SUPABASE_SERVICE_ROLE_KEY`). Upsert idempotente por `slug` — pode rodar várias vezes.
- **Cache:** `src/app/ofertas/page.tsx` tem `export const revalidate = 3600` (ISR 1h). Mudanças no banco levam até 1h para aparecer; em emergência, forçar redeploy.

## Modelo de conteúdo

- Toda review tem `atributos.preco` — o ranking de comparações depende disso.
- `categoria` precisa existir em `src/lib/categorias.ts` (validação silenciosa hoje; tratar como erro).
- `atributos` são chaves declaradas naquela categoria; valores são numéricos.
- Slug em **kebab-case**, único por review.
- `gray-matter` parseia o frontmatter em `obterTodasReviews()`; arquivos sem `slug`/`titulo` são descartados.
- **Imagens:** apenas fotos reais — URL do marketplace (ex.: `http2.mlstatic.com/...`) ou arquivo local em `public/reviews/<slug>.webp` (referenciado como `/reviews/<slug>.webp`). **Não usar Unsplash, placeholders de stock ou fotos genéricas.** Ver `next.config.ts` para hosts remotos permitidos.
- Links de afiliado: placeholders `https://example.com/<slug>` (não inventar URLs reais).

## ⚠️ Quirks do Next.js 16 / Turbopack

- `transpilePackages: ["next-mdx-remote"]` em `next.config.ts` é **workaround oficial** para o Turbopack compilar `next-mdx-remote`. Não remover.
- `turbopack.root: path.resolve(".")` força o Turbopack a usar o diretório do projeto como raiz — evita o aviso _"inferred your workspace root"_ quando há `package.json` em diretórios pai (ex.: `$HOME`).
- React 19.2 — alguns patterns de Suspense/Server Actions diferem do que você pode ter visto antes.

## Customizações adicionais do Copilot

- **Como adicionar um produto/matéria:** ver [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
- **Skill `add-product`:** [`.github/skills/add-product/SKILL.md`](.github/skills/add-product/SKILL.md) — workflow guiado de entrevista + criação de MDX.
- **CLAUDE.md** importa este arquivo; mantenha-o atualizado para o Claude Code também.
