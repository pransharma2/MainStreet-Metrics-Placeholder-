# MainStreet Metrics

> Turn messy sales exports into clean, business-ready dashboards.

**MainStreet Metrics** is a small-business sales analytics product. Boutiques, cafés, Etsy sellers, and home businesses upload messy sales files from Square, Shopify, Etsy, Excel, or Google Sheets and get a polished, plain-English dashboard that tells them what's actually happening — and what to do next. No data team required.

This is a working portfolio / product-validation prototype. The frontend is investor-demo-ready; the backend runs a real medallion-style data pipeline on top of Supabase.

---

## Status at a glance

| Phase | Scope | Status |
| --- | --- | --- |
| **Phase 1** | Polished frontend shell — landing page, dashboard, upload/mapping/file-check screens, design system | ✅ Shipped |
| **Phase 2** | Supabase backend — auth, multi-business workspaces, RLS, file uploads, Storage, column detection, mapping persistence | ✅ Shipped |
| **Phase 3** | Medallion pipeline — bronze raw rows, validation, silver normalization, gold aggregations, rules-based insights, dashboard reads real data | ✅ Shipped |
| **Phase 3.5** | Verification & hardening — npm-only workflow, self-hosted fonts, race-safe processing, clean `npm run build` | ✅ Shipped |
| **Phase 4** | Public demo, landing conversion, printable insight report, onboarding + business profile, dashboard explanation layer, settings, lead capture, final polish + deployment readiness | 🚧 Wrapping up on `feature/adding-Phase-4` |

See [Roadmap](#roadmap) for what's next.

---

## Live demo routes

The product ships a fully public, no-signup demo so anyone can see what the dashboard looks like:

- [`/demo`](http://localhost:3000/demo) — pick a sample business
- [`/demo/boutique`](http://localhost:3000/demo/boutique) — Willow & Sage, a boutique
- [`/demo/cafe`](http://localhost:3000/demo/cafe) — a neighborhood café
- [`/demo/etsy`](http://localhost:3000/demo/etsy) — an Etsy-style handmade shop

Each one renders the real dashboard components against a realistic, messy sample export.

---

## Key features

- **Beautiful landing page** with hero, stat strip, "how it works", features, insights preview, dashboard preview, pricing, FAQ, and final CTA.
- **Public demo experience** at `/demo/*` so visitors can explore three full sample dashboards without signing up.
- **Public lead capture** at `/request-dashboard` — friendly form that writes to `early_access_leads` (anon-insert RLS only; nobody can read leads back from the browser).
- **Onboarding + business profile** — first-time users complete a short questionnaire (industry, time zone, main source, primary goal). Editable later under **Settings**.
- **Dashboard explanation layer** — every chart pairs with a deterministic "what this means / why it matters / next step" panel. No AI; pure rules over real data.
- **Printable insight report** at `/dashboard/report` and `/demo/[businessType]/report` — `window.print()` only, no PDF library.
- **Real auth** — Supabase email/password with friendly error mapping. Google OAuth stubbed as "Coming soon".
- **Multi-business workspaces** — every business-scoped table is RLS-protected; users only see their own rows.
- **Drag-and-drop uploads** for CSV / XLSX up to 10 MB, parsed in Node.
- **Column detection + mapping UI** with confidence badges, friendly suggestions, and a one-click "Build my dashboard" action.
- **Bronze → silver → gold pipeline** rebuilt deterministically on every upload, with a race-safe status claim so two clicks can't double-process.
- **Rules-based validation** with plain-English messages — critical issues stop the run with a clear reason; warnings continue.
- **Rules-based insights** — top-product concentration, strongest sales day, repeat-customer value, slow movers, MoM trend, AOV, missing-email warnings, and more.
- **Demo-data fallback** — until a workspace has its first processed upload, the dashboard renders the polished Willow & Sage demo with a clear banner so new users always see a beautiful page.
- **Self-hosted fonts** — Inter + Fraunces bundled locally, no Google Fonts fetch at build time.
- **Friendly 404 + error boundary** — `app/not-found.tsx` and `app/error.tsx` keep the brand visible when something breaks.
- **Production-grade headers** — `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, and `poweredByHeader: false` configured in `next.config.mjs`.

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a custom theme (emerald brand + warm neutrals + display font)
- **shadcn/ui-style primitives** built inline so it doesn't look like a default template
- **Recharts** for the sales trend area chart and the channel donut
- **Framer Motion** for subtle hero entrance animation and hover micro-interactions
- **lucide-react** icons
- **Supabase** — Auth, Postgres, Storage
- **Papaparse** + **SheetJS** (`xlsx`) for CSV / Excel parsing
- **Zod** for request validation
- **`@fontsource-variable/inter`** + **`@fontsource-variable/fraunces`** for self-hosted fonts

---

## Architecture overview

```
Browser
  │
  ▼
Next.js App Router (server components + route handlers, Node runtime)
  │
  ├── middleware.ts          → refreshes Supabase session, guards /dashboard/* and /api/uploads*
  ├── app/(auth)/actions.ts  → login / signup / logout (signup atomically provisions a default business)
  ├── app/api/uploads/*      → upload, mapping, processing endpoints
  └── lib/supabase/admin.ts  → service-role client, `import "server-only"` so it never ships to the browser
  │
  ▼
Supabase
  ├── Auth         (email/password)
  ├── Postgres     (RLS on every business-scoped table)
  └── Storage      (private `uploads` bucket, per-business folder policy)
```

Pure processing functions live under `lib/processing/` and have no Supabase or Next dependencies — they're easy to unit-test and easy to lift into a worker later if processing grows.

---

## Data pipeline overview

```
  Upload          Mapping            Bronze              Validation
  ──────          ───────            ──────              ──────────
  CSV / XLSX  →   detect columns →   bronze_raw_rows  →  data_quality_runs
  ≤ 10 MB         user confirms      raw_data + mapped   data_quality_results
                                                          (critical → fail run)

      Silver                            Gold                          Dashboard
      ──────                            ────                          ─────────
      orders_silver       →  gold_daily_sales            →  loadDashboardData()
      order_items_silver     gold_monthly_sales              real numbers when
      customers_silver       gold_product_performance        any gold rows exist;
      products_silver        gold_customer_summary           demo fallback otherwise
                             gold_business_insights
```

Each `POST /api/uploads/{id}/process` call is a deterministic full rebuild for that upload's silver and the whole business's gold + insights, so reprocessing is always safe.

---

## Security and privacy

- **Row-Level Security** is on for every business-scoped table. `is_business_member(business_id)` and `can_access_upload(upload_id)` are SECURITY DEFINER helpers used in every policy.
- **Multi-business tenant isolation** — `business_id` is the tenant boundary; `business_users` controls access; users can only see rows for businesses they belong to.
- **Private uploads bucket** — Supabase Storage `uploads` bucket is private, with per-business folder policies keyed on `(storage.foldername(name))[1]::uuid`. Files are stored at `{business_id}/{upload_id}/{filename}`.
- **Service role key is server-only** — `SUPABASE_SERVICE_ROLE_KEY` is imported only from `lib/supabase/admin.ts`, which begins with `import "server-only"`. Any client component that imports it will fail the build.
- **Friendly error mapping** — auth errors are rewritten to non-technical language (`friendlyAuthError`) before being shown to the user.
- **No secrets in the repo** — `.env.local` is gitignored; `.env.local.example` documents the required keys with placeholder values.

---

## Local setup

Requirements: Node 18.17+, npm (bundled with Node), and a free [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/pransharma2/MainStreet-Metrics-Placeholder-.git
cd MainStreet-Metrics-Placeholder-
npm install
cp .env.local.example .env.local    # then fill in your Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Scripts:
- `npm run dev` — Next dev server
- `npm run build` — Production build
- `npm start` — Production server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check (no emit)

> **Use npm only.** This project intentionally moved off `pnpm` during Phase 3.5; mixing package managers will desync the lockfile.

---

## Supabase setup

### 1. Create a project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. From **Project Settings → API**, copy the **Project URL**, the **anon public** key, and the **service_role** key.

### 2. Fill in `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-only, never expose
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The service role key is imported only by `lib/supabase/admin.ts`, which is guarded with `import "server-only"` — it will never ship to the browser.

### 3. Apply the schema

Open the Supabase **SQL editor** and paste the contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates everything:

- Core tables — `profiles`, `businesses`, `business_users`, `file_uploads`, `detected_columns`
- Pipeline tables — `bronze_raw_rows`, `data_quality_runs`, `data_quality_results`, `orders_silver`, `order_items_silver`, `customers_silver`, `products_silver`, `gold_daily_sales`, `gold_monthly_sales`, `gold_product_performance`, `gold_customer_summary`, `gold_business_insights`
- Enums — `business_role`, `upload_status`, `upload_source`, `confidence_level`
- A `handle_new_user()` trigger that auto-creates a profile row on signup
- RLS helpers `is_business_member()` and `can_access_upload()`
- Row-Level Security policies on every business-scoped table
- A private `uploads` storage bucket with per-business folder policies

If you applied an earlier phase's schema and only want the Phase 3 additions, run [`supabase/migrations/0002_phase3_medallion.sql`](./supabase/migrations/0002_phase3_medallion.sql) instead — it's idempotent.

### 4. (Optional) Configure email confirmations

Under **Authentication → Providers → Email** you can disable "Confirm email" for local development so signup flows straight into the dashboard. In production, leave it on — the login screen handles the "check your inbox" state.

---

## Sample data walkthrough

Three realistic, deliberately messy CSVs live under [`sample-data/`](./sample-data/):

- `boutique_sales_messy.csv` — Shopify-style export
- `cafe_sales_messy.csv` — Square / POS receipt export with ticket numbers
- `etsy_shop_sales_messy.csv` — Etsy-style transaction export

Try the full flow end-to-end:

1. Sign up at `/signup`, land in `/dashboard`.
2. Click **Uploads** → drag `boutique_sales_messy.csv` into the dropzone.
3. Review the auto-detected column mapping on `/dashboard/mapping/{id}` and tweak if needed.
4. Click **Build my dashboard**.
5. The upload status walks through `uploaded → parsed → mapped → processing → processed`.
6. `/dashboard` now shows your real numbers — the demo banner is gone.
7. Upload one of the other sample files; the dashboard merges everything for the workspace and refreshes.
8. Sign up a second account → that user's `/dashboard` shows demo data and cannot see the first user's rows.

If you'd rather not sign up at all, visit `/demo` and click into any of the sample businesses for a fully rendered dashboard.

---

## Troubleshooting

- **"We couldn't find any rows with data"** — your CSV is empty or the header row is malformed. Re-export from your store.
- **"We couldn't read any dates"** — your order date column is mapped to something else or contains non-date text. Edit the mapping on `/dashboard/mapping/{id}` and try again.
- **"We couldn't find any sales amounts"** — map your total column to `total_amount`, or map both `unit_price` and `quantity`.
- **Still seeing demo data after Build my dashboard?** Check `file_uploads.status`. If it's `failed`, hover the badge on `/dashboard` or visit the File check page for the friendly reason.

---

## Project structure

```
mainstreet-metrics/
├── app/
│   ├── (auth)/                       # login + signup pages and server actions
│   ├── api/uploads/                  # upload, mapping, process route handlers
│   ├── dashboard/                    # dashboard, upload, mapping, file-check, onboarding, report, settings
│   ├── demo/                         # public demo experience (Phase 4)
│   ├── request-dashboard/            # public lead-capture page (Phase 4)
│   ├── globals.css                   # theme tokens + utilities + print styles
│   ├── icon.svg                      # brand favicon
│   ├── robots.ts                     # /robots.txt route
│   ├── error.tsx                     # friendly global error boundary
│   ├── not-found.tsx                 # friendly 404
│   ├── layout.tsx                    # root layout (fonts, metadata, viewport)
│   └── page.tsx                      # landing page
├── components/
│   ├── brand/                        # logo
│   ├── dashboard/                    # MetricCard, InsightCard, charts, tables, shell, onboarding card, explanation card
│   ├── demo/                         # public-demo shell + cards
│   ├── landing/                      # hero, stat strip, sections, CTA, footer
│   ├── leads/                        # lead-capture form
│   ├── mapping/                      # mapping table editor
│   ├── onboarding/                   # onboarding form
│   ├── report/                       # printable report view
│   ├── settings/                     # business profile form
│   ├── upload/                       # dropzone + recent uploads
│   └── ui/                           # Button, Card, Badge, Input, Label, Separator
├── docs/
│   ├── deployment.md                 # Vercel + Supabase deploy guide
│   └── phase-4-handoff.md            # condensed state at the start of Phase 4
├── lib/
│   ├── processing/                   # pure bronze/silver/gold/insights/validation
│   ├── supabase/                     # browser, server, admin, middleware clients
│   ├── column-detect.ts              # header → standard-field heuristics
│   ├── dashboard-data.ts             # gold → component shapes (server-only)
│   ├── demo-data.ts                  # public demo dashboards
│   ├── parse-file.ts                 # shared CSV/XLSX parser
│   ├── sample-data.ts                # Willow & Sage demo data
│   ├── types/db.ts                   # row + insert types
│   └── workspace.ts                  # requireActiveSession()
├── sample-data/                      # three messy CSVs for end-to-end testing
├── supabase/
│   ├── schema.sql                    # full schema (apply once)
│   └── migrations/                   # idempotent additive migrations
├── middleware.ts                     # session refresh + route guard
├── next.config.mjs                   # security headers, poweredByHeader off
└── package.json
```

---

## Design system

- **Colors:** `brand` emerald (`#059669`) for CTAs and highlights; `warm` neutral (amber/stone blend) for secondary accents; near-white background with a whisper of warmth (`hsl(40 33% 99%)`); near-black text with `cv02/cv03/cv04` OpenType features for crisper small text.
- **Typography:** Inter for UI/body, Fraunces for display headings — friendly, editorial, Main Street.
- **Motion:** subtle hero fade-up, smooth FAQ accordion, soft shadows that lift on hover.

---

## Deployment

The app is a stock Next.js 14 App Router project, so any Node 18.17+ host works. The recommended path is **Vercel + Supabase** — see [`docs/deployment.md`](./docs/deployment.md) for the step-by-step guide (env vars, Supabase auth redirects, post-deploy verification checklist).

The build is hermetic: fonts are self-hosted, no third-party fetches happen at build time, and every secret comes from environment variables. Security headers (HSTS, Referrer-Policy, X-Content-Type-Options, Permissions-Policy) are wired up in `next.config.mjs`, and `/robots.txt` automatically disallows `/dashboard`, `/api`, `/login`, and `/signup`.

---

## Roadmap

**Done:**
- ✅ **Phase 1** — Polished frontend MVP (landing, dashboard, upload/mapping/file-check shells, sample data).
- ✅ **Phase 2** — Supabase Auth + Postgres + RLS; file upload, parsing, column detection, mapping persistence.
- ✅ **Phase 3** — Medallion pipeline (bronze → silver → gold), rules-based validation + insights, real dashboard data with demo fallback.
- ✅ **Phase 3.5** — Verification + hardening: npm-only, self-hosted fonts, race-safe processing endpoint, clean `npm run build`.
- ✅ **Phase 4** — Public demo experience, landing-page conversion, printable insight report, onboarding + business profile, dashboard explanation layer, settings, public lead capture (`/request-dashboard`), final polish + deployment readiness.

**Later (deferred — not started):**
- Saved per-source mapping templates so repeat uploads with the same headers become a one-click confirmation.
- Workspace switcher UI on top of the existing `business_users` schema.
- PDF export library (today: `window.print()` from `/dashboard/report`).
- Email reports — weekly digest via Supabase scheduled functions + a transactional email provider.
- Incremental gold updates instead of full rebuild.
- Real Google OAuth (today the button is a "Coming soon" stub).
- Stripe billing.
- Live API connectors for Shopify / Square / Etsy.
- Power BI embed.
- Optional FastAPI + Pandas / DuckDB worker for heavier processing.

---

## Screenshots

> _Screenshots coming soon. In the meantime, the easiest way to see what the product looks like is `npm run dev` and visit [`/demo`](http://localhost:3000/demo)._

---

## Product principles

- **Friendly over technical.** We say *"File check"* not *"Data quality runs"*, and *"We couldn't read this file"* not *"Parser exception"*.
- **Warn, don't block.** Minor issues never stop a dashboard from being built.
- **Trust signals.** Privacy reassurance, tenant isolation, no credit card.
- **Every chart explains itself.** Insight cards with plain-English titles, short body, supporting metric, and a single recommended action.

---

## License

Proprietary — prototype for portfolio / product validation. Please contact the author before redistributing.
