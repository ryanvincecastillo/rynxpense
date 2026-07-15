-- Auth trip money events (Timeline / decision history)

create table if not exists public.rynxpense_trip_money_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.rynxpense_trips(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  type text not null
    check (type in (
      'price_found',
      'committed',
      'paid',
      'expense',
      'purchase_check',
      'cut_applied',
      'budget_changed'
    )),
  category text,
  amount numeric(14,2),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists rynxpense_trip_money_events_trip_idx
  on public.rynxpense_trip_money_events (trip_id, at desc);

alter table public.rynxpense_trip_money_events enable row level security;

drop policy if exists rynxpense_trip_money_events_all on public.rynxpense_trip_money_events;
create policy rynxpense_trip_money_events_all on public.rynxpense_trip_money_events for all
  using (
    owner_user_id = auth.uid()
    and public.is_project_member(project_id)
  )
  with check (
    owner_user_id = auth.uid()
    and public.is_project_member(project_id)
  );
