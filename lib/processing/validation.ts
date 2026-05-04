import type { DataQualityRunStatus, DataQualitySeverity } from "@/lib/types/db";
import type { MappedRow, ResolvedMapping } from "@/lib/processing/bronze";
import {
  detectDateFormat,
  isFutureDate,
  normalizeEmail,
  normalizeText,
  parseDate,
  parseMoneyOrNull,
  parseQuantity,
} from "@/lib/processing/parse-values";

export interface ValidationResult {
  rule_name: string;
  severity: DataQualitySeverity;
  affected_rows: number;
  message: string;
  suggested_fix?: string;
}

export interface ValidationRun {
  status: DataQualityRunStatus;
  total_rows: number;
  warning_count: number;
  error_count: number;
  critical: boolean; // true = do not proceed to silver/gold
  critical_reason?: string;
  results: ValidationResult[];
}

const MIN_ESSENTIAL_FIELDS: Array<
  "order_date" | "total_amount" | "unit_price"
> = ["order_date"];

function rowIsBlank(row: MappedRow): boolean {
  for (const v of Object.values(row)) {
    if (v !== null && v !== undefined && String(v).trim() !== "") return false;
  }
  return true;
}

export function validateMappedRows(
  rows: MappedRow[],
  mapping: ResolvedMapping
): ValidationRun {
  const results: ValidationResult[] = [];
  const nonBlank = rows.filter((r) => !rowIsBlank(r));
  const total = nonBlank.length;

  // ---------- Critical checks first --------------------------------------
  if (total === 0) {
    return {
      status: "failed",
      total_rows: 0,
      warning_count: 0,
      error_count: 1,
      critical: true,
      critical_reason:
        "This file doesn't have any rows we can read. Try another export.",
      results: [
        {
          rule_name: "empty_file",
          severity: "error",
          affected_rows: 0,
          message: "We couldn't find any rows with data in this file.",
          suggested_fix:
            "Export again from your store and make sure it includes sales rows.",
        },
      ],
    };
  }

  // Essential field presence in mapping.
  const missingEssential: string[] = [];
  for (const f of MIN_ESSENTIAL_FIELDS) {
    if (!mapping.mappedFields.has(f)) missingEssential.push(f);
  }
  const hasAnyMoney =
    mapping.mappedFields.has("total_amount") ||
    (mapping.mappedFields.has("unit_price") &&
      mapping.mappedFields.has("quantity"));
  if (!hasAnyMoney) missingEssential.push("total_amount");

  if (missingEssential.length > 0) {
    results.push({
      rule_name: "missing_required_mapping",
      severity: "error",
      affected_rows: 0,
      message:
        "We need at least an order date and a sales amount (or unit price + quantity) to build your dashboard.",
      suggested_fix:
        "On the column mapping page, map your date column to order_date and your amount column to total_amount.",
    });
    return {
      status: "failed",
      total_rows: total,
      warning_count: 0,
      error_count: 1,
      critical: true,
      critical_reason:
        "We need at least an order date and a sales amount to build your dashboard.",
      results,
    };
  }

  // ---------- Row-level checks -------------------------------------------
  let unparseableDates = 0;
  let futureDates = 0;
  let missingAmounts = 0;
  let badQuantities = 0;
  let badMoney = 0;
  let missingEmail = 0;
  let missingProduct = 0;
  let negativeTotals = 0;
  const formats = new Set<string>();
  const orderIdCounts = new Map<string, number>();

  for (const row of nonBlank) {
    // Date
    const rawDate = row.order_date;
    const parsedDate = parseDate(rawDate);
    if (rawDate === undefined || rawDate === null || String(rawDate).trim() === "") {
      unparseableDates++;
    } else {
      const fmt = detectDateFormat(rawDate);
      if (fmt) formats.add(fmt);
      if (!parsedDate) unparseableDates++;
      else if (isFutureDate(parsedDate)) futureDates++;
    }

    // Money / amount
    const rawTotal = row.total_amount;
    const rawUnit = row.unit_price;
    const rawQty = row.quantity;
    const totalN = parseMoneyOrNull(rawTotal);
    const unitN = parseMoneyOrNull(rawUnit);
    const qtyN = parseQuantity(rawQty);

    const hasAmount =
      totalN !== null ||
      (unitN !== null && qtyN !== null) ||
      (unitN !== null && mapping.mappedFields.has("unit_price") && (qtyN ?? 1) > 0);
    if (!hasAmount) missingAmounts++;
    if (totalN !== null && totalN < 0) negativeTotals++;

    if (rawTotal !== undefined && rawTotal !== null && String(rawTotal).trim() !== "" && totalN === null) {
      badMoney++;
    }
    if (rawUnit !== undefined && rawUnit !== null && String(rawUnit).trim() !== "" && unitN === null) {
      badMoney++;
    }
    if (rawQty !== undefined && rawQty !== null && String(rawQty).trim() !== "" && qtyN === null) {
      badQuantities++;
    }

    // Customer email
    if (mapping.mappedFields.has("customer_email")) {
      if (!normalizeEmail(row.customer_email)) missingEmail++;
    } else {
      missingEmail++;
    }

    // Product
    if (!normalizeText(row.product_name) && !normalizeText(row.sku)) {
      missingProduct++;
    }

    // Dup order ids
    const oid = normalizeText(row.order_id);
    if (oid) orderIdCounts.set(oid, (orderIdCounts.get(oid) ?? 0) + 1);
  }

  // Critical: no usable date at all.
  if (unparseableDates === total) {
    results.push({
      rule_name: "no_usable_dates",
      severity: "error",
      affected_rows: unparseableDates,
      message:
        "We couldn't read any dates in this file. A sales dashboard needs dates to group your orders.",
      suggested_fix:
        "Make sure your order date column has dates like 2024-08-12 or 08/12/2024.",
    });
    return {
      status: "failed",
      total_rows: total,
      warning_count: 0,
      error_count: 1,
      critical: true,
      critical_reason:
        "We couldn't read any dates in this file. A dashboard needs valid dates.",
      results,
    };
  }
  // Critical: no usable sales amount at all.
  if (missingAmounts === total) {
    results.push({
      rule_name: "no_usable_amounts",
      severity: "error",
      affected_rows: missingAmounts,
      message:
        "We couldn't find any sales amounts in this file. A dashboard needs amounts to show revenue.",
      suggested_fix:
        "Map a total amount column, or map both unit price and quantity.",
    });
    return {
      status: "failed",
      total_rows: total,
      warning_count: 0,
      error_count: 1,
      critical: true,
      critical_reason:
        "We couldn't find any sales amounts in this file.",
      results,
    };
  }

  // ---------- Non-blocking warnings / info -------------------------------
  if (unparseableDates > 0) {
    results.push({
      rule_name: "some_unparseable_dates",
      severity: "warning",
      affected_rows: unparseableDates,
      message: `We couldn't read the date on ${unparseableDates} row${
        unparseableDates === 1 ? "" : "s"
      }. We'll skip those in time-based charts.`,
      suggested_fix: "Check that dates follow a consistent format like 2024-08-12.",
    });
  }
  if (futureDates > 0) {
    results.push({
      rule_name: "future_dates",
      severity: "warning",
      affected_rows: futureDates,
      message: `${futureDates} row${
        futureDates === 1 ? " has" : "s have"
      } a date in the future.`,
      suggested_fix: "Double-check the date column — these may be typos.",
    });
  }
  if (badMoney > 0) {
    results.push({
      rule_name: "bad_money_values",
      severity: "warning",
      affected_rows: badMoney,
      message: `We had trouble reading ${badMoney} money value${
        badMoney === 1 ? "" : "s"
      } — those rows will use 0.`,
      suggested_fix: "Check for stray text in your amount columns.",
    });
  }
  if (badQuantities > 0) {
    results.push({
      rule_name: "bad_quantities",
      severity: "warning",
      affected_rows: badQuantities,
      message: `We had trouble reading ${badQuantities} quantity value${
        badQuantities === 1 ? "" : "s"
      }.`,
    });
  }
  if (missingEmail > 0 && mapping.mappedFields.has("customer_email")) {
    const pct = Math.round((missingEmail / total) * 100);
    results.push({
      rule_name: "missing_customer_emails",
      severity: "warning",
      affected_rows: missingEmail,
      message: `Some rows are missing customer emails (${pct}%). You can still continue, but customer insights may be less complete.`,
    });
  } else if (!mapping.mappedFields.has("customer_email")) {
    results.push({
      rule_name: "no_email_column",
      severity: "info",
      affected_rows: 0,
      message:
        "No customer email column was mapped. Customer insights may be less complete.",
      suggested_fix:
        "If your file has an email column, map it on the column mapping page.",
    });
  }
  if (missingProduct > 0) {
    results.push({
      rule_name: "missing_product_names",
      severity: "warning",
      affected_rows: missingProduct,
      message: `Some product names are missing, so product insights may be incomplete.`,
    });
  }
  if (negativeTotals > 0) {
    results.push({
      rule_name: "negative_totals",
      severity: "info",
      affected_rows: negativeTotals,
      message: `We found ${negativeTotals} negative total${
        negativeTotals === 1 ? "" : "s"
      }. These may be refunds or returns.`,
    });
  }
  if (formats.size > 1) {
    results.push({
      rule_name: "mixed_date_formats",
      severity: "info",
      affected_rows: 0,
      message: "We cleaned multiple date formats in this file.",
    });
  }
  let duplicateOrderIds = 0;
  for (const count of orderIdCounts.values()) {
    if (count > 1) duplicateOrderIds += count;
  }
  if (duplicateOrderIds > 0) {
    results.push({
      rule_name: "duplicate_order_ids",
      severity: "info",
      affected_rows: duplicateOrderIds,
      message: `Some order IDs appear on multiple rows (${duplicateOrderIds}). This is normal for item-level exports.`,
    });
  }

  const warning_count = results.filter((r) => r.severity === "warning").length;
  const error_count = results.filter((r) => r.severity === "error").length;

  const status: DataQualityRunStatus =
    error_count > 0 ? "failed" : warning_count > 0 ? "warnings" : "passed";

  return {
    status,
    total_rows: total,
    warning_count,
    error_count,
    critical: false,
    results,
  };
}
