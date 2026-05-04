import type { ConfidenceLevel } from "@/lib/types/db";

/**
 * Canonical standard fields we map customer columns to.
 * Must stay in sync with the `STANDARD_FIELDS` list in the mapping UI.
 */
export const STANDARD_FIELDS = [
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

export type StandardField = (typeof STANDARD_FIELDS)[number] | "Ignore";

type Rule = {
  field: StandardField;
  exact?: string[];
  contains?: string[];
  confidence?: ConfidenceLevel;
};

// Order matters: first match wins.
const RULES: Rule[] = [
  { field: "order_id", exact: ["orderid", "orderno", "ordernumber", "order", "ordername", "transactionid", "ticket", "ticketnumber", "receiptnumber", "receipt"], contains: ["orderid", "ordernum", "txnid", "ticket", "receipt"], confidence: "high" },
  { field: "order_date", exact: ["date", "orderdate", "createdat", "purchasedate", "soldat", "timestamp"], contains: ["date", "createdat", "soldat", "timestamp"], confidence: "high" },
  { field: "customer_email", exact: ["email", "customeremail", "buyeremail", "useremail"], contains: ["email"], confidence: "high" },
  { field: "customer_name", exact: ["customer", "customername", "buyer", "buyername", "name", "fullname"], contains: ["customername", "buyername"], confidence: "medium" },
  { field: "customer_id", exact: ["customerid", "buyerid", "userid"], contains: ["customerid", "buyerid"], confidence: "high" },
  { field: "sku", exact: ["sku", "itemcode", "variantsku"], contains: ["sku"], confidence: "high" },
  { field: "product_name", exact: ["product", "productname", "item", "itemname", "title", "listingtitle"], contains: ["product", "item", "title"], confidence: "medium" },
  { field: "product_id", exact: ["productid", "itemid", "listingid"], contains: ["productid", "itemid", "listingid"], confidence: "high" },
  { field: "category", exact: ["category", "producttype", "type", "department"], contains: ["category", "department"], confidence: "medium" },
  { field: "quantity", exact: ["qty", "quantity", "units", "count"], contains: ["quantity", "qty"], confidence: "high" },
  { field: "unit_price", exact: ["price", "unitprice", "itemprice"], contains: ["unitprice", "itemprice"], confidence: "medium" },
  { field: "discount_amount", exact: ["discount", "discountamount", "promo"], contains: ["discount"], confidence: "medium" },
  { field: "tax_amount", exact: ["tax", "taxamount", "salestax", "vat"], contains: ["tax"], confidence: "medium" },
  { field: "shipping_amount", exact: ["shipping", "shippingamount", "shipping_cost", "shippingcost", "shippingfee"], contains: ["shipping"], confidence: "medium" },
  { field: "total_amount", exact: ["total", "totalamount", "grosssales", "amount", "subtotal", "ordertotal"], contains: ["total", "amount"], confidence: "high" },
  { field: "payment_method", exact: ["paymentmethod", "payment", "tender", "paymenttype"], contains: ["payment"], confidence: "medium" },
  { field: "sales_channel", exact: ["channel", "saleschannel", "source", "platform", "store"], contains: ["channel"], confidence: "medium" },
  { field: "fulfillment_status", exact: ["status", "fulfillment", "fulfillmentstatus", "orderstatus"], contains: ["fulfillment", "status"], confidence: "low" },
  { field: "refund_amount", exact: ["refund", "refundamount", "refunded"], contains: ["refund"], confidence: "medium" },
  { field: "inventory_quantity", exact: ["inventory", "stock", "inventoryquantity", "onhand"], contains: ["inventory", "stock", "onhand"], confidence: "medium" },
];

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export interface ColumnSuggestion {
  original: string;
  sample: string | null;
  suggestion: StandardField;
  confidence: ConfidenceLevel;
  position: number;
}

/**
 * Takes a list of header strings (and optional first-row samples) and returns
 * a mapping suggestion per column, ranked by simple name heuristics.
 */
export function detectColumns(
  headers: string[],
  sampleRow?: Record<string, unknown>
): ColumnSuggestion[] {
  const used = new Set<StandardField>();
  const out: ColumnSuggestion[] = [];

  headers.forEach((original, position) => {
    const norm = normalize(original);
    const sampleVal = sampleRow ? sampleRow[original] : undefined;
    const sample =
      sampleVal == null
        ? null
        : String(sampleVal).slice(0, 80);

    if (!norm) {
      out.push({
        original,
        sample,
        suggestion: "Ignore",
        confidence: "low",
        position,
      });
      return;
    }

    let match: Rule | undefined;
    let matchConfidence: ConfidenceLevel = "low";

    // Exact match first
    for (const rule of RULES) {
      if (rule.exact?.includes(norm)) {
        match = rule;
        matchConfidence = rule.confidence ?? "high";
        break;
      }
    }
    // Substring match if no exact
    if (!match) {
      for (const rule of RULES) {
        if (rule.contains?.some((c) => norm.includes(c))) {
          match = rule;
          matchConfidence = rule.confidence ?? "medium";
          // Downgrade: substring matches rarely high-confidence.
          if (matchConfidence === "high") matchConfidence = "medium";
          break;
        }
      }
    }

    const suggestion: StandardField = match?.field ?? "Ignore";

    // If the same standard field was already suggested for another header,
    // keep the first one at its confidence and downgrade the duplicate.
    if (suggestion !== "Ignore" && used.has(suggestion)) {
      out.push({
        original,
        sample,
        suggestion: "Ignore",
        confidence: "low",
        position,
      });
      return;
    }
    if (suggestion !== "Ignore") used.add(suggestion);

    out.push({
      original,
      sample,
      suggestion,
      confidence: match ? matchConfidence : "low",
      position,
    });
  });

  return out;
}

export function sourceFromFilename(filename: string): "Shopify" | "Square" | "Etsy" | "CSV" | "Excel" {
  const f = filename.toLowerCase();
  if (f.includes("shopify")) return "Shopify";
  if (f.includes("square")) return "Square";
  if (f.includes("etsy")) return "Etsy";
  if (f.endsWith(".xlsx") || f.endsWith(".xls")) return "Excel";
  return "CSV";
}
