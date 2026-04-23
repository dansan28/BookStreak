-- ============================================================
-- BookStreak — Supabase SQL Migrations
-- Run these in order in the Supabase SQL editor
-- ============================================================

-- 1. PROFILES TABLE
create table public.profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users(id) on delete cascade,
  daily_goal_minutes  int not null default 30,
  theme_preference    text not null default 'system'
    check (theme_preference in ('light','dark','system')),
  current_streak      int not null default 0,
  longest_streak      int not null default 0,
  last_read_date      date,
  created_at          timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. BOOKS TABLE
create table public.books (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  author        text not null,
  total_pages   int not null default 0,
  current_page  int not null default 0,
  status        text not null default 'pending'
    check (status in ('pending','reading','finished')),
  rating        int check (rating between 1 and 5),
  cover_url     text,
  created_at    timestamptz not null default now()
);

create index books_user_id_idx on public.books(user_id);
create index books_status_idx on public.books(user_id, status);

-- 3. READING SESSIONS TABLE
create table public.reading_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  book_id          uuid not null references public.books(id) on delete cascade,
  duration_minutes int not null default 0,
  pages_read       int not null default 0,
  date             date not null,
  created_at       timestamptz not null default now()
);

create index sessions_user_date_idx on public.reading_sessions(user_id, date);
create index sessions_book_idx on public.reading_sessions(book_id);

-- 4. STREAK UPDATE FUNCTION
create or replace function public.update_streak(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_last_date   date;
  v_today       date := current_date;
  v_current     int;
  v_longest     int;
begin
  select last_read_date, current_streak, longest_streak
    into v_last_date, v_current, v_longest
    from public.profiles
   where user_id = p_user_id;

  if v_last_date = v_today then
    return; -- Already logged today
  elsif v_last_date = v_today - 1 then
    v_current := v_current + 1; -- Consecutive day
  else
    v_current := 1; -- Streak broken
  end if;

  if v_current > v_longest then
    v_longest := v_current;
  end if;

  update public.profiles
     set current_streak  = v_current,
         longest_streak  = v_longest,
         last_read_date  = v_today
   where user_id = p_user_id;
end;
$$;

-- 5. ROW LEVEL SECURITY

-- PROFILES
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- BOOKS
alter table public.books enable row level security;

create policy "Users can manage own books"
  on public.books for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- READING SESSIONS
alter table public.reading_sessions enable row level security;

create policy "Users can manage own sessions"
  on public.reading_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
