# Nocturne — Web (Next.js)

Quick starter for the Nocturne web app (Dark Romance theme).

Setup

```bash
cd nocturne/web
npm install
npm run dev
```

Environment

Create a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Spotify sync and scheduled jobs

1. Set these server secrets in your platform (Vercel/GitHub secrets):
```
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
SYNC_TRIGGER_TOKEN
SITE_URL (for GitHub Actions)
```
2. Run DB migrations by applying `supabase/schema.sql` and `supabase/policies.sql`.
3. The repository includes a GitHub Action `spotify-sync.yml` that runs every 15 minutes and POSTs to `/api/spotify/sync_all` using `SYNC_TRIGGER_TOKEN`.

Relationship status

Users can set `relationship_status` on their profile with options like `Single`, `In a Relationship`, `Married`, etc. The field was added to the `profiles` table.

Follows & Notifications

- A `follows` table was added to support follower relationships.
- When a user follows another, a notification is created via a server API (`/api/notify/follow`) using the Supabase service role key.
- Notifications are stored in the `notifications` table and can be read/marked-as-read by the recipient.

Make sure to run both `supabase/schema.sql` and `supabase/policies.sql` to apply these changes.

Web Push (optional)

1. Generate VAPID keys (one-time):

```bash
npx web-push generate-vapid-keys --json
```

2. Set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` as secrets in Vercel/GitHub Actions.
3. The app exposes `/api/push/subscribe` to register subscriptions (server uses `SUPABASE_SERVICE_ROLE_KEY`).
4. Include `PushSetup` component in your client to register the service worker and subscribe users (see `src/components/ui/PushSetup.tsx`).
5. Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` / `VAPID_PUBLIC_KEY` as secrets. Use `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in the client.

Maintenance cleanup

- The app includes a DB function `cleanup_old_notifications()` which deletes notifications older than 30 days.
- Exposed API: `POST /api/maintenance/cleanup` (protected by `MAINTENANCE_TOKEN` header). Use the GitHub Action `cleanup.yml` or a scheduled job to call it daily.

Applying DB migrations

- To apply the database schema and policies locally or to your Supabase Postgres instance, set the `SUPABASE_DB_URL` environment variable (Postgres connection string) and run:

```bash
cd web
./scripts/apply_migrations.sh
```

- Alternatively use the Supabase CLI: `supabase db push` from the repo root.

RLS smoke tests

- To run the RLS smoke script locally set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` then:

```bash
cd web
./scripts/run_rls_smoke.sh
```


