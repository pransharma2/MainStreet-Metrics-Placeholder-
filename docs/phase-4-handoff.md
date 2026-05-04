# MainStreet Metrics — Phase 4 Handoff

> Read this file first before making changes. It's the condensed state of the repo as of the start of Phase 4.

---

## 1. Current project status

**Phases 1, 2, 3, and 3.5 are complete.** `npm run typecheck` and `npm run build` both pass cleanly. The app compiles, statically pre-renders `/`, `/login`, `/signup`, and renders the dashboard + API routes dynamically. End-to-end verification against a live Supabase project has not yet been performed by the user — the pipeline has been exercised only through pure-function harnesses against the sample CSVs.

**Do not start Phase 4 implementation work** until the user confirms the next direction. This document is a handoff, not a task list.

---

## 2. Completed phases

### Phase 1 — Frontend MVP (done)
Polished frontend-first shell. Landing page (hero, stat strip, how it works, features, insights preview, dashboard preview, pricing, FAQ, final CTA), auth page placeholders, dashboard shell with sidebar + topbar, upload / mapping / data-quality / settings page mockups, demo dashboard using static Willow & Sage sample data, reusable primitives (`Button`, `Card`, `Badge`, `Input`, `Label`, `Separator`, `MetricCard`, `InsightCard`, `SalesTrendChart`, `RevenueByChannelChart`, `TopProductsTable`, `CustomerInsights`, `DataQualityCard`).

### Phase 2 — Supabase backend (done)
Wired Supabase Auth + Postgres + Storage. Middleware for session refresh + route guards. `handle_new_user()` trigger. Auto-provisioning of a default business + `business_users` row on signup (atomic via service-role admin). Real CSV/XLSX upload endpoint + column detection + column mapping UI with persistence. `DashboardShellProvider` / `useActiveSession()`. Demo fallback banner on `/dashboard` while no uploads exist. Email/password auth with friendly errors; Google OAuth stubbed as "Coming soon".

### Phase 3 — Medallion pipeline (done)
- 12 new RLS-protected tables: `bronze_raw_rows`, `data_quality_runs`, `data_quality_results`, `orders_silver`, `order_items_silver`, `customers_silver`, `products_silver`, `gold_daily_sales`, `gold_monthly_sales`, `gold_product_performance`, `gold_customer_summary`, `gold_business_insights`.
- `processing` added to `upload_status` enum.
- Pure processing library under `lib/processing/` (parse-values, bronze, validation, silver, gold, insights) — no I/O, fully unit-testable.
- `POST /api/uploads/[id]/process` endpoint: auth, RLS, full-file read from Storage, bronze insert, validation with friendly messages, silver build, business-wide gold rebuild, deterministic insights.
- Dashboard real-data loader (`lib/dashboard-data.ts`) with 30-day window + MoM deltas; graceful demo fallback per section when no real data exists.
- "Build my dashboard" UI on mapping and file-check pages with staged loading/error/success states.
- Three messy sample CSVs: `sample-data/{boutique,cafe,etsy_shop}_sales_messy.csv`.

### Phase 3.5 — Verification + hardening (done)
- Package manager migrated from pnpm → npm. `packageManager` field removed from `package.json`, `pnpm-lock.yaml` deleted, `package-lock.json` generated. All docs use npm only.
- Sample CSVs verified end-to-end through the real pure-processing chain (parseCsvBuffer → detectColumns → resolveMapping → applyMappingToRow → validateMappedRows → buildSilver → buildGold → buildInsights). Every assertion PASS on all three files.
- `lib/column-detect.ts` — added `ticket`, `ticketnumber`, `receipt`, `receiptnumber` to `order_id` detection (auto-maps Square/Toast/cafe POS exports).
- Process endpoint: stricter status gate (rejects `uploaded`/`parsed` with friendly redirect to mapping page).
- Process endpoint: **race-safe status claim**: the `→ processing` transition is a conditional update that returns 409 on contention. Two concurrent Build clicks cannot both process the same upload.
- Client buttons honor `redirect` field in 409 responses.
- **Fonts self-hosted** via `@fontsource-variable/inter` + `@fontsource-variable/fraunces`. No build-time fetch of `fonts.googleapis.com`. Typography visually unchanged.
- `app/(auth)/login/page.tsx` — `useSearchParams()` now wrapped in `<Suspense>` (pre-existing Phase 2 bug that was masked by the font failure).
- `npm run typecheck` passes; `npm run build` passes cleanly.

---

## 3. Current architecture

```
Browser (client components)
   │
   │  fetch /api/uploads, /api/uploads/[id]/mapping, /api/uploads/[id]/process
   ▼
Next.js 14 App Router (runtime=nodejs on mutating routes)
   │
   │  auth.getUser()  ──►  Supabase Auth
   │  supabase client ──►  Supabase Postgres  (RLS enforced per request)
   │                    ──►  Supabase Storage  (private `uploads` bucket, per-business folder policy)
   │
   └──►  lib/processing/*  (pure functions, no I/O)
```

- **Auth**: email/password via Supabase. Session refreshed in `middleware.ts`. `requireActiveSession()` in `lib/workspace.ts` is the canonical server helper — redirects to `/login` and loads user + default business.
- **Tenant model**: one user → one or more `businesses` via `business_users` (role enum: owner/admin/member). MVP creates one default business per signup. All business-scoped tables are gated by `is_business_member(business_id)` in RLS policies.
- **Server-only guardrail**: `lib/workspace.ts`, `lib/dashboard-data.ts`, `lib/supabase/server.ts`, and `lib/supabase/admin.ts` all start with `import "server-only"`. No client component imports any of them.
- **Service role key** is only imported by `lib/supabase/admin.ts` (and only used in the signup flow for atomic business provisioning).
- **Pipeline shape**: upload → parse + column-detect (API route) → user mapping → `POST /api/uploads/[id]/process` → bronze + validation + silver + gold + insights. The process endpoint rebuilds gold for the entire business on every run.
- **Dashboard data**: `lib/dashboard-data.ts` reads gold tables; `hasRealData` is `true` iff `gold_daily_sales` has ≥1 row for the business. Falls back to the Willow & Sage demo otherwise.

---

## 4. Important files and what they do

### Auth & session
- `middleware.ts` — refreshes Supabase session, guards `/dashboard/*` and `/api/uploads*`.
- `app/(auth)/layout.tsx` / `login/page.tsx` / `signup/page.tsx` — auth UI. Login uses `useSearchParams()` inside a `<Suspense>` boundary.
- `app/(auth)/actions.ts` — server actions: `loginAction`, `signupAction`, `logoutAction`. Signup uses the service-role admin client for atomic business provisioning.
- `lib/workspace.ts` (`import "server-only"`) — `requireActiveSession()` loads user + default business, redirects to `/login` when unauthenticated.
- `lib/supabase/{server,client,admin,middleware}.ts` — Supabase client factories per runtime context.

### Upload + mapping
- `app/api/uploads/route.ts` — `POST` uploads: validates size/ext, parses file, inserts `file_uploads` row, uploads raw file to Storage, runs column detection into `detected_columns`.
- `app/api/uploads/[id]/mapping/route.ts` — `PATCH` saves user-confirmed mapping, transitions status to `mapped`.
- `lib/column-detect.ts` — header heuristics mapping original columns → standard fields.
- `lib/parse-file.ts` — shared Papa/XLSX helpers (used by both upload and process routes).
- `components/mapping/mapping-table.tsx` — mapping UI with "Save mapping", "Save & review", and "Build my dashboard" actions.

### Processing pipeline
- `app/api/uploads/[id]/process/route.ts` — the whole medallion pipeline orchestrator. Race-safe status claim, chunked bronze inserts, silver build, business-wide gold rebuild, insights.
- `lib/processing/parse-values.ts` — `parseDate`, `parseMoney`, `parseQuantity`, `normalizeText`, `normalizeProductName`, `normalizeEmail`, `buildCustomerKey`, `buildProductKey`, `detectDateFormat`, `isFutureDate`.
- `lib/processing/bronze.ts` — `resolveMapping`, `applyMappingToRow`, `buildBronzeRows`.
- `lib/processing/validation.ts` — rules engine, friendly messages, critical vs warning distinction.
- `lib/processing/silver.ts` — `buildSilver` (orders/items/customers/products; item-level vs row-level detection).
- `lib/processing/gold.ts` — `buildGold` (daily/monthly/product/customer aggregations, ranks, new/returning split).
- `lib/processing/insights.ts` — `buildInsights` (top-product concentration, strongest day, repeat value, high-value product, slow movers, MoM trend, AOV, missing-email warning).

### Dashboard
- `app/dashboard/page.tsx` — server component; real or demo data via `loadDashboardData()`.
- `app/dashboard/data-quality/[uploadId]/page.tsx` — prefers real `data_quality_results` when present.
- `lib/dashboard-data.ts` (`import "server-only"`) — reads gold tables, builds `overviewMetrics`/`salesTrend`/`channelRevenue`/`topProducts`/`customerSegments`/`insights`/`dataQualityItems`, 30-day window + MoM deltas.
- `components/dashboard/dashboard-shell.tsx` (client) — sidebar + topbar. Uses `getInitials` from `@/lib/utils`, not from workspace.
- `components/dashboard/dashboard-shell-context.tsx` (client) — `DashboardShellProvider`, `useActiveSession()`. Imports `ActiveSession` type from `@/lib/types/db`.
- `components/dashboard/build-dashboard-button.tsx` (client) — reusable "Build my dashboard" button with staged loading / error / success states and redirect handling.
- `components/dashboard/{metric-card,insight-card,sales-trend-chart,revenue-by-channel-chart,top-products-table,customer-insights,data-quality-card}.tsx` — visual components (unchanged since Phase 1).

### Types, utils, styles
- `lib/types/db.ts` — hand-maintained row types for every table + insert-shape types; also holds `ActiveSession`.
- `lib/utils.ts` — `cn`, `formatCurrency`, `formatNumber`, `formatPercent`, `formatDelta`, `getInitials`.
- `lib/sample-data.ts` — Willow & Sage demo (demo fallback for `/dashboard`).
- `app/globals.css` — Tailwind base + CSS custom properties (including `--font-inter` / `--font-display` pointing at the self-hosted variable fonts).
- `app/layout.tsx` — imports `@fontsource-variable/inter` + `@fontsource-variable/fraunces`, sets metadata, renders the body.
- `tailwind.config.ts` — emerald brand + warm neutral theme; font tokens `sans: var(--font-inter)`, `display: var(--font-display)`.

### Docs + samples
- `README.md` — user-facing setup and Phase 3 walkthrough.
- `CLAUDE.md` — this project's rolling memory + guardrails.
- `sample-data/{boutique,cafe,etsy_shop}_sales_messy.csv` — messy realistic test files.
- `sample-data/README.md` — instructions for using the samples.

---

## 5. Current database tables + migrations

**Migration files** (apply in order):
- `supabase/schema.sql` — the single authoritative file. Contains Phase 2 + Phase 3 DDL, idempotent (`create table if not exists`, `create or replace function`, `drop policy if exists` + recreate).
- `supabase/migrations/0002_phase3_medallion.sql` — standalone Phase 3 migration, for projects where Phase 2 has already been applied. Idempotent and safe to re-run.

**Tables** (all RLS-protected):

Phase 2:
- `profiles` (1:1 with `auth.users`)
- `businesses`
- `business_users` (membership + role)
- `file_uploads` (enum `upload_status`: `uploaded|parsed|mapped|processing|processed|failed`; enum `upload_source`: `Shopify|Square|Etsy|CSV|Excel`)
- `detected_columns`
- Storage bucket `uploads` with per-business folder policy

Phase 3 (all via `is_business_member(business_id)`):
- `bronze_raw_rows`
- `data_quality_runs`, `data_quality_results`
- `orders_silver`, `order_items_silver`
- `customers_silver` (unique on `business_id, customer_key`)
- `products_silver` (unique on `business_id, product_key`)
- `gold_daily_sales` (unique on `business_id, sales_date`)
- `gold_monthly_sales` (unique on `business_id, month_start`)
- `gold_product_performance`
- `gold_customer_summary`
- `gold_business_insights` (severity enum: `info|positive|warning|critical`)

**Helper functions** (security-definer, RLS-aware): `public.is_business_member(uuid)`, `public.can_access_upload(uuid)`, `public.handle_new_user()` (trigger on `auth.users` insert).

---

## 6. Known issues

- **`next/font` Google Fonts build issue — FIXED** in Phase 3.5. Fonts are self-hosted via `@fontsource-variable/inter` + `@fontsource-variable/fraunces`; `npm run build` no longer fetches `fonts.googleapis.com` and works offline / on restricted networks.
- **End-to-end Supabase run not yet performed** by the user. The sample CSVs have been verified through the pure processing chain; a full live run (sign up → upload → map → build → dashboard → second-user RLS test) is still pending.
- **Minor Next.js deprecation warning** (Next 14.2.5 security advisory). Not addressed per the user's "don't upgrade Next yet" rule.
- **Punycode deprecation warning** from a transitive dep. Cosmetic.

---

## 7. Package manager

**npm only.** `pnpm-lock.yaml` is not present. `package-lock.json` is the tracked lock file. Do not reintroduce pnpm or yarn.

---

## 8. Exact commands

```bash
npm install       # install deps from package-lock.json
npm run dev       # Next dev server on http://localhost:3000
npm run typecheck # tsc --noEmit
npm run build     # Next production build (no network, no font fetch)
npm start         # run production server after build
npm run lint      # ESLint
```

Node 18.17+ required.

---

## 9. What not to touch

- **Do not redesign the app from scratch.** The Phase 1 visual design is the product's selling point.
- **Do not weaken RLS.** Every business-scoped table must stay gated by `is_business_member(business_id)` in both `using` and `with check`.
- **Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.** It must only be imported by `lib/supabase/admin.ts`, which is `import "server-only"`.
- **Do not remove the multi-business model.** `business_users` + `is_business_member` is the core of the tenancy story. Stay forward-compatible with a future workspace switcher.
- **Do not remove the demo dashboard fallback.** New users must see a beautiful dashboard before investing time in an upload.
- **Do not weaken the server/client boundary.** Client components must never import `lib/workspace.ts`, `lib/dashboard-data.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`, or any other module that starts with `import "server-only"`. Use `import type` or move pure utilities to `lib/utils.ts` / `lib/types/db.ts`.
- **Do not start random features.** Hold on Stripe, real Google OAuth, PDF exports, email reports, Shopify/Square/Etsy live connectors, Power BI embedded, and incremental/scheduled gold rebuilds until explicitly scoped.
- **Do not commit secrets.** `.env.local` stays gitignored; never hardcode Supabase keys.
- **Do not upgrade Next.js yet.** The 14.2.5 security advisory is known; upgrade will happen as a deliberate task.
- **Do not reintroduce pnpm/yarn.** npm only.

---

## 10. Recommended next step

Phase 3.5 is complete. Phase 4 should focus on **customer-demo readiness and monetization readiness**, which likely means:

1. **Live end-to-end verification first** — apply the schema to a Supabase project, sign up two users, upload each of the three sample CSVs through the full mapping → build flow, confirm tenant isolation, confirm real data appears on `/dashboard` and the demo banner disappears. Only after this is green should any Phase 4 feature work begin.

2. **Saved per-source mapping templates** — remember a user's approved mapping and auto-apply on future uploads with matching headers. Turns the second upload into a one-click confirmation. High UX leverage, no new external deps.

3. **Workspace switcher UI** — surface `business_users` as a dropdown in the sidebar. Schema already supports it.

4. **PDF export** — render the current dashboard to a downloadable monthly report. Small-business owners love tangible deliverables.

5. **Email reports** — weekly digest via Supabase scheduled functions + a transactional email provider. Directly supports monetization (paid tier perk).

6. **Google OAuth** — wire the existing "Coming soon" button through Supabase. Removes a signup-flow friction point.

7. **Incremental gold rebuild** — replace full-business rebuild with a per-upload delta once file volumes grow. Not urgent at MVP scale.

8. **Stripe billing** — only after the above are in place and there's a real plan worth paying for.

Suggested ordering if Phase 4 is scoped to "ready for paying customers": **live verification → mapping templates → PDF export → email reports → workspace switcher → Google OAuth → Stripe**.

---

## Handoff checklist for the new session

When a fresh Claude session starts, verify in order:

- [ ] `npm install` succeeds
- [ ] `npm run typecheck` is clean
- [ ] `npm run build` is clean
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`
- [ ] `supabase/schema.sql` has been applied to the Supabase project
- [ ] `npm run dev` boots and `/` loads the landing page
- [ ] Signup creates a user + default business
- [ ] Upload one sample CSV → mapping saves → Build my dashboard → `/dashboard` shows real numbers
- [ ] A second user cannot see the first user's data

Only then start Phase 4 work.
