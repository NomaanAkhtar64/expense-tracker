# Expense Tracker

A full-stack expense tracker built as a portfolio project. This scaffold covers project setup and JWT-based authentication end-to-end; expense CRUD and analytics are built in a later session (see `todo.md`).

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

Backend tests run against an in-memory SQLite database (see `decisions.md`), so no Postgres instance is required.

## More documentation

- `context.md` — project overview, architecture, current status
- `decisions.md` — reasoning behind key choices (cookie vs localStorage, test DB, etc.)
- `todo.md` — what's left to build (expense CRUD, filtering, analytics, deployment, ...)
