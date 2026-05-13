-- =============================================================================
-- MainStreet Metrics — Phase 4 lead capture (early access / dashboard requests)
--
-- Apply this AFTER the Phase 2 schema (supabase/schema.sql) and the
-- Phase 4 onboarding migration (0003_phase4_onboarding.sql).
-- Safe to re-run: everything uses `if not exists` / `create or replace`.
--
-- Adds a public-write / no-public-read leads table. Anyone (anonymous or
-- authenticated) can submit a lead via the /request-dashboard form, but
-- only privileged DB admins can read them. No admin UI is built yet.
-- =============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.early_access_leads (
  id                        uuid primary key default gen_random_uuid(),
  name                      text not null,
  email                     text not null,
  business_name             text,
  business_type             text,
  sales_source              text,
  estimated_monthly_orders  text,
  goal                      text,
  message                   text,
  source_page               text,
  status                    text not null default 'new',
  user_id                   uuid references auth.users(id) on delete set null,
  business_id               uuid references public.businesses(id) on delete set null,
  created_at                timestamptz not null default now()
);

create index if not exists early_access_leads_created_idx on public.early_access_leads (created_at desc);
create index if not exists early_access_leads_email_idx   on public.early_access_leads (lower(email));

alter table public.early_access_leads enable row level security;

-- Anonymous + authenticated visitors can INSERT a lead — that's the public
-- form. They cannot read, update, or delete anything.
drop policy if exists "early_access_leads_insert_anyone" on public.early_access_leads;
create policy "early_access_leads_insert_anyone"
  on public.early_access_leads
  for insert
  to anon, authenticated
  with check (true);

-- No SELECT / UPDATE / DELETE policies are defined for anon or authenticated.
-- With RLS enabled and no matching policy, those operations are blocked.
-- Service-role connections bypass RLS automatically (admin tooling only).
