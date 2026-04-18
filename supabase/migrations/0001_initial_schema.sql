-- 0001_initial_schema.sql
-- ZOL: Core schema for multi-tenant mechanic shop AI platform

create extension if not exists "uuid-ossp";

-- ─── SHOPS ───────────────────────────────────────────────────────────────────
create table public.shops (
  id                            uuid primary key default uuid_generate_v4(),
  name                          text not null,
  owner_user_id                 uuid not null references auth.users(id) on delete cascade,
  phone_number                  text,                         -- E.164 format
  vapi_phone_number_id          text unique,                  -- Vapi's internal ID
  vapi_assistant_id             text,                         -- Vapi assistant linked to this shop
  phone_provisioning_type       text default 'vapi_owned',   -- 'vapi_owned' | 'forwarded'
  google_email                  text,
  google_refresh_token_encrypted text,
  google_calendar_id            text,
  business_hours                jsonb default '{}'::jsonb,    -- { mon: {open, close}, ... }
  human_redirect_number         text,                         -- forward during business hours
  pricing_config                jsonb default '{}'::jsonb,    -- { labor_rate, parts_markup, common_services: [...] }
  onboarding_status             text not null default 'pending',  -- 'pending' | 'google_connected' | 'phone_provisioned' | 'active'
  created_at                    timestamptz not null default now()
);

-- ─── CUSTOMERS ───────────────────────────────────────────────────────────────
create table public.customers (
  id            uuid primary key default uuid_generate_v4(),
  shop_id       uuid not null references public.shops(id) on delete cascade,
  name          text,
  phone         text,
  email         text,
  vehicle_make  text,
  vehicle_model text,
  vehicle_year  integer,
  plate         text,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ─── CALLS ───────────────────────────────────────────────────────────────────
create table public.calls (
  id           uuid primary key default uuid_generate_v4(),
  shop_id      uuid not null references public.shops(id) on delete cascade,
  customer_id  uuid references public.customers(id) on delete set null,
  vapi_call_id text unique,
  direction    text not null default 'inbound',  -- 'inbound' | 'outbound'
  transcript   text,
  raw_payload  jsonb,
  status       text not null default 'active',   -- 'active' | 'completed' | 'failed'
  started_at   timestamptz,
  ended_at     timestamptz,
  created_at   timestamptz not null default now()
);

-- ─── CALL EXTRACTIONS ────────────────────────────────────────────────────────
create table public.call_extractions (
  id                  uuid primary key default uuid_generate_v4(),
  call_id             uuid not null references public.calls(id) on delete cascade,
  car_details         jsonb,         -- { make, model, year, plate, vin }
  issue_description   text,
  estimated_severity  text,          -- 'low' | 'medium' | 'high'
  person_name         text,
  person_phone        text,
  person_email        text,
  created_at          timestamptz not null default now()
);

-- ─── QUOTES ──────────────────────────────────────────────────────────────────
create table public.quotes (
  id               uuid primary key default uuid_generate_v4(),
  shop_id          uuid not null references public.shops(id) on delete cascade,
  customer_id      uuid not null references public.customers(id) on delete cascade,
  call_id          uuid references public.calls(id) on delete set null,
  line_items       jsonb not null default '[]'::jsonb,  -- [{ description, qty, unit_price }]
  subtotal         numeric(10,2) not null default 0,
  tax              numeric(10,2) not null default 0,
  total            numeric(10,2) not null default 0,
  status           text not null default 'draft',       -- 'draft' | 'sent' | 'accepted' | 'rejected'
  sent_via         text,                                -- 'email' | 'sms'
  gmail_message_id text,
  sent_at          timestamptz,
  created_at       timestamptz not null default now()
);

-- ─── AGENT RUNS ──────────────────────────────────────────────────────────────
create table public.agent_runs (
  id              uuid primary key default uuid_generate_v4(),
  shop_id         uuid not null references public.shops(id) on delete cascade,
  trigger_type    text not null,     -- 'call_ended' | 'manual' | 'scheduled'
  trigger_ref_id  uuid,              -- e.g. call_id
  input           jsonb,
  status          text not null default 'running',  -- 'running' | 'done' | 'failed'
  steps           jsonb not null default '[]'::jsonb,  -- [{ step, tool, input, output, duration_ms, status }]
  result          jsonb,
  error           text,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz
);

-- ─── FOLLOWUPS ───────────────────────────────────────────────────────────────
create table public.followups (
  id                uuid primary key default uuid_generate_v4(),
  shop_id           uuid not null references public.shops(id) on delete cascade,
  customer_id       uuid not null references public.customers(id) on delete cascade,
  scheduled_at      timestamptz,
  type              text not null,   -- 'call' | 'email' | 'service_reminder'
  notes             text,
  status            text not null default 'pending',  -- 'pending' | 'done' | 'cancelled'
  calendar_event_id text,
  created_at        timestamptz not null default now()
);
