# Base44 Dev Environment

## Stack
- Vite 5 + React 18 + TypeScript + Tailwind CSS
- Frontend-only; all data is mock data (`src/data/mockData.ts`)
- Supabase client exists (`lib/supabase.ts`) but uses placeholder fallbacks — no real credentials needed to boot

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- Dev server on port 3000 with HMR
- `npm install` runs automatically inside the container on start
- `node_modules` is a named volume (not bind-mounted) to avoid host/container conflicts

## Notes
- No external credentials required — the app renders entirely from mock data
- Vite config already has `host: true`; `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is passed via compose env for preview host compatibility
