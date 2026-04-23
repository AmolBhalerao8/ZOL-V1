-- 0004_fix_rls_performance_and_missing_fk_index.sql
-- 1. Wrap auth.uid() calls in (select ...) so Postgres evaluates them once
--    per statement instead of once per row — fixes auth_rls_initplan WARNs.
-- 2. Add missing covering index on quotes.call_id (FK without index).

-- ─── SHOPS: rewrite the 4 policies ──────────────────────────────────────────
drop policy if exists "shops_owner_select" on public.shops;
drop policy if exists "shops_owner_insert" on public.shops;
drop policy if exists "shops_owner_update" on public.shops;
drop policy if exists "shops_owner_delete" on public.shops;

create policy "shops_owner_select" on public.shops
  for select using (owner_user_id = (select auth.uid()));

create policy "shops_owner_insert" on public.shops
  for insert with check (owner_user_id = (select auth.uid()));

create policy "shops_owner_update" on public.shops
  for update using (owner_user_id = (select auth.uid()))
  with check (owner_user_id = (select auth.uid()));

create policy "shops_owner_delete" on public.shops
  for delete using (owner_user_id = (select auth.uid()));

-- ─── is_shop_owner: wrap auth.uid() too ─────────────────────────────────────
create or replace function public.is_shop_owner(p_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.shops
    where id = p_shop_id and owner_user_id = (select auth.uid())
  );
$$;

-- ─── Missing FK index on quotes.call_id ──────────────────────────────────────
create index if not exists idx_quotes_call_id on public.quotes (call_id);
