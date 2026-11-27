-- Landing Page CMS Schema (Package Bundles, Testimonials, FAQs, Site Contents)

create table if not exists public.package_bundles (
  id text primary key,
  name text not null,
  subtitle text not null default '',
  box_description text not null default '',
  single_price integer not null check (single_price >= 0),
  bulk_price integer not null check (bulk_price >= 0),
  min_bulk_units integer not null default 20 check (min_bulk_units >= 1),
  is_popular boolean not null default false,
  items text[] not null default '{}',
  bonuses text[] not null default '{}',
  target_audience text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists package_bundles_active_sort_idx
  on public.package_bundles (is_active, sort_order);

create table if not exists public.testimonials (
  id text primary key,
  author text not null,
  role text not null default '',
  city text not null default '',
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  content text not null,
  purchased_product text not null default '',
  initials text not null default 'AF',
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_published_sort_idx
  on public.testimonials (is_published, sort_order);

create table if not exists public.faqs (
  id text primary key,
  question text not null,
  answer text not null,
  badge text null,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_published_sort_idx
  on public.faqs (is_published, sort_order);

create table if not exists public.site_contents (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Role Grants & RLS
grant select on public.package_bundles, public.testimonials, public.faqs, public.site_contents to anon, authenticated;
grant insert, update, delete on public.package_bundles, public.testimonials, public.faqs, public.site_contents to authenticated;

alter table public.package_bundles enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.site_contents enable row level security;

do $$
begin
  -- package_bundles policies
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='package_bundles' and policyname='package_bundles_select_public') then
    create policy package_bundles_select_public on public.package_bundles for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='package_bundles' and policyname='package_bundles_insert_staff') then
    create policy package_bundles_insert_staff on public.package_bundles for insert to authenticated with check ((select private.is_staff()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='package_bundles' and policyname='package_bundles_update_staff') then
    create policy package_bundles_update_staff on public.package_bundles for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='package_bundles' and policyname='package_bundles_delete_staff') then
    create policy package_bundles_delete_staff on public.package_bundles for delete to authenticated using ((select private.is_staff()));
  end if;

  -- testimonials policies
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='testimonials' and policyname='testimonials_select_public') then
    create policy testimonials_select_public on public.testimonials for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='testimonials' and policyname='testimonials_insert_staff') then
    create policy testimonials_insert_staff on public.testimonials for insert to authenticated with check ((select private.is_staff()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='testimonials' and policyname='testimonials_update_staff') then
    create policy testimonials_update_staff on public.testimonials for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='testimonials' and policyname='testimonials_delete_staff') then
    create policy testimonials_delete_staff on public.testimonials for delete to authenticated using ((select private.is_staff()));
  end if;

  -- faqs policies
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='faqs' and policyname='faqs_select_public') then
    create policy faqs_select_public on public.faqs for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='faqs' and policyname='faqs_insert_staff') then
    create policy faqs_insert_staff on public.faqs for insert to authenticated with check ((select private.is_staff()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='faqs' and policyname='faqs_update_staff') then
    create policy faqs_update_staff on public.faqs for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='faqs' and policyname='faqs_delete_staff') then
    create policy faqs_delete_staff on public.faqs for delete to authenticated using ((select private.is_staff()));
  end if;

  -- site_contents policies
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_contents' and policyname='site_contents_select_public') then
    create policy site_contents_select_public on public.site_contents for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_contents' and policyname='site_contents_insert_staff') then
    create policy site_contents_insert_staff on public.site_contents for insert to authenticated with check ((select private.is_staff()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_contents' and policyname='site_contents_update_staff') then
    create policy site_contents_update_staff on public.site_contents for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_contents' and policyname='site_contents_delete_staff') then
    create policy site_contents_delete_staff on public.site_contents for delete to authenticated using ((select private.is_staff()));
  end if;
end $$;

-- Realtime publication
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='package_bundles') then
      alter publication supabase_realtime add table public.package_bundles;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='testimonials') then
      alter publication supabase_realtime add table public.testimonials;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='faqs') then
      alter publication supabase_realtime add table public.faqs;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='site_contents') then
      alter publication supabase_realtime add table public.site_contents;
    end if;
  end if;
end $$;
