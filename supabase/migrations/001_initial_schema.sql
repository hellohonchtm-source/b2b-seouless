-- NexusAI B2B Commerce & Agentic Ecosystem — Initial Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL > New Query)
-- All tables use Row-Level Security (RLS). The anon key is safe to ship in the client.

-- ──────────────────────────────────────────────
-- 1. ENUM types
-- ──────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('brand_admin', 'retailer_buyer', 'platform_admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('draft', 'submitted', 'approved', 'paid', 'shipped');
  end if;
  if not exists (select 1 from pg_type where typname = 'agent_task_status') then
    create type agent_task_status as enum ('idle', 'running', 'success', 'error');
  end if;
end $$;

-- ──────────────────────────────────────────────
-- 2. TABLES
-- ──────────────────────────────────────────────

-- profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  role        user_role not null default 'retailer_buyer',
  company_name text not null,
  created_at  timestamptz not null default now()
);

-- products (B2B catalog items)
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  brand_id            text not null,
  name                text not null,
  category            text not null,
  description         text default '',
  wholesale_price_usd numeric(10,2) not null,
  retail_price_usd    numeric(10,2) not null,
  moq                 integer not null default 1,
  images              jsonb not null default '[]'::jsonb,
  owner_id            uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now()
);

-- product_variants (SKUs belonging to a product)
create table if not exists public.product_variants (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references public.products(id) on delete cascade,
  size                text not null,
  color               text not null,
  sku                 text not null unique,
  inventory_count     integer not null default 0,
  wholesale_price_usd numeric(10,2) not null,
  created_at          timestamptz not null default now()
);

-- orders (B2B wholesale orders)
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  buyer_id          uuid not null references auth.users(id) on delete cascade,
  brand_id          text not null,
  status            order_status not null default 'draft',
  total_amount_usd  numeric(12,2) not null,
  created_at        timestamptz not null default now()
);

-- order_items (line items belonging to an order)
create table if not exists public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid not null,
  variant_id      uuid not null,
  quantity        integer not null check (quantity > 0),
  unit_price_usd  numeric(10,2) not null,
  created_at      timestamptz not null default now()
);

-- agent_tasks (AI workflow tasks)
create table if not exists public.agent_tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  status      agent_task_status not null default 'idle',
  output      text,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- 3. INDEXES
-- ──────────────────────────────────────────────
create index if not exists idx_products_owner_id     on public.products(owner_id);
create index if not exists idx_products_brand_id     on public.products(brand_id);
create index if not exists idx_product_variants_pid  on public.product_variants(product_id);
create index if not exists idx_orders_buyer_id       on public.orders(buyer_id);
create index if not exists idx_orders_brand_id      on public.orders(brand_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_agent_tasks_user_id   on public.agent_tasks(user_id);

-- ──────────────────────────────────────────────
-- 4. ROW-LEVEL SECURITY
-- ──────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.agent_tasks      enable row level security;

-- profiles: all authenticated users can read (for persona switcher);
-- users can update only their own profile
create policy "profiles_read_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid());

-- products: all authenticated users can read;
-- owners can insert/update/delete their own products
create policy "products_read_authenticated" on public.products
  for select to authenticated using (true);
create policy "products_insert_own" on public.products
  for insert to authenticated with check (owner_id = auth.uid());
create policy "products_update_own" on public.products
  for update to authenticated using (owner_id = auth.uid());
create policy "products_delete_own" on public.products
  for delete to authenticated using (owner_id = auth.uid());

-- product_variants: all authenticated users can read;
-- only owners of the parent product can write
create policy "variants_read_authenticated" on public.product_variants
  for select to authenticated using (true);
create policy "variants_insert_own" on public.product_variants
  for insert to authenticated with check (
    exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())
  );
create policy "variants_update_own" on public.product_variants
  for update to authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())
  );
create policy "variants_delete_own" on public.product_variants
  for delete to authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())
  );

-- orders: buyers can read their own; brand_admins can read by brand_id;
-- any authenticated user can create orders; buyers can update their own
create policy "orders_read_own" on public.orders
  for select to authenticated using (buyer_id = auth.uid());
create policy "orders_insert_authenticated" on public.orders
  for insert to authenticated with check (buyer_id = auth.uid());
create policy "orders_update_own" on public.orders
  for update to authenticated using (buyer_id = auth.uid());

-- order_items: accessible if the parent order belongs to the user
create policy "order_items_read_own" on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );
create policy "order_items_insert_own" on public.order_items
  for insert to authenticated with check (
    exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );

-- agent_tasks: users can CRUD only their own tasks
create policy "agent_tasks_read_own" on public.agent_tasks
  for select to authenticated using (user_id = auth.uid());
create policy "agent_tasks_insert_own" on public.agent_tasks
  for insert to authenticated with check (user_id = auth.uid());
create policy "agent_tasks_update_own" on public.agent_tasks
  for update to authenticated using (user_id = auth.uid());
create policy "agent_tasks_delete_own" on public.agent_tasks
  for delete to authenticated using (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- 5. AUTO-CREATE PROFILE ON SIGN-UP
-- ──────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, company_name)
  values (new.id, new.email, 'retailer_buyer', '')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────────────────────────────────
-- 6. UPDATED_AT TRIGGERS (optional, for future use)
-- ──────────────────────────────────────────────
-- Tables currently use created_at only. Add updated_at columns
-- and triggers later if mutation tracking is needed.
