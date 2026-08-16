# Expense Tracker

A full-stack expense tracker built as a portfolio project. This scaffold covers project setup and JWT-based authentication end-to-end; expense CRUD and analytics are built in a later session (see "What's not implemented" below).

## Stack

- **Backend**: FastAPI, SQLAlchemy 2.0 (async), Alembic, PostgreSQL
- **Auth**: JWT (python-jose) with bcrypt password hashing (passlib)
- **Frontend**: Next.js (App Router) + TypeScript, Tailwind CSS, TanStack Query
- **Local dev**: Docker Compose (Postgres + FastAPI backend); frontend runs outside Docker via `npm run dev`
- **Testing**: pytest (backend)
- **CI**: GitHub Actions runs pytest on every push/PR

## Project structure

```
.
├── backend/          # FastAPI app, SQLAlchemy models, Alembic migrations, tests
├── frontend/          # Next.js App Router frontend
├── docker-compose.yml # Postgres + backend for local dev
└── .github/workflows/ # CI
```

## Running locally

### 1. Backend + database (Docker)

```bash
cp backend/.env.example backend/.env   # edit JWT_SECRET etc. if you like
docker compose up --build
```

This starts Postgres (named volume `postgres_data`) and the FastAPI backend on `http://localhost:8000`, with code mounted for hot reload.

Apply migrations (first run, and after any new migration):

```bash
docker compose exec backend alembic upgrade head
```

Check it's up: `curl http://localhost:8000/health` → `{"status":"ok"}`

### 2. Frontend (outside Docker)

```bash
cd frontend
npm install
cp .env.local.example .env.local   # BACKEND_URL defaults to http://localhost:8000
npm run dev
```

Visit `http://localhost:3000`. Register an account, log in, and you'll land on `/dashboard`.

## Running tests

```bash
cd backend
pip install -r requirements.txt
pytest
```

Backend tests run against an in-memory SQLite database (see "Decisions" below), so no Postgres instance is required.

## Decisions worth knowing about

- **JWT stored in an httpOnly cookie, not localStorage.** Login goes through a Next.js Route Handler (`/api/auth/login`) that calls the FastAPI backend, then sets the JWT as an httpOnly cookie on the response. Client-side JavaScript (including any XSS payload) can never read this cookie, unlike a token in `localStorage`. All backend calls that need auth (e.g. the dashboard fetching `/auth/me`) happen **server-side** in Next.js (`lib/api.ts`, using `next/headers` `cookies()`), so the token never has to touch the browser's JS runtime at all. Register and login requests from the browser go to Next.js API routes rather than straight to FastAPI, keeping the backend URL/CORS surface minimal.
- **Test database: SQLite in-memory, not a second Postgres instance.** Backend tests spin up a single in-memory SQLite database per test (via SQLAlchemy's `StaticPool` so all connections in a test share it) rather than requiring a running Postgres. This keeps `pytest` a zero-setup, fast command — important for CI, where no Postgres service container is provisioned. The User model is simple enough (uuid, string, string, datetime) that SQLite/Postgres behavior doesn't meaningfully diverge; `sqlalchemy.Uuid` is used instead of the Postgres-specific UUID type specifically so the same models work against both. If future migrations use Postgres-only features, worth revisiting.
- **Login/register use JSON bodies**, not OAuth2 form-encoded (FastAPI's default `OAuth2PasswordRequestForm` convention). Simpler to call from a JSON-based frontend; there's no OAuth2 flow here, so there's no reason to follow that convention.
- **User ID is a UUID**, not an auto-increment integer, to avoid leaking user counts and to make IDs safe to expose in URLs later.
- **TanStack Query is wired up via `app/providers.tsx`** (`QueryClientProvider` in the root layout) and used for the register/login mutations (`useMutation` in `lib/auth-client.ts`). The dashboard's `/auth/me` call doesn't use it since that fetch happens server-side in a Server Component — TanStack Query is a client-side tool, so it comes into play once there's client-side data fetching (which the upcoming expense CRUD screens will need heavily).

## What's NOT yet implemented

This scaffold stops after auth works end-to-end. Still to build:

- Expense CRUD (create/read/update/delete expense records)
- Categories, filtering, search
- Analytics/reporting (charts, totals, trends)
- Any database tables beyond `users`
- Pagination
- Password reset / email verification
- Refresh tokens (current JWT just expires after `JWT_EXPIRE_MINUTES`; there's no silent refresh)
- Production deployment config (the Dockerfile/compose setup here is dev-only — no multi-stage build, no HTTPS, no production `next build`/`next start` service)
- Rate limiting / account lockout on login attempts
