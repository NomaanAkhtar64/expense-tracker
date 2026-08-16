# TODO

Scaffold (auth, project setup) is done and verified end-to-end. Everything below is unbuilt — this is where the next session picks up.

## Expense CRUD (core feature, do this first)

- [ ] `Expense` model: amount, currency?, description, category, date, `user_id` (FK to `users`), created_at/updated_at
- [ ] Alembic migration for `expenses` table
- [ ] `POST /expenses` — create
- [ ] `GET /expenses` — list (scoped to current user)
- [ ] `GET /expenses/{id}` — read one (must belong to current user — 404, not 403, if not)
- [ ] `PUT /expenses/{id}` / `PATCH /expenses/{id}` — update
- [ ] `DELETE /expenses/{id}` — delete
- [ ] pytest coverage for all of the above, including the "can't touch another user's expense" case
- [ ] Frontend: expense list page (probably `/expenses`), using TanStack Query for fetch/cache
- [ ] Frontend: create/edit expense form
- [ ] Frontend: delete with confirmation

## Categories

- [ ] Decide: fixed enum vs. user-defined `Category` table
- [ ] If a table: migration + CRUD endpoints
- [ ] Category filter on the expense list (frontend + backend query param)

## Filtering & search

- [ ] Filter by date range
- [ ] Filter by category
- [ ] Filter by amount range
- [ ] Text search on description
- [ ] Pagination (list endpoint currently has none — will matter once there's real data volume)

## Analytics / reporting

- [ ] Total spend (overall, by period)
- [ ] Spend by category (for a chart)
- [ ] Spend over time (trend chart)
- [ ] Decide charting library for frontend
- [ ] These queries are the most likely place to need Postgres-specific SQL (date truncation, grouping) — see `decisions.md` note on the SQLite test DB limitation; may need a real-Postgres test fixture here

## Auth hardening (deferred from the scaffold, not urgent but real gaps)

- [ ] CSRF protection — httpOnly cookie auth is not CSRF-proof by itself; currently relying on `sameSite=lax`, which is a partial mitigation, not a complete one
- [ ] Refresh tokens / silent refresh (JWT currently just expires after `JWT_EXPIRE_MINUTES`, forcing a full re-login)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Rate limiting / lockout on repeated failed login attempts

## Infra / deployment (not started)

- [ ] Production Dockerfile (multi-stage build; current one is dev-only with `--reload`)
- [ ] Production `next build` / `next start` (or static export, depending on hosting choice) — frontend has no production container yet
- [ ] HTTPS / reverse proxy setup
- [ ] Pick and configure a deployment target (Fly.io, Railway, Render, VPS, etc. — undecided)
- [ ] Production secrets management (currently just `.env` files, fine for local dev only)
- [ ] CI: add a frontend job (lint/build/typecheck) — CI currently only runs backend pytest
