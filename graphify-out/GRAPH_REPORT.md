# Graph Report - .  (2026-06-27)

## Corpus Check
- Corpus is ~6,053 words - fits in a single context window. You may not need a graph.

## Summary
- 155 nodes · 273 edges · 16 communities (11 shown, 5 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Category & Comparison Pages|Category & Comparison Pages]]
- [[_COMMUNITY_Layout, SEO & Metadata|Layout, SEO & Metadata]]
- [[_COMMUNITY_Review UI Components|Review UI Components]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Production Dependencies|Production Dependencies]]
- [[_COMMUNITY_Comparison Attributes|Comparison Attributes]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_Homepage & Review Data|Homepage & Review Data]]
- [[_COMMUNITY_Next.js Docs & Branding|Next.js Docs & Branding]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next Config|Next Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_UI Icons|UI Icons]]
- [[_COMMUNITY_Globe Icon|Globe Icon]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Review` - 10 edges
3. `Ultrabook 14 18h bateria (review)` - 10 edges
4. `obterReviewsPorCategoria()` - 9 edges
5. `Notebook Gamer RTX 4060 16GB (review)` - 9 edges
6. `Workstation 32GB RTX 4070 (review)` - 9 edges
7. `obterCategoria()` - 8 edges
8. `CATEGORIAS` - 7 edges
9. `obterTabelaComparativa()` - 7 edges
10. `Fone Bluetooth ANC 30h (review)` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Next.js logo (wordmark SVG)` --conceptually_related_to--> `Next.js project bootstrap (create-next-app)`  [INFERRED]
  public/next.svg → README.md
- `Vercel logo (triangle SVG)` --conceptually_related_to--> `Next.js project bootstrap (create-next-app)`  [INFERRED]
  public/vercel.svg → README.md
- `Next.js project bootstrap (create-next-app)` --conceptually_related_to--> `Next.js breaking-changes warning (read node_modules/next docs)`  [INFERRED]
  README.md → AGENTS.md
- `CLAUDE agent rules (references AGENTS.md)` --references--> `Next.js breaking-changes warning (read node_modules/next docs)`  [EXTRACTED]
  CLAUDE.md → AGENTS.md
- `Fone Bluetooth ANC 30h (review)` --semantically_similar_to--> `Fone Studio Wireless Hi-Res (review)`  [INFERRED] [semantically similar]
  src/content/reviews/fone-bluetooth-anc.mdx → src/content/reviews/fone-studio-qualidade.mdx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Notebooks comparison set** — reviews_notebook_gamer_rtx_4060, reviews_notebook_ultrabook_bateria, reviews_notebook_workstation_32gb [EXTRACTED 0.95]
- **Fones comparison set** — reviews_fone_bluetooth_anc, reviews_fone_studio_qualidade [EXTRACTED 0.95]
- **Battery leadership attribute group** — reviews_atributo_bateria, reviews_fone_bluetooth_anc, reviews_notebook_ultrabook_bateria [INFERRED 0.75]

## Communities (16 total, 5 thin omitted)

### Community 0 - "Category & Comparison Pages"
Cohesion: 0.16
Nodes (19): CategoriaPage(), CompararPage(), AttributeRanking(), BestByAttributeCard(), ComparisonTable(), obterCategoria(), obterMelhoresPorAtributo(), obterMelhorPorAtributo() (+11 more)

### Community 1 - "Layout, SEO & Metadata"
Cohesion: 0.15
Nodes (10): inter, metadata, Footer(), Header(), CATEGORIA_POR_SLUG, CATEGORIAS, SLUGS_VALIDOS, Marketplace (+2 more)

### Community 2 - "Review UI Components"
Cohesion: 0.18
Nodes (12): RatingBadge(), ReviewCard(), ReviewList(), SearchBar(), REVIEWS_DIR, filtrarReviews(), reviews, AtributoId (+4 more)

### Community 3 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 4 - "Production Dependencies"
Cohesion: 0.13
Nodes (14): dependencies, gray-matter, next, next-mdx-remote, react, react-dom, name, private (+6 more)

### Community 5 - "Comparison Attributes"
Cohesion: 0.34
Nodes (15): Atributo: ANC, Atributo: armazenamento, Atributo: bateria, Atributo: memoria, Atributo: preco, Atributo: processador, Atributo: som, Atributo: tela (+7 more)

### Community 6 - "Dev Dependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-next, jsdom, tailwindcss, @tailwindcss/postcss, @testing-library/jest-dom, @testing-library/react (+6 more)

### Community 7 - "Homepage & Review Data"
Cohesion: 0.48
Nodes (5): HomePage(), Hero(), obterReviewPorSlug(), obterReviewsEmDestaque(), obterTodasReviews()

### Community 8 - "Next.js Docs & Branding"
Cohesion: 0.50
Nodes (5): Next.js breaking-changes warning (read node_modules/next docs), CLAUDE agent rules (references AGENTS.md), Next.js logo (wordmark SVG), Vercel logo (triangle SVG), Next.js project bootstrap (create-next-app)

## Knowledge Gaps
- **62 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Dev Dependencies` to `Production Dependencies`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Review` connect `Review UI Components` to `Category & Comparison Pages`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Ultrabook 14 18h bateria (review)` (e.g. with `Fone Bluetooth ANC 30h (review)` and `Notebook Gamer RTX 4060 16GB (review)`) actually correct?**
  _`Ultrabook 14 18h bateria (review)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Layout, SEO & Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Production Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._