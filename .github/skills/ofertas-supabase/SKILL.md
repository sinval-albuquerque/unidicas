---
name: ofertas-supabase
description: Editar, criar ou auditar ofertas no Supabase (tabela `ofertas`) do Unidicas. Use quando o usuário disser "adicione uma oferta", "edite a oferta do X no Supabase", "atualize o preço no banco", "liste as ofertas ativas", "suba o MDX para o banco", ou similar.
---

# Ofertas no Supabase

A vitrine `/ofertas` lê de duas fontes, com prioridade:

1. **Supabase** (tabela `ofertas`) — atualizada sem rebuild.
2. **MDX fallback** (`src/content/ofertas/*.mdx`) — se Supabase falhar ou estiver sem env.

## Quando usar Supabase (vs MDX)

| Caso                                                              | Onde editar                 |
| ----------------------------------------------------------------- | --------------------------- |
| Oferta temporária (cupom, frete grátis, vence logo)               | Supabase                    |
| Oferta com review-irmão em `src/content/reviews/<slug>.mdx`       | Supabase (mesmo `slug`)     |
| Conteúdo editorial longo / callouts MDX (`<ProTip>`, `<Warning>`) | MDX (mais rico)             |
| Produto com comparação/ranking                                    | MDX (atributos comparáveis) |

## Adicionar/editar oferta (Table Editor)

1. Confirmar com o usuário: **produto**, **preço**, **preço original** (se desconto), **link de afiliado** (deve conter `?matt_word=unidicasofertas`), `emDestaque`, `categoria`, `tags` opcionais.
2. Se a oferta tiver um review-irmão em `src/content/reviews/<slug>.mdx`, usar o **mesmo `slug`** (consistência entre `/ofertas` e `/reviews/...`).
3. Pedir para o usuário abrir o Table Editor: `https://supabase.com/dashboard/project/_/editor` (a URL exata depende do projeto).
4. Guiar pelos campos obrigatórios:

   | Coluna           | Obrigatório | Observação                                                       |
   | ---------------- | :---------: | ---------------------------------------------------------------- |
   | `slug`           |     ✅      | kebab-case, único                                                |
   | `titulo`         |     ✅      | aparece no card e na página                                      |
   | `produto`        |     ✅      | nome curto (alt de imagem)                                       |
   | `categoria`      |     ✅      | deve existir em `src/lib/categorias.ts`                          |
   | `preco`          |     ✅      | numérico, `>= 0`                                                 |
   | `preco_original` |      —      | se desconto; `>= preco`                                          |
   | `imagem`         |     ✅      | URL completa (`https://...`)                                     |
   | `marketplace`    |     ✅      | "Mercado Livre" / "Amazon" / etc.                                |
   | `link_afiliado`  |     ✅      | **deve** conter `?matt_word=unidicasofertas`                     |
   | `resumo`         |     ✅      | 1 linha                                                          |
   | `conteudo`       |      —      | MDX (opcional)                                                   |
   | `ativo`          |     ✅      | `true` para aparecer                                             |
   | `em_destaque`    |      —      | `true` sobe para o topo da listagem                              |
   | `tags`           |      —      | `text[]` (Postgres) — `{"Frete Grátis","Prime"}` no Table Editor |
   | `expira_em`      |      —      | `timestamptz` ISO                                                |
   | `nota`           |      —      | `0–5` (1 casa decimal)                                           |

5. Após salvar, lembrar: `/ofertas` tem **ISR de 1h** — a mudança pode levar até 60 min para aparecer (ou forçar redeploy).
6. Validar:
   ```sql
   select slug, titulo, preco, ativo, em_destaque, updated_at
   from public.ofertas
   where slug = '<slug>';
   ```

## Subir o MDX para o Supabase (carga inicial / reset)

```bash
npm run ofertas:db:migrate
# equivalente a:
node --env-file=.env.local scripts/migrate-ofertas-to-supabase.mjs
```

Requer `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Upsert idempotente — pode rodar várias vezes.

## Desativar oferta (sem deletar)

- **Table Editor**: linha da oferta → `ativo = false`.
- **SQL**:
  ```sql
  update public.ofertas set ativo = false where slug = '<slug>';
  ```

## Auditoria

"Ativas e ordenadas como na home":

```sql
select slug, titulo, preco, preco_original, em_destaque, updated_at
from public.ofertas
where ativo = true
order by em_destaque desc, preco asc;
```

"Vencidas e ainda ativas" (candidatas a `ativo = false`):

```sql
select slug, titulo, expira_em
from public.ofertas
where ativo = true and expira_em < now();
```

## Validações importantes

- `link_afiliado` **obrigatoriamente** contém `?matt_word=unidicasofertas` (rastreamento ML).
- `categoria` deve existir em `src/lib/categorias.ts` (filtro da home).
- `preco > 0`; `preco_original >= preco` quando presente.
- `expira_em` no passado → considerar `ativo = false` (sem cron hoje).
- `tags` é `text[]` (Postgres array). Use `{"tag1","tag2"}` no Table Editor.

## Referências

- Cliente: `src/lib/supabase.ts`
- Camada DB: `src/lib/ofertas-db.ts`
- Script de migração: `scripts/migrate-ofertas-to-supabase.mjs`
- Schema: `supabase/schema.sql`
- Tipos: `src/types/oferta.ts`
- Skill irmã (MDX): `.github/skills/add-product/SKILL.md`
