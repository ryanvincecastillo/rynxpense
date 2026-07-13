# Supabase — Rynxpense on shared project

Tenant slug: **`rynxpense-dev`**

Table prefix: **`rynxpense_`**

## Push migration

From repo root (linked to shared Supabase project):

```bash
cd supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Or run SQL manually: `migrations/20260713220000_rynxpense_initial.sql`

## Tables created

- `rynxpense_profiles`
- `rynxpense_trips`
- `rynxpense_itinerary_days`
- `rynxpense_expenses`
- `rynxpense_share_links`
- `rynxpense_waitlist_entries`

## RPCs

- `rynxpense_ensure_profile(p_project_id, p_display_name)`
- `rynxpense_get_shared_trip(p_slug)` — public read for share pages

## Env (Vercel + local)

See `apps/web/.env.example`

## Auth email

Patch shared `auth-send-email` — see `supabase/functions/auth-send-email/README.md`
