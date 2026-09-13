# Base44 Dev Environment

## Stack
- Vite 5 + React 18 + TypeScript + Tailwind CSS
- Supabase (auth + Postgres) for backend data when authenticated; mock data as fallback
- Frontend renders entirely from mock data when no user is authenticated

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- Dev server on port 3000 with HMR
- `npm install` runs automatically inside the container on start
- `node_modules` is a named volume (not bind-mounted) to avoid host/container conflicts
- Supabase credentials delivered via `env_file: /run/base44/app.env`

## Architecture
- `lib/repository/` — typed Supabase repository layer (profiles, products, orders, agent_tasks)
  - Uses anon-key client only; never exposes service_role
  - Each read returns `{ data, source, error }` — callers see whether data came from Supabase or local
  - When unauthenticated, returns mock data with `source: 'local'`
  - When authenticated and a Supabase read fails, keeps local data and surfaces the error (no silent overwrite)
- `src/hooks/useAppData.ts` — central hook that loads data, manages loading/error state, and handles writes
- `src/App.tsx` — shows a data-source indicator banner (live vs. local demo) and error/warning banners
- `supabase/migrations/001_initial_schema.sql` — full schema with tables, indexes, RLS policies, and a signup trigger

## Env Vars
- `NEXT_PUBLIC_SUPABASE_URL` — exposed via `import.meta.env` (vite.config `envPrefix: ['VITE_', 'NEXT_PUBLIC_']`)
- `VITE_SUPABASE_ANON_KEY` — exposed via `import.meta.env`
- `GEMINI_API_KEY` — optional, for AI features

## Supabase Setup (Manual Dashboard Steps)
1. Create a Supabase project at https://supabase.com
2. In Dashboard > SQL > New Query, paste and run `supabase/migrations/001_initial_schema.sql`
3. In Dashboard > Authentication > Providers, enable Email/Password
4. In Dashboard > Project Settings > API, copy the Project URL and anon public key
5. Add those as secrets in Base44 (NEXT_PUBLIC_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
6. Sign up a user — the trigger auto-creates a profile row

## Verification
- `npm run build` inside the container to check for compile errors
- Preview shows "DATA SOURCE: LOCAL DEMO DATA" when unauthenticated
- Maker API modal opens from both header button and Dashboard "View API Docs" button
