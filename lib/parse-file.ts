import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParseFileResult {
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

export function parseCsvBuffer(buffer: ArrayBuffer, maxRows?: number): ParseFileResult {
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
    rows: typeof maxRows === "number" ? rows.slice(0, maxRows) : rows,
    totalRows: rows.length,
  };
}

export function parseExcelBuffer(buffer: ArrayBuffer, maxRows?: number): ParseFileResult {
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
    rows: typeof maxRows === "number" ? json.slice(0, maxRows) : json,
    totalRows: json.length,
  };
}

export function parseUploadedFile(
  filename: string,
  buffer: ArrayBuffer,
  maxRows?: number
): ParseFileResult {
  const lower = filename.toLowerCase();
  return lower.endsWith(".csv")
    ? parseCsvBuffer(buffer, maxRows)
    : parseExcelBuffer(buffer, maxRows);
}
