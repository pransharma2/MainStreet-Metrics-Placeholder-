-- =============================================================================
-- MainStreet Metrics — Phase 3 medallion schema (bronze / silver / gold)
--
-- Apply this AFTER the Phase 2 schema (supabase/schema.sql).
-- Safe to re-run: everything uses `if not exists` or `create or replace`.
-- =============================================================================

-- Add 'processing' to upload_status enum if not already present ----------------
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'upload_status' and e.enumlabel = 'processing'
  ) then
    alter type upload_status add value 'processing' before 'processed';
  end if;
end$$;

-- =============================================================================
-- BRONZE: raw rows exactly as uploaded (+ mapped view of the same row)
-- =============================================================================
create table if not exists public.bronze_raw_rows (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  file_upload_id  uuid not null references public.file_uploads(id) on delete cascade,
  source_system   text,
  raw_row_number  integer not null,
  raw_data        jsonb not null,
  mapped_data     jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists bronze_raw_rows_business_idx   on public.bronze_raw_rows (business_id);
create index if not exists bronze_raw_rows_upload_idx     on public.bronze_raw_rows (file_upload_id);

alter table public.bronze_raw_rows enable row level security;

drop policy if exists "bronze_raw_rows_select"  on public.bronze_raw_rows;
drop policy if exists "bronze_raw_rows_cud"     on public.bronze_raw_rows;
create policy "bronze_raw_rows_select" on public.bronze_raw_rows for select
  using (public.is_business_member(business_id));
create policy "bronze_raw_rows_cud" on public.bronze_raw_rows for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

-- =============================================================================
-- DATA QUALITY
-- =============================================================================
create table if not exists public.data_quality_runs (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  file_upload_id  uuid not null references public.file_uploads(id) on delete cascade,
  status          text not null check (status in ('passed', 'warnings', 'failed')),
  total_rows      integer,
  warning_count   integer not null default 0,
  error_count     integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists dq_runs_business_idx on public.data_quality_runs (business_id);
create index if not exists dq_runs_upload_idx   on public.data_quality_runs (file_upload_id, created_at desc);

alter table public.data_quality_runs enable row level security;

drop policy if exists "dq_runs_select" on public.data_quality_runs;
drop policy if exists "dq_runs_cud"    on public.data_quality_runs;
create policy "dq_runs_select" on public.data_quality_runs for select
  using (public.is_business_member(business_id));
create policy "dq_runs_cud" on public.data_quality_runs for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create table if not exists public.data_quality_results (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid references public.data_quality_runs(id) on delete cascade,
  business_id     uuid not null references public.businesses(id) on delete cascade,
  file_upload_id  uuid not null references public.file_uploads(id) on delete cascade,
  rule_name       text not null,
  severity        text not null check (severity in ('info', 'warning', 'error')),
  affected_rows   integer not null default 0,
  message         text not null,
  suggested_fix   text,
  created_at      timestamptz not null default now()
);

create index if not exists dq_results_business_idx on public.data_quality_results (business_id);
create index if not exists dq_results_upload_idx   on public.data_quality_results (file_upload_id);
create index if not exists dq_results_run_idx      on public.data_quality_results (run_id);

alter table public.data_quality_results enable row level security;

drop policy if exists "dq_results_select" on public.data_quality_results;
drop policy if exists "dq_results_cud"    on public.data_quality_results;
create policy "dq_results_select" on public.data_quality_results for select
  using (public.is_business_member(business_id));
create policy "dq_results_cud" on public.data_quality_results for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

-- =============================================================================
-- SILVER
-- =============================================================================
create table if not exists public.orders_silver (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,
  file_upload_id    uuid references public.file_uploads(id) on delete cascade,
  source_order_id   text,
  order_date        date,
  customer_key      text,
  customer_name     text,
  customer_email    text,
  sales_channel     text,
  subtotal_amount   numeric not null default 0,
  discount_amount   numeric not null default 0,
  tax_amount        numeric not null default 0,
  shipping_amount   numeric not null default 0,
  total_amount      numeric not null default 0,
  refund_amount     numeric not null default 0,
  net_amount        numeric not null default 0,
  currency          text,
  created_at        timestamptz not null default now()
);

create index if not exists orders_silver_business_idx  on public.orders_silver (business_id);
create index if not exists orders_silver_upload_idx    on public.orders_silver (file_upload_id);
create index if not exists orders_silver_date_idx      on public.orders_silver (business_id, order_date);
create index if not exists orders_silver_customer_idx  on public.orders_silver (business_id, customer_key);

alter table public.orders_silver enable row level security;

drop policy if exists "orders_silver_select" on public.orders_silver;
drop policy if exists "orders_silver_cud"    on public.orders_silver;
create policy "orders_silver_select" on public.orders_silver for select
  using (public.is_business_member(business_id));
create policy "orders_silver_cud" on public.orders_silver for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create table if not exists public.order_items_silver (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references public.businesses(id) on delete cascade,
  file_upload_id      uuid references public.file_uploads(id) on delete cascade,
  order_id            uuid references public.orders_silver(id) on delete cascade,
  source_order_id     text,
  product_key         text,
  product_name        text,
  sku                 text,
  category            text,
  quantity            numeric not null default 0,
  unit_price          numeric not null default 0,
  gross_item_amount   numeric not null default 0,
  discount_amount     numeric not null default 0,
  refund_amount       numeric not null default 0,
  net_item_amount     numeric not null default 0,
  created_at          timestamptz not null default now()
);

create index if not exists order_items_silver_business_idx on public.order_items_silver (business_id);
create index if not exists order_items_silver_upload_idx   on public.order_items_silver (file_upload_id);
create index if not exists order_items_silver_order_idx    on public.order_items_silver (order_id);
create index if not exists order_items_silver_product_idx  on public.order_items_silver (business_id, product_key);

alter table public.order_items_silver enable row level security;

drop policy if exists "order_items_silver_select" on public.order_items_silver;
drop policy if exists "order_items_silver_cud"    on public.order_items_silver;
create policy "order_items_silver_select" on public.order_items_silver for select
  using (public.is_business_member(business_id));
create policy "order_items_silver_cud" on public.order_items_silver for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create table if not exists public.customers_silver (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,
  customer_key      text not null,
  customer_name     text,
  customer_email    text,
  first_order_date  date,
  last_order_date   date,
  total_orders      integer not null default 0,
  total_spend       numeric not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (business_id, customer_key)
);

create index if not exists customers_silver_business_idx on public.customers_silver (business_id);
create index if not exists customers_silver_key_idx      on public.customers_silver (business_id, customer_key);

alter table public.customers_silver enable row level security;

drop policy if exists "customers_silver_select" on public.customers_silver;
drop policy if exists "customers_silver_cud"    on public.customers_silver;
create policy "customers_silver_select" on public.customers_silver for select
  using (public.is_business_member(business_id));
create policy "customers_silver_cud" on public.customers_silver for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create table if not exists public.products_silver (
  id                        uuid primary key default gen_random_uuid(),
  business_id               uuid not null references public.businesses(id) on delete cascade,
  product_key               text not null,
  product_name              text not null,
  normalized_product_name   text,
  sku                       text,
  category                  text,
  first_sold_date           date,
  last_sold_date            date,
  total_quantity_sold       numeric not null default 0,
  total_revenue             numeric not null default 0,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  unique (business_id, product_key)
);

create index if not exists products_silver_business_idx on public.products_silver (business_id);
create index if not exists products_silver_key_idx      on public.products_silver (business_id, product_key);

alter table public.products_silver enable row level security;

drop policy if exists "products_silver_select" on public.products_silver;
drop policy if exists "products_silver_cud"    on public.products_silver;
create policy "products_silver_select" on public.products_silver for select
  using (public.is_business_member(business_id));
create policy "products_silver_cud" on public.products_silver for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

-- =============================================================================
-- GOLD
-- =============================================================================
create table if not exists public.gold_daily_sales (
  id                    uuid primary key default gen_random_uuid(),
  business_id           uuid not null references public.businesses(id) on delete cascade,
  sales_date            date not null,
  total_revenue         numeric not null default 0,
  net_revenue           numeric not null default 0,
  total_orders          integer not null default 0,
  total_units_sold      numeric not null default 0,
  average_order_value   numeric not null default 0,
  new_customers         integer not null default 0,
  returning_customers   integer not null default 0,
  created_at            timestamptz not null default now(),
  unique (business_id, sales_date)
);

create index if not exists gold_daily_sales_business_idx on public.gold_daily_sales (business_id);
create index if not exists gold_daily_sales_date_idx     on public.gold_daily_sales (business_id, sales_date);

alter table public.gold_daily_sales enable row level security;

drop policy if exists "gold_daily_sales_select" on public.gold_daily_sales;
drop policy if exists "gold_daily_sales_cud"    on public.gold_daily_sales;
create policy "gold_daily_sales_select" on public.gold_daily_sales for select
  using (public.is_business_member(business_id));
create policy "gold_daily_sales_cud" on public.gold_daily_sales for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create table if not exists public.gold_monthly_sales (
  id                     uuid primary key default gen_random_uuid(),
  business_id            uuid not null references public.businesses(id) on delete cascade,
  month_start            date not null,
  total_revenue          numeric not null default 0,
  net_revenue            numeric not null default 0,
  total_orders           integer not null default 0,
  total_units_sold       numeric not null default 0,
  average_order_value    numeric not null default 0,
  repeat_customer_rate   numeric not null default 0,
  created_at             timestamptz not null default now(),
  unique (business_id, month_start)
);

create index if not exists gold_monthly_sales_business_idx on public.gold_monthly_sales (business_id);
create index if not exists gold_monthly_sales_month_idx    on public.gold_monthly_sales (business_id, month_start);

alter table public.gold_monthly_sales enable row level security;

drop policy if exists "gold_monthly_sales_select" on public.gold_monthly_sales;
drop policy if exists "gold_monthly_sales_cud"    on public.gold_monthly_sales;
create policy "gold_monthly_sales_select" on public.gold_monthly_sales for select
  using (public.is_business_member(business_id));
create policy "gold_monthly_sales_cud" on public.gold_monthly_sales for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create table if not exists public.gold_product_performance (
  id                   uuid primary key default gen_random_uuid(),
  business_id          uuid not null references public.businesses(id) on delete cascade,
  product_key          text,
  product_name         text,
  sku                  text,
  category             text,
  total_revenue        numeric not null default 0,
  total_quantity_sold  numeric not null default 0,
  total_orders         integer not null default 0,
  average_unit_price   numeric not null default 0,
  first_sold_date      date,
  last_sold_date       date,
  revenue_rank         integer,
  quantity_rank        integer,
  created_at           timestamptz not null default now()
);

create index if not exists gold_product_perf_business_idx on public.gold_product_performance (business_id);
create index if not exists gold_product_perf_key_idx      on public.gold_product_performance (business_id, product_key);

alter table public.gold_product_performance enable row level security;

drop policy if exists "gold_product_perf_select" on public.gold_product_performance;
drop policy if exists "gold_product_perf_cud"    on public.gold_product_performance;
create policy "gold_product_perf_select" on public.gold_product_performance for select
  using (public.is_business_member(business_id));
create policy "gold_product_perf_cud" on public.gold_product_performance for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create table if not exists public.gold_customer_summary (
  id                   uuid primary key default gen_random_uuid(),
  business_id          uuid not null references public.businesses(id) on delete cascade,
  customer_key         text,
  customer_name        text,
  customer_email       text,
  first_order_date     date,
  last_order_date      date,
  total_orders         integer not null default 0,
  total_spend          numeric not null default 0,
  average_order_value  numeric not null default 0,
  customer_type        text,
  created_at           timestamptz not null default now()
);

create index if not exists gold_customer_summary_business_idx on public.gold_customer_summary (business_id);
create index if not exists gold_customer_summary_key_idx      on public.gold_customer_summary (business_id, customer_key);

alter table public.gold_customer_summary enable row level security;

drop policy if exists "gold_customer_summary_select" on public.gold_customer_summary;
drop policy if exists "gold_customer_summary_cud"    on public.gold_customer_summary;
create policy "gold_customer_summary_select" on public.gold_customer_summary for select
  using (public.is_business_member(business_id));
create policy "gold_customer_summary_cud" on public.gold_customer_summary for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create table if not exists public.gold_business_insights (
  id                   uuid primary key default gen_random_uuid(),
  business_id          uuid not null references public.businesses(id) on delete cascade,
  file_upload_id       uuid references public.file_uploads(id) on delete set null,
  insight_type         text not null,
  title                text not null,
  description          text not null,
  metric_value         numeric,
  comparison_value     numeric,
  severity             text not null default 'info'
                         check (severity in ('info', 'positive', 'warning', 'critical')),
  recommended_action   text,
  created_at           timestamptz not null default now()
);

create index if not exists gold_business_insights_business_idx on public.gold_business_insights (business_id);
create index if not exists gold_business_insights_upload_idx   on public.gold_business_insights (file_upload_id);

alter table public.gold_business_insights enable row level security;

drop policy if exists "gold_business_insights_select" on public.gold_business_insights;
drop policy if exists "gold_business_insights_cud"    on public.gold_business_insights;
create policy "gold_business_insights_select" on public.gold_business_insights for select
  using (public.is_business_member(business_id));
create policy "gold_business_insights_cud" on public.gold_business_insights for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));
