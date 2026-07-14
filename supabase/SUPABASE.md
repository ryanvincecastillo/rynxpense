# Supabase — Rynxpense on shared project

Tenant slug: **`rynxpense-dev`**  
Table prefix: **`rynxpense_`**  
Shared project ref: **`xkoyoleurdafejlyxpxk`** (Ryan's Projects)

## Status (applied)

- [x] Migration SQL executed on shared DB (`rynxpense-dev` project row + all `rynxpense_*` tables)
- [x] Vercel env vars set (production + preview)
- [x] Production redeploy triggered
- [x] `auth-send-email` edge function updated with Rynxpense branding
- [x] Auth redirect URLs added (`rynxpense://login-callback`, `https://rynxpense.com/**`)

The `https://rynxpense.com/**` wildcard covers all post-login redirects including `/discover`, `/trips`, and `/home` — no Supabase dashboard changes needed after the route restructure.

## Routes (web app)

| Path | Purpose |
|------|---------|
| `/` | Redirects to `/home` |
| `/home` | Marketing landing page |
| `/discover` | App home (browse / discover) |
| `/trips` | My trips list |
| `/trips/new` | Plan a new trip |
| `/trips/[id]` | Trip detail |
| `/trips/[id]/expenses` | Expense tracker |
| `/profile` | User profile |
| `/login` | Sign in (redirects to `/discover` when authenticated) |

## Push migration (if re-running)

```bash
cd /Users/ryanvincecastillo/Projects/rynxpense
supabase link --project-ref xkoyoleurdafejlyxpxk
supabase db query --linked -f supabase/migrations/20260713220000_rynxpense_initial.sql
```

Note: `supabase db push` fails on shared project (other apps' migrations not in this repo). Use `db query -f` for additive SQL.

## Shared control plane (`public.projects`)

All tenant apps resolve `NEXT_PUBLIC_APP_PROJECT_SLUG` → project UUID via the `get_project_id_by_slug` RPC. Direct PostgREST access to `public.projects` is blocked by RLS.

Migration lives in **InaanApp** repo: `supabase/migrations/20260715000001_projects_rls_secure_lookup.sql`

## Tables

- `rynxpense_profiles`
- `rynxpense_trips`
- `rynxpense_itinerary_days`
- `rynxpense_expenses`
- `rynxpense_share_links`
- `rynxpense_waitlist_entries`

## RPCs

- `rynxpense_ensure_profile(p_project_id, p_display_name)`
- `rynxpense_get_shared_trip(p_slug)`

## Env (Vercel + local)

See `apps/web/.env.example`. Local copy: `apps/web/.env.local`

| Variable | Where | Purpose |
|----------|-------|---------|
| `RYNXPENSE_EDGE_SECRET` | Supabase secret + Vercel | Auth token for `rynxpense-generate-trip` edge function |
| `RYNXPENSE_GROQ_API_KEY` | Supabase secret (+ optional Vercel/local fallback) | Groq API key for AI trip generation |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local | Legacy edge auth fallback; also used for server-side Supabase admin |

## Edge functions

### `rynxpense-generate-trip`

AI trip plan generation via Groq (`RYNXPENSE_GROQ_API_KEY`). Called from Next.js `/api/trips/generate` with service-role bearer token.

```bash
supabase functions deploy rynxpense-generate-trip --project-ref xkoyoleurdafejlyxpxk
```

## Auth email

Patched in `inaanapp/supabase/functions/auth-send-email` — deployed with `RYNXPENSE_FROM_EMAIL` secret.
