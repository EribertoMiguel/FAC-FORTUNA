-- OneState: execute este arquivo no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team text not null default 'Sem equipe' check (team in ('Sem equipe','Carro 1','Carro 2','Carro 3')),
  daily_essence integer not null default 0 check (daily_essence >= 0),
  delivery_per_operation integer not null default 120 check (delivery_per_operation >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete restrict,
  entry_date date not null default current_date,
  kind text not null check (kind in ('production','delivery')),
  essence integer not null default 0 check (essence >= 0),
  jewels integer not null default 0 check (jewels >= 0),
  team text not null default 'Sem equipe' check (team in ('Sem equipe','Carro 1','Carro 2','Carro 3')),
  time_slot text,
  status text not null default 'Pendente' check (status in ('Pendente','Sim','Não','N/A')),
  notes text,
  created_at timestamptz not null default now(),
  constraint entry_kind_values check (
    (kind='production' and essence>=0 and jewels=0) or
    (kind='delivery' and essence=0 and jewels>=0)
  )
);
create index if not exists entries_date_idx on public.entries(entry_date);
create index if not exists entries_member_idx on public.entries(member_id);

create table if not exists public.settings (
  id integer primary key check (id=1),
  ratio integer not null default 10 check (ratio>0),
  warehouse_capacity integer not null default 2500,
  vault_capacity integer not null default 250,
  machines integer not null default 5,
  essence_per_machine integer not null default 250,
  cycle_minutes integer not null default 482,
  delivery_quantity integer not null default 120,
  delivery_count integer not null default 4
);
insert into public.settings(id) values(1) on conflict(id) do nothing;

alter table public.members enable row level security;
alter table public.entries enable row level security;
alter table public.settings enable row level security;

-- Somente usuário autenticado com app_metadata.role = 'admin' acessa dados.
create policy "admin full access members" on public.members
for all to authenticated
using ((auth.jwt()->'app_metadata'->>'role')='admin')
with check ((auth.jwt()->'app_metadata'->>'role')='admin');

create policy "admin full access entries" on public.entries
for all to authenticated
using ((auth.jwt()->'app_metadata'->>'role')='admin')
with check ((auth.jwt()->'app_metadata'->>'role')='admin');

create policy "admin full access settings" on public.settings
for all to authenticated
using ((auth.jwt()->'app_metadata'->>'role')='admin')
with check ((auth.jwt()->'app_metadata'->>'role')='admin');

-- IMPORTANTE:
-- 1) Crie um usuário pelo Supabase Authentication > Users.
-- 2) No SQL Editor, substitua o UUID abaixo pelo ID desse usuário e execute:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where id = 'UUID-DO-USUARIO-ADMIN';
-- Não use user_metadata para a função administrativa: app_metadata é controlado pelo servidor.
