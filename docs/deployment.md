# Deployment guide — Vercel + Supabase

> The fastest path to a public, customer-ready URL. Follow it once and the rest is `git push`.

MainStreet Metrics is a stock Next.js 14 App Router app, so any Node-capable host works. These notes cover **Vercel** because the auth + middleware story is zero-config there, but the same env vars apply to Render, Fly, Railway, or a self-hosted Node 18.17+ box.

---

## 1. Prereqs

- A GitHub account with this repo pushed up.
- A free [Vercel](https://vercel.com) account.
- A free [Supabase](https://supabase.com) project (project URL + anon key + service role key).
- A custom domain (optional, but recommended for the OG / social cards).

---

## 2. Apply the database schema

Before the first deploy, the Supabase project needs the schema applied.

1. Open the Supabase SQL editor.
2. Paste the contents of [`supabase/schema.sql`](../supabase/schema.sql) and run it. This is idempotent — safe to re-run.
3. If you want only the Phase 4 additive migrations (because Phase 2/3 schema is already applied), run these in order:
   - [`supabase/migrations/0002_phase3_medallion.sql`](../supabase/migrations/0002_phase3_medallion.sql)
   - [`supabase/migrations/0003_phase4_onboarding.sql`](../supabase/migrations/0003_phase4_onboarding.sql)
   - [`supabase/migrations/0004_phase4_leads.sql`](../supabase/migrations/0004_phase4_leads.sql)

Verify in the Supabase **Table editor** that the `early_access_leads`, `businesses`, and gold-layer tables exist.

---

## 3. Import the repo into Vercel

1. Vercel → **Add New… → Project** → import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Build command: leave the default (`next build`).
4. Output / install commands: defaults.
5. Root directory: repo root.

Do **not** click "Deploy" yet — set the env vars first.

---

## 4. Environment variables

Configure these under **Project Settings → Environment Variables** for the **Production** environment (and **Preview**, if you want preview URLs to work):

| Name | Source | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Public, shipped to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → Project API keys → `anon public` | Public, shipped to the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → Project API keys → `service_role` | **Server-only.** Never expose. Imported only by `lib/supabase/admin.ts`. |
| `NEXT_PUBLIC_SITE_URL` | Your final public URL, e.g. `https://mainstreetmetrics.app` | Used for auth redirects, OG tags, and `robots.txt`. |

Mark `SUPABASE_SERVICE_ROLE_KEY` as **sensitive** in the Vercel UI so the value is hidden after save.

---

## 5. Configure Supabase Auth redirects

In the Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL** — set to your public URL (e.g. `https://mainstreetmetrics.app`).
- **Redirect URLs** — add the same URL plus any preview domains (e.g. `https://*.vercel.app/**`).

If email confirmations are enabled, the signup flow will email a confirmation link that returns to this URL.

---

## 6. Deploy

Click **Deploy** in Vercel. The first build takes ~2 minutes. Subsequent pushes to the deploy branch redeploy automatically.

Vercel runs `npm install` then `npm run build`. Both should pass cleanly because we self-host fonts (no `fonts.googleapis.com` fetch) and we don't use any build-time secrets beyond the env vars above.

---

## 7. Post-deploy verification checklist

After the first deploy:

- [ ] `/` loads the landing page.
- [ ] `/demo`, `/demo/boutique`, `/demo/cafe`, `/demo/etsy` all render dashboards.
- [ ] `/request-dashboard` loads while logged out and accepts a friendly lead submission.
- [ ] `/dashboard` redirects to `/login` when logged out.
- [ ] `/login` and `/signup` render and the form submits cleanly.
- [ ] Signup creates an `auth.users` row, a `profiles` row, a `businesses` row, and a `business_users` row.
- [ ] After signup, the user lands on `/dashboard/onboarding`. Submitting the form returns them to `/dashboard`.
- [ ] Uploading a sample CSV (`sample-data/boutique_sales_messy.csv`) → mapping → **Build my dashboard** ends with real numbers on `/dashboard`.
- [ ] A second account cannot see the first account's data (RLS test).
- [ ] `/robots.txt` is served and disallows `/dashboard`, `/api`, `/login`, `/signup`.
- [ ] Response headers include `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Strict-Transport-Security` (DevTools → Network → any HTML response).
- [ ] No `X-Powered-By` header is present.
- [ ] Browser tab shows the brand favicon.

---

## 8. Custom domain (optional)

1. Vercel → **Project → Settings → Domains** → add the domain.
2. Update DNS records as Vercel instructs (an `A` record or `CNAME`).
3. Once verified, update:
   - `NEXT_PUBLIC_SITE_URL` in Vercel.
   - **Site URL** in Supabase Authentication.
4. Trigger a fresh deploy so OG tags + `robots.txt` pick up the new domain.

---

## 9. Rolling back

Vercel keeps every deployment. Use **Deployments → … → Promote to Production** to roll back to a known-good build. Schema changes are not auto-rolled back — keep migrations additive (we already do).

---

## 10. What to monitor week one

- Supabase → **Logs → Auth** for failed signups.
- Supabase → **Logs → API** for unexpected RLS denials.
- Vercel → **Logs** for any `app/error.tsx` digests reported by users.
- `early_access_leads` table — anyone who submitted the lead form on `/request-dashboard`.

---

## 11. What deployment does **not** include yet

- Stripe billing.
- Real Google OAuth (the button is a "Coming soon" stub).
- Email reports / weekly digest.
- Live Shopify / Square / Etsy connectors.
- A managed worker for heavier processing.

Each of those is its own deliberate scope; ship the polished public app first.
