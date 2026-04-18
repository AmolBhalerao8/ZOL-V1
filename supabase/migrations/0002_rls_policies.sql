-- 0002_rls_policies.sql
-- Row Level Security policies for all public tables
-- Every table is scoped to shop_id where shop.owner_user_id = auth.uid()

-- ─── Enable RLS ───────────────────────────────────────────────────────────────
alter table public.shops enable row level security;
alter table public.customers enable row level security;
alter table public.calls enable row level security;
alter table public.call_extractions enable row level security;
alter table public.quotes enable row level security;
alter table public.agent_runs enable row level security;
alter table public.followups enable row level security;

-- ─── SHOPS ────────────────────────────────────────────────────────────────────
-- Users can only see/manage their own shop
create policy "shops_owner_select" on public.shops
  for select using (owner_user_id = auth.uid());

create policy "shops_owner_insert" on public.shops
  for insert with check (owner_user_id = auth.uid());

create policy "shops_owner_update" on public.shops
  for update using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "shops_owner_delete" on public.shops
  for delete using (owner_user_id = auth.uid());

-- ─── Helper function: is_shop_owner ──────────────────────────────────────────
-- Checks if the current user owns a given shop_id
create or replace function public.is_shop_owner(p_shop_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.shops
    where id = p_shop_id and owner_user_id = auth.uid()
  );
$$;

-- ─── CUSTOMERS ────────────────────────────────────────────────────────────────
create policy "customers_shop_select" on public.customers
  for select using (public.is_shop_owner(shop_id));

create policy "customers_shop_insert" on public.customers
  for insert with check (public.is_shop_owner(shop_id));

create policy "customers_shop_update" on public.customers
  for update using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

create policy "customers_shop_delete" on public.customers
  for delete using (public.is_shop_owner(shop_id));

-- ─── CALLS ────────────────────────────────────────────────────────────────────
create policy "calls_shop_select" on public.calls
  for select using (public.is_shop_owner(shop_id));

create policy "calls_shop_insert" on public.calls
  for insert with check (public.is_shop_owner(shop_id));

create policy "calls_shop_update" on public.calls
  for update using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

create policy "calls_shop_delete" on public.calls
  for delete using (public.is_shop_owner(shop_id));

-- ─── CALL EXTRACTIONS ─────────────────────────────────────────────────────────
-- Scoped via the parent call's shop_id
create policy "call_extractions_select" on public.call_extractions
  for select using (
    exists (
      select 1 from public.calls c
      where c.id = call_id and public.is_shop_owner(c.shop_id)
    )
  );

create policy "call_extractions_insert" on public.call_extractions
  for insert with check (
    exists (
      select 1 from public.calls c
      where c.id = call_id and public.is_shop_owner(c.shop_id)
    )
  );

create policy "call_extractions_update" on public.call_extractions
  for update using (
    exists (
      select 1 from public.calls c
      where c.id = call_id and public.is_shop_owner(c.shop_id)
    )
  );

create policy "call_extractions_delete" on public.call_extractions
  for delete using (
    exists (
      select 1 from public.calls c
      where c.id = call_id and public.is_shop_owner(c.shop_id)
    )
  );

-- ─── QUOTES ───────────────────────────────────────────────────────────────────
create policy "quotes_shop_select" on public.quotes
  for select using (public.is_shop_owner(shop_id));

create policy "quotes_shop_insert" on public.quotes
  for insert with check (public.is_shop_owner(shop_id));

create policy "quotes_shop_update" on public.quotes
  for update using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

create policy "quotes_shop_delete" on public.quotes
  for delete using (public.is_shop_owner(shop_id));

-- ─── AGENT RUNS ───────────────────────────────────────────────────────────────
create policy "agent_runs_shop_select" on public.agent_runs
  for select using (public.is_shop_owner(shop_id));

create policy "agent_runs_shop_insert" on public.agent_runs
  for insert with check (public.is_shop_owner(shop_id));

create policy "agent_runs_shop_update" on public.agent_runs
  for update using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

-- ─── FOLLOWUPS ────────────────────────────────────────────────────────────────
create policy "followups_shop_select" on public.followups
  for select using (public.is_shop_owner(shop_id));

create policy "followups_shop_insert" on public.followups
  for insert with check (public.is_shop_owner(shop_id));

create policy "followups_shop_update" on public.followups
  for update using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

create policy "followups_shop_delete" on public.followups
  for delete using (public.is_shop_owner(shop_id));
