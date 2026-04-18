-- 0003_indexes.sql
-- Performance indexes for common query patterns

-- Shops: look up by owner (dashboard load) and by Vapi phone number ID (webhook)
create index idx_shops_owner_user_id on public.shops(owner_user_id);
create index idx_shops_vapi_phone_number_id on public.shops(vapi_phone_number_id) where vapi_phone_number_id is not null;
create index idx_shops_onboarding_status on public.shops(onboarding_status);

-- Customers: look up by shop + phone (dedup on inbound call)
create index idx_customers_shop_id on public.customers(shop_id);
create index idx_customers_shop_phone on public.customers(shop_id, phone) where phone is not null;
create index idx_customers_shop_email on public.customers(shop_id, email) where email is not null;

-- Calls: recent calls per shop (dashboard)
create index idx_calls_shop_id_created on public.calls(shop_id, created_at desc);
create index idx_calls_vapi_call_id on public.calls(vapi_call_id) where vapi_call_id is not null;
create index idx_calls_customer_id on public.calls(customer_id) where customer_id is not null;

-- Call extractions: by call
create index idx_call_extractions_call_id on public.call_extractions(call_id);

-- Quotes: recent quotes per shop
create index idx_quotes_shop_id_created on public.quotes(shop_id, created_at desc);
create index idx_quotes_customer_id on public.quotes(customer_id);
create index idx_quotes_status on public.quotes(shop_id, status);

-- Agent runs: recent runs per shop (runs page)
create index idx_agent_runs_shop_id_started on public.agent_runs(shop_id, started_at desc);
create index idx_agent_runs_trigger_ref on public.agent_runs(trigger_ref_id) where trigger_ref_id is not null;
create index idx_agent_runs_status on public.agent_runs(shop_id, status);

-- Followups: pending followups per shop
create index idx_followups_shop_id_scheduled on public.followups(shop_id, scheduled_at);
create index idx_followups_status on public.followups(shop_id, status);
create index idx_followups_customer_id on public.followups(customer_id);
