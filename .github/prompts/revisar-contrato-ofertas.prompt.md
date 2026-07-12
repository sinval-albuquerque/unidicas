---
name: revisar-contrato-ofertas
description: Audita a sincronia entre OfertaRow (Supabase, snake_case), Oferta (domínio, camelCase) e OfertaFrontmatter (frontmatter MDX). Use quando o usuário alterar qualquer um dos três contratos, ou quando aparecer um bug do tipo "campo undefined" no card de oferta.
---

# Audite o contrato de Ofertas

Há **três representações** da mesma entidade "oferta" no Unidicas. Se uma mudar sem a outra, o site quebra silenciosamente (campo vira `undefined` e renderiza placeholder ou some).

## 1. Leia os arquivos de contrato

- `src/types/oferta.ts` — `OfertaFrontmatter` (camelCase) + `Oferta extends OfertaFrontmatter` (domínio).
- `src/lib/ofertas-db.ts` — `interface OfertaRow` (snake_case, contrato do Supabase) + `rowToOferta` (a **única ponte** entre banco e domínio).
- `src/lib/ofertas-content.ts` — `obterTodasOfertas` (parser MDX, descarta arquivos sem `slug`/`titulo`).
- `supabase/schema.sql` — DDL (fonte canônica do banco).
- `scripts/migrate-ofertas-to-supabase.mjs` — `parseOfertas` (MDX → row, usado na migração).

## 2. Verifique, para cada campo novo ou renomeado

| Verificação                                           | Onde                                      |
| ----------------------------------------------------- | ----------------------------------------- |
| Existe em `OfertaFrontmatter`?                        | `src/types/oferta.ts`                     |
| Existe em `Oferta`?                                   | `src/types/oferta.ts`                     |
| Existe em `OfertaRow` (snake_case)?                   | `src/lib/ofertas-db.ts`                   |
| `rowToOferta` faz a conversão (`row.x` → `oferta.x`)? | `src/lib/ofertas-db.ts`                   |
| Coluna existe no `CREATE TABLE`?                      | `supabase/schema.sql`                     |
| `parseOfertas` lê o campo do frontmatter?             | `scripts/migrate-ofertas-to-supabase.mjs` |
| `obterTodasOfertas` (MDX) lê o campo do frontmatter?  | `src/lib/ofertas-content.ts`              |

## 3. Regras de naming

- **Domínio (TS, MDX):** `camelCase` → `precoOriginal`, `linkAfiliado`, `emDestaque`, `expiraEm`.
- **Banco (SQL, `OfertaRow`):** `snake_case` → `preco_original`, `link_afiliado`, `em_destaque`, `expira_em`.
- **Conversão em `rowToOferta`** é a única ponte — se algo novo entra, tem que ser mapeado lá, com tratamento de `null` → `undefined` (banco) e fallback `?? undefined` (MDX).

## 4. Saída esperada

Liste, em uma tabela curta:

| Campo           | OfertaFrontmatter | Oferta |    OfertaRow     | rowToOferta | schema.sql | MDX parser | migrate script | OK? |
| --------------- | :---------------: | :----: | :--------------: | :---------: | :--------: | :--------: | :------------: | :-: |
| `slug`          |        ✅         |   ✅   |      `slug`      |     ✅      |     ✅     |     ✅     |       ✅       | ✅  |
| `preco`         |        ✅         |   ✅   |     `preco`      |     ✅      |     ✅     |     ✅     |       ✅       | ✅  |
| `precoOriginal` |        ✅         |   ✅   | `preco_original` |     ✅      |     ✅     |     ✅     |       ✅       | ✅  |
| `linkAfiliado`  |        ✅         |   ✅   | `link_afiliado`  |     ✅      |     ✅     |     ✅     |       ✅       | ✅  |
| `emDestaque`    |        ✅         |   ✅   |  `em_destaque`   |     ✅      |     ✅     |     ✅     |       ✅       | ✅  |
| `expiraEm`      |        ✅         |   ✅   |   `expira_em`    |     ✅      |     ✅     |     ✅     |       ✅       | ✅  |
| …               |         …         |   …    |        …         |      …      |     …      |     …      |       …        |  …  |

Se algum `OK?` for `❌`, indique **arquivo + linha aproximada** a corrigir e proponha o patch mínimo (1–3 linhas por arquivo).

## 5. Bug típico → campo undefined

Sintoma: card renderiza "R$ NaN" ou texto vazio onde deveria estar o preço. Causa mais comum: campo novo foi adicionado em `Oferta` e em `OfertaRow`, mas **esquecido em `rowToOferta`**. Corrigir o mapeamento resolve sem deploy de banco.
