/**
 * Apply the user-confirmed detected_columns mapping to raw file rows.
 * Produces `mapped_data` keyed by canonical standard field names.
 */

export type StandardField =
  | "order_id"
  | "order_date"
  | "customer_id"
  | "customer_name"
  | "customer_email"
  | "product_id"
  | "product_name"
  | "sku"
  | "category"
  | "quantity"
  | "unit_price"
  | "discount_amount"
  | "tax_amount"
  | "shipping_amount"
  | "total_amount"
  | "payment_method"
  | "sales_channel"
  | "fulfillment_status"
  | "refund_amount"
  | "inventory_quantity";

export const STANDARD_FIELDS: readonly StandardField[] = [
  "order_id",
  "order_date",
  "customer_id",
  "customer_name",
  "customer_email",
  "product_id",
  "product_name",
  "sku",
  "category",
  "quantity",
  "unit_price",
  "discount_amount",
  "tax_amount",
  "shipping_amount",
  "total_amount",
  "payment_method",
  "sales_channel",
  "fulfillment_status",
  "refund_amount",
  "inventory_quantity",
] as const;

export interface ColumnMappingEntry {
  original: string;
  suggestion: string;
  ignored: boolean;
}

export interface ResolvedMapping {
  /** standard field -> original header */
  fieldToOriginal: Partial<Record<StandardField, string>>;
  /** original header -> standard field (only non-ignored, non-"Ignore") */
  originalToField: Map<string, StandardField>;
  /** the set of standard fields that have at least one mapped column */
  mappedFields: Set<StandardField>;
}

export function resolveMapping(cols: ColumnMappingEntry[]): ResolvedMapping {
  const fieldToOriginal: Partial<Record<StandardField, string>> = {};
  const originalToField = new Map<string, StandardField>();
  const mappedFields = new Set<StandardField>();
  const standardSet = new Set<string>(STANDARD_FIELDS);
  for (const c of cols) {
    if (!c || !c.original) continue;
    if (c.ignored) continue;
    if (!c.suggestion || c.suggestion === "Ignore") continue;
    if (!standardSet.has(c.suggestion)) continue;
    const field = c.suggestion as StandardField;
    originalToField.set(c.original, field);
    // First column for a field wins — keep deterministic (file order).
    if (!(field in fieldToOriginal)) {
      fieldToOriginal[field] = c.original;
      mappedFields.add(field);
    }
  }
  return { fieldToOriginal, originalToField, mappedFields };
}

export type MappedRow = Partial<Record<StandardField, unknown>>;

/**
 * Produce a record keyed by standard field name from one raw parsed row.
 * Values are kept as raw strings/numbers; parsing is the silver layer's job.
 */
export function applyMappingToRow(
  raw: Record<string, unknown>,
  mapping: ResolvedMapping
): MappedRow {
  const out: MappedRow = {};
  for (const [original, field] of mapping.originalToField.entries()) {
    const v = raw[original];
    if (v !== undefined) out[field] = v;
  }
  return out;
}

export interface BronzeBuildInput {
  businessId: string;
  fileUploadId: string;
  sourceSystem: string | null;
  rows: Record<string, unknown>[];
  mapping: ResolvedMapping;
}

export interface BronzeInsertRow {
  business_id: string;
  file_upload_id: string;
  source_system: string | null;
  raw_row_number: number;
  raw_data: Record<string, unknown>;
  mapped_data: Record<string, unknown>;
}

export function buildBronzeRows(input: BronzeBuildInput): BronzeInsertRow[] {
  const out: BronzeInsertRow[] = [];
  input.rows.forEach((raw, i) => {
    const mapped = applyMappingToRow(raw, input.mapping);
    out.push({
      business_id: input.businessId,
      file_upload_id: input.fileUploadId,
      source_system: input.sourceSystem,
      raw_row_number: i + 1,
      raw_data: raw,
      mapped_data: mapped as Record<string, unknown>,
    });
  });
  return out;
}
