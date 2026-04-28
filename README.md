# MainStreet Metrics

> Turn messy sales exports into clean, business-ready dashboards.

**MainStreet Metrics** is a small-business sales analytics product. Small shops — boutiques, cafés, Etsy sellers, home businesses — upload messy sales files from Square, Shopify, Etsy, Excel, or Google Sheets, and get a clean, friendly dashboard that tells them what's actually happening and what to do next.

This repository currently covers **Phase 1 (frontend MVP) + Phase 2 (Supabase backend)**: a polished, investor-demo-ready UI with real auth, multi-business workspaces, file uploads, CSV/Excel parsing, and column mapping — all wired to Supabase (Auth + Postgres + Storage). The medallion transforms (bronze → silver → gold) and rules-based insights are planned for Phase 3+.

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
- **Google Fonts** — Inter (body) + Fraunces (display)

Designed for Phase 2+ integration with **Supabase** (Auth, Postgres, Storage) and optional **FastAPI + Pandas** workers for heavy file processing.

---

## Local setup

Requirements: Node 18.17+, [pnpm](https://pnpm.io/), and a free [Supabase](https://supabase.com) project.

```bash
cd mainstreet-metrics
pnpm install
cp .env.local.example .env.local    # then fill in your Supabase keys
pnpm dev
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

### 4. (Optional) Configure email confirmations

In **Authentication → Providers → Email**, you can disable "Confirm email" during local development so signup flows straight into the dashboard. In production, leave it on — the login screen already handles the "check your inbox" state.

### 5. Run it

```bash
pnpm dev
```

Visit `/signup`, create an account, and you'll be dropped into your new workspace. Upload a CSV from `/dashboard/upload` to see the full parse → detect → map flow end-to-end.

Scripts:
- `pnpm dev` — Next dev server
- `pnpm build` — Production build
- `pnpm start` — Production server
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript check (no emit)

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

Shipped in Phase 1 + Phase 2:
- ✅ Supabase Auth (email/password) with friendly error messages
- ✅ Multi-business workspaces with RLS
- ✅ File upload + CSV/Excel parsing + column detection
- ✅ Column mapping UI persisted to Postgres

Still deferred (planned):
- Google OAuth (stub today — "Coming soon" badge)
- Bronze / silver / gold medallion transforms
- Rules-based insight generation from real data
- Monthly refresh + email reports + PDF export
- Stripe billing
- API connectors (Shopify, Square, Etsy)
- Power BI embed

---

## Roadmap

**Phase 1 — Frontend MVP (this repo):** landing page, dashboard, upload/mapping/file-check/settings pages, auth placeholders, sample data.

**Phase 2 — Backend & auth (DONE):** Supabase Auth + Postgres schema + RLS; `profiles`, `businesses`, `business_users`, `file_uploads`, `detected_columns`; CSV/Excel upload + parsing; column-detect heuristics; mapping persistence.

**Phase 2.5 — Google OAuth:** real social login wired through Supabase.

**Phase 3 — Pipeline:** bronze insert (JSONB), validation rules + `data_quality_runs`, silver normalization, gold aggregations, rules-based insights, per-source saved mapping templates.

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
