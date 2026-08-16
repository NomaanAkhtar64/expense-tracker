# Project Context

## What this is

A full-stack expense tracker, built as a portfolio project. The goal is to demonstrate a clean, production-shaped setup: async FastAPI backend, typed Next.js frontend, real auth (not a toy), migrations, tests, and CI — not just a CRUD demo.

## Stack

| Layer | Choice |
|---|---|
| Backend framework | FastAPI |
| ORM | SQLAlchemy 2.0 (async, `asyncpg` driver) |
| Migrations | Alembic |
| Database | PostgreSQL (Postgres 16 in Docker) |
| Auth | JWT (python-jose) + bcrypt hashing (passlib) |
| Frontend framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS |
| Client-side data fetching | TanStack Query |
| Local dev | Docker Compose (Postgres + backend); frontend runs outside Docker via `npm run dev` |
| Testing | pytest (backend only, so far) |
| CI | GitHub Actions, runs pytest on push/PR |

See `decisions.md` for the reasoning behind specific choices (test DB, cookie storage, ID type, etc).

## Repo layout

```
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, /health
│   │   ├── config.py        # pydantic-settings, reads .env
│   │   ├── database.py      # async engine/session, Base
│   │   ├── models.py        # User model
│   │   ├── schemas.py       # Pydantic request/response models
│   │   ├── security.py      # password hashing, JWT encode/decode
│   │   ├── deps.py          # get_current_user dependency
│   │   └── routers/auth.py  # /auth/register, /auth/login, /auth/me
│   ├── alembic/              # migrations (one so far: create users table)
│   ├── tests/                # pytest suite, SQLite in-memory fixture
│   ├── requirements.txt      # pinned deps
│   ├── .env.example           # committed template
│   └── .env                   # real local secrets, gitignored
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # landing page
│   │   ├── login/page.tsx     # login form (TanStack Query mutation)
│   │   ├── register/page.tsx  # register form (TanStack Query mutation)
│   │   ├── dashboard/page.tsx # protected server component, shows user email
│   │   ├── api/auth/          # route handlers: register, login (sets cookie), logout
│   │   └── providers.tsx      # QueryClientProvider
│   ├── lib/
│   │   ├── api.ts              # server-only fetch helper, attaches JWT from cookie
│   │   └── auth-client.ts      # client-side fetch wrappers for register/login mutations
│   └── .env.local              # BACKEND_URL, gitignored
├── docker-compose.yml          # postgres + backend
└── .github/workflows/backend-tests.yml
```

## Current status (as of 2026-08-16)

Auth is fully working end-to-end and verified:
- Backend: register/login/me tested via pytest (6 tests, all passing) and manually against live Docker Postgres.
- Frontend: register → login → dashboard (shows email) → logout flow verified via curl with a cookie jar against the real running Next.js + FastAPI stack.
- Docker Compose stack builds and runs; Alembic migration applies cleanly against real Postgres.
- Frontend builds and lints cleanly (`npm run build`, `npm run lint`).

Nothing beyond auth has been built yet — see `todo.md`.

## Key facts to remember

- The dev machine's default Python is 3.14, which is too new for some pinned dependency wheels (`pydantic-core`, `asyncpg`) to build locally. This doesn't matter for the actual stack — Docker and CI both pin Python 3.12 — but if working directly on the host outside Docker, use Python 3.12, not the system `python3`.
- Local Postgres was already running on host port 5432 before this project existed, so `docker-compose.yml` maps the containerized Postgres to host port **5433** instead (backend talks to it internally via `postgres:5432` on the Docker network — this only affects host-side tools like `psql`).
- `backend/.env` (real secrets) and `frontend/.env.local` exist locally for dev convenience but are gitignored; `.env.example` / `.env.local.example` are committed templates.
