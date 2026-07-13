-- Rynxpense initial schema (rynxpense_* prefix, shared public.projects tenancy)

create extension if not exists pgcrypto;

-- Ensure shared tenancy tables exist (no-op if already from InaanApp)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = auth.uid()
      and pm.status = 'active'
  );
$$;

insert into public.projects (slug, name)
values ('rynxpense-dev', 'Rynxpense Dev')
on conflict (slug) do nothing;

-- Profiles
create table if not exists public.rynxpense_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete restrict,
  email text not null,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

-- Trips
create table if not exists public.rynxpense_trips (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget_amount numeric(14,2) not null check (budget_amount > 0),
  currency text not null default 'PHP',
  travelers int not null default 2 check (travelers >= 1),
  status text not null default 'PLANNING'
    check (status in ('PLANNING', 'ACTIVE', 'COMPLETED')),
  preferences text,
  total_estimated numeric(14,2),
  budget_breakdown jsonb,
  tips jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rynxpense_trips_owner_idx on public.rynxpense_trips (owner_user_id);
create index if not exists rynxpense_trips_project_idx on public.rynxpense_trips (project_id);
create index if not exists rynxpense_trips_status_idx on public.rynxpense_trips (status);

-- Itinerary days
create table if not exists public.rynxpense_itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.rynxpense_trips(id) on delete cascade,
  day_number int not null check (day_number >= 1),
  title text not null,
  activities jsonb not null default '[]'::jsonb,
  estimated_cost numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, day_number)
);

create index if not exists rynxpense_itinerary_days_trip_idx on public.rynxpense_itinerary_days (trip_id);

-- Expenses
create table if not exists public.rynxpense_expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.rynxpense_trips(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  category text not null,
  note text,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rynxpense_expenses_trip_idx on public.rynxpense_expenses (trip_id);

-- Share links
create table if not exists public.rynxpense_share_links (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null unique references public.rynxpense_trips(id) on delete cascade,
  slug text not null unique,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists rynxpense_share_links_slug_idx on public.rynxpense_share_links (slug);

-- Waitlist
create table if not exists public.rynxpense_waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.rynxpense_profiles enable row level security;
alter table public.rynxpense_trips enable row level security;
alter table public.rynxpense_itinerary_days enable row level security;
alter table public.rynxpense_expenses enable row level security;
alter table public.rynxpense_share_links enable row level security;
alter table public.rynxpense_waitlist_entries enable row level security;

-- Profile policies
drop policy if exists rynxpense_profiles_select on public.rynxpense_profiles;
create policy rynxpense_profiles_select on public.rynxpense_profiles for select
using (public.is_project_member(project_id) and id = auth.uid());

drop policy if exists rynxpense_profiles_insert on public.rynxpense_profiles;
create policy rynxpense_profiles_insert on public.rynxpense_profiles for insert
with check (public.is_project_member(project_id) and id = auth.uid());

drop policy if exists rynxpense_profiles_update on public.rynxpense_profiles;
create policy rynxpense_profiles_update on public.rynxpense_profiles for update
using (public.is_project_member(project_id) and id = auth.uid());

-- Trips
drop policy if exists rynxpense_trips_all on public.rynxpense_trips;
create policy rynxpense_trips_all on public.rynxpense_trips for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

-- Itinerary days (via trip ownership)
drop policy if exists rynxpense_itinerary_days_all on public.rynxpense_itinerary_days;
create policy rynxpense_itinerary_days_all on public.rynxpense_itinerary_days for all
using (
  exists (
    select 1 from public.rynxpense_trips t
    where t.id = trip_id
      and t.owner_user_id = auth.uid()
      and public.is_project_member(t.project_id)
  )
)
with check (
  exists (
    select 1 from public.rynxpense_trips t
    where t.id = trip_id
      and t.owner_user_id = auth.uid()
      and public.is_project_member(t.project_id)
  )
);

-- Expenses
drop policy if exists rynxpense_expenses_all on public.rynxpense_expenses;
create policy rynxpense_expenses_all on public.rynxpense_expenses for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

-- Share links (owner manages; public read via RPC)
drop policy if exists rynxpense_share_links_all on public.rynxpense_share_links;
create policy rynxpense_share_links_all on public.rynxpense_share_links for all
using (
  exists (
    select 1 from public.rynxpense_trips t
    where t.id = trip_id
      and t.owner_user_id = auth.uid()
      and public.is_project_member(t.project_id)
  )
)
with check (
  exists (
    select 1 from public.rynxpense_trips t
    where t.id = trip_id
      and t.owner_user_id = auth.uid()
      and public.is_project_member(t.project_id)
  )
);

-- Waitlist: service-role only for reads; no anon select
drop policy if exists rynxpense_waitlist_service on public.rynxpense_waitlist_entries;
create policy rynxpense_waitlist_service on public.rynxpense_waitlist_entries for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- RPC: ensure profile + project membership
create or replace function public.rynxpense_ensure_profile(
  p_project_id uuid,
  p_display_name text default ''
)
returns public.rynxpense_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_profile public.rynxpense_profiles;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select email into v_email from auth.users where id = v_user_id;

  insert into public.project_members (project_id, user_id, role, status)
  values (p_project_id, v_user_id, 'owner', 'active')
  on conflict (project_id, user_id) do nothing;

  insert into public.rynxpense_profiles (id, project_id, email, display_name)
  values (
    v_user_id,
    p_project_id,
    coalesce(v_email, ''),
    coalesce(nullif(trim(p_display_name), ''), split_part(coalesce(v_email, 'user'), '@', 1))
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = case
      when excluded.display_name <> '' then excluded.display_name
      else rynxpense_profiles.display_name
    end,
    updated_at = now()
  returning * into v_profile;

  return v_profile;
end;
$$;

-- RPC: public shared trip read
create or replace function public.rynxpense_get_shared_trip(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_trip_id uuid;
  v_result jsonb;
begin
  select sl.trip_id into v_trip_id
  from public.rynxpense_share_links sl
  where sl.slug = p_slug and sl.is_public = true;

  if v_trip_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'id', t.id,
    'destination', t.destination,
    'startDate', t.start_date,
    'endDate', t.end_date,
    'budgetAmount', t.budget_amount,
    'currency', t.currency,
    'travelers', t.travelers,
    'status', t.status,
    'totalEstimated', t.total_estimated,
    'budgetBreakdown', t.budget_breakdown,
    'tips', t.tips,
    'itineraryDays', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', d.id,
          'dayNumber', d.day_number,
          'title', d.title,
          'activities', d.activities,
          'estimatedCost', d.estimated_cost
        ) order by d.day_number
      )
      from public.rynxpense_itinerary_days d
      where d.trip_id = t.id
    ), '[]'::jsonb),
    'shareLink', jsonb_build_object(
      'slug', sl.slug,
      'isPublic', sl.is_public
    )
  ) into v_result
  from public.rynxpense_trips t
  join public.rynxpense_share_links sl on sl.trip_id = t.id
  where t.id = v_trip_id and sl.slug = p_slug;

  return v_result;
end;
$$;

grant execute on function public.rynxpense_ensure_profile(uuid, text) to authenticated;
grant execute on function public.rynxpense_get_shared_trip(text) to anon, authenticated;
