-- Schema da tabela `ofertas` (vitrine /ofertas do Unidicas).
-- Single source of truth do shape: `interface OfertaRow` em src/lib/ofertas-db.ts.
--
-- Aplicar no Supabase via SQL Editor:
--   https://supabase.com/dashboard/project/_/sql/new
--
-- Idempotente: pode rodar quantas vezes quiser (CREATE IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Requer a extensão pgcrypto para gen_random_uuid().

create extension if not exists pgcrypto;

create table if not exists public.ofertas (
  id              uuid          primary key default gen_random_uuid(),
  slug            text          not null unique,
  titulo          text          not null,
  produto         text          not null,
  categoria       text          not null default 'outros',
  mlb_id          text                      check (mlb_id is null or mlb_id ~ '^MLB[A-Z0-9]+$'),
  preco           numeric(10,2) not null check (preco >= 0),
  preco_original  numeric(10,2)            check (preco_original is null or preco_original >= preco),
  imagem          text          not null default '',
  marketplace     text          not null default 'Mercado Livre',
  link_afiliado  text          not null default '#',
  cupom           text,
  expira_em       timestamptz,
  tags            text[]        not null default '{}',
  em_destaque     boolean       not null default false,
  nota            numeric(2,1)             check (nota is null or (nota >= 0 and nota <= 5)),
  resumo          text          not null default '',
  conteudo        text          not null default '',
  verificado_em   date,
  ativo           boolean       not null default true,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

-- Migração idempotente para bases já existentes: garante a coluna
-- `verificado_em` (e outros campos opcionais adicionados depois do CREATE).
-- CREATE TABLE IF NOT EXISTS não adiciona colunas em tabelas pré-existentes.
alter table public.ofertas
  add column if not exists verificado_em date;
alter table public.ofertas
  add column if not exists mlb_id text check (mlb_id is null or mlb_id ~ '^MLB[A-Z0-9]+$');
alter table public.ofertas
  add column if not exists asin text check (asin is null or asin ~ '^B[A-Z0-9]{9}$');

-- Índices de leitura (a query em obterOfertasAtivas filtra por ativo + ordena por em_destaque + preco).
create index if not exists ofertas_ativo_idx      on public.ofertas (ativo);
create index if not exists ofertas_destaque_idx   on public.ofertas (em_destaque, preco);
create index if not exists ofertas_categoria_idx  on public.ofertas (categoria);
create index if not exists ofertas_expira_idx     on public.ofertas (expira_em) where expira_em is not null;
create index if not exists ofertas_verificado_idx on public.ofertas (verificado_em);
create index if not exists ofertas_asin_idx on public.ofertas (asin) where asin is not null;

-- Trigger: mantém updated_at em todo UPDATE.
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ofertas_touch_updated_at on public.ofertas;
create trigger ofertas_touch_updated_at
  before update on public.ofertas
  for each row execute function public.touch_updated_at();

-- ===== Row Level Security =====
-- Leitura pública apenas das ofertas ativas. Sem escrita pelo client (anon/authenticated).
-- Escrita (insert/update/delete) só via service_role (src/lib/supabase.ts → `supabaseAdmin`).

alter table public.ofertas enable row level security;

drop policy if exists "ofertas: leitura pública" on public.ofertas;
create policy "ofertas: leitura pública"
  on public.ofertas
  for select
  to anon, authenticated
  using (ativo = true);

-- Comentários (ajudam no Table Editor)
comment on table  public.ofertas                  is 'Vitrine curada de ofertas (fallback: src/content/ofertas/*.mdx).';
comment on column public.ofertas.slug             is 'kebab-case, único, mesmo slug do review em src/content/reviews/ se existir.';
comment on column public.ofertas.link_afiliado    is 'Deve conter matt_word=unidicasofertas (rastreamento ML).';
comment on column public.ofertas.preco_original   is 'Preço cheio antes do desconto. null = sem desconto.';
comment on column public.ofertas.tags             is 'Array Postgres, ex.: {Frete Grátis,Prime}.';
comment on column public.ofertas.expira_em        is 'ISO timestamptz. Vencida + ativo=true = considerar desativar.';
