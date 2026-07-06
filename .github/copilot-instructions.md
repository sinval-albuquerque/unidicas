# Instruções para o Copilot — Projeto Unidicas

> Este arquivo é lido automaticamente pelo GitHub Copilot (chat, CLI, IDE).
> Ensina o agente a adicionar produtos novos no projeto Unidicas de forma rápida.

## Visão geral do projeto

Site de reviews de produtos (afiliados). Stack: Next.js 16 (App Router) + TypeScript + Tailwind v4 + MDX. Reviews e matérias são arquivos `.mdx` em `src/content/`. O site é estático (sem banco de dados).

## Como adicionar um novo produto (review)

Quando o usuário pedir para adicionar um produto (ex.: "adicione o iPhone 16", "crie uma review do Galaxy S25"), criar um arquivo em `src/content/reviews/<slug>.mdx` com este template (preencher com os dados fornecidos; usar `https://images.unsplash.com/...` para imagem se não houver URL):

```mdx
---
slug: "nome-do-produto-em-kebab"
titulo: "Nome do Produto: destaque principal"
produto: "Nome curto do produto"
categoria: "notebooks" | "celulares" | "fones" | "air-fryers" | "smartwatches"
nota: 4.5
imagem: "https://images.unsplash.com/...?w=600"
marketplace: "Amazon" | "Mercado Livre" | "Shopee" | "Magalu" | "AliExpress"
preco: 999
precoOriginal: 1299  # opcional
linkAfiliado: "https://..."
pros:
  - "Ponto positivo 1"
  - "Ponto positivo 2"
contras:
  - "Ponto negativo 1"
resumo: "Resumo curto em 1 frase."
emDestaque: true  # ou false
atributos:
  # ver src/lib/categorias.ts para IDs por categoria
  memoria: 16
  bateria: 8
  preco: 999
---

## Review completa

Texto da review em MDX. Você pode usar:
- `<ProductCallout title="..." href="..." price={...}>descrição</ProductCallout>`
- `<ProductGrid ids={["slug-outro"]} titulo="Veja também" />`
- `<ProductList categoria="fones" limite={3} />`
- `<ProTip>Dica em destaque</ProTip>`
- `<Warning>Alerta importante</Warning>`
- `<Cite source="Fonte" href="https://...">Citação</Cite>`
```

**IDs de atributos por categoria:** ver [`src/lib/categorias.ts`](src/lib/categorias.ts) — é a fonte única de verdade. Não duplicar aqui.

## Como adicionar uma nova matéria

Criar `src/content/materias/<slug>.mdx`:

```mdx
---
slug: "slug-da-materia"
titulo: "Título da matéria"
resumo: "Resumo em 1-2 frases."
data: "2026-06-28"
destaque: false
---

Conteúdo em MDX. Use os componentes acima para embutir produtos.
```

## Comandos úteis que o usuário pode pedir

- "adicione o produto X" → criar review em `src/content/reviews/`
- "crie uma matéria sobre Y" → criar em `src/content/materias/`
- "liste os produtos cadastrados" → ler `src/content/reviews/`
- "edite a review do X" → ler e modificar
- "delete o produto X" → remover arquivo `.mdx`

## Regras

1. Sempre criar slug em kebab-case a partir do nome.
2. Usar caminhos de imagem do Unsplash como placeholder.
3. Não inventar links de afiliado reais — usar `https://example.com/...`.
4. Sempre incluir `atributos.preco` (o ranking de comparações depende disso).
5. Validar que a `categoria` exista em `src/lib/categorias.ts`.
6. Após criar, o usuário pode rodar `npm run dev` para ver no navegador.
