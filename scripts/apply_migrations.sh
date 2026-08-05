#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "SUPABASE_DB_URL not set. You can either set it to your Supabase Postgres connection string or use the Supabase CLI."
  echo "Using Supabase CLI: run 'supabase db push --project-ref <ref>' from repo root."
  exit 1
fi

echo "Applying SQL migrations from $ROOT_DIR/supabase/schema.sql to database"
psql "$SUPABASE_DB_URL" -f "$ROOT_DIR/supabase/schema.sql"
echo "Applying policies from $ROOT_DIR/supabase/policies.sql"
psql "$SUPABASE_DB_URL" -f "$ROOT_DIR/supabase/policies.sql"

echo "Migrations applied."
