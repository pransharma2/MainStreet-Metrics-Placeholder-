-- =============================================================================
-- MainStreet Metrics — Phase 2 schema + RLS
--
-- Apply this in the Supabase SQL editor AFTER creating your project.
-- Safe to re-run: everything uses `if not exists` or `create or replace`.
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- =============================================================================
-- profiles  (1:1 with auth.users)
-- =============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- businesses  (a tenant / workspace)
-- =============================================================================
create table if not exists public.businesses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  industry    text,
  currency    text not null default 'USD',
  timezone    text not null default 'America/Chicago',
  tagline     text,
  created_by  uuid not null references auth.users(id) on delete restrict,
  created_at  timestamptz not null default now()
);

alter table public.businesses enable row level security;

-- =============================================================================
-- business_users  (membership)
-- =============================================================================
create type business_role as enum ('owner', 'admin', 'member');

create table if not exists public.business_users (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        business_role not null default 'owner',
  created_at  timestamptz not null default now(),
  primary key (business_id, user_id)
);

alter table public.business_users enable row level security;

-- Helper: is the current user a member of a given business?
create or replace function public.is_business_member(b_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.business_users
     where business_id = b_id
       and user_id = auth.uid()
  );
$$;

-- Policies for businesses
drop policy if exists "businesses_select_members" on public.businesses;
create policy "businesses_select_members"
  on public.businesses for select
  using (public.is_business_member(id));

drop policy if exists "businesses_update_admins" on public.businesses;
create policy "businesses_update_admins"
  on public.businesses for update
  using (
    exists (
      select 1 from public.business_users bu
       where bu.business_id = businesses.id
         and bu.user_id = auth.uid()
         and bu.role in ('owner', 'admin')
    )
  );

-- Insert is handled via service role (auto-provision on signup).

-- Policies for business_users
drop policy if exists "business_users_select_self_or_peer" on public.business_users;
create policy "business_users_select_self_or_peer"
  on public.business_users for select
  using (
    user_id = auth.uid()
    or public.is_business_member(business_id)
  );

-- =============================================================================
-- file_uploads
-- =============================================================================
create type upload_status as enum (
  'uploaded', 'parsed', 'mapped', 'processed', 'failed'
);

create type upload_source as enum ('Shopify', 'Square', 'Etsy', 'CSV', 'Excel');

create table if not exists public.file_uploads (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses(id) on delete cascade,
  uploader_id    uuid not null references auth.users(id) on delete set null,
  filename       text not null,
  source         upload_source not null default 'CSV',
  size_bytes     bigint not null default 0,
  row_count      integer,
  storage_path   text not null,
  status         upload_status not null default 'uploaded',
  error_message  text,
  preview_rows   jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists file_uploads_business_idx
  on public.file_uploads (business_id, created_at desc);

alter table public.file_uploads enable row level security;

drop policy if exists "file_uploads_select_members" on public.file_uploads;
create policy "file_uploads_select_members"
  on public.file_uploads for select
  using (public.is_business_member(business_id));

drop policy if exists "file_uploads_insert_members" on public.file_uploads;
create policy "file_uploads_insert_members"
  on public.file_uploads for insert
  with check (public.is_business_member(business_id));

drop policy if exists "file_uploads_update_members" on public.file_uploads;
create policy "file_uploads_update_members"
  on public.file_uploads for update
  using (public.is_business_member(business_id));

-- =============================================================================
-- detected_columns
-- =============================================================================
create type confidence_level as enum ('high', 'medium', 'low');

create table if not exists public.detected_columns (
  id              uuid primary key default gen_random_uuid(),
  file_upload_id  uuid not null references public.file_uploads(id) on delete cascade,
  original        text not null,
  sample          text,
  suggestion      text not null,
  confidence      confidence_level not null default 'medium',
  ignored         boolean not null default false,
  position        integer not null default 0
);

create index if not exists detected_columns_upload_idx
  on public.detected_columns (file_upload_id, position);

alter table public.detected_columns enable row level security;

-- Helper: is the current user a member of the business that owns a given upload?
create or replace function public.can_access_upload(u_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.file_uploads fu
      join public.business_users bu on bu.business_id = fu.business_id
     where fu.id = u_id
       and bu.user_id = auth.uid()
  );
$$;

drop policy if exists "detected_columns_select" on public.detected_columns;
create policy "detected_columns_select"
  on public.detected_columns for select
  using (public.can_access_upload(file_upload_id));

drop policy if exists "detected_columns_cud" on public.detected_columns;
create policy "detected_columns_cud"
  on public.detected_columns for all
  using (public.can_access_upload(file_upload_id))
  with check (public.can_access_upload(file_upload_id));

-- =============================================================================
-- Storage bucket for uploads
-- =============================================================================
-- Create a private bucket named 'uploads' (done manually in the Supabase UI, or:)
insert into storage.buckets (id, name, public)
  values ('uploads', 'uploads', false)
  on conflict (id) do nothing;

-- Policy: only members of the business can read/write files under `<business_id>/...`
drop policy if exists "uploads_rw_members" on storage.objects;
create policy "uploads_rw_members"
  on storage.objects for all
  using (
    bucket_id = 'uploads'
    and public.is_business_member((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'uploads'
    and public.is_business_member((storage.foldername(name))[1]::uuid)
  );
