-- supabase/schema-and-rls.sql

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  image_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  paypal_order_id text unique not null,
  customer_email text,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping numeric(10,2) not null default 0 check (shipping >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'paid' check (status in ('paid', 'fulfilled', 'refunded', 'cancelled')),
  shipping_info jsonb not null default '{}'::jsonb,
  paypal_capture jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

insert into public.products (id, name, price, stock, active, image_url, description)
values
  ('can-1', 'Pastel Smile Drop', 40.00, 100, true, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', 'Soft premium tee packed inside a collectible TeePoP can.'),
  ('can-2', 'Cloud Pop Edition', 40.00, 100, true, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80', 'Streetwear-inspired shirt with a clean DTF print finish.'),
  ('can-3', 'Candy Street Pack', 40.00, 100, true, 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80', 'Gift-ready TeePoP drop with premium print quality.')
on conflict (id) do update set
  price = excluded.price,
  name = excluded.name,
  active = excluded.active,
  image_url = excluded.image_url,
  description = excluded.description,
  updated_at = now();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (active = true);

-- Orders and order_items should be written by the backend only using the service role key.
-- Do not create public insert/update/delete policies for orders.

drop policy if exists "Customers can read their own orders" on public.orders;
create policy "Customers can read their own orders"
on public.orders
for select
to authenticated
using (customer_email = auth.jwt() ->> 'email');

drop policy if exists "Customers can read their own order items" on public.order_items;
create policy "Customers can read their own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.customer_email = auth.jwt() ->> 'email'
  )
);

create or replace function public.decrement_product_stock(p_product_id text, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  update public.products
  set stock = stock - p_quantity,
      updated_at = now()
  where id = p_product_id
    and stock >= p_quantity;

  if not found then
    raise exception 'Not enough stock for product %', p_product_id;
  end if;
end;
$$;

revoke all on function public.decrement_product_stock(text, integer) from public;
grant execute on function public.decrement_product_stock(text, integer) to service_role;
