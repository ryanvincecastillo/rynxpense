-- Public guest trip snapshots for share-to-social (no auth required)

create table if not exists public.rynxpense_guest_shares (
  slug text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index if not exists rynxpense_guest_shares_expires_idx
  on public.rynxpense_guest_shares (expires_at);

alter table public.rynxpense_guest_shares enable row level security;

drop policy if exists "rynxpense_guest_shares_public_read" on public.rynxpense_guest_shares;
create policy "rynxpense_guest_shares_public_read"
on public.rynxpense_guest_shares
for select
using (expires_at > now());

-- Inserts go through service role (API); no anon/authenticated write policies.
