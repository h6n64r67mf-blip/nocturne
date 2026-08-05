-- Row Level Security policies and examples for Nocturne

-- Enable RLS for profiles
alter table if exists profiles enable row level security;
-- Allow users to select public profiles
create policy "select profiles" on profiles for select using (true);
-- Allow authenticated users to update their own profile
create policy "update own profile" on profiles for update using ( auth.uid() = id );

-- Messages: enable RLS
alter table if exists messages enable row level security;
-- allow participants to select messages where they are sender or receiver
create policy "select messages participants" on messages for select using ( sender_id = auth.uid() or receiver_id = auth.uid() );
-- allow authenticated sender to insert with sender_id = auth.uid()
create policy "insert messages authenticated" on messages for insert with check ( sender_id = auth.uid() );

-- Spotify tokens: only server-side (service role) should access; revoke public access
alter table if exists spotify_tokens enable row level security;
create policy "no public access" on spotify_tokens for select using ( false );

-- now_playing: allow select for public (to show friends' now playing)
alter table if exists now_playing enable row level security;
create policy "select now_playing" on now_playing for select using ( true );

-- stories: allow owner to insert and select by owner or followers (followers logic omitted)
alter table if exists stories enable row level security;
create policy "insert stories" on stories for insert with check ( author_id = auth.uid() );

-- follows: allow users to follow/unfollow others
alter table if exists follows enable row level security;
create policy "insert follow" on follows for insert with check ( follower_id = auth.uid() );
create policy "delete follow" on follows for delete using ( follower_id = auth.uid() );
create policy "select follows" on follows for select using ( follower_id = auth.uid() or following_id = auth.uid() );

-- notifications: only recipients can select their notifications; inserts are restricted to service role (use admin API)
alter table if exists notifications enable row level security;
create policy "select notifications" on notifications for select using ( user_id = auth.uid() );
create policy "no client insert notifications" on notifications for insert using ( false );
-- allow recipients to mark their notifications read
create policy "update notifications read" on notifications for update using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );

-- Notes: After applying policies, test with Supabase Auth and service role to ensure behavior.
