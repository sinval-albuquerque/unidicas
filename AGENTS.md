# Unidicas

Site de reviews de produtos (afiliados). Stack: **Next.js 16 (App Router) + TypeScript + Tailwind v4 + MDX**. Conteúdo estático em `src/content/` — sem banco de dados.

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
- `src/lib/comparacoes.ts` — funções **puras** de ranking (testadas em `src/tests/comparacoes.test.ts`)
- `src/lib/search.ts` — busca textual sobre as reviews
- `src/app/<secao>/<categoria>/...` — rotas dinâmicas (App Router)
- `src/components/` — UI de cards, tabelas, badges
- `src/types/review.ts`, `src/types/oferta.ts` — contratos de domínio

## Modelo de conteúdo

- Toda review tem `atributos.preco` — o ranking de comparações depende disso.
- `categoria` precisa existir em `src/lib/categorias.ts` (validação silenciosa hoje; tratar como erro).
- `atributos` são chaves declaradas naquela categoria; valores são numéricos.
- Slug em **kebab-case**, único por review.
- `gray-matter` parseia o frontmatter em `obterTodasReviews()`; arquivos sem `slug`/`titulo` são descartados.
- Imagens: URLs `https://images.unsplash.com/...` como placeholder quando não houver asset real.
- Links de afiliado: placeholders `https://example.com/<slug>` (não inventar URLs reais).

## ⚠️ Quirks do Next.js 16 / Turbopack

- `transpilePackages: ["next-mdx-remote"]` em `next.config.ts` é **workaround oficial** para o Turbopack compilar `next-mdx-remote`. Não remover.
- `turbopack.root: path.resolve(".")` força o Turbopack a usar o diretório do projeto como raiz — evita o aviso _"inferred your workspace root"_ quando há `package.json` em diretórios pai (ex.: `$HOME`).
- React 19.2 — alguns patterns de Suspense/Server Actions diferem do que você pode ter visto antes.

## Customizações adicionais do Copilot

- **Como adicionar um produto/matéria:** ver [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
- **Skill `add-product`:** [`.github/skills/add-product/SKILL.md`](.github/skills/add-product/SKILL.md) — workflow guiado de entrevista + criação de MDX.
- **CLAUDE.md** importa este arquivo; mantenha-o atualizado para o Claude Code também.
