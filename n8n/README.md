# n8n — Sync de Ofertas do Mercado Livre (v2)

Workflow automatizado que busca **produtos específicos do ML** (a partir do
ID do item) numa planilha Google Sheets, normaliza os dados pela **API oficial
do Mercado Livre** e gera dois arquivos:

1. `src/content/ofertas/<slug>.mdx` — formato que o site consome em `/ofertas`
2. `content/produtos/MLB<ID>.json` — versão JSON normalizada (compat com bot atual)

Depois faz `git commit + push` → Vercel auto-deploy.

> **Importante**: este workflow assume que o **n8n roda no seu PC** (IP residencial).
> Se rodar em VPS/cloud, o Mercado Livre pode bloquear o acesso com HTTP 403.

---

## 1. Variáveis de ambiente (Settings → Variables no n8n)

| Variável                | Valor (exemplo)                     | Descrição                                   |
| ----------------------- | ----------------------------------- | ------------------------------------------- |
| `ML_AFFILIATE_ID`       | `UNIDICASOFERTAS`                   | Seu ID de afiliado ML (vai no `?matt_word`) |
| `UNIDICAS_PROJECT_PATH` | `C:\Users\Sinval\Projetos\unidicas` | Caminho absoluto do projeto                 |
| `GSHEET_DOC_ID`         | `1AbCdEf...`                        | ID do Google Sheets (parte da URL)          |
| `GSHEET_SHEET_NAME`     | `categorias`                        | Nome da aba                                 |
| `DESCONTO_MIN_PCT`      | `15`                                | Desconto mínimo para considerar (opcional)  |

> **Como pegar o `GSHEET_DOC_ID`**: abra a planilha, copie o ID entre
> `/d/` e `/edit` na URL. Ex.:
> `https://docs.google.com/spreadsheets/d/**1AbCdEf...**/edit#gid=0`

---

## 2. Planilha Google Sheets

Crie uma planilha com **5 colunas** (linha 1 = cabeçalho):

| mlb_id        | categoria  | categoria_slug | status  | cupom   |
| ------------- | ---------- | -------------- | ------- | ------- |
| MLB1234567890 | Notebooks  | notebooks      | ativa   | NOTA10  |
| MLB9876543210 | Fones      | fones          | ativa   |         |
| MLB5555555555 | Smartwatch | smartwatches   | ativa   | SMART15 |
| MLB1111111111 | Air Fryer  | air-fryers     | ativa   | FRYER20 |
| MLB2222222222 | Aspirador  | outros         | inativa |         |

- **mlb_id**: ID do item no Mercado Livre (10 dígitos começando com MLB).
  Pegue na URL: `mercadolivre.com.br/produto/MLB1234567890/...` ou na LPSM
  (`lista.mercadolivre.com.br/...` → o ID aparece no JSON da página).
- **categoria**: nome legível (apenas descritivo).
- **categoria_slug**: slug do site (`notebooks`, `celulares`, `fones`,
  `smartwatches`, `air-fryers`, `eletrodomesticos`, `outros`).
- **status**: `ativa` para processar, `inativa` para pular.
- **cupom**: opcional, vai para o frontmatter do MDX.

---

## 3. Importar o workflow

1. Abra o n8n (ex.: `http://localhost:5678`)
2. Menu ⋮ → **Import from File…**
3. Selecione `n8n/workflow-ml-ofertas.json`
4. Abra o nó **Ler Google Sheets** e selecione sua credencial OAuth2 Google
5. Ative o workflow (toggle no canto superior direito)

---

## 4. O que cada nó faz

```
[Cron 6h] → [Ler Google Sheets] → [Filtra ativa+mlb_id]
   → [ML API /items/:id] → [Code: Normaliza + Gera MDX/JSON]
   → [Filtra nao-descartados] → [Grava MDX] → [Grava JSON] → [git commit+push]
```

### 4.1. ML API

- Endpoint: `https://api.mercadolibre.com/items/{MLB_ID}`
- **Sem autenticação** (até 1000 req/h)
- Retorna JSON com `price`, `original_price`, `available_quantity`,
  `condition`, `shipping.free_shipping`, `installments`, `permalink`,
  `secure_thumbnail`, `category_id`, `seller_id`

### 4.2. Code: Normaliza + Gera MDX/JSON

- Filtra por `descontoPct >= DESCONTO_MIN_PCT` (15% por padrão)
- Filtra por `estoque > 0`
- Adiciona `?matt_word=ID&matt_tool=ID` no `permalink`
- Imagem fullsize: troca `-I.jpg` por `-O.jpg` (original, sem limite de tamanho)
- Slug estável: `<titulo-slug>-<mlb_id>` (não muda entre execuções)
- Marca `emDestaque: true` se desconto >= 30%
- `expiraEm`: data atual + 6h

### 4.3. Saídas

**MDX** (`src/content/ofertas/<slug>.mdx`) — frontmatter compatível com
`src/types/oferta.ts`:

- `slug`, `titulo`, `preco`, `precoOriginal`, `linkAfiliado`, `pros`,
  `contras`, `imagem`, `emDestaque`, `tags`, `atributos.preco`,
  `atributos.desconto`, `expiraEm`

**JSON** (`content/produtos/MLB<ID>.json`) — campos normalizados
(preco_de/preco_por como **number**, desconto como **number**,
link_afiliado **com matt_word**, imagem fullsize).

### 4.4. git commit + push

- `git add src/content/ofertas/ content/produtos/`
- Só commita se houver diff
- Mensagem: `Bot n8n: sync ML <data> (<titulo>)`
- Push para `origin main` → Vercel auto-deploy

---

## 5. Mudanças da v2 vs v1 (bot antigo)

| Aspecto           | v1 (bot antigo)                          | v2 (este workflow)                                   |
| ----------------- | ---------------------------------------- | ---------------------------------------------------- |
| Fonte dos dados   | Não documentado                          | Google Sheets                                        |
| Endpoint ML       | Provavelmente LPSM (HTML scrapado)       | `/items/:id` (API oficial JSON)                      |
| Preço             | `"R$ 2"` (string quebrada)               | `2.0` (number)                                       |
| Preço original    | `"51% OFF R$499,99"` (string com texto)  | `499.99` (number)                                    |
| Desconto          | `"44%"` (string)                         | `44` (number)                                        |
| Link de afiliado  | `""` (vazio, sem rastreamento)           | `?matt_word=UNIDICASOFERTAS&matt_tool=...`           |
| Imagem            | `D_Q_NP_2X_...` (thumbnail 50px)         | `-O.jpg` (original)                                  |
| Saída principal   | `content/produtos/MLB<ID>.json`          | `src/content/ofertas/<slug>.mdx` (consumido!) + JSON |
| Desconto mínimo   | Nenhum                                   | 15% (configurável)                                   |
| Filtro de estoque | Não                                      | `available_quantity > 0`                             |
| Slug              | Não tinha (id do ML era o identificador) | `<titulo-slug>-<mlb_id>`                             |

---

## 6. Teste manual

1. No n8n, abra o workflow e clique em **Execute Workflow** (▶)
2. Veja a aba **Executions** para confirmar que cada nó passou
3. Verifique se `src/content/ofertas/<slug>.mdx` foi criado
4. Verifique se `content/produtos/MLB<ID>.json` foi **normalizado**
5. Rode `npm run dev` no projeto e abra `/ofertas` para ver o resultado

---

## 7. Limites e cuidados

- **API do ML**: 1000 req/h sem auth — ok para ~10 ofertas a cada 6h
- **Vercel builds**: 1 build a cada 6h = 120 builds/mês (plano grátis = 6.000 min/mês)
- **Git commits**: o workflow só commita se houver mudança (idempotente)
- **Item indisponível**: o filtro `estoque > 0` evita gravar MDX de item esgotado

---

## 8. Próximos passos

- [ ] Adicionar **deduplicação** por `link_afiliado` (evitar reescrever mesmo MDX)
- [ ] Adicionar filtro de **avaliação do vendedor** (`seller.seller_reputation.level_id == "5_green"`)
- [ ] Enviar notificação no **Telegram** após cada sync
- [ ] Adicionar **deduplicação por imagem** (hash MD5) — evita produtos duplicados
- [ ] Adicionar **TTL** no MDX: deletar ofertas com mais de 30 dias
- [ ] Adicionar **categoria automática** (lookup do `category_id` do ML → slug do site)
