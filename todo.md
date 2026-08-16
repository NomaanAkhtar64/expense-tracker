# TODO

Scaffold (auth, project setup) is done and verified end-to-end. Everything below is unbuilt — this is where the next session picks up.

## Expense CRUD (core feature, do this first)

- [x] `Expense` model: amount, currency, description, category, date, `user_id` (FK to `users`), created_at/updated_at
- [x] Alembic migration for `expenses` table (and `expense_categories` — see Categories section)
- [x] `POST /expenses` — create
- [x] `GET /expenses` — list (scoped to current user)
- [x] `GET /expenses/{id}` — read one (must belong to current user — 404, not 403, if not)
- [x] `PATCH /expenses/{id}` — update (partial; went with PATCH only, not also PUT)
- [x] `DELETE /expenses/{id}` — delete
- [ ] pytest coverage for all of the above, including the "can't touch another user's expense" case — manually verified via curl against real Postgres/Docker instead so far, see `decisions.md`
- [x] Frontend: expense list, using TanStack Query for fetch/cache — landed as a section on `/dashboard` (not a separate `/expenses` page) with an "Add expense" button linking to `/expenses/new`
- [x] Frontend: create expense form (`/expenses/new`) — category field is a custom creatable combobox (typing filters existing categories; Enter on "Create "X"" queues that intent locally, no request fires until the whole form submits, at which point `POST /categories` runs before `POST /expenses` if a new category was queued).
- [x] Frontend: edit expense form (`/expenses/[id]/edit`) — Server Component fetches the expense (401 → redirect to `/login`, 404 → Next.js not-found page), passes it to a client form that shares the same `CategoryCombobox` (moved to `app/expenses/category-combobox.tsx` so both forms can import it) and calls `PATCH /api/expenses/[id]`. Reachable via an "Edit" link per row on the dashboard table.
- [x] Frontend: delete with confirmation — `DeleteExpenseDialog` popup modal (not native `window.confirm()`, for theme/dark-mode consistency and testability): backdrop + centered dialog, closes on Escape/backdrop-click/Cancel with zero requests fired, focuses the Cancel button on open, only "Delete" calls `DELETE /api/expenses/[id]`. New `DELETE` handler in `app/api/expenses/[id]/route.ts` and `deleteExpense()` in `lib/expenses-client.ts`.

## Categories

- [x] Decide: fixed enum vs. user-defined `Category` table — went with a hybrid: `ExpenseCategory` table with nullable `user_id` (NULL = global/pre-seeded, set = user-owned custom category). See `decisions.md`.
- [x] Migration — `expense_categories` table created + seeded with 10 default global categories
- [x] `POST /categories` — create a custom category (owned by current user)
- [x] `GET /categories` — list categories visible to current user (global + their own)
- [x] `DELETE /categories/{id}` — delete a custom category (must be owned by current user, not global; 409 if still referenced by an expense)
- [ ] Category filter on the expense list (frontend + backend query param)
- [ ] `PATCH /categories/{id}` — rename a custom category (not built — wasn't in original scope, add if the frontend needs it)

## Frontend layout & theming

- [x] Global `Header` (brand link + theme toggle) and `Footer`, wired into the root layout so every page gets them
- [x] Light/dark theme, light by default, manual toggle (not OS `prefers-color-scheme`) — persisted via a plain `theme` cookie (not httpOnly, just a UI preference) read server-side in `app/layout.tsx` so the very first response already has the right class on `<html>`, avoiding any flash-of-wrong-theme. Tailwind v4 manual dark variant (`@custom-variant dark`) in `globals.css`.
- [x] Auth-aware header — `Header` is now an async Server Component that checks `/auth/me` on every request and shows `LogoutButton` (moved from `app/dashboard/` to `app/logout-button.tsx`) only when authenticated
- [x] Fixed: logged-in users could still reach `/login` and `/register` — both now check auth server-side and redirect to `/dashboard` if already logged in (form UI split out into `login-form.tsx`/`register-form.tsx` client components so the page itself can stay an async Server Component doing the check)
- [x] `/` now redirects immediately: `/dashboard` if authenticated, `/login` otherwise — no more standalone landing page

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
