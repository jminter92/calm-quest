create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists daily_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  caffeine_cap numeric not null default 3,
  cost_per_shot numeric,
  taper_start_day date,
  taper_end_day date,
  taper_start_cap numeric,
  taper_end_cap numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists caffeine_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  logged_at timestamptz not null,
  shots numeric not null,
  drink_type text not null,
  note text,
  trigger_label text,
  created_at timestamptz not null default now()
);

create table if not exists trigger_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  logged_at timestamptz not null,
  trigger_label text not null,
  craving_intensity int not null check (craving_intensity between 1 and 5),
  outcome text not null check (outcome in ('resisted', 'partial_win', 'had_caffeine')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  day date not null,
  caffeine_cap_override numeric,
  mood int check (mood between 1 and 5),
  energy int check (energy between 1 and 5),
  sleep_quality int check (sleep_quality between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

create table if not exists xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_type text not null,
  xp_amount int not null,
  related_date date,
  created_at timestamptz not null default now()
);

create unique index if not exists xp_events_daily_cap_once
on xp_events (user_id, event_type, related_date)
where event_type in ('stayed_under_cap', 'three_day_streak', 'seven_day_streak');

create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger daily_settings_updated_at
before update on daily_settings
for each row execute function update_updated_at_column();

create trigger daily_checkins_updated_at
before update on daily_checkins
for each row execute function update_updated_at_column();

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.daily_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

alter table profiles enable row level security;
alter table daily_settings enable row level security;
alter table caffeine_logs enable row level security;
alter table trigger_logs enable row level security;
alter table daily_checkins enable row level security;
alter table xp_events enable row level security;

create policy "Profiles are private"
on profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users manage their settings"
on daily_settings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage caffeine logs"
on caffeine_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage trigger logs"
on trigger_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage daily checkins"
on daily_checkins for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage XP events"
on xp_events for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
