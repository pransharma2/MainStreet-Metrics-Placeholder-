import { NextResponse, type NextRequest } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { detectColumns, sourceFromFilename } from "@/lib/column-detect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PREVIEW_ROWS = 200;
const ALLOWED_EXT = [".csv", ".xlsx", ".xls"] as const;

type ParseResult = {
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
};

function friendly(err: string) {
  const s = err.toLowerCase();
  if (s.includes("not authenticated")) return "Please sign in again.";
  if (s.includes("workspace") || s.includes("business"))
    return "We couldn't access this workspace.";
  if (s.includes("too large"))
    return "This file is larger than 10 MB. Try a smaller export, or contact us if you need more.";
  if (s.includes("empty")) return "This file looks empty. Try uploading another CSV.";
  if (s.includes("extension") || s.includes("type"))
    return "We support CSV and Excel files (.csv, .xlsx, .xls).";
  return "We had trouble reading this file.";
}

function parseCsv(buffer: ArrayBuffer): ParseResult {
  const text = new TextDecoder("utf-8").decode(buffer).replace(/^\uFEFF/, "");
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });
  const rows = (result.data ?? []).filter(
    (r) => r && Object.values(r).some((v) => v !== null && v !== undefined && v !== "")
  );
  const headers =
    (result.meta.fields ?? []).map((h) => (h ?? "").trim()).filter(Boolean);
  return {
    headers,
    rows: rows.slice(0, MAX_PREVIEW_ROWS),
    totalRows: rows.length,
  };
}

function parseExcel(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "array" });
  const firstSheet = wb.SheetNames[0];
  if (!firstSheet) throw new Error("empty");
  const sheet = wb.Sheets[firstSheet];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  const headers =
    json.length > 0 ? Object.keys(json[0]).map((h) => h.trim()) : [];
  return {
    headers: headers.filter(Boolean),
    rows: json.slice(0, MAX_PREVIEW_ROWS),
    totalRows: json.length,
  };
}

export async function POST(req: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 401 }
    );
  }

  // Resolve active business (single-business MVP)
  const { data: membership } = await supabase
    .from("business_users")
    .select("business_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const businessId = membership?.business_id;
  if (!businessId) {
    return NextResponse.json(
      { error: "We couldn't access this workspace." },
      { status: 403 }
    );
  }

  // Parse form
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "We couldn't read the uploaded file." },
      { status: 400 }
    );
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Please choose a file to upload." },
      { status: 400 }
    );
  }

  // Validate size + extension
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: friendly("too large") },
      { status: 413 }
    );
  }
  const lower = file.name.toLowerCase();
  if (!ALLOWED_EXT.some((e) => lower.endsWith(e))) {
    return NextResponse.json(
      { error: friendly("extension") },
      { status: 415 }
    );
  }

  const buffer = await file.arrayBuffer();

  // Parse
  let parsed: ParseResult;
  try {
    parsed = lower.endsWith(".csv")
      ? parseCsv(buffer)
      : parseExcel(buffer);
  } catch (err) {
    console.error("[api/uploads] parse error:", err);
    return NextResponse.json(
      { error: friendly("") },
      { status: 422 }
    );
  }

  if (parsed.headers.length === 0 || parsed.totalRows === 0) {
    return NextResponse.json(
      { error: friendly("empty") },
      { status: 422 }
    );
  }

  // Insert file_uploads row (RLS: must be a member of business)
  const { data: upload, error: insertErr } = await supabase
    .from("file_uploads")
    .insert({
      business_id: businessId,
      uploader_id: user.id,
      filename: file.name,
      source: sourceFromFilename(file.name),
      size_bytes: file.size,
      row_count: parsed.totalRows,
      storage_path: "", // filled in below
      status: "uploaded",
      preview_rows: parsed.rows.slice(0, 20),
    })
    .select("id")
    .single();

  if (insertErr || !upload) {
    console.error("[api/uploads] insert error:", insertErr);
    return NextResponse.json(
      { error: "We couldn't save this upload. Please try again." },
      { status: 500 }
    );
  }

  // Store raw file in Supabase Storage
  const storagePath = `${businessId}/${upload.id}/${file.name}`;
  const { error: storageErr } = await supabase.storage
    .from("uploads")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (storageErr) {
    console.error("[api/uploads] storage error:", storageErr);
    // Roll back the metadata row so we don't leave orphans.
    await supabase.from("file_uploads").delete().eq("id", upload.id);
    return NextResponse.json(
      { error: "We couldn't store your file. Please try again." },
      { status: 500 }
    );
  }

  // Save storage_path + mark parsed
  await supabase
    .from("file_uploads")
    .update({ storage_path: storagePath, status: "parsed" })
    .eq("id", upload.id);

  // Detect + save columns
  const suggestions = detectColumns(parsed.headers, parsed.rows[0]);
  const rowsToInsert = suggestions.map((s) => ({
    file_upload_id: upload.id,
    original: s.original,
    sample: s.sample,
    suggestion: s.suggestion,
    confidence: s.confidence,
    ignored: s.suggestion === "Ignore",
    position: s.position,
  }));
  if (rowsToInsert.length > 0) {
    const { error: colsErr } = await supabase
      .from("detected_columns")
      .insert(rowsToInsert);
    if (colsErr) {
      console.error("[api/uploads] detected_columns insert:", colsErr);
    }
  }

  return NextResponse.json({
    uploadId: upload.id,
    redirect: `/dashboard/mapping/${upload.id}`,
    totalRows: parsed.totalRows,
  });
}
