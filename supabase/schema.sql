-- ============================================================
-- Lumé — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ─────────────────────────────────────────
-- PROFILES
-- Extended user data linked to auth.users
-- ─────────────────────────────────────────
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  display_name   text,
  skin_type      text not null default 'normal',
  goals          text[] not null default '{}',
  morning_time   text,
  evening_time   text,
  referral_source text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-update updated_at on change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- CHECK-INS
-- Daily mood/energy/sleep/stress entries
-- ─────────────────────────────────────────
create table if not exists check_ins (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  mood         smallint not null check (mood between 1 and 5),
  energy       smallint not null check (energy between 1 and 5),
  stress_level smallint not null check (stress_level between 1 and 5),
  sleep_hours  numeric(4,1) not null,
  notes        text,
  photo_url    text,
  glow_score   numeric(4,1) not null,
  completed_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index check_ins_user_id_completed_at
  on check_ins(user_id, completed_at desc);

alter table check_ins enable row level security;

create policy "Users can read their own check-ins"
  on check_ins for select
  using (auth.uid() = user_id);

create policy "Users can insert their own check-ins"
  on check_ins for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- RITUALS
-- AI-generated ritual stored per check-in
-- ─────────────────────────────────────────
create table if not exists rituals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  check_in_id     uuid not null references check_ins(id) on delete cascade,
  morning_ritual  jsonb not null default '[]',
  evening_ritual  jsonb not null default '[]',
  affirmation     text not null,
  glow_tip        text not null,
  generated_at    timestamptz not null default now()
);

create index rituals_user_id_generated_at
  on rituals(user_id, generated_at desc);

alter table rituals enable row level security;

create policy "Users can read their own rituals"
  on rituals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own rituals"
  on rituals for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- STREAKS
-- One row per user, upserted on each check-in
-- ─────────────────────────────────────────
create table if not exists streaks (
  user_id             uuid primary key references profiles(id) on delete cascade,
  current_streak      integer not null default 0,
  longest_streak      integer not null default 0,
  last_check_in_date  date,
  updated_at          timestamptz not null default now()
);

alter table streaks enable row level security;

create policy "Users can read their own streak"
  on streaks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own streak"
  on streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own streak"
  on streaks for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- CIRCLES
-- Private accountability groups (up to 5 members)
-- ─────────────────────────────────────────
create table if not exists circles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'My Circle',
  created_by  uuid not null references profiles(id) on delete cascade,
  invite_code text not null unique default substring(gen_random_uuid()::text, 1, 8),
  created_at  timestamptz not null default now()
);

alter table circles enable row level security;

create policy "Users can create circles"
  on circles for insert
  with check (auth.uid() = created_by);

-- ─────────────────────────────────────────
-- CIRCLE MEMBERS
-- ─────────────────────────────────────────
create table if not exists circle_members (
  circle_id  uuid not null references circles(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (circle_id, user_id)
);

alter table circle_members enable row level security;

create policy "Members can read their own circle memberships"
  on circle_members for select
  using (auth.uid() = user_id);

create policy "Users can join circles"
  on circle_members for insert
  with check (auth.uid() = user_id);

-- Circles read policy added here (after circle_members exists)
create policy "Circle members can read their circle"
  on circles for select
  using (
    auth.uid() = created_by or
    exists (
      select 1 from circle_members
      where circle_members.circle_id = circles.id
        and circle_members.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- Triggered when a new user registers via Supabase Auth
-- ─────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────
-- POSTS (Community feed — V1.2)
-- ─────────────────────────────────────────
create table if not exists posts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  content      text not null check (char_length(content) between 1 and 280),
  photo_url    text,
  likes_count  integer not null default 0,
  is_flagged   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index posts_created_at on posts(created_at desc);

alter table posts enable row level security;

create policy "Anyone can read non-flagged posts"
  on posts for select
  using (not is_flagged);

create policy "Users can insert own posts"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own posts"
  on posts for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- BOOKINGS (Expert sessions — Glow Elite)
-- ─────────────────────────────────────────
create table if not exists bookings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  session_type   text not null,
  expert_name    text not null,
  scheduled_at   timestamptz not null,
  notes          text,
  status         text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at     timestamptz not null default now()
);

alter table bookings enable row level security;

create policy "Users can read own bookings"
  on bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on bookings for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- STORAGE — photos bucket
-- Run once in Supabase dashboard SQL editor
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos', 'photos', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

create policy "Users can upload their own photos"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read their own photos"
  on storage.objects for select
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own photos"
  on storage.objects for delete
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
