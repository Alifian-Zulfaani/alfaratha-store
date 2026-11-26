-- Alfaratha Store POS, Inventory & Public Catalog Schema
-- Follows Supabase Postgres Best Practices (RLS enabled, FK indexes, private helper, SECURITY INVOKER RPCs)

create schema if not exists private;
grant usage on schema private to authenticated;

-- 1. Core Catalog Tables
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null check (category in ('kurma', 'kismis-kacang', 'cokelat-gift', 'zamzam-herbal', 'paket')),
  origin text not null default 'Timur Tengah',
  description text not null default '',
  badge text null check (badge is null or badge in ('best-seller', 'favorit', 'terbatas', 'premium')),
  badge_text text null,
  image_url text not null default '/images/ajwa.webp',
  default_variant_index integer not null default 0,
  features text[] not null default '{}',
  rating numeric(3, 2) not null default 5.0,
  reviews_count integer not null default 1,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  sku text not null unique,
  label text not null,
  price integer not null check (price >= 0),
  cost_price integer not null check (cost_price >= 0),
  original_price integer null check (original_price is null or original_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  min_stock integer not null default 5 check (min_stock >= 0),
  storage_location text not null default 'Gudang Kering' check (
    storage_location in ('Ruang Pendingin', 'Gudang Kering', 'Gudang Palet', 'Etalase Toko')
  ),
  expired_date date not null default '2027-08-31',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);

-- 2. Staff Profiles (linked to auth.users)
create table if not exists public.staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null unique,
  name text not null,
  role text not null default 'Kasir' check (role in ('Kasir', 'Supervisor', 'Admin Gudang')),
  branch text not null default 'Alfaratha Store',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Private helper verifying authenticated staff membership (cached per query by RLS)
create or replace function private.is_staff()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_profiles sp
    where sp.id = (select auth.uid())
  );
$$;

revoke execute on function private.is_staff() from public, anon, service_role;
grant execute on function private.is_staff() to authenticated;

-- 3. POS Transactions & Item Snapshots
create sequence if not exists public.pos_invoice_seq start with 843 increment by 1;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  created_at timestamptz not null default now(),
  cashier_id uuid null references public.staff_profiles(id) on delete set null,
  cashier_name text not null,
  customer_name text not null default 'Pelanggan Walk-In',
  customer_phone text null,
  pricing_mode text not null check (pricing_mode in ('eceran', 'jamaah')),
  subtotal integer not null check (subtotal >= 0),
  discount integer not null default 0 check (discount >= 0),
  total integer not null check (total >= 0),
  payment_method text not null check (payment_method in ('cash', 'qris', 'transfer', 'edc')),
  cash_received integer not null check (cash_received >= 0),
  change_amount integer not null default 0 check (change_amount >= 0),
  notes text null
);

create index if not exists transactions_cashier_id_idx
  on public.transactions (cashier_id);
create index if not exists transactions_created_at_idx
  on public.transactions (created_at desc);

create table if not exists public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  product_id text not null,
  variant_id text not null,
  sku text not null,
  product_name text not null,
  variant_label text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0)
);

create index if not exists transaction_items_transaction_id_idx
  on public.transaction_items (transaction_id);

-- 4. Inventory Audit Trail
create table if not exists public.stock_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id text not null,
  variant_id text not null,
  sku text not null,
  product_name text not null,
  variant_label text not null,
  type text not null check (type in ('restock', 'rusak', 'retur', 'koreksi', 'penjualan')),
  delta integer not null check (delta <> 0),
  stock_before integer not null check (stock_before >= 0),
  stock_after integer not null check (stock_after >= 0),
  reason text not null,
  staff_id uuid null references public.staff_profiles(id) on delete set null,
  staff_name text not null
);

create index if not exists stock_logs_created_at_idx
  on public.stock_logs (created_at desc);
create index if not exists stock_logs_staff_id_idx
  on public.stock_logs (staff_id);

-- 5. Least-Privilege Role Grants & Row Level Security
grant usage on schema public to anon, authenticated;
grant select on public.products, public.product_variants to anon, authenticated;
grant insert, update, delete on public.products, public.product_variants to authenticated;
grant select, update on public.staff_profiles to authenticated;
grant select, insert on public.transactions, public.transaction_items, public.stock_logs to authenticated;
grant usage, select on sequence public.pos_invoice_seq to authenticated;

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.stock_logs enable row level security;

-- Products policies
drop policy if exists products_select_public on public.products;
create policy products_select_public
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists products_insert_staff on public.products;
create policy products_insert_staff
  on public.products for insert
  to authenticated
  with check ((select private.is_staff()));

drop policy if exists products_update_staff on public.products;
create policy products_update_staff
  on public.products for update
  to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

drop policy if exists products_delete_staff on public.products;
create policy products_delete_staff
  on public.products for delete
  to authenticated
  using ((select private.is_staff()));

-- Product Variants policies
drop policy if exists variants_select_public on public.product_variants;
create policy variants_select_public
  on public.product_variants for select
  to anon, authenticated
  using (true);

drop policy if exists variants_insert_staff on public.product_variants;
create policy variants_insert_staff
  on public.product_variants for insert
  to authenticated
  with check ((select private.is_staff()));

drop policy if exists variants_update_staff on public.product_variants;
create policy variants_update_staff
  on public.product_variants for update
  to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

drop policy if exists variants_delete_staff on public.product_variants;
create policy variants_delete_staff
  on public.product_variants for delete
  to authenticated
  using ((select private.is_staff()));

-- Staff Profiles policies (own profile)
drop policy if exists staff_select_own on public.staff_profiles;
create policy staff_select_own
  on public.staff_profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists staff_update_own on public.staff_profiles;
create policy staff_update_own
  on public.staff_profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Transactions, Items & Stock Logs policies
drop policy if exists transactions_select_staff on public.transactions;
create policy transactions_select_staff
  on public.transactions for select
  to authenticated
  using ((select private.is_staff()));

drop policy if exists transactions_insert_staff on public.transactions;
create policy transactions_insert_staff
  on public.transactions for insert
  to authenticated
  with check ((select private.is_staff()));

drop policy if exists transaction_items_select_staff on public.transaction_items;
create policy transaction_items_select_staff
  on public.transaction_items for select
  to authenticated
  using ((select private.is_staff()));

drop policy if exists transaction_items_insert_staff on public.transaction_items;
create policy transaction_items_insert_staff
  on public.transaction_items for insert
  to authenticated
  with check ((select private.is_staff()));

drop policy if exists stock_logs_select_staff on public.stock_logs;
create policy stock_logs_select_staff
  on public.stock_logs for select
  to authenticated
  using ((select private.is_staff()));

drop policy if exists stock_logs_insert_staff on public.stock_logs;
create policy stock_logs_insert_staff
  on public.stock_logs for insert
  to authenticated
  with check ((select private.is_staff()));

-- 6. Atomic POS & Inventory RPC Functions (SECURITY INVOKER)
create or replace function public.process_pos_checkout(
  p_customer_name text,
  p_customer_phone text,
  p_pricing_mode text,
  p_payment_method text,
  p_cash_received integer,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_staff_id uuid;
  v_cashier_name text;
  v_invoice_number text;
  v_trx_id uuid;
  v_now timestamptz := now();
  v_subtotal integer := 0;
  v_total_qty integer := 0;
  v_discount_rate numeric := 0;
  v_discount integer := 0;
  v_total integer := 0;
  v_cash_received integer;
  v_change_amount integer := 0;
  v_customer_name text;
  v_notes text;
  v_item record;
  v_items_snapshot jsonb := '[]'::jsonb;
begin
  -- Verify authenticated active staff
  select sp.id, sp.name
  into v_staff_id, v_cashier_name
  from public.staff_profiles sp
  where sp.id = (select auth.uid());

  if v_staff_id is null then
    raise exception 'Sesi staff tidak valid atau akses ditolak.';
  end if;

  if p_pricing_mode not in ('eceran', 'jamaah') then
    raise exception 'Mode harga tidak valid.';
  end if;

  if p_payment_method not in ('cash', 'qris', 'transfer', 'edc') then
    raise exception 'Metode pembayaran tidak valid.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang belanja masih kosong.';
  end if;

  -- First pass: Lock rows in deterministic variant_id order to avoid deadlocks and validate stock
  for v_item in
    with req as (
      select
        (el->>'product_id')::text as product_id,
        (el->>'variant_id')::text as variant_id,
        sum((el->>'quantity')::integer)::integer as req_qty
      from jsonb_array_elements(p_items) as el
      group by 1, 2
    )
    select
      req.product_id,
      req.variant_id,
      req.req_qty,
      pv.sku,
      pv.label as variant_label,
      pv.price as unit_price,
      pv.stock as current_stock,
      pr.name as product_name
    from req
    join public.product_variants pv on pv.id = req.variant_id and pv.product_id = req.product_id
    join public.products pr on pr.id = pv.product_id
    order by pv.id asc
    for update of pv
  loop
    if v_item.req_qty is null or v_item.req_qty <= 0 then
      raise exception 'Jumlah pembelian untuk "%" tidak valid.', v_item.product_name;
    end if;

    if v_item.current_stock < v_item.req_qty then
      raise exception 'Stok "% (%)" tidak mencukupi. Tersisa % unit.',
        v_item.product_name, v_item.variant_label, v_item.current_stock;
    end if;

    v_subtotal := v_subtotal + (v_item.unit_price * v_item.req_qty);
    v_total_qty := v_total_qty + v_item.req_qty;
  end loop;

  if v_total_qty = 0 then
    raise exception 'Produk tidak ditemukan di database.';
  end if;

  -- Consistent discount rules: Jamaah -15% (or -20% for >= 20 units)
  if p_pricing_mode = 'jamaah' and v_total_qty >= 1 then
    if v_total_qty >= 20 then
      v_discount_rate := 0.20;
    else
      v_discount_rate := 0.15;
    end if;
    v_discount := round(v_subtotal * v_discount_rate)::integer;
  end if;

  v_total := greatest(0, v_subtotal - v_discount);

  if p_payment_method = 'cash' then
    if coalesce(p_cash_received, 0) < v_total then
      raise exception 'Uang tunai diterima kurang dari total tagihan.';
    end if;
    v_cash_received := p_cash_received;
    v_change_amount := greatest(0, v_cash_received - v_total);
  else
    v_cash_received := v_total;
    v_change_amount := 0;
  end if;

  v_invoice_number := 'TRX-' || extract(year from v_now)::integer::text || '-' || lpad(nextval('public.pos_invoice_seq')::text, 4, '0');
  v_customer_name := coalesce(nullif(btrim(p_customer_name), ''), 'Pelanggan Walk-In');
  v_notes := nullif(btrim(coalesce(p_notes, '')), '');

  insert into public.transactions (
    invoice_number, created_at, cashier_id, cashier_name,
    customer_name, customer_phone, pricing_mode,
    subtotal, discount, total, payment_method, cash_received, change_amount, notes
  )
  values (
    v_invoice_number, v_now, v_staff_id, v_cashier_name,
    v_customer_name, nullif(btrim(coalesce(p_customer_phone, '')), ''), p_pricing_mode,
    v_subtotal, v_discount, v_total, p_payment_method, v_cash_received, v_change_amount, v_notes
  )
  returning id into v_trx_id;

  -- Second pass: Apply stock deduction, transaction items, and stock logs
  for v_item in
    with req as (
      select
        (el->>'product_id')::text as product_id,
        (el->>'variant_id')::text as variant_id,
        sum((el->>'quantity')::integer)::integer as req_qty
      from jsonb_array_elements(p_items) as el
      group by 1, 2
    )
    select
      req.product_id,
      req.variant_id,
      req.req_qty,
      pv.sku,
      pv.label as variant_label,
      pv.price as unit_price,
      pv.stock as stock_before,
      (pv.stock - req.req_qty) as stock_after,
      pr.name as product_name
    from req
    join public.product_variants pv on pv.id = req.variant_id and pv.product_id = req.product_id
    join public.products pr on pr.id = pv.product_id
    order by pv.id asc
  loop
    update public.product_variants
    set stock = v_item.stock_after,
        updated_at = v_now
    where id = v_item.variant_id;

    insert into public.transaction_items (
      transaction_id, product_id, variant_id, sku,
      product_name, variant_label, unit_price, quantity, line_total
    )
    values (
      v_trx_id, v_item.product_id, v_item.variant_id, v_item.sku,
      v_item.product_name, v_item.variant_label, v_item.unit_price, v_item.req_qty,
      v_item.unit_price * v_item.req_qty
    );

    insert into public.stock_logs (
      created_at, product_id, variant_id, sku,
      product_name, variant_label, type, delta,
      stock_before, stock_after, reason, staff_id, staff_name
    )
    values (
      v_now, v_item.product_id, v_item.variant_id, v_item.sku,
      v_item.product_name, v_item.variant_label, 'penjualan', -v_item.req_qty,
      v_item.stock_before, v_item.stock_after, 'Penjualan POS #' || v_invoice_number,
      v_staff_id, v_cashier_name
    );

    v_items_snapshot := v_items_snapshot || jsonb_build_object(
      'productId', v_item.product_id,
      'variantId', v_item.variant_id,
      'sku', v_item.sku,
      'productName', v_item.product_name,
      'variantLabel', v_item.variant_label,
      'unitPrice', v_item.unit_price,
      'quantity', v_item.req_qty,
      'lineTotal', v_item.unit_price * v_item.req_qty
    );
  end loop;

  return jsonb_build_object(
    'id', v_trx_id::text,
    'invoiceNumber', v_invoice_number,
    'timestamp', v_now,
    'cashierName', v_cashier_name,
    'customerName', v_customer_name,
    'customerPhone', nullif(btrim(coalesce(p_customer_phone, '')), ''),
    'pricingMode', p_pricing_mode,
    'items', v_items_snapshot,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'total', v_total,
    'paymentMethod', p_payment_method,
    'cashReceived', v_cash_received,
    'changeAmount', v_change_amount,
    'notes', v_notes
  );
end;
$$;

create or replace function public.adjust_variant_stock(
  p_product_id text,
  p_variant_id text,
  p_delta integer,
  p_type text,
  p_reason text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_staff_id uuid;
  v_staff_name text;
  v_sku text;
  v_product_name text;
  v_variant_label text;
  v_stock_before integer;
  v_stock_after integer;
  v_log_id uuid;
  v_now timestamptz := now();
begin
  select sp.id, sp.name
  into v_staff_id, v_staff_name
  from public.staff_profiles sp
  where sp.id = (select auth.uid());

  if v_staff_id is null then
    raise exception 'Sesi staff tidak valid atau akses ditolak.';
  end if;

  if p_delta is null or p_delta = 0 then
    raise exception 'Jumlah penyesuaian stok tidak boleh nol.';
  end if;

  if p_type not in ('restock', 'rusak', 'retur', 'koreksi') then
    raise exception 'Jenis mutasi stok tidak valid.';
  end if;

  select pv.sku, pr.name, pv.label, pv.stock
  into v_sku, v_product_name, v_variant_label, v_stock_before
  from public.product_variants pv
  join public.products pr on pr.id = pv.product_id
  where pv.id = p_variant_id and pv.product_id = p_product_id
  for update of pv;

  if not found then
    raise exception 'Varian produk tidak ditemukan.';
  end if;

  v_stock_after := v_stock_before + p_delta;
  if v_stock_after < 0 then
    raise exception 'Stok akhir tidak boleh negatif (sisa saat ini %).', v_stock_before;
  end if;

  update public.product_variants
  set stock = v_stock_after,
      updated_at = v_now
  where id = p_variant_id;

  insert into public.stock_logs (
    created_at, product_id, variant_id, sku, product_name, variant_label,
    type, delta, stock_before, stock_after, reason, staff_id, staff_name
  )
  values (
    v_now, p_product_id, p_variant_id, v_sku, v_product_name, v_variant_label,
    p_type, p_delta, v_stock_before, v_stock_after,
    coalesce(nullif(btrim(coalesce(p_reason, '')), ''), 'Penyesuaian (' || p_type || ')'),
    v_staff_id, v_staff_name
  )
  returning id into v_log_id;

  return jsonb_build_object(
    'logId', v_log_id::text,
    'stockBefore', v_stock_before,
    'stockAfter', v_stock_after
  );
end;
$$;

create or replace function public.create_product_with_variant(
  p_id text,
  p_name text,
  p_category text,
  p_origin text,
  p_description text,
  p_badge_text text,
  p_image_url text,
  p_variant_id text,
  p_sku text,
  p_variant_label text,
  p_price integer,
  p_cost_price integer,
  p_stock integer,
  p_min_stock integer,
  p_storage_location text,
  p_expired_date date
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_staff_id uuid;
  v_staff_name text;
  v_now timestamptz := now();
begin
  select sp.id, sp.name
  into v_staff_id, v_staff_name
  from public.staff_profiles sp
  where sp.id = (select auth.uid());

  if v_staff_id is null then
    raise exception 'Sesi staff tidak valid atau akses ditolak.';
  end if;

  insert into public.products (
    id, name, category, origin, description, badge, badge_text,
    image_url, default_variant_index, features, rating, reviews_count, sort_order
  )
  values (
    p_id,
    btrim(p_name),
    p_category,
    coalesce(nullif(btrim(coalesce(p_origin, '')), ''), 'Timur Tengah'),
    coalesce(nullif(btrim(coalesce(p_description, '')), ''), 'Produk kurasi kualitas tinggi Alfaratha Store.'),
    'premium',
    coalesce(nullif(btrim(coalesce(p_badge_text, '')), ''), 'Produk Baru'),
    coalesce(nullif(btrim(coalesce(p_image_url, '')), ''), '/images/ajwa.webp'),
    0,
    array[
      'Kualitas Terjaga & Higienis',
      'Disimpan di ' || p_storage_location,
      'Siap Kirim & Tersedia di Toko'
    ],
    5.0,
    1,
    -1
  );

  insert into public.product_variants (
    id, product_id, sku, label, price, cost_price,
    stock, min_stock, storage_location, expired_date, sort_order
  )
  values (
    p_variant_id, p_id, upper(btrim(p_sku)), coalesce(nullif(btrim(coalesce(p_variant_label, '')), ''), 'Kemasan 500 gr'),
    greatest(0, p_price), greatest(0, p_cost_price),
    greatest(0, p_stock), greatest(1, p_min_stock),
    p_storage_location, coalesce(p_expired_date, '2027-08-31'::date), 0
  );

  if greatest(0, p_stock) > 0 then
    insert into public.stock_logs (
      created_at, product_id, variant_id, sku, product_name, variant_label,
      type, delta, stock_before, stock_after, reason, staff_id, staff_name
    )
    values (
      v_now, p_id, p_variant_id, upper(btrim(p_sku)), btrim(p_name),
      coalesce(nullif(btrim(coalesce(p_variant_label, '')), ''), 'Kemasan 500 gr'),
      'restock', p_stock, 0, p_stock, 'Penambahan SKU Produk Baru', v_staff_id, v_staff_name
    );
  end if;

  return jsonb_build_object('productId', p_id, 'variantId', p_variant_id);
end;
$$;

-- 7. Realtime Publication for Live Stock & Transactions Sync
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.products;
    alter publication supabase_realtime add table public.product_variants;
    alter publication supabase_realtime add table public.transactions;
    alter publication supabase_realtime add table public.stock_logs;
  end if;
exception
  when duplicate_object then null;
end $$;
