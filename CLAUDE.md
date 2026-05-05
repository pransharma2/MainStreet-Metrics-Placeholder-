# MainStreet Metrics

> Project memory for future Claude Code sessions. Read this file first before making changes.

---

## 1. Product Summary

**MainStreet Metrics** is a small-business sales analytics product.

**Core promise:** *Turn messy sales exports into clean, business-ready dashboards.*

**Target users:**
- Small business owners
- Boutiques
- Cafés
- Etsy-style shops
- Local retailers
- Home businesses
- Small Shopify / Square / Etsy sellers
- Business owners without a data team

Users upload messy CSV/XLSX exports (from Square, Shopify, Etsy, Excel, Google Sheets, etc.) and eventually receive cleaned sales, product, customer, inventory, and business-insight dashboards — with plain-English recommendations and no data expertise required.

---

## 2. Current Project Status

**Phase 1, Phase 2, Phase 3, Phase 3.5 (verification + hardening), and Phase 4 chunks 1–3 (public demo + landing conversion) are complete. `npm run typecheck` and `npm run build` both pass cleanly. Phase 3 has not yet been end-to-end exercised against a live Supabase project by the user. Phase 4 work is happening on the `feature/adding-Phase-4` branch.**

### Phase 1 — Frontend MVP (done)
- Polished frontend-first MVP shell
- Landing page (hero, stat strip, how it works, features, insights preview, dashboard preview, pricing, FAQ, final CTA)
- Auth page placeholders (login, signup)
- Dashboard shell with sidebar + topbar
- Upload page mockup
- Mapping page mockup
- Data quality page mockup
- Demo dashboard using static sample data
- Reusable components (`Button`, `Card`, `Badge`, `Input`, `Label`, `Separator`, `MetricCard`, `InsightCard`, etc.)
- Premium SaaS visual design
- Willow & Sage Boutique as the demo business
- Static sample data flowing through `lib/sample-data.ts`

### Phase 2 — Supabase backend (done, not yet user-verified)
- Wired Supabase backend foundation
- Added Supabase client helpers (browser, server, admin, middleware)
- Added root `middleware.ts` for session refresh + route guards
- Added `supabase/schema.sql` (tables, enums, triggers, RLS, storage bucket)
- Added auth server actions (login, signup, logout) with friendly error mapping
- Rewired login/signup pages to `useFormState`
- Added email/password auth
- Stubbed Google OAuth as **Coming soon** (disabled button)
- Added default business creation on signup (atomic via service-role admin client)
- Added real dashboard session/business context (`DashboardShellProvider`, `useActiveSession()`)
- Added real CSV/XLSX upload endpoint (`POST /api/uploads`)
- Added Supabase Storage upload path (`{business_id}/{upload_id}/{filename}`)
- Added `file_uploads` row inserts
- Added `detected_columns` row inserts
- Added column detection logic (`lib/column-detect.ts`)
- Added mapping save endpoint (`PATCH /api/uploads/[id]/mapping`)
- Added recent uploads sourced from DB
- Added real mapping page by upload ID
- Added file/data quality page based on uploaded columns
- Added demo dashboard fallback banner ("You're viewing demo data…")
- Updated README with setup instructions

### Phase 3 — Medallion pipeline (done, not yet end-to-end user-verified)
- Added new tables (in both `supabase/schema.sql` and `supabase/migrations/0002_phase3_medallion.sql`, idempotent):
  - `bronze_raw_rows` (raw + mapped JSONB per upload row)
  - `data_quality_runs`, `data_quality_results`
  - `orders_silver`, `order_items_silver`, `customers_silver`, `products_silver`
  - `gold_daily_sales`, `gold_monthly_sales`, `gold_product_performance`, `gold_customer_summary`
  - `gold_business_insights`
- Added `processing` to `upload_status` enum (safe `alter type ... add value if not exists`)
- All new tables are RLS-protected via `is_business_member(business_id)`
- Added pure processing library under `lib/processing/`:
  - `parse-values.ts` — `parseDate`, `parseMoney`, `parseQuantity`, `normalizeText`, `normalizeProductName`, `normalizeEmail`, `buildCustomerKey`, `buildProductKey`, `detectDateFormat`, `isFutureDate`
  - `bronze.ts` — `resolveMapping`, `applyMappingToRow`, `buildBronzeRows`
  - `validation.ts` — rules engine with friendly messages, critical vs. warning distinction
  - `silver.ts` — `buildSilver` (detects item-level vs row-level files, groups into orders/items, aggregates customers/products)
  - `gold.ts` — `buildGold` (daily/monthly/product/customer aggregations with ranks and new/returning split)
  - `insights.ts` — `buildInsights` (top-product concentration, strongest day, repeat-customer value, high-value product, slow movers, MoM trend, AOV, missing-email warning)
- Extracted shared file parsing into `lib/parse-file.ts` (used by both upload and process routes)
- Added `POST /api/uploads/[id]/process` endpoint that:
  1. Authenticates + RLS-checks upload
  2. Sets status=`processing`
  3. Downloads original file from Storage + full parse
  4. Applies saved column mapping, runs validation
  5. Writes `data_quality_runs` + `data_quality_results`
  6. On critical failure: sets status=`failed`, returns friendly error
  7. Inserts bronze rows (chunked)
  8. Deletes previous silver for this upload, inserts fresh silver orders/items, upserts customers/products
  9. Rebuilds full business gold + insights
  10. Sets status=`processed`, returns `{ redirect: "/dashboard" }`
- Added `lib/dashboard-data.ts` (server-only) that loads gold rows and maps them into the existing component shapes, with 30-day window and MoM deltas
- Added `components/dashboard/build-dashboard-button.tsx` (client) — used on the file-check page
- Updated `components/mapping/mapping-table.tsx` — new "Build my dashboard" primary action + "Save & review" + "Save mapping"
- Updated `app/dashboard/page.tsx` to read from `loadDashboardData()`; real data when gold exists, demo fallback otherwise (existing visual design preserved)
- Updated `app/dashboard/data-quality/[uploadId]/page.tsx` to prefer real `data_quality_results` when present; fall back to mapping-based preview
- Added sample messy files: `sample-data/boutique_sales_messy.csv`, `cafe_sales_messy.csv`, `etsy_shop_sales_messy.csv`
- Extended `lib/types/db.ts` with row types for every new table + insert-shape types
- `import "server-only"` preserved on `lib/workspace.ts`, `lib/dashboard-data.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`; no client component imports any of them

### Phase 3.5 — Verification + hardening (done)
- Migrated from `pnpm` to `npm`. `pnpm-lock.yaml` deleted, `packageManager` field removed from `package.json`, `package-lock.json` generated. All docs now reference `npm install` / `npm run dev` / `npm run typecheck` / `npm run build` only.
- QA pass against schema, RLS, process endpoint, validation, dashboard fallback, and all 3 sample CSVs. Every sample CSV runs end-to-end through the real pure-processing chain cleanly (verified with a throwaway harness that was then cleaned up).
- `lib/column-detect.ts` — added `ticket`, `ticketnumber`, `receipt`, `receiptnumber` to `order_id` detection so Square/Toast/cafe-style POS exports auto-map correctly.
- `app/api/uploads/[id]/process/route.ts` — stricter status gate: `uploaded` and `parsed` uploads now rejected with a friendly "Please finish matching your columns first" + `redirect` back to the mapping page. `mapped`, `processed`, `failed` still allowed.
- `app/api/uploads/[id]/process/route.ts` — **race-safe status claim**: the `→ processing` transition is now a conditional update (`.eq("id", uploadId).in("status", ["mapped","processed","failed"])`) that returns `null` on contention, producing a friendly 409. Two concurrent Build clicks can't both process the same upload.
- `components/dashboard/build-dashboard-button.tsx` and `components/mapping/mapping-table.tsx` — follow `redirect` field in 409 responses (sends user back to mapping when needed).
- **Fonts self-hosted** — replaced `next/font/google` with `@fontsource-variable/inter` + `@fontsource-variable/fraunces`. `--font-inter` / `--font-display` CSS variables now defined in `app/globals.css`; Tailwind tokens unchanged. Builds no longer fetch `fonts.googleapis.com`.
- `app/(auth)/login/page.tsx` — wrapped `useSearchParams()` in a `<Suspense>` boundary (pre-existing Phase 2 issue that was masked by the font failure). `npm run build` now passes cleanly end-to-end.

### Phase 4 — Customer-demo & monetization layer (in progress)

Shipped on `feature/adding-Phase-4`. Goal: make the product customer-demo-ready and monetization-ready without weakening the existing app. No Stripe, OAuth, connectors, PDF, or Power BI work in this phase.

**Chunk 1 — Public demo experience (done)**
- `lib/demo-data.ts` — three demo businesses with the same types as `lib/sample-data.ts` so existing dashboard components render them unchanged:
  - `boutique` — Willow & Sage Boutique (reuses the existing sample)
  - `cafe` — Morning Mug Café (new)
  - `etsy` — North Star Handmade (new)
  - Each summary carries an explicit `href: /demo/${slug}` with a template-literal type so TypeScript rejects any other target.
- `components/demo/demo-shell.tsx` — unauthenticated shell (logo + "Live demo" badge + "All demos" / "Try with your own file" / "Start free" CTAs). Never imports any server-only module or auth context.
- `components/demo/demo-business-card.tsx` — picker card. Whole card is a single `<Link href={summary.href}>` with a visible "View demo dashboard" pill inside. Doc-comment reminds future editors to never point it at `/dashboard`.
- `app/demo/page.tsx` — public picker (static). Three cards + CTA block.
- `app/demo/[businessType]/page.tsx` — dynamic public demo dashboard. Reuses `MetricCard`, `SalesTrendChart`, `RevenueByChannelChart`, `TopProductsTable`, `CustomerInsights`, `InsightCard`, `DataQualityCard`. `generateStaticParams` prerenders boutique / cafe / etsy at build time. Invalid slugs → `notFound()`.
- Middleware hardening (`lib/supabase/middleware.ts` + `middleware.ts`) — early-returns for public paths (`/`, `/demo`, `/demo/*`) before touching Supabase, and the root matcher excludes `demo` / `demo/*` so middleware never runs for them. Protection for `/dashboard/*` and `/api/uploads/*` unchanged.
- Landing-page links audit — fixed four CTAs on the landing page that were pointing at `/dashboard` as a demo surface (would redirect to `/login` when logged out):
  - `components/landing/hero.tsx` — "View demo dashboard" → `/demo`
  - `components/landing/final-cta.tsx` — "View the demo" → `/demo`
  - `components/landing/dashboard-preview.tsx` — "Open the full demo dashboard" → `/demo`
  - `components/landing/footer.tsx` — "Demo dashboard" footer link → `/demo`

**Chunk 2 — Landing page conversion (done)**
- `components/landing/hero.tsx` — new headline "Stop guessing what's working in your small business." + subheadline covering Shopify/Square/Etsy/spreadsheet inputs and the four dashboard outcomes. Tightened to two CTAs: **View demo dashboard → /demo** (primary), **Start free → /signup** (secondary). Removed the old "Upload sample file" → `/dashboard/upload` button that would 307 logged-out users. Added a supporting trust line.
- `components/landing/pain.tsx` (new) — "Your sales data should not feel like homework." with four cards: Exports are messy / Spreadsheets break / Reports feel too generic / You need answers, not more tabs. Inserted into `app/page.tsx` between `StatStrip` and `HowItWorks`.
- `components/landing/how-it-works.tsx` — step 2 retitled to "Match your columns" with friendlier copy. Step 3 aligned to "simple recommendations". Added a centered "Try the live demo → /demo" CTA under the three step cards.
- `components/landing/who-its-for.tsx` — new heading "Built for businesses that are too busy to wrestle with spreadsheets." Expanded from 4 to 6 card types: Boutiques & retailers, Cafés & bakeries, Etsy & handmade, Pop-ups & markets, Home businesses, Small online stores. Grid now 3-up on `lg`.
- `components/landing/pricing.tsx` — replaced SaaS tiers with **service-first packages**: Starter Dashboard $99 one-time, Growth Dashboard $299 one-time (highlighted), Monthly Refresh from $49/month. "Early pricing while MainStreet Metrics is in beta" pill under the header. Starter CTA → `/demo`; Growth and Monthly Refresh CTAs → `/signup`. Footer line links to `/signup` for self-serve. **No Stripe wiring.**
- `components/landing/faq.tsx` — replaced all 6 Q&A pairs with a customer-facing set: data/spreadsheets, file types, Shopify/Square connectors, privacy, done-for-you, large companies.
- `components/landing/final-cta.tsx` — new heading "Ready to see what your sales data is trying to tell you?" CTA order is now **View demo dashboard → /demo** (primary), **Start free → /signup** (secondary).

**Chunks not yet started in this phase:**
- Chunk 4 — Onboarding + business profile (requires a small schema migration `0003_phase4.sql` adding `industry`, `timezone`, `tagline`, `main_source`, `primary_goal`, `onboarded_at` to `businesses`; RLS unchanged).
- Chunk 5 — Dashboard explanation layer (deterministic "what this means / why it matters / next step" tooltips + panel).
- Chunk 6 — Insight report page at `/dashboard/report`, `window.print()` only (no PDF lib).
- Chunk 7 — Settings / business profile polish.
- Chunk 8 — Lead CTA path (`early_access_leads` table + friendly form, anon-insert RLS only).
- Chunk 9 — Small product polish + README + CLAUDE.md refresh.

**Guardrails honored so far in Phase 4:**
- No Supabase schema or migration changes yet (chunks 1–2 are UI-only).
- No RLS weakening, no service-role exposure, no multi-business-model changes.
- No Stripe, OAuth, connectors, PDF generation, or Power BI.
- No Next.js upgrade, no `pnpm`/`yarn` reintroduction.
- Existing polished UI preserved — all Phase 4 work reuses existing Tailwind tokens, `Button`, `Card`, `Badge`, typography, and section rhythm.
- Server-only modules still not imported by any client component.

---

## 3. Important Design Direction

**The frontend design quality is very important.** The product must look premium from day one — this is both a portfolio piece and an investor demo.

The design should remain:
- Premium
- Modern
- Polished
- Small-business-friendly
- Trustworthy
- Clean
- Visually impressive
- Portfolio-ready
- Investor-demo-ready

Future work **should not** make the UI look generic, plain, or overly technical.

Use **Claude Design–level** frontend quality.

Preserve:
- Strong visual hierarchy
- Smooth spacing
- Soft gradients
- Rounded cards
- Tasteful shadows
- Beautiful dashboard cards
- Friendly microcopy
- Responsive layout
- Thoughtful loading, success, error, and empty states

### Friendly microcopy — always

User-facing language must be friendly and non-technical. Examples:

| Don't say | Say instead |
| --- | --- |
| Parsing failed | *We had trouble reading this file* |
| Mapping required | *Help us match your columns* |
| RLS error | *We couldn't access this workspace* |
| No rows found | *This file looks empty. Try uploading another CSV* |
| 413 Payload Too Large | *That file is a bit large — try something under 10 MB* |

---

## 4. Architecture Overview

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (custom emerald + warm neutral theme)
- **shadcn/ui**-style inline primitives
- **Recharts** (charts)
- **Framer Motion** (hero fade-up, subtle interactions)
- **lucide-react** icons
- **Fonts:** Inter (body) + Fraunces (display) — self-hosted via `@fontsource-variable/*`, no build-time fetch of Google Fonts

### Backend
- **Supabase Auth** (email/password; Google OAuth stubbed)
- **Supabase Postgres**
- **Supabase Storage** (private `uploads` bucket)
- **Supabase RLS** on every business-scoped table
- **Next.js API routes** for MVP processing

### Processing
- Phase 2 currently parses uploads and detects columns in the API route (Node runtime).
- Phase 3 should build a medallion-style data pipeline:
  - **Bronze** — raw uploaded rows
  - **Silver** — cleaned, standardized orders / products / customers
  - **Gold** — dashboard-ready metrics and insights

### Long-term (not yet built)
- Stripe billing
- Real Google OAuth
- Shopify / Square / Etsy connectors
- Power BI embedding
- PDF / email reports
- Scheduled monthly refreshes
- Optional FastAPI + Pandas / DuckDB worker for heavier processing

---

## 5. Current Files and What They Do

### Supabase + env
- `lib/supabase/client.ts` — browser Supabase client (`createBrowserClient`)
- `lib/supabase/server.ts` — server Supabase client that forwards cookies via `next/headers`
- `lib/supabase/admin.ts` — service-role admin client, guarded by `import "server-only"`
- `lib/supabase/middleware.ts` — `updateSession()` helper used by root middleware; refreshes session + enforces route guards
- `lib/env.ts` — centralized env access with friendly "missing env" errors

### Workspace + types
- `lib/workspace.ts` — `requireActiveSession()` server helper; loads profile + first business; `getInitials()`
- `lib/column-detect.ts` — `STANDARD_FIELDS`, `detectColumns()`, `sourceFromFilename()`
- `lib/types/db.ts` — hand-maintained row types (`ProfileRow`, `BusinessRow`, `FileUploadRow`, `DetectedColumnRow`, enums)

### Routing + middleware
- `middleware.ts` — project-root middleware; refreshes Supabase session on every request, guards `/dashboard/*` and `/api/uploads*`

### Schema
- `supabase/schema.sql` — full Postgres schema (see section 6)

### Auth
- `app/(auth)/actions.ts` — server actions: `loginAction`, `signupAction` (with auto-business provisioning), `logoutAction`; `friendlyAuthError()` mapping
- `app/(auth)/login/page.tsx` — client form wired to `loginAction`; `?confirm=1` notice; Google stub
- `app/(auth)/signup/page.tsx` — client form wired to `signupAction`; fullName + businessName + email + password; Google stub

### API
- `app/api/uploads/route.ts` — `POST`; auth, 10 MB + extension check, CSV/XLSX parse, `file_uploads` insert, Storage upload, rollback on failure, column detection
- `app/api/uploads/[id]/mapping/route.ts` — `PATCH`; zod-validated mapping save, sets `status='mapped'`

### Dashboard pages
- `app/dashboard/page.tsx` — main dashboard; server component; shows demo-data banner when no uploads exist
- `app/dashboard/upload/page.tsx` — upload page; lists recent uploads from DB with friendly empty state
- `app/dashboard/mapping/[uploadId]/page.tsx` — column mapping UI for a specific upload
- `app/dashboard/mapping/page.tsx` — redirect to latest upload's mapping or empty state
- `app/dashboard/data-quality/[uploadId]/page.tsx` — file-check page computed from real `detected_columns`
- `app/dashboard/data-quality/page.tsx` — redirect to latest or empty state

### Components
- `components/upload/upload-dropzone.tsx` — drag/drop, XHR with progress, success/error states, redirect to mapping
- `components/dashboard/dashboard-shell.tsx` — client shell; uses `useActiveSession()` from context for real business + user info
- `components/dashboard/dashboard-shell-context.tsx` — `DashboardShellProvider` + `useActiveSession()` hook
- `components/mapping/mapping-table.tsx` — mapping editor; `PATCH`es to `/api/uploads/[id]/mapping`; Save + Save-and-continue

### Sample data + docs
- `lib/sample-data.ts` — static Willow & Sage demo data (still used as the dashboard fallback)
- `README.md` — setup instructions + how auth/uploads work + demo-fallback explanation

---

## 6. Database and Supabase Status

`supabase/schema.sql` currently includes:

- **Tables**
  - `profiles` (1:1 with `auth.users`)
  - `businesses`
  - `business_users` (with `business_role` enum)
  - `file_uploads` (with `upload_status`, `upload_source` enums)
  - `detected_columns` (with `confidence_level` enum)
- **Enums:** `business_role`, `upload_status`, `upload_source`, `confidence_level`
- **Auth user trigger:** `handle_new_user()` inserts a profile row when an `auth.users` row is created
- **RLS helper functions:**
  - `is_business_member(b_id uuid)` — security definer
  - `can_access_upload(u_id uuid)` — security definer
- **RLS policies** on every table: `profiles_select/update_self`, `businesses_select_members/update_admins`, `file_uploads_select/insert/update_members`, `detected_columns_select/cud`, storage `uploads_rw_members`
- **Private `uploads` storage bucket**
- **Per-business storage folder policies** keyed off `(storage.foldername(name))[1]::uuid`

### Intended tenant model

- A user can belong to one or more businesses.
- `business_users` controls access.
- `business_id` is the tenant boundary.
- Users should only see their own business data.
- `SUPABASE_SERVICE_ROLE_KEY` must only be used server-side, and only for provisioning (e.g., creating the default business on signup).

---

## 7. Current Upload Flow

1. User signs up.
2. Default business is created automatically (via admin client inside `signupAction`).
3. User lands on `/dashboard`, sees the demo dashboard with a banner.
4. User uploads a CSV/XLSX at `/dashboard/upload`.
5. File is validated for type (`.csv` / `.xlsx` / `.xls`) and size (≤ 10 MB).
6. File is stored in Supabase Storage at `{business_id}/{upload_id}/{filename}`.
7. A `file_uploads` row is created.
8. File is parsed for preview/columns (Papaparse for CSV, SheetJS for Excel).
9. Column detection runs (`detectColumns`).
10. `detected_columns` rows are inserted.
11. User is redirected to `/dashboard/mapping/{uploadId}`.
12. User can edit/save the mapping.
13. Upload `status` changes to `mapped`.
14. User can view the file-check / data-quality page.

---

## 8. What Is Not Built Yet

These are **explicitly not built** and should not be assumed to exist:

- Stripe payments
- Real Google OAuth
- Email reports
- PDF exports
- Shopify / Square / Etsy live API connectors
- Monthly scheduled refreshes
- Power BI embedded
- Full production worker / FastAPI processing layer
- Workspace switcher UI (multi-business per user)
- Per-source saved mapping templates (reuse mapping across uploads with the same headers)
- Incremental gold updates (today: gold is rebuilt from full silver on every process)
- Product MoM trend in gold_product_performance (placeholder `trend: 0` in dashboard)

---

## 9. Verification Checklist (Phase 3)

Phase 3 has not yet been end-to-end verified by the user against a live Supabase project. The checklist:

1. `npm install`, `npm run typecheck`, `npm run build`
2. Create a Supabase project
3. Apply `supabase/schema.sql` (or `supabase/migrations/0002_phase3_medallion.sql` if Phase 2 was already applied)
4. Fill `.env.local`
5. `npm run dev`
6. Sign up, confirm default business appears
7. `/dashboard` shows demo data with banner
8. Upload `sample-data/boutique_sales_messy.csv`
9. Review detected column mapping
10. Click **Build my dashboard**
11. Confirm status transitions: uploaded → parsed → mapped → processing → processed
12. Confirm rows exist in `bronze_raw_rows`, `data_quality_runs`, `data_quality_results`, `orders_silver`, `order_items_silver`, `customers_silver`, `products_silver`, `gold_daily_sales`, `gold_monthly_sales`, `gold_product_performance`, `gold_customer_summary`, `gold_business_insights`
13. `/dashboard` shows real values instead of demo data
14. Banner is gone once real data exists
15. Sign up as a second user → that user's `/dashboard` shows only demo data; cannot see the first user's rows (RLS test)
16. Sign out → `/dashboard/*` redirects to `/login`

---

## 10. Suggested Next Phase (Phase 4)

Phase 3 is shipped. Good candidates for Phase 4 (pick what has the most business value):

- **Saved mapping templates** per source — remember a user's approved mapping and auto-apply on future uploads with matching headers so step 3 becomes a one-click confirmation.
- **Workspace switcher UI** — surface `business_users` as a dropdown (schema already supports it).
- **PDF export** — render the current dashboard to a downloadable monthly report.
- **Email reports** — schedule a weekly "here's your numbers" digest using Supabase scheduled functions + a transactional email provider.
- **Incremental gold updates** — replace full-business rebuild with per-upload delta for scale.
- **Google OAuth** — wire the existing "Coming soon" button through Supabase.

Phase 3 should **not** add Stripe, real OAuth, PDF exports, or external API connectors yet.

---

## 11. Guardrails for Future Claude Sessions

Strict rules for any future session working on this project:

- **Do not** redesign the app from scratch.
- **Do not** remove the polished Phase 1 design.
- **Do not** skip verification before moving to the next phase.
- **Do not** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It must only be imported from `lib/supabase/admin.ts`, which has `import "server-only"`.
- **Do not** remove RLS.
- **Do not** hardcode Supabase credentials.
- **Do not** replace the multi-business model with a single-user-only model.
- **Do not** overcomplicate the MVP.
- **Keep** frontend components reusable and clean.
- **Keep** business-owner-facing copy friendly and simple.
- **Keep** technical architecture documented.
- **Run** `npm run typecheck` and `npm run build` after meaningful changes.

---

## 12. Useful Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build

git status
git add .
git commit -m "message"
```

---

## 13. Suggested Commit Message

After creating/updating this file, the suggested commit is:

```bash
git add CLAUDE.md README.md
git commit -m "Document project state and Phase 2 handoff"
```
