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
| Frontend framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS v4 (manual class-based dark mode, see `decisions.md`) |
| Client-side data fetching | TanStack Query |
| Local dev | Docker Compose (Postgres + backend); frontend runs outside Docker via `npm run dev` |
| Testing | pytest (backend only, so far) |
| CI | GitHub Actions, runs pytest on push/PR |

See `decisions.md` for the reasoning behind specific choices (test DB, cookie storage, ID type, category model, theme persistence, etc).

## Repo layout

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, /health, router wiring
│   │   ├── config.py            # pydantic-settings, reads .env
│   │   ├── database.py          # async engine/session, Base
│   │   ├── models.py            # User, ExpenseCategory, Expense
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── security.py          # password hashing, JWT encode/decode
│   │   ├── deps.py              # get_current_user dependency
│   │   ├── seed_data.py         # DEFAULT_EXPENSE_CATEGORIES, used by the migration
│   │   └── routers/
│   │       ├── auth.py          # /auth/register, /auth/login, /auth/me
│   │       ├── categories.py    # /categories (GET/POST), /categories/{id} (DELETE)
│   │       └── expenses.py      # /expenses (GET/POST), /expenses/{id} (GET/PATCH/DELETE)
│   ├── alembic/versions/         # 2 migrations: users table; expense_categories + expenses tables (+ seed)
│   ├── tests/                    # pytest suite, SQLite in-memory fixture (auth only so far)
│   ├── requirements.txt          # pinned deps
│   ├── .env.example               # committed template
│   └── .env                       # real local secrets, gitignored
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              # root layout: reads theme cookie, renders Header/Footer/ThemeProvider/Providers
│   │   ├── page.tsx                # "/" — redirects to /dashboard or /login depending on auth
│   │   ├── header.tsx              # async Server Component: brand link, ThemeToggle, LogoutButton if authenticated
│   │   ├── footer.tsx
│   │   ├── logout-button.tsx
│   │   ├── theme-provider.tsx      # ThemeContext, writes the theme cookie + toggles the .dark class
│   │   ├── theme-toggle.tsx        # header sun/moon button
│   │   ├── providers.tsx           # QueryClientProvider
│   │   ├── login/
│   │   │   ├── page.tsx            # async Server Component: redirects to /dashboard if already logged in
│   │   │   └── login-form.tsx      # the actual form (client component, TanStack Query mutation)
│   │   ├── register/               # same split as login/
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # protected Server Component, shows user email
│   │   │   ├── expense-list.tsx    # table + "Add expense", TanStack Query
│   │   │   └── delete-expense-dialog.tsx  # popup confirm modal for delete
│   │   ├── expenses/
│   │   │   ├── category-combobox.tsx  # shared creatable combobox (new + edit forms)
│   │   │   ├── new/page.tsx           # create expense form
│   │   │   └── [id]/edit/              # Server Component fetch + client edit-expense-form.tsx
│   │   └── api/                    # route handlers proxying to FastAPI with the cookie JWT attached:
│   │       ├── auth/               # register, login (sets cookie), logout
│   │       ├── categories/         # GET/POST
│   │       └── expenses/           # GET/POST, [id] GET/PATCH/DELETE
│   ├── lib/
│   │   ├── api.ts                  # server-only fetch helper, attaches JWT from cookie
│   │   ├── auth-client.ts          # client-side fetch wrappers for register/login mutations
│   │   ├── categories-client.ts    # ExpenseCategory type, fetch/create category
│   │   ├── expenses-client.ts      # Expense type, fetch/create/update/delete expense
│   │   └── theme.ts                # THEME_COOKIE_NAME, Theme type
│   └── .env.local                  # BACKEND_URL, gitignored
├── docker-compose.yml               # postgres + backend
└── .github/workflows/backend-tests.yml.disabled  # rename to .yml to re-enable
```

## Current status (as of 2026-08-17)

Auth, expense CRUD, and categories are built and verified end-to-end:

- **Backend**: `/auth/*`, `/categories`, `/categories/{id}`, `/expenses`, `/expenses/{id}` all implemented and manually verified via curl against real Postgres/Docker (two-user isolation, 404-not-403 on other users' resources, 409 on deleting an in-use category, validation errors). Auth still has pytest coverage (6 tests); the newer categories/expenses routes do **not** yet have pytest coverage — see `todo.md`.
- **Frontend**: full flow works against the real stack — register → login → dashboard → add/edit/delete expenses (custom creatable category combobox, popup delete-confirmation modal) → logout. Light/dark theme toggle in the header, persisted via a cookie read server-side (no flash-of-wrong-theme). Logged-in users are redirected away from `/login`/`/register`/`/`.
- Docker Compose stack builds and runs; both Alembic migrations apply cleanly against real Postgres.
- Frontend lints and type-checks cleanly (`npm run lint`, `tsc --noEmit`).
- UI changes in this project are verified with a headless-Chromium Playwright script run inside the `mcr.microsoft.com/playwright` Docker image (see "Key facts to remember" below) rather than manual clicking, since this is a non-interactive environment.

See `todo.md` for what's still open (pytest coverage for the newer routes, category filtering, analytics, auth hardening, deployment).

## Key facts to remember

- The dev machine's default Python is 3.14, which is too new for some pinned dependency wheels (`pydantic-core`, `asyncpg`) to build locally. This doesn't matter for the actual stack — Docker and CI both pin Python 3.12 — but if working directly on the host outside Docker, use Python 3.12 (there's already a `backend/.venv` built with it), not the system `python3`.
- Local Postgres was already running on host port 5432 before this project existed, so `docker-compose.yml` maps the containerized Postgres to host port **5433** instead (backend talks to it internally via `postgres:5432` on the Docker network — this only affects host-side tools like `psql`).
- `backend/.env` (real secrets) and `frontend/.env.local` exist locally for dev convenience but are gitignored; `.env.example` / `.env.local.example` are committed templates.
- `frontend/AGENTS.md` is auto-generated/managed by `next dev` itself (Next.js 16.3+ feature to point AI agents at the version-matched docs bundled in `node_modules/next/dist/docs/`) — don't hand-edit the managed block, it gets rewritten. `frontend/CLAUDE.md` just imports it.
- Verifying frontend UI changes: `chromium-cli` and Playwright's own browser download are not available/runnable directly on the host (missing shared libs like `libnspr4.so`, no passwordless sudo to install them). What works: `npm install playwright` in a scratch dir for the type/API surface, then actually **run** the script inside `docker run --network host mcr.microsoft.com/playwright:<version>-noble node script.js` (pick the image tag matching the installed `playwright` npm package's version) so it reaches the host's `next dev` (port 3000) and Docker-Compose backend (port 8000). Screenshot paths must be relative to the container's mounted working dir, not the host's absolute scratchpad path, or they silently land inside the ephemeral container and vanish on `--rm`.
