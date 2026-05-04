/**
 * Shared DB row types. Kept intentionally small and hand-maintained so we
 * don't need a full Supabase codegen step in Phase 2.
 */

export type UploadStatus =
  | "uploaded"
  | "parsed"
  | "mapped"
  | "processing"
  | "processed"
  | "failed";

export type UploadSource = "Shopify" | "Square" | "Etsy" | "CSV" | "Excel";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface BusinessRow {
  id: string;
  name: string;
  industry: string | null;
  currency: string;
  timezone: string;
  tagline: string | null;
  created_by: string;
  created_at: string;
}

export interface BusinessUserRow {
  business_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface FileUploadRow {
  id: string;
  business_id: string;
  uploader_id: string;
  filename: string;
  source: UploadSource;
  size_bytes: number;
  row_count: number | null;
  storage_path: string;
  status: UploadStatus;
  error_message: string | null;
  preview_rows: unknown[] | null;
  created_at: string;
}

export interface ActiveSession {
  user: {
    id: string;
    email: string | null;
    profile: ProfileRow | null;
  };
  business: BusinessRow;
}

export interface DetectedColumnRow {
  id: string;
  file_upload_id: string;
  original: string;
  sample: string | null;
  suggestion: string;
  confidence: ConfidenceLevel;
  ignored: boolean;
  position: number;
}

// =============================================================================
// Phase 3 — medallion pipeline
// =============================================================================

export type DataQualitySeverity = "info" | "warning" | "error";
export type DataQualityRunStatus = "passed" | "warnings" | "failed";
export type InsightSeverity = "info" | "positive" | "warning" | "critical";

export interface BronzeRawRow {
  id: string;
  business_id: string;
  file_upload_id: string;
  source_system: string | null;
  raw_row_number: number;
  raw_data: Record<string, unknown>;
  mapped_data: Record<string, unknown> | null;
  created_at: string;
}

export interface DataQualityRunRow {
  id: string;
  business_id: string;
  file_upload_id: string;
  status: DataQualityRunStatus;
  total_rows: number | null;
  warning_count: number;
  error_count: number;
  created_at: string;
}

export interface DataQualityResultRow {
  id: string;
  run_id: string | null;
  business_id: string;
  file_upload_id: string;
  rule_name: string;
  severity: DataQualitySeverity;
  affected_rows: number;
  message: string;
  suggested_fix: string | null;
  created_at: string;
}

export interface OrderSilverRow {
  id: string;
  business_id: string;
  file_upload_id: string | null;
  source_order_id: string | null;
  order_date: string | null;
  customer_key: string | null;
  customer_name: string | null;
  customer_email: string | null;
  sales_channel: string | null;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  refund_amount: number;
  net_amount: number;
  currency: string | null;
  created_at: string;
}

export interface OrderItemSilverRow {
  id: string;
  business_id: string;
  file_upload_id: string | null;
  order_id: string | null;
  source_order_id: string | null;
  product_key: string | null;
  product_name: string | null;
  sku: string | null;
  category: string | null;
  quantity: number;
  unit_price: number;
  gross_item_amount: number;
  discount_amount: number;
  refund_amount: number;
  net_item_amount: number;
  created_at: string;
}

export interface CustomerSilverRow {
  id: string;
  business_id: string;
  customer_key: string;
  customer_name: string | null;
  customer_email: string | null;
  first_order_date: string | null;
  last_order_date: string | null;
  total_orders: number;
  total_spend: number;
  created_at: string;
  updated_at: string;
}

export interface ProductSilverRow {
  id: string;
  business_id: string;
  product_key: string;
  product_name: string;
  normalized_product_name: string | null;
  sku: string | null;
  category: string | null;
  first_sold_date: string | null;
  last_sold_date: string | null;
  total_quantity_sold: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface GoldDailySalesRow {
  id: string;
  business_id: string;
  sales_date: string;
  total_revenue: number;
  net_revenue: number;
  total_orders: number;
  total_units_sold: number;
  average_order_value: number;
  new_customers: number;
  returning_customers: number;
  created_at: string;
}

export interface GoldMonthlySalesRow {
  id: string;
  business_id: string;
  month_start: string;
  total_revenue: number;
  net_revenue: number;
  total_orders: number;
  total_units_sold: number;
  average_order_value: number;
  repeat_customer_rate: number;
  created_at: string;
}

export interface GoldProductPerformanceRow {
  id: string;
  business_id: string;
  product_key: string | null;
  product_name: string | null;
  sku: string | null;
  category: string | null;
  total_revenue: number;
  total_quantity_sold: number;
  total_orders: number;
  average_unit_price: number;
  first_sold_date: string | null;
  last_sold_date: string | null;
  revenue_rank: number | null;
  quantity_rank: number | null;
  created_at: string;
}

export interface GoldCustomerSummaryRow {
  id: string;
  business_id: string;
  customer_key: string | null;
  customer_name: string | null;
  customer_email: string | null;
  first_order_date: string | null;
  last_order_date: string | null;
  total_orders: number;
  total_spend: number;
  average_order_value: number;
  customer_type: string | null;
  created_at: string;
}

export interface GoldBusinessInsightRow {
  id: string;
  business_id: string;
  file_upload_id: string | null;
  insight_type: string;
  title: string;
  description: string;
  metric_value: number | null;
  comparison_value: number | null;
  severity: InsightSeverity;
  recommended_action: string | null;
  created_at: string;
}
