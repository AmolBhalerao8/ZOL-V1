# ZOL — Agentic AI Platform for Mechanic Shops

## Background and Motivation
ZOL is a multi-tenant AI platform for mechanic shops. It handles 24/7 after-hours calls via Vapi, transcribes them, extracts structured data, generates and sends quotes via Gmail, and manages customer follow-ups via Google Calendar.

The project starts from a bare Next.js 16 scaffold with basic Supabase client setup. We need to build the entire platform.

**Available now:** Supabase keys + OpenAI key  
**Add later:** Vapi, Google OAuth, GCP keys  
**Approach:** Build all code fully — it all compiles and runs; features requiring missing keys will return clear errors pointing to configuration.

## Key Challenges and Analysis
- Next.js 16 (App Router) — must read docs before implementing
- Multi-tenant: per-shop credentials in DB, org-level in env
- Agent orchestrator: PLAN → TOOL_CALL → OBSERVE → FINISH loop with GPT-4o function calling
- RLS on every table scoped by shop_id → owner_user_id = auth.uid()
- Encryption of refresh tokens at rest
- Webhook signature verification before processing
- All heavy work deferred to Cloud Tasks worker (return 200 immediately)

## High-level Task Breakdown
1. [x] Fix .env.local + Supabase clients — DONE
2. [ ] Install all dependencies
3. [ ] Supabase migrations + types
4. [ ] lib/* (crypto, vapi, google, openai, cloud-tasks)
5. [ ] agents/* (types, orchestrator, 5 tools, 3 sub-agents)
6. [ ] features/* (calls, quotes, crm, followups, onboarding)
7. [ ] Auth pages + onboarding flow + API routes
8. [ ] Dashboard pages (all 9 pages)
9. [ ] Components (shadcn/ui + custom)
10. [ ] API routes (webhook, oauth, agents, quotes, calendar)
11. [ ] Workers (Cloud Run)
12. [ ] Vitest tests
13. [ ] PROGRESS.md + README + .env.example

## Project Status Board
- [ ] Fix .env.local + Supabase clients
- [ ] Install dependencies
- [ ] Supabase migrations
- [ ] lib/* modules
- [ ] agents/*
- [ ] features/*
- [ ] Auth + onboarding pages
- [ ] Dashboard pages
- [ ] Components
- [ ] API routes
- [ ] Workers
- [ ] Tests
- [ ] Docs

## Lessons
- Next.js 16 App Router: use `getClaims()` not `getSession()` in middleware
- Supabase: use `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not `PUBLISHABLE_KEY`)
- Supabase admin client uses service role key — server-only, never exposed to browser
- Supabase URL: extract ref from JWT → `https://{ref}.supabase.co`

## Executor's Feedback or Assistance Requests
- Building with available keys (Supabase + OpenAI). Vapi/Google/GCP stubs will compile cleanly.
- NEXT_PUBLIC_SUPABASE_URL was empty — extracted from JWT anon key ref: yvnfwohspehfwkvqpriv → https://yvnfwohspehfwkvqpriv.supabase.co
