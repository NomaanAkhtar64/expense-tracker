# Decisions Log

Newest first. Each entry: what was decided, why, and what the alternative would have cost.

---

## 2026-08-16 — JWT stored in httpOnly cookie, not localStorage

**Decision**: Login goes through a Next.js Route Handler (`/api/auth/login`) that calls FastAPI, then sets the JWT as an httpOnly cookie on the response. All authenticated backend calls (e.g. `/auth/me` for the dashboard) happen server-side in Next.js via `lib/api.ts`, which reads the cookie with `next/headers` `cookies()` and attaches it as a Bearer token. The browser's JS never sees the token.

**Why**: A token in `localStorage` is readable by any JS running on the page — one XSS payload and the token is exfiltrated. An httpOnly cookie can't be read by client-side JS at all, even with XSS present (though the app is still vulnerable to CSRF in principle; not mitigated yet — see `todo.md`).

**Cost of the alternative**: localStorage would have been simpler (no route-handler proxying, no server/client split for data fetching) but meaningfully weaker against XSS, which is the more common real-world token-theft vector for SPAs.

---

## 2026-08-16 — Backend tests use in-memory SQLite, not a second Postgres instance

**Decision**: `backend/tests/conftest.py` spins up a single in-memory SQLite database per test (via SQLAlchemy's `StaticPool` so every connection in a test shares the same DB), rather than requiring a running Postgres instance for tests.

**Why**: Keeps `pytest` a zero-setup command — no service container needed in CI, no risk of tests leaking into a real dev database, fast (all 6 tests run in ~1.5s). The `User` model is simple enough (uuid, string, string, datetime) that SQLite/Postgres behavior doesn't meaningfully diverge.

**Trade-off / risk**: SQLite and Postgres are not identical. `sqlalchemy.Uuid` (not the Postgres-specific `UUID` dialect type) was used specifically so the same model definitions work against both. If future migrations lean on Postgres-only features (JSONB operators, array columns, full-text search, window functions with Postgres-specific syntax), those code paths won't be exercised by the test suite and would need either a real Postgres test fixture or targeted integration tests. Worth revisiting once expense CRUD/analytics land, since analytics queries are the most likely place to hit Postgres-specific SQL.

---

## 2026-08-16 — Login/register use JSON bodies, not OAuth2 form-encoded

**Decision**: `/auth/login` and `/auth/register` accept `{"email": ..., "password": ...}` as JSON, not FastAPI's default `OAuth2PasswordRequestForm` (form-encoded `username`/`password`).

**Why**: There's no actual OAuth2 flow here (no third-party client, no scopes, no token introspection) — just a JWT issued to a first-party frontend. JSON is what the Next.js frontend naturally sends, and using the OAuth2 form convention would have added friction (extra `python-multipart` dependency already included, form-vs-JSON inconsistency across endpoints) for no real benefit.

---

## 2026-08-16 — User ID is a UUID, not an auto-increment integer

**Decision**: `User.id` is a `sqlalchemy.Uuid` primary key (Python `uuid.uuid4()` default), not a serial integer.

**Why**: Avoids leaking user counts/creation order via sequential IDs, and makes IDs safe to expose directly in URLs or API responses later (e.g. `/expenses?user_id=...`) without needing a separate public-facing identifier.

---

## 2026-08-16 — Postgres container mapped to host port 5433, not 5432

**Decision**: `docker-compose.yml` maps `5433:5432` for the postgres service instead of `5432:5432`.

**Why**: The dev machine already had a local Postgres instance bound to host port 5432 (unrelated to this project); the default mapping failed with "address already in use". Only affects host-side access (e.g. `psql` from the host) — the backend container talks to postgres over the internal Docker network at `postgres:5432` regardless, so `DATABASE_URL` inside `docker-compose.yml` is unaffected.

---

## 2026-08-16 — TanStack Query used for client-side mutations only, not for the dashboard fetch

**Decision**: Register and login forms use `useMutation` from `@tanstack/react-query` (wired up via `QueryClientProvider` in `app/providers.tsx`). The dashboard's `/auth/me` call does *not* use TanStack Query — it's a server-side `fetch` inside a Server Component.

**Why**: TanStack Query manages client-side data fetching/caching state; the dashboard fetch happens entirely on the server (as part of rendering the protected page and deciding whether to redirect), so there's no client-side query to manage there. TanStack Query becomes load-bearing once client-side data fetching starts in earnest — expense list/create/update screens are the expected next use.

---

## 2026-08-16 — Hand-wrote the initial Alembic migration instead of running `--autogenerate`

**Decision**: `backend/alembic/versions/ad0640a6f010_create_users_table.py` was written by hand rather than generated via `alembic revision --autogenerate` against a live database.

**Why**: No Postgres instance was reachable at the moment the migration needed to be created (before Docker Compose was verified). The migration is simple (one table, no relationships), so hand-writing it and then verifying it applies cleanly against real Postgres (`docker compose exec backend alembic upgrade head` — confirmed working) was faster and equally reliable. Future migrations should use `--autogenerate` against the running dev Postgres as normal.
