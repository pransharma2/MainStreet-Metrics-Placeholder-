-- =============================================================================
-- MainStreet Metrics — Phase 4 onboarding & business profile fields
--
-- Apply this AFTER the Phase 2 schema (supabase/schema.sql).
-- Safe to re-run: everything uses `if not exists`.
--
-- Adds optional, free-text business-profile fields and onboarding markers
-- to public.businesses. These are owner-controlled (already covered by the
-- existing businesses_update_admins RLS policy), so no new policies needed.
-- =============================================================================

alter table public.businesses
  add column if not exists industry      text,
  add column if not exists currency      text not null default 'USD',
  add column if not exists timezone      text not null default 'America/Chicago',
  add column if not exists tagline       text,
  add column if not exists main_source   text,
  add column if not exists primary_goal  text,
  add column if not exists onboarded_at           timestamptz,
  add column if not exists onboarding_dismissed_at timestamptz;

-- (industry / currency / timezone / tagline existed in Phase 2 — `if not exists`
-- makes this migration idempotent if you applied the Phase 2 schema first.)
