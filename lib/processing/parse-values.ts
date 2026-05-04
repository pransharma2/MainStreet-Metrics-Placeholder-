/**
 * Pure parsing/normalization helpers for Phase 3 processing.
 * No Supabase, no I/O — safe to unit-test or import from server code.
 */

function asString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

/** Normalize whitespace; return null for empties. */
export function normalizeText(value: unknown): string | null {
  const s = asString(value).replace(/\s+/g, " ").trim();
  return s.length === 0 ? null : s;
}

/** Preserve display name; also return a lowercase grouping key. */
export function normalizeProductName(value: unknown): {
  display: string | null;
  normalized: string | null;
} {
  const display = normalizeText(value);
  if (!display) return { display: null, normalized: null };
  return { display, normalized: display.toLowerCase() };
}

/**
 * Parse a money-like value: "$84.00", "1,234.56", "(12.50)", "-5", "84".
 * Returns 0 for unparseable input (but use parseMoneyOrNull if you need to
 * distinguish missing from zero).
 */
export function parseMoney(value: unknown): number {
  const n = parseMoneyOrNull(value);
  return n ?? 0;
}

export function parseMoneyOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  let s = asString(value).trim();
  if (!s) return null;
  let negative = false;
  // Parenthesized negatives: "(12.50)"
  if (s.startsWith("(") && s.endsWith(")")) {
    negative = true;
    s = s.slice(1, -1);
  }
  // Strip currency symbols and thousands separators, keep digits/./-
  s = s.replace(/[^0-9.\-]/g, "");
  if (!s || s === "-" || s === ".") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -Math.abs(n) : n;
}

/** Parse an integer/decimal quantity. */
export function parseQuantity(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = asString(value).replace(/[, ]/g, "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const MONTHS: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

function pad(n: number, w = 2): string {
  return n.toString().padStart(w, "0");
}

function toIso(y: number, m: number, d: number): string | null {
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2999) return null;
  // Validate via Date roundtrip
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return `${y}-${pad(m)}-${pad(d)}`;
}

/**
 * Parse a wide variety of date formats. Returns YYYY-MM-DD or null.
 * Supported:
 *   - ISO: 2024-08-12 (optionally with T...)
 *   - Slashed: 8/12/2024 or 12/8/2024 (MDY is tried first, then DMY)
 *   - Dashed: 08-12-2024
 *   - Month name: "August 12, 2024" / "12 Aug 2024" / "Aug 12 2024"
 */
export function parseDate(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  // Excel date serial numbers
  if (typeof value === "number" && Number.isFinite(value) && value > 1000) {
    // Excel epoch: Dec 30, 1899
    const ms = Math.round((value - 25569) * 86400 * 1000);
    const dt = new Date(ms);
    if (!isNaN(dt.getTime())) {
      return toIso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
    }
  }

  const raw = asString(value).trim();
  if (!raw) return null;

  // Split off time if present
  const datePart = raw.split(/[T ]/)[0].trim();

  // ISO: YYYY-MM-DD
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(datePart);
  if (iso) return toIso(+iso[1], +iso[2], +iso[3]);

  // Slash/dash separated numbers
  const parts = datePart.split(/[/\-.]/).map((p) => p.trim());
  if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
    const a = +parts[0];
    const b = +parts[1];
    const c = +parts[2];
    // 4-digit year anchors format
    if (parts[0].length === 4) {
      // YYYY-M-D
      return toIso(a, b, c);
    }
    if (parts[2].length === 4 || c > 31) {
      // Third part is year. Try MDY first (common US export), fall back to DMY.
      const mdY = toIso(c < 100 ? 2000 + c : c, a, b);
      if (mdY) return mdY;
      return toIso(c < 100 ? 2000 + c : c, b, a);
    }
    // Ambiguous 2-digit year at end -> assume MDY with 2000s
    return toIso(2000 + c, a, b);
  }

  // Month name formats
  const mn1 = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{2,4})$/.exec(datePart);
  if (mn1) {
    const m = MONTHS[mn1[1].toLowerCase()];
    const d = +mn1[2];
    let y = +mn1[3];
    if (y < 100) y += 2000;
    if (m) return toIso(y, m, d);
  }
  const mn2 = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/.exec(datePart);
  if (mn2) {
    const d = +mn2[1];
    const m = MONTHS[mn2[2].toLowerCase()];
    let y = +mn2[3];
    if (y < 100) y += 2000;
    if (m) return toIso(y, m, d);
  }

  // Last resort: let JS try
  const dt = new Date(raw);
  if (!isNaN(dt.getTime())) {
    return toIso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  }
  return null;
}

/** Best-effort detection of which date format is in a raw string (for mix warnings). */
export function detectDateFormat(value: unknown): "iso" | "slash" | "dash" | "month-name" | "excel-serial" | "other" | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return "excel-serial";
  const s = asString(value).trim();
  if (!s) return null;
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(s)) return "iso";
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(s)) return "slash";
  if (/^\d{1,2}-\d{1,2}-\d{2,4}/.test(s)) return "dash";
  if (/^[A-Za-z]+\s+\d{1,2},?\s+\d{2,4}/.test(s)) return "month-name";
  if (/^\d{1,2}\s+[A-Za-z]+\s+\d{2,4}/.test(s)) return "month-name";
  return "other";
}

export function isFutureDate(iso: string | null, today = new Date()): boolean {
  if (!iso) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  if (isNaN(d.getTime())) return false;
  const t = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  return d.getTime() > t.getTime();
}

/** Lowercase, trimmed email if it looks like one; otherwise null. */
export function normalizeEmail(value: unknown): string | null {
  const s = normalizeText(value);
  if (!s) return null;
  const lower = s.toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower) ? lower : null;
}

/**
 * Build a stable customer key per-row.
 * Priority: email -> source customer id -> name -> anonymous-<order-id>.
 */
export function buildCustomerKey(input: {
  customer_email?: unknown;
  customer_id?: unknown;
  customer_name?: unknown;
  source_order_id?: unknown;
  row_number?: number;
}): string {
  const email = normalizeEmail(input.customer_email);
  if (email) return `email:${email}`;
  const cid = normalizeText(input.customer_id);
  if (cid) return `id:${cid.toLowerCase()}`;
  const name = normalizeText(input.customer_name);
  if (name) return `name:${name.toLowerCase()}`;
  const ord = normalizeText(input.source_order_id);
  if (ord) return `anon-order:${ord.toLowerCase()}`;
  return `anon-row:${input.row_number ?? 0}`;
}

/** Build a stable product key per-row. */
export function buildProductKey(input: {
  sku?: unknown;
  product_id?: unknown;
  product_name?: unknown;
  row_number?: number;
}): string {
  const sku = normalizeText(input.sku);
  if (sku) return `sku:${sku.toLowerCase()}`;
  const pid = normalizeText(input.product_id);
  if (pid) return `id:${pid.toLowerCase()}`;
  const pname = normalizeText(input.product_name);
  if (pname) return `name:${pname.toLowerCase()}`;
  return `unknown-product:${input.row_number ?? 0}`;
}
