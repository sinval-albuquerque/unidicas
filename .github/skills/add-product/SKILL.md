---
name: add-product
description: Adiciona um novo produto (review) ou matéria no projeto Unidicas. Use quando o usuário disser "adicione um produto", "crie uma review", "cadastre o produto X", ou similar.
---

# Adicionar produto / matéria no Unidicas

## Quando usar

- "adicione o produto [X]"
- "crie uma review do [Y]"
- "cadastre o [Z] com link de afiliado [url]"
- "crie uma matéria sobre [tema]"

## Passo a passo

1. Pergunte ao usuário (se não souber) os dados mínimos:
   - **Nome do produto**
   - **Categoria** (notebooks, celulares, fones, air-fryers, smartwatches)
   - **Nota (0-5)**
   - **Preço atual** (R$)
   - **Preço original** (opcional, se houver desconto)
   - **Marketplace** (Amazon, Mercado Livre, Shopee, Magalu, AliExpress)
   - **Link de afiliado**
   - **2-3 prós e 1-2 contras**
   - **Resumo de 1 frase**
   - **Imagem (URL)** — **obrigatório** ser foto real do produto (URL do marketplace, ex.: `http2.mlstatic.com/...`) ou arquivo local em `public/reviews/<slug>.webp`. Não usar Unsplash, stock ou placeholder genérico.

2. Derivar o **slug** em kebab-case a partir do nome (ex.: "iPhone 16 Pro" → `iphone-16-pro`).

3. Verificar se já existe arquivo `src/content/reviews/<slug>.mdx` — se sim, perguntar se é para sobrescrever.

4. Criar o arquivo `.mdx` com o template em `.github/copilot-instructions.md`.

5. Preencher `atributos` com base na categoria (ver `src/lib/categorias.ts` — single source of truth).

6. Confirmar ao usuário com um resumo curto.

## Atalho — template mínimo

Se o usuário só der nome + categoria + preço, criar **com placeholders apenas onde o usuário ainda não tem valor real** — exceto `imagem`, que **precisa ser real** desde o início:

- imagem: **`NÃO criar com placeholder`** — pedir ao usuário a URL do produto no marketplace ou usar imagem local em `public/reviews/<slug>.webp`. O linter `npm run check:images` falha CI se detectar Unsplash.
- linkAfiliado: `https://example.com/<slug>` (placeholder, o usuário troca depois)
- pros/contras: 1-2 itens genéricos (deixar o usuário preencher depois)
- emDestaque: `false`

## Validações

- Slug único (sem espaços, sem acentos, kebab-case)
- `categoria` válida (deve estar em `src/lib/categorias.ts`)
- `atributos.preco` sempre presente
- **Imagem real** (URL do marketplace ou arquivo local em `public/reviews/<slug>.webp`). Nunca Unsplash, stock ou placeholder.
- Nota entre 0 e 5
