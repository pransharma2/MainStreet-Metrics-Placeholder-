# MainStreet Metrics

> Turn messy sales exports into clean, business-ready dashboards.

**MainStreet Metrics** is a small-business sales analytics product. Small shops — boutiques, cafés, Etsy sellers, home businesses — upload messy sales files from Square, Shopify, Etsy, Excel, or Google Sheets, and get a clean, friendly dashboard that tells them what's actually happening and what to do next.

This repository currently covers **Phase 1 (frontend MVP) + Phase 2 (Supabase backend) + Phase 3 (medallion pipeline) + Phase 3.5 (verification & hardening)**: a polished, investor-demo-ready UI with real auth, multi-business workspaces, file uploads, CSV/Excel parsing, column mapping, and a real bronze → silver → gold processing pipeline that powers the dashboard with your uploaded data. Rules-based insights are generated automatically. Fonts are self-hosted, the process endpoint is race-safe, and `npm run build` passes cleanly with no network fetch.

---

## Highlights

- **Beautiful landing page** with hero, stat strip, "how it works", features, insights preview, dashboard preview, pricing, FAQ, and final CTA.
- **Polished dashboard** for a demo boutique ("Willow & Sage") — overview metrics, sales trend, channel split, top products, customer mix, plain-English insights, latest upload status, and data quality card.
- **Friendly upload flow** — drag & drop, sample files, recent uploads table.
- **Column mapping UI** with confidence badges, suggestions, and per-row "ignore".
- **File check / data quality** screen with success/warning/info/error tallies and plain-English messages.
- **Auth placeholders** (login, signup) with Supabase-ready layout.
- **Settings placeholder** for business profile and connections.

Every surface is frontend-only — no backend calls — but structured so Phase 2 backend integration is straightforward.

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (custom theme: emerald brand + warm neutrals + display font)
- **shadcn/ui-style primitives** (`Button`, `Card`, `Badge`, `Input`, `Label`, `Separator`) — built inline and customized so it doesn't look like a default template
- **Recharts** for the sales trend area chart and the channel donut
- **Framer Motion** for subtle hero entrance animation
- **lucide-react** icons
- **Self-hosted fonts** via `@fontsource-variable/inter` + `@fontsource-variable/fraunces` — Inter (body) + Fraunces (display), bundled locally so builds don't fetch Google Fonts at build time

Designed for Phase 2+ integration with **Supabase** (Auth, Postgres, Storage) and optional **FastAPI + Pandas** workers for heavy file processing.

---

## Local setup

Requirements: Node 18.17+, npm (bundled with Node), and a free [Supabase](https://supabase.com) project.

```bash
cd mainstreet-metrics
npm install
cp .env.local.example .env.local    # then fill in your Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. From **Project Settings → API**, copy the **Project URL**, the **anon public** key, and the **service_role** key.

### 2. Fill in `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-only, never expose
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The service role key is only imported by `lib/supabase/admin.ts`, which is guarded with `import "server-only"` — it will never ship to the browser.

### 3. Apply the schema

Open the **SQL editor** in Supabase and paste the contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates:

- `profiles`, `businesses`, `business_users`, `file_uploads`, `detected_columns`
- Enums for upload status, source, confidence level, business role
- A `handle_new_user()` trigger that auto-creates a profile row on signup
- Security-definer helpers `is_business_member()` and `can_access_upload()`
- Row-Level Security policies on every table
- A private `uploads` storage bucket with per-business folder policies
- **Phase 3 tables**: `bronze_raw_rows`, `data_quality_runs`, `data_quality_results`, `orders_silver`, `order_items_silver`, `customers_silver`, `products_silver`, `gold_daily_sales`, `gold_monthly_sales`, `gold_product_performance`, `gold_customer_summary`, `gold_business_insights` — all RLS-protected and tenant-isolated.

If you applied Phase 2 previously and only want the Phase 3 additions, run
[`supabase/migrations/0002_phase3_medallion.sql`](./supabase/migrations/0002_phase3_medallion.sql) instead — it is idempotent (`create table if not exists`).

### 4. (Optional) Configure email confirmations

In **Authentication → Providers → Email**, you can disable "Confirm email" during local development so signup flows straight into the dashboard. In production, leave it on — the login screen already handles the "check your inbox" state.

### 5. Run it

```bash
npm run dev
```

Visit `/signup`, create an account, and you'll be dropped into your new workspace. Upload a CSV from `/dashboard/upload` to see the full parse → detect → map flow end-to-end.

Scripts:
- `npm run dev` — Next dev server
- `npm run build` — Production build
- `npm start` — Production server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check (no emit)

### How auth works

- `middleware.ts` calls `updateSession()` on every request, which refreshes the Supabase session cookie and guards `/dashboard/*` + `/api/uploads*`.
- `app/(auth)/actions.ts` contains server actions for `login`, `signup`, `logout`. Signup uses the service-role admin client to atomically insert a default business + `business_users` row so every user lands in a usable workspace.
- `requireActiveSession()` (in `lib/workspace.ts`) is the canonical server helper — it redirects to `/login` if unauthenticated and loads the user's profile + first business membership.
- Google OAuth is stubbed as **Coming soon** — the button is disabled on both login and signup.

### How uploads work

1. `POST /api/uploads` — authenticates the user, validates size (≤ 10 MB) and extension (`.csv`, `.xlsx`, `.xls`), parses the file in Node, inserts a `file_uploads` row, writes the raw file to Supabase Storage under `{business_id}/{upload_id}/{filename}`, and runs column detection into `detected_columns`.
2. The browser is redirected to `/dashboard/mapping/{uploadId}` where the user reviews/adjusts suggestions.
3. `PATCH /api/uploads/{id}/mapping` saves the final mapping and flips the upload status to `mapped`.

All tables are business-scoped via RLS; the service role client is only used for provisioning during signup.

### How processing works (Phase 3)

Once a file's mapping is saved, click **Build my dashboard** (on the mapping page or the file-check page). The `POST /api/uploads/{id}/process` route:

1. Re-authenticates and re-checks RLS access on the upload.
2. Sets `file_uploads.status = 'processing'`.
3. Downloads the original file from Supabase Storage and parses every row.
4. Applies the saved `detected_columns` mapping → **bronze** (`bronze_raw_rows`, storing both `raw_data` and `mapped_data`).
5. Runs rules-based **validation** and writes `data_quality_runs` + `data_quality_results` with friendly messages. Critical issues (no rows, no usable dates, no sales amounts, missing essential mappings) stop the run and mark the upload `failed` with an explanation; everything else is a warning that lets processing continue.
6. Builds **silver** tables: `orders_silver`, `order_items_silver`, `customers_silver` (upsert by `business_id, customer_key`), `products_silver` (upsert by `business_id, product_key`).
7. Rebuilds **gold** tables for the whole business from every silver row: `gold_daily_sales`, `gold_monthly_sales`, `gold_product_performance`, `gold_customer_summary`.
8. Generates deterministic **insights** into `gold_business_insights` (top-product concentration, strongest sales day, repeat-customer value, slow-moving products, MoM trend, AOV, missing-data warnings, etc.).
9. Sets `file_uploads.status = 'processed'` and redirects to `/dashboard`.

Reprocessing the same file is safe: bronze, silver (for that upload), gold, and insights are rebuilt each time.

### How the dashboard picks real vs. demo data

`lib/dashboard-data.ts` loads gold rows for the active business. If any exist, the dashboard renders real numbers (overview metrics, sales trend, revenue by channel, top products, customer mix, insights, file check). If not, the polished Willow & Sage demo is shown with the "viewing demo data" banner so new users always see a beautiful page.

### Test walkthrough (upload → mapping → processing → dashboard)

1. Sign up, land in `/dashboard`.
2. Click **Uploads** → drag `sample-data/boutique_sales_messy.csv`.
3. Review the auto-detected column mapping on `/dashboard/mapping/{id}`.
4. Click **Build my dashboard**.
5. You should land on `/dashboard` with real numbers pulled from the sample file.
6. Upload another sample file — the dashboard merges all processed uploads for your workspace and refreshes every metric.
7. Sign out and sign up a second account → `/dashboard` shows demo data and cannot see the first user's rows.

### Troubleshooting

- **"We couldn't find any rows with data"** — your CSV is empty or the header row is malformed. Re-export from your store.
- **"We couldn't read any dates"** — your order date column is mapped to something else or contains non-date text. Edit the mapping on `/dashboard/mapping/{id}` and try again.
- **"We couldn't find any sales amounts"** — map your total column to `total_amount`, or map both `unit_price` and `quantity`.
- **Still seeing demo data after Build my dashboard?** Check `file_uploads.status`. If it's `failed`, hover the badge on `/dashboard` or visit the File check page to see the friendly reason.

### Demo-data fallback

Until a workspace has its first completed upload, `/dashboard` shows the polished Willow & Sage demo with a clear banner:

> **You're viewing demo data.** Upload a sales file to start building your own dashboard.

This is deliberate — new users see what the product will look like before they've invested any time.

---

## Project structure

```
mainstreet-metrics/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # auth shell (logo + back link)
│   │   ├── login/page.tsx          # login placeholder
│   │   └── signup/page.tsx         # signup placeholder
│   ├── dashboard/
│   │   ├── page.tsx                # main dashboard (Willow & Sage demo)
│   │   ├── upload/page.tsx         # drag-drop + recent uploads
│   │   ├── mapping/page.tsx        # column mapping UI
│   │   ├── data-quality/page.tsx   # file check screen
│   │   └── settings/page.tsx       # business profile + sources
│   ├── globals.css                 # theme tokens, utilities
│   ├── layout.tsx                  # root layout (fonts, metadata)
│   └── page.tsx                    # landing page
├── components/
│   ├── brand/logo.tsx
│   ├── dashboard/                  # DashboardShell, MetricCard, InsightCard,
│   │                               # SalesTrendChart, RevenueByChannelChart,
│   │                               # TopProductsTable, CustomerInsights,
│   │                               # DataQualityCard
│   ├── landing/                    # Navbar, Hero, StatStrip, HowItWorks,
│   │                               # WhatYouGet, InsightsPreview,
│   │                               # DashboardPreview, WhoItsFor,
│   │                               # Pricing, FAQ, FinalCTA, Footer
│   ├── mapping/mapping-table.tsx
│   ├── upload/                     # UploadDropzone, RecentUploads
│   └── ui/                         # Button, Card, Badge, Input, Label,
│                                   # Separator, Container
├── lib/
│   ├── sample-data.ts              # all demo data + TS types
│   └── utils.ts                    # cn, formatCurrency, formatNumber
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## Design system

Colors (Tailwind tokens):
- **`brand`** (primary) — emerald (`#059669`), used for CTAs, accents, highlights
- **`warm`** — warm neutral (amber/stone blend), used for secondary accents (loyalty, industry tags)
- **Background** — off-white with a whisper of warmth (`hsl(40 33% 99%)`)
- **Text** — near-black with `cv02/cv03/cv04` OpenType features enabled for crisper small text

Typography:
- **Inter** for UI and body
- **Fraunces** for display headings (gives a friendly, editorial, Main Street feeling without being too corporate)

Motion:
- Subtle hero fade-up, smooth accordion FAQ, hover micro-interactions on cards, soft shadows that lift on hover.

---

## What's intentionally NOT built yet

Shipped in Phase 1 + Phase 2 + Phase 3:
- ✅ Supabase Auth (email/password) with friendly error messages
- ✅ Multi-business workspaces with RLS
- ✅ File upload + CSV/Excel parsing + column detection
- ✅ Column mapping UI persisted to Postgres
- ✅ Bronze → silver → gold medallion pipeline
- ✅ Rules-based data validation + friendly messages
- ✅ Rules-based business insights generated from gold
- ✅ Dashboard reads real gold data when available; demo fallback otherwise

Still deferred (planned):
- Google OAuth (stub today — "Coming soon" badge)
- Monthly refresh + email reports + PDF export
- Stripe billing
- API connectors (Shopify, Square, Etsy)
- Power BI embed
- Workspace switcher UI (multi-business per user)

---

## Roadmap

**Phase 1 — Frontend MVP (this repo):** landing page, dashboard, upload/mapping/file-check/settings pages, auth placeholders, sample data.

**Phase 2 — Backend & auth (DONE):** Supabase Auth + Postgres schema + RLS; `profiles`, `businesses`, `business_users`, `file_uploads`, `detected_columns`; CSV/Excel upload + parsing; column-detect heuristics; mapping persistence.

**Phase 2.5 — Google OAuth:** real social login wired through Supabase.

**Phase 3 — Pipeline (DONE):** bronze insert (JSONB), validation rules + `data_quality_runs`/`data_quality_results`, silver normalization (orders / items / customers / products), gold aggregations (daily / monthly / product / customer), rules-based insights, dashboard real-data loader with demo fallback.

**Phase 4 — Polish & delivery:** saved per-source mapping templates, monthly refresh scheduler, PDF export, email reports.

**Phase 6 — Polish:** real demo business seed, monthly refresh, PDF export, email reports.

**Phase 7 — Connectors & scale:** Shopify / Square / Etsy APIs, Power BI embed, multi-business teams, scheduled refresh.

---

## Demo tour

1. Visit `/` — scroll the full landing page.
2. Click **"Start free"** → lands on `/signup`; **"Create workspace"** jumps to the dashboard.
3. On `/dashboard`, explore the metrics, sales trend, product table, customer mix, insights, and latest upload card.
4. Click **Uploads** (sidebar) → `/dashboard/upload` — try dragging a file into the dropzone.
5. Click **Column mapping** → `/dashboard/mapping` — change a column's mapping; toggle Ignore.
6. Click **File check** → `/dashboard/data-quality` — see the friendly warnings screen.
7. Click **Settings** → `/dashboard/settings` — view business profile + connected sources.

---

## Product principles

- **Friendly over technical.** We say *"File check"* not *"Data quality runs"*, and *"We couldn't read this file"* not *"Parser exception"*.
- **Warn, don't block.** Minor issues never stop a dashboard from being built.
- **Trust signals.** Privacy reassurance, tenant isolation, no credit card.
- **Every chart explains itself.** Insight cards with plain-English titles, short body, supporting metric, and a single recommended action.

---

## License

Proprietary — prototype for portfolio / product validation. Contact the author before redistributing.
