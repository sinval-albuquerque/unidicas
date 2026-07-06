# Unidicas

Site de reviews de produtos (afiliados). Stack: **Next.js 16 (App Router) + TypeScript + Tailwind v4 + MDX**. Conteúdo estático em `src/content/` — sem banco de dados.

> **Aviso:** esta versão do Next.js tem breaking changes. Antes de escrever código Next, leia os guias em `node_modules/next/dist/docs/`.

## Comandos

```bash
npm run dev        # dev server (Turbopack)
npm run build      # build de produção
npm run start      # servidor de produção
npm run lint       # ESLint
npm test           # Vitest (uma vez)
npm run test:watch # Vitest em modo watch
npm run typecheck  # tsc --noEmit
```

## Estrutura

- `src/content/reviews/*.mdx` — reviews (frontmatter + MDX)
- `src/content/materias/*.mdx` — matérias e guias
- `src/lib/categorias.ts` — single source of truth de categorias e atributos comparáveis
- `src/lib/secoes.ts` — agrupamento de categorias (cor, ícone)
- `src/lib/reviews.ts` — leitura de MDX com `gray-matter`
- `src/lib/comparacoes.ts` — funções puras de ranking
- `src/app/<secao>/<categoria>/...` — rotas dinâmicas
- `src/components/` — UI de cards, tabelas, badges
- `src/tests/` — testes Vitest

## Adicionando uma review

1. Crie `src/content/reviews/<slug>.mdx` (slug em kebab-case).
2. Use o frontmatter modelo de [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
3. IDs de atributos por categoria: ver `src/lib/categorias.ts`.
4. Toda review precisa de `atributos.preco` (o ranking depende disso).

Para um workflow guiado de entrevista com o usuário, use a skill `add-product` em `.github/skills/add-product/SKILL.md`.

## Documentação para agentes de IA

- [`AGENTS.md`](AGENTS.md) — onboarding canônico (também lido por Claude Code, Aider, Codex).
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — instruções específicas do Copilot.
- [`.github/skills/add-product/SKILL.md`](.github/skills/add-product/SKILL.md) — skill de adicionar produto.

## Deploy

O projeto é estático e roda bem na [Vercel](https://vercel.com).
