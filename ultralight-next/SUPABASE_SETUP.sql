-- ============================================================================
-- ULTRALIGHT — Gestão de Estoque · Configuração do Supabase
-- ----------------------------------------------------------------------------
-- Como usar:
--   1. Acesse https://app.supabase.com -> seu projeto -> SQL Editor
--   2. Cole TODO este arquivo e clique em "Run"
--   3. Copie a URL e a anon key (Settings -> API) para o .env.local
-- ============================================================================

-- 1. Tabelas -----------------------------------------------------------------
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  senha_hash text not null,
  role text not null default 'user',
  created_at timestamptz default now()
);

create table if not exists produtos (
  id text primary key,
  codigo text unique not null,
  nome text not null,
  categoria text default '',
  unidade text not null default 'un',
  estoque_min int not null default 0,
  saldo int not null default 0,
  codigo_barras text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists historico (
  id text primary key,
  produto_id text,
  produto_nome text not null,
  tipo text not null,
  qtd int not null,
  obs text default '',
  data timestamptz not null default now(),
  responsavel text,
  empresa_destino text,
  usuario_id uuid,
  usuario_nome text
);

-- 2. Desabilitar Row Level Security (ferramenta interna) ---------------------
alter table usuarios  disable row level security;
alter table produtos  disable row level security;
alter table historico disable row level security;

-- 3. Habilitar realtime (sincronização entre dispositivos) -------------------
-- (Ignora erro caso a tabela já esteja na publicação)
do $$
begin
  alter publication supabase_realtime add table produtos;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table historico;
exception when duplicate_object then null;
end $$;

-- 4. Usuário admin RYAN (senha: 1234) ----------------------------------------
-- O hash abaixo é o SHA-256 de 'ultralight_2024_1234'.
insert into usuarios (username, senha_hash, role)
values ('RYAN', '25e19c46cf0ca51397c4769b754be40f494579f8761d0c0e889053ed4496ac57', 'admin')
on conflict (username) do nothing;

-- 5. Tabela de ordens de produção ---------------------------------------------
create table if not exists ordens_producao (
  id text primary key,
  tipo text not null,
  status text not null default 'pendente',
  produto_id text,
  produto_nome text not null,
  quantidade int not null,
  petg_quantidade int,
  obs text default '',
  criado_por text not null,
  criado_em timestamptz default now(),
  iniciado_em timestamptz,
  concluido_em timestamptz,
  usuario_destino text not null
);

alter table ordens_producao disable row level security;

do $$
begin
  alter publication supabase_realtime add table ordens_producao;
exception when duplicate_object then null;
end $$;

-- 6. Usuários CHAPARIA e ALMOXARIFADO (senha: 1234) ---------------------------
insert into usuarios (username, senha_hash, role)
values ('CHAPARIA', '25e19c46cf0ca51397c4769b754be40f494579f8761d0c0e889053ed4496ac57', 'chaparia')
on conflict (username) do nothing;

insert into usuarios (username, senha_hash, role)
values ('ALMOXARIFADO', '25e19c46cf0ca51397c4769b754be40f494579f8761d0c0e889053ed4496ac57', 'almoxarifado')
on conflict (username) do nothing;

-- 7. Coluna pausas em ordens_producao (para pausas com motivo) -----------------
-- Execute este bloco se a tabela ja existe sem a coluna pausas.
alter table ordens_producao add column if not exists pausas jsonb default '[]'::jsonb not null;

-- 8. Coluna linha em ordens_producao (para Linha 1 / Linha 2 de montagem) ------
alter table ordens_producao add column if not exists linha text default null;

-- 10. Colunas para pedidos de almoxarifado ---------------------------------------
alter table ordens_producao add column if not exists tipo_pedido text default 'estoque';
alter table ordens_producao add column if not exists pedido_numero text default null;
alter table ordens_producao add column if not exists previsao_entrega text default null;
alter table ordens_producao add column if not exists itens_pedido jsonb default null;

-- 11. Usuários MONTAGEM e EXPEDICAO (senha: 1234) --------------------------------
insert into usuarios (username, senha_hash, role)
values ('MONTAGEM', '25e19c46cf0ca51397c4769b754be40f494579f8761d0c0e889053ed4496ac57', 'montagem')
on conflict (username) do nothing;

insert into usuarios (username, senha_hash, role)
values ('EXPEDICAO', '25e19c46cf0ca51397c4769b754be40f494579f8761d0c0e889053ed4496ac57', 'expedicao')
on conflict (username) do nothing;
