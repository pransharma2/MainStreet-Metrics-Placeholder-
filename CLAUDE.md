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

**Phase 1 and Phase 2 are complete. Phase 2 has NOT yet been fully tested locally with a real Supabase project by the user.**

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
- **Fonts:** Inter (body) + Fraunces (display)

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

- Full bronze / silver / gold medallion processing
- Real dashboard metrics from uploaded files
- Gold tables powering the charts
- Rules-based business insight generation
- Stripe payments
- Real Google OAuth
- Email reports
- PDF exports
- Shopify / Square / Etsy live API connectors
- Monthly scheduled refreshes
- Power BI embedded
- Full production worker / FastAPI processing layer

---

## 9. Immediate Next Step Before Phase 3

**The next step is NOT Phase 3. It is Phase 2 verification.** Do not start Phase 3 until this checklist passes end-to-end.

### Local verification checklist

1. Run `pnpm install`
2. Run `pnpm typecheck`
3. Run `pnpm build`
4. Create a Supabase project
5. Fill `.env.local` from `.env.local.example`
6. Apply `supabase/schema.sql` in the Supabase SQL editor
7. Run `pnpm dev`
8. Sign up as a new user
9. Confirm default business is created
10. Confirm demo dashboard banner appears
11. Upload a small CSV
12. Confirm the Storage object is created (`uploads/{business_id}/{upload_id}/...`)
13. Confirm a `file_uploads` row is created
14. Confirm `detected_columns` rows are created
15. Confirm the mapping page loads real detected columns
16. Save the mapping
17. Confirm upload `status` changes to `mapped`
18. Confirm the data-quality page works
19. Sign out
20. Confirm `/dashboard/*` routes are protected (redirect to `/login`)

---

## 10. Phase 3 Plan Preview

Phase 3 should begin **only after** the Phase 2 checklist above is verified.

Phase 3 should focus on:
- Bronze raw-row insert (JSONB per upload)
- Validation table or validation results (`data_quality_runs` or similar)
- Silver cleaned, normalized tables (orders, line items, customers, products)
- Gold metric tables (daily revenue, top products, customer segments, channel mix)
- Real dashboard data sourced from uploaded files
- Rules-based insight generation (e.g., "Saturdays lead revenue", "10 VIPs drove 32% of sales")
- Replacing static dashboard values with real gold metrics when available
- **Keep the demo fallback** when no real gold data exists yet

Phase 3 should **not** add Stripe, real OAuth, PDF exports, or external API connectors yet.

---

## 11. Guardrails for Future Claude Sessions

Strict rules for any future session working on this project:

- **Do not** redesign the app from scratch.
- **Do not** remove the polished Phase 1 design.
- **Do not** skip verification before building Phase 3.
- **Do not** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It must only be imported from `lib/supabase/admin.ts`, which has `import "server-only"`.
- **Do not** remove RLS.
- **Do not** hardcode Supabase credentials.
- **Do not** replace the multi-business model with a single-user-only model.
- **Do not** overcomplicate the MVP.
- **Keep** frontend components reusable and clean.
- **Keep** business-owner-facing copy friendly and simple.
- **Keep** technical architecture documented.
- **Run** `pnpm typecheck` and `pnpm build` after meaningful changes.

---

## 12. Useful Commands

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm build

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
