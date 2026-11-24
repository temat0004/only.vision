-- =====================================================================
-- only.vision — схема базы для Supabase
-- Запуск: Supabase → SQL Editor → вставить файл целиком → Run.
-- После этого выполнить supabase/seed.sql (стартовые товары).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Таблицы ----------
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,
  price       integer not null check (price > 0),
  description text default '',
  details     text default '',
  art         text default 'tee',
  color       text default '#151515',
  bg          text default '#2a2a2a',
  image_url   text,
  is_new      boolean default false,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- Остаток хранится по размерам. CHECK не даст складу уйти в минус даже при ошибке в коде.
create table if not exists product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size       text not null,
  stock      integer not null default 0 check (stock >= 0),
  unique (product_id, size)
);

create sequence if not exists order_number_seq start 1001;

create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  number        integer unique not null default nextval('order_number_seq'),
  customer_name text not null,
  phone         text not null,
  address       text not null,
  comment       text default '',
  status        text not null default 'new' check (status in ('new', 'assembled', 'delivered')),
  subtotal      integer not null,
  delivery      integer not null,
  total         integer not null,
  created_at    timestamptz default now()
);

create table if not exists order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  name       text not null,
  size       text not null,
  price      integer not null,
  qty        integer not null check (qty > 0)
);

-- Своя функция: «Сообщить о поступлении»
create table if not exists waitlist (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  size       text default '',
  name       text default '',
  phone      text not null,
  notified   boolean default false,
  created_at timestamptz default now()
);

-- ---------- Доступ (RLS) ----------
-- Покупатель (anon): видит активные товары, может записаться в лист ожидания.
-- Заказы создаются ТОЛЬКО через функцию place_order. Читать чужие заказы нельзя.
-- Админ = любой вошедший пользователь (в Authentication отключите регистрацию,
-- создайте одного пользователя вручную).
alter table products         enable row level security;
alter table product_variants enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table waitlist         enable row level security;

drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (active or auth.role() = 'authenticated');
drop policy if exists "admin write products" on products;
create policy "admin write products" on products for all to authenticated using (true) with check (true);

drop policy if exists "public read variants" on product_variants;
create policy "public read variants" on product_variants for select using (true);
drop policy if exists "admin write variants" on product_variants;
create policy "admin write variants" on product_variants for all to authenticated using (true) with check (true);

drop policy if exists "admin orders" on orders;
create policy "admin orders" on orders for all to authenticated using (true) with check (true);
drop policy if exists "admin order items" on order_items;
create policy "admin order items" on order_items for all to authenticated using (true) with check (true);

drop policy if exists "anyone joins waitlist" on waitlist;
create policy "anyone joins waitlist" on waitlist for insert to anon, authenticated with check (phone ~ '^\+996\d{9}$');
drop policy if exists "admin waitlist" on waitlist;
create policy "admin waitlist" on waitlist for all to authenticated using (true) with check (true);

-- Права ролей. В новых проектах Supabase таблицы, созданные через SQL, не открыты для API
-- автоматически — без этих GRANT сайт получает «permission denied». RLS выше ограничивает строки.
grant usage on schema public to anon, authenticated;
grant select on public.products, public.product_variants to anon;
grant insert on public.waitlist to anon;
grant select, insert, update, delete on public.products, public.product_variants, public.orders, public.order_items, public.waitlist to authenticated;
grant usage, select on sequence public.order_number_seq to authenticated;

-- ---------- СЛОЖНОЕ МЕСТО: оформление заказа ----------
-- 1. Блокируем строки нужных размеров (FOR UPDATE). Второй покупатель, который
--    в ту же секунду берёт тот же размер, ждёт, пока закончится первая транзакция.
-- 2. После разблокировки он видит уже уменьшенный остаток и получает OUT_OF_STOCK.
-- 3. Цены берём из базы, а не от клиента.
create or replace function place_order(
  p_name text, p_phone text, p_address text, p_comment text, p_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_min_order   constant integer := 1000;
  v_delivery    constant integer := 200;
  v_free_from   constant integer := 5000;
  v_wanted      record;
  v_problems    jsonb := '[]'::jsonb;
  v_subtotal    integer := 0;
  v_delivery_sum integer;
  v_order       orders;
begin
  if p_phone !~ '^\+996\d{9}$' then
    return jsonb_build_object('ok', false, 'error', 'BAD_PHONE');
  end if;
  if coalesce(length(trim(p_name)), 0) < 2 or coalesce(length(trim(p_address)), 0) < 6 then
    return jsonb_build_object('ok', false, 'error', 'BAD_INPUT');
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('ok', false, 'error', 'EMPTY');
  end if;

  -- Блокируем строки в одном порядке (по id), чтобы не было взаимных блокировок
  perform 1 from product_variants
   where id in (select (x->>'variant_id')::uuid from jsonb_array_elements(p_items) x)
   order by id
   for update;

  -- Сколько хотят и сколько есть (один размер мог прийти дважды — суммируем)
  for v_wanted in
    select w.variant_id, w.qty, pv.stock, p.price, p.active
      from (select (x->>'variant_id')::uuid as variant_id, sum((x->>'qty')::int) as qty
              from jsonb_array_elements(p_items) x group by 1) w
      left join product_variants pv on pv.id = w.variant_id
      left join products p on p.id = pv.product_id
  loop
    if v_wanted.stock is null or not v_wanted.active then
      v_problems := v_problems || jsonb_build_object('variant_id', v_wanted.variant_id, 'available', 0);
    elsif v_wanted.qty < 1 or v_wanted.qty > v_wanted.stock then
      v_problems := v_problems || jsonb_build_object('variant_id', v_wanted.variant_id, 'available', v_wanted.stock);
    else
      v_subtotal := v_subtotal + v_wanted.price * v_wanted.qty;
    end if;
  end loop;

  if jsonb_array_length(v_problems) > 0 then
    return jsonb_build_object('ok', false, 'error', 'OUT_OF_STOCK', 'problems', v_problems);
  end if;
  if v_subtotal < v_min_order then
    return jsonb_build_object('ok', false, 'error', 'MIN_ORDER');
  end if;

  v_delivery_sum := case when v_subtotal >= v_free_from then 0 else v_delivery end;

  insert into orders (customer_name, phone, address, comment, subtotal, delivery, total)
  values (trim(p_name), p_phone, trim(p_address), coalesce(trim(p_comment), ''), v_subtotal, v_delivery_sum, v_subtotal + v_delivery_sum)
  returning * into v_order;

  insert into order_items (order_id, product_id, variant_id, name, size, price, qty)
  select v_order.id, p.id, pv.id, p.name, pv.size, p.price, w.qty
    from (select (x->>'variant_id')::uuid as variant_id, sum((x->>'qty')::int) as qty
            from jsonb_array_elements(p_items) x group by 1) w
    join product_variants pv on pv.id = w.variant_id
    join products p on p.id = pv.product_id;

  -- Списываем остатки
  update product_variants pv
     set stock = pv.stock - w.qty
    from (select (x->>'variant_id')::uuid as variant_id, sum((x->>'qty')::int) as qty
            from jsonb_array_elements(p_items) x group by 1) w
   where pv.id = w.variant_id;

  return jsonb_build_object('ok', true, 'number', v_order.number, 'total', v_order.total);
end;
$$;

-- Отслеживание заказа клиентом: только по паре «номер + телефон»
create or replace function track_order(p_number integer, p_phone text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'number', o.number, 'status', o.status, 'created_at', o.created_at,
    'subtotal', o.subtotal, 'delivery', o.delivery, 'total', o.total,
    'items', coalesce((select jsonb_agg(jsonb_build_object('variant_id', i.variant_id, 'name', i.name, 'size', i.size, 'price', i.price, 'qty', i.qty))
                         from order_items i where i.order_id = o.id), '[]'::jsonb)
  )
  from orders o
  where o.number = p_number and o.phone = p_phone;
$$;

revoke all on function place_order(text, text, text, text, jsonb) from public;
grant execute on function place_order(text, text, text, text, jsonb) to anon, authenticated;
revoke all on function track_order(integer, text) from public;
grant execute on function track_order(integer, text) to anon, authenticated;

-- ---------- Фото товаров: Supabase Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects for select using (bucket_id = 'products');
drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'products');
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update to authenticated using (bucket_id = 'products');
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete to authenticated using (bucket_id = 'products');
