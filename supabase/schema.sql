-- Nocturne DB schema (Postgres)
-- Run this in Supabase SQL editor or via psql against your DB

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  relationship_status text default 'Prefer Not to Say',
  bio text,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  content text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  content text,
  created_at timestamptz default now()
);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  media_url text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade, -- recipient
  actor_id uuid references profiles(id) on delete cascade, -- who triggered
  type text,
  data jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user on notifications(user_id);

-- Push subscriptions for Web Push
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  endpoint text,
  p256dh text,
  auth text,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

create index if not exists idx_push_user on push_subscriptions(user_id);

-- Cleanup old notifications (retain 30 days)
create or replace function public.cleanup_old_notifications()
returns void language sql as $$
  delete from notifications where created_at < now() - interval '30 days';
$$;

create table if not exists dark_reals (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  front_url text,
  back_url text,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid,
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  content text,
  is_whisper boolean default false,
  created_at timestamptz default now()
);

create table if not exists streaks (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references profiles(id) on delete cascade,
  user_b uuid references profiles(id) on delete cascade,
  count int default 0,
  last_message_at timestamptz
);

create table if not exists now_playing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  track_title text,
  track_artist text,
  artwork_url text,
  genre text,
  started_at timestamptz default now()
);

-- Example RLS: allow profile owners to update their profile
-- enable row level security on profiles and add a policy in Supabase UI

-- Spotify token storage per user
create table if not exists spotify_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  access_token text,
  refresh_token text,
  scope text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Atomic streak increment/upsert function
create or replace function public.increment_streak(a uuid, b uuid)
returns void language plpgsql as $$
declare
  ua uuid;
  ub uuid;
  rec record;
begin
  if a < b then
    ua := a; ub := b;
  else
    ua := b; ub := a;
  end if;

  select * into rec from streaks where user_a = ua and user_b = ub for update;
  if rec is null then
    insert into streaks(user_a, user_b, count, last_message_at) values (ua, ub, 1, now());
  else
    if date(rec.last_message_at) = current_date then
      -- same day, do not increment
      update streaks set last_message_at = now() where id = rec.id;
    elsif date(rec.last_message_at) = current_date - 1 then
      update streaks set count = rec.count + 1, last_message_at = now() where id = rec.id;
    else
      update streaks set count = 1, last_message_at = now() where id = rec.id;
    end if;
  end if;
end;
$$;
