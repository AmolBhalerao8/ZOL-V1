# ZOL — Build Progress

## Status: Build Compiles ✅ | MVP Feature-Complete

---

## ✅ Step 1 — Project Scaffolding
- `package.json` with all dependencies (openai, googleapis, @google-cloud/tasks, zod, shadcn/ui primitives, vitest)
- `tsconfig.json` — strict mode, path aliases (`@/*` → `src/*`)
- `tailwind.config` — standard setup
- `next.config.ts` — `serverExternalPackages` for `@google-cloud/tasks`, `googleapis`, `google-auth-library`
- `.env.example` with all required variables documented
- Full folder scaffold matching the spec

## ✅ Step 2 — Supabase Migrations + Types
- `supabase/migrations/0001_initial_schema.sql` — all 7 tables
- `supabase/migrations/0002_rls_policies.sql` — RLS on every table, `is_shop_owner` helper
- `supabase/migrations/0003_indexes.sql` — performance indexes
- `src/lib/supabase/types.ts` — generated from Supabase MCP, clean (no `__InternalSupabase`)

## ✅ Step 3 — Supabase Client Factories
- `src/lib/supabase/client.ts` — browser client
- `src/lib/supabase/server.ts` — SSR server client (cookie-aware)
- `src/lib/supabase/admin.ts` — service role, bypasses RLS

## ✅ Step 4 — Auth Pages
- `/login` — Supabase email+password sign-in
- `/signup` — Supabase sign-up with redirect to `/create-shop`
- `/api/auth/signout` — sign-out + redirect to `/login`

## ✅ Step 5 — Crypto + Vapi Lib
- `src/lib/crypto/encrypt.ts` — AES-256-GCM encrypt/decrypt using `ENCRYPTION_KEY`
- `src/lib/vapi/client.ts` — Vapi REST wrapper (buy number, create assistant, link, delete)
- `src/lib/vapi/provisioning.ts` — `provisionShop(shopId)` full flow
- `src/lib/vapi/webhook-verify.ts` — HMAC-SHA256 signature verification
- `src/lib/vapi/types.ts` — Vapi webhook payload types

## ✅ Step 6 — Google Lib
- `src/lib/google/oauth.ts` — OAuth 2.0 flow, token exchange, refresh
- `src/lib/google/gmail-client.ts` — per-shop Gmail client factory + `sendEmail`
- `src/lib/google/calendar-client.ts` — per-shop Calendar client factory + CRUD events
- `src/lib/cloud-tasks/enqueue.ts` — GCP Cloud Tasks job enqueue

## ✅ Step 7 — Onboarding Flow
- `/create-shop` — shop name, hours, pricing → INSERT shops
- `/connect-google` — OAuth redirect to Google
- `/provision-phone` — triggers Vapi provisioning
- `/api/google/oauth/callback` — exchanges code, encrypts token, stores in DB
- `/api/onboarding/provision` — calls `provisionShop`

## ✅ Step 8 — Agent System
- `src/agents/types.ts` — `Tool<I,O>`, `ShopContext`, `AgentStepRecord`, all I/O types
- `src/agents/orchestrator.ts` — PLAN → TOOL_CALL → OBSERVE → FINISH loop (OpenAI function calling)
- `src/agents/tools/extract-call-details.ts` — transcript → structured car+issue data
- `src/agents/tools/calculate-quote.ts` — issue → line items + totals via GPT-4o
- `src/agents/tools/upsert-customer.ts` — find-or-create customer in Supabase
- `src/agents/tools/send-quote-email.ts` — send formatted email via shop's Gmail
- `src/agents/tools/book-followup.ts` — create followup record + Google Calendar event
- `src/agents/intake-agent.ts` — full intake pipeline (5 tools in sequence)
- `src/agents/quote-agent.ts` — manual quote generation
- `src/agents/outreach-agent.ts` — follow-up scheduling

## ✅ Step 9 — Features / Business Logic
- `src/features/calls/` — `identify-shop`, `extract-details`, `process-call`
- `src/features/quotes/` — `generate-quote`, `send-quote`
- `src/features/crm/` — `upsert-customer`, `log-interaction`
- `src/features/followups/` — `schedule-followup`
- `src/features/onboarding/` — server actions: `create-shop`, `connect-google`, `provision-vapi`

## ✅ Step 10 — Worker (Cloud Run)
- `workers/agent-worker/index.ts` — HTTP server, `/health` + `/handle` endpoints
- `workers/agent-worker/handler.ts` — receives Cloud Tasks payload, runs intake agent
- `workers/agent-worker/Dockerfile` — Node 20 Alpine, tsx runner

## ✅ Step 11 — Dashboard UI
- `/(dashboard)/layout.tsx` — sidebar navigation
- `/(dashboard)/page.tsx` — home: stats bar + recent activity
- `/calls`, `/calls/[id]` — call list + transcript+extraction detail
- `/quotes`, `/quotes/[id]` — quote cards + line items
- `/customers`, `/customers/[id]` — CRM table + customer detail
- `/runs`, `/runs/[id]` — agent run history + step-by-step trace
- `/settings` — shop info, phone, Google status, pricing, hours, integrations

## ✅ Step 12 — Vitest Tests
- `tests/lib/vapi/webhook-verify.test.ts`
- `tests/lib/vapi/encrypt.test.ts`
- `tests/agents/calculate-quote.test.ts`
- `tests/agents/extract-call-details.test.ts`
- `tests/features/identify-shop.test.ts`

## ⏳ Step 13 — Terraform (Pending GCP keys)
- Infrastructure-as-code for Cloud Run + Cloud Tasks + IAM
- Blocked until `GCP_PROJECT_ID` and `GCP_SERVICE_ACCOUNT_JSON` are provided

---

## Known Gaps (require API keys to activate)

| Feature | Blocked by | Status |
|---|---|---|
| Vapi phone provisioning | `VAPI_API_KEY` | Compiles, runtime no-op |
| Vapi webhook signature check | `VAPI_WEBHOOK_SECRET` | Compiles, verification skipped |
| Google OAuth / Gmail / Calendar | `GOOGLE_CLIENT_ID/SECRET` | Compiles, runtime no-op |
| Cloud Tasks job enqueue | `GCP_PROJECT_ID` + `WORKER_URL` | Compiles, throws error on call |
| Token encryption | `ENCRYPTION_KEY` | Compiles, throws on encrypt/decrypt |
| OpenAI agent runs | `OPENAI_API_KEY` ✅ | Fully functional |
| Supabase DB | `NEXT_PUBLIC_SUPABASE_*` ✅ | Fully functional |

---

## Next Steps (after keys are provided)
1. Add `VAPI_API_KEY` → test phone provisioning
2. Add `GOOGLE_CLIENT_ID/SECRET` + `ENCRYPTION_KEY` → test Google OAuth
3. Add GCP credentials → test Cloud Tasks queue + deploy worker
4. Write Terraform configs for GCP infrastructure
5. Deploy to Vercel + Cloud Run
