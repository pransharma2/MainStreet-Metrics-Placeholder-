/**
 * Shared DB row types. Kept intentionally small and hand-maintained so we
 * don't need a full Supabase codegen step in Phase 2.
 */

export type UploadStatus =
  | "uploaded"
  | "parsed"
  | "mapped"
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
