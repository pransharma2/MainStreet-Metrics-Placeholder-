import type { MappedRow, ResolvedMapping } from "@/lib/processing/bronze";
import {
  buildCustomerKey,
  buildProductKey,
  normalizeEmail,
  normalizeProductName,
  normalizeText,
  parseDate,
  parseMoneyOrNull,
  parseQuantity,
} from "@/lib/processing/parse-values";

// Insert shapes (DB-assigned id + created_at/updated_at).

export interface OrderSilverInsert {
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
}

export interface OrderItemSilverInsert {
  business_id: string;
  file_upload_id: string | null;
  order_silver_local_id: string;
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
}

export interface CustomerSilverInsert {
  business_id: string;
  customer_key: string;
  customer_name: string | null;
  customer_email: string | null;
  first_order_date: string | null;
  last_order_date: string | null;
  total_orders: number;
  total_spend: number;
}

export interface ProductSilverInsert {
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
}

export interface SilverBuildInput {
  businessId: string;
  fileUploadId: string;
  rows: MappedRow[];
  mapping: ResolvedMapping;
  currency: string | null;
}

export interface SilverBuildOutput {
  orders: (OrderSilverInsert & { _localId: string })[];
  items: OrderItemSilverInsert[];
  customers: CustomerSilverInsert[];
  products: ProductSilverInsert[];
}

function minDate(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a < b ? a : b;
}
function maxDate(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

/**
 * Build silver tables from mapped rows.
 * Grouping strategy:
 *  - If any rows share a source_order_id, we treat the file as item-level and
 *    aggregate items into orders.
 *  - Otherwise, each row becomes its own order.
 */
export function buildSilver(input: SilverBuildInput): SilverBuildOutput {
  const { businessId, fileUploadId, rows, currency } = input;

  // Pre-pass: detect item-level file.
  const orderIdFreq = new Map<string, number>();
  for (const r of rows) {
    const oid = normalizeText(r.order_id);
    if (oid) orderIdFreq.set(oid, (orderIdFreq.get(oid) ?? 0) + 1);
  }
  const itemLevel =
    Array.from(orderIdFreq.values()).some((c) => c > 1) &&
    rows.some((r) => normalizeText(r.product_name) || normalizeText(r.sku));

  type OrderAccum = {
    localId: string;
    order_date: string | null;
    source_order_id: string | null;
    customer_key: string | null;
    customer_name: string | null;
    customer_email: string | null;
    sales_channel: string | null;
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
    refund: number;
    // items attached to this order
    items: OrderItemSilverInsert[];
  };

  const ordersByKey = new Map<string, OrderAccum>();
  const items: OrderItemSilverInsert[] = [];

  let localCounter = 0;
  const nextLocalId = () => `ord-${++localCounter}`;

  rows.forEach((row, i) => {
    const rowNumber = i + 1;
    const orderDate = parseDate(row.order_date);
    const srcOrderId = normalizeText(row.order_id);
    const email = normalizeEmail(row.customer_email);
    const custName = normalizeText(row.customer_name);
    const channel = normalizeText(row.sales_channel);
    const productDisplay = normalizeProductName(row.product_name);
    const sku = normalizeText(row.sku);
    const category = normalizeText(row.category);

    // Money fields
    const total = parseMoneyOrNull(row.total_amount);
    const unit = parseMoneyOrNull(row.unit_price);
    const qtyParsed = parseQuantity(row.quantity);
    const hasProduct = !!(productDisplay.display || sku);
    const quantity = qtyParsed ?? (hasProduct ? 1 : 0);
    const discount = parseMoneyOrNull(row.discount_amount) ?? 0;
    const tax = parseMoneyOrNull(row.tax_amount) ?? 0;
    const shipping = parseMoneyOrNull(row.shipping_amount) ?? 0;
    const refund = parseMoneyOrNull(row.refund_amount) ?? 0;

    const itemGross =
      unit !== null && quantity > 0 ? unit * quantity : total ?? 0;
    const itemNet = (total ?? itemGross) - refund;

    // Build keys
    const customerKey = buildCustomerKey({
      customer_email: row.customer_email,
      customer_id: row.customer_id,
      customer_name: row.customer_name,
      source_order_id: row.order_id,
      row_number: rowNumber,
    });
    const productKey = hasProduct
      ? buildProductKey({
          sku: row.sku,
          product_id: row.product_id,
          product_name: row.product_name,
          row_number: rowNumber,
        })
      : null;

    // Find or create the order bucket.
    const orderKey = itemLevel && srcOrderId
      ? `oid:${srcOrderId.toLowerCase()}`
      : `row:${rowNumber}`;
    let order = ordersByKey.get(orderKey);
    if (!order) {
      order = {
        localId: nextLocalId(),
        order_date: orderDate,
        source_order_id: srcOrderId,
        customer_key: customerKey,
        customer_name: custName,
        customer_email: email,
        sales_channel: channel,
        subtotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        refund: 0,
        items: [],
      };
      ordersByKey.set(orderKey, order);
    } else {
      // Fill missing header-level fields from later rows in the same order.
      order.order_date ??= orderDate;
      order.customer_key ??= customerKey;
      order.customer_name ??= custName;
      order.customer_email ??= email;
      order.sales_channel ??= channel;
    }

    if (itemLevel) {
      // Item-level: accumulate per-item amounts into the order.
      order.subtotal += itemGross;
      order.discount += discount;
      order.tax += tax;
      order.shipping += shipping;
      order.total += total ?? itemGross;
      order.refund += refund;
    } else {
      // Row-level order: subtotal/total come from the row itself.
      // Prefer total_amount; otherwise derive.
      if (total !== null) {
        order.total = total;
      } else {
        order.total = itemGross;
      }
      order.subtotal = itemGross;
      order.discount = discount;
      order.tax = tax;
      order.shipping = shipping;
      order.refund = refund;
    }

    // Always emit an order-item row if the row has any product OR if it's a
    // row-level file (so we retain quantity info for product analytics).
    if (hasProduct || !itemLevel) {
      const itemIns: OrderItemSilverInsert = {
        business_id: businessId,
        file_upload_id: fileUploadId,
        order_silver_local_id: order.localId,
        source_order_id: order.source_order_id,
        product_key: productKey,
        product_name: productDisplay.display,
        sku,
        category,
        quantity,
        unit_price: unit ?? (quantity > 0 ? itemGross / quantity : 0),
        gross_item_amount: itemGross,
        discount_amount: discount,
        refund_amount: refund,
        net_item_amount: itemNet,
      };
      order.items.push(itemIns);
      items.push(itemIns);
    }
  });

  // Materialize orders.
  const orders: (OrderSilverInsert & { _localId: string })[] = [];
  for (const o of ordersByKey.values()) {
    const net = o.total - o.refund;
    orders.push({
      _localId: o.localId,
      business_id: businessId,
      file_upload_id: fileUploadId,
      source_order_id: o.source_order_id,
      order_date: o.order_date,
      customer_key: o.customer_key,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      sales_channel: o.sales_channel,
      subtotal_amount: round2(o.subtotal),
      discount_amount: round2(o.discount),
      tax_amount: round2(o.tax),
      shipping_amount: round2(o.shipping),
      total_amount: round2(o.total),
      refund_amount: round2(o.refund),
      net_amount: round2(net),
      currency,
    });
  }

  // Customers (aggregated over orders).
  const custMap = new Map<string, CustomerSilverInsert>();
  for (const o of orders) {
    if (!o.customer_key) continue;
    const existing = custMap.get(o.customer_key);
    if (!existing) {
      custMap.set(o.customer_key, {
        business_id: businessId,
        customer_key: o.customer_key,
        customer_name: o.customer_name,
        customer_email: o.customer_email,
        first_order_date: o.order_date,
        last_order_date: o.order_date,
        total_orders: 1,
        total_spend: o.net_amount,
      });
    } else {
      existing.customer_name ??= o.customer_name;
      existing.customer_email ??= o.customer_email;
      existing.first_order_date = minDate(existing.first_order_date, o.order_date);
      existing.last_order_date = maxDate(existing.last_order_date, o.order_date);
      existing.total_orders += 1;
      existing.total_spend = round2(existing.total_spend + o.net_amount);
    }
  }

  // Products (aggregated over items).
  const prodMap = new Map<string, ProductSilverInsert>();
  // We need order_date per item; build a lookup from local id.
  const orderDateByLocal = new Map<string, string | null>();
  for (const o of orders) orderDateByLocal.set(o._localId, o.order_date);

  for (const it of items) {
    if (!it.product_key || !it.product_name) continue;
    const d = orderDateByLocal.get(it.order_silver_local_id) ?? null;
    const existing = prodMap.get(it.product_key);
    const revenue = it.net_item_amount || it.gross_item_amount;
    if (!existing) {
      prodMap.set(it.product_key, {
        business_id: businessId,
        product_key: it.product_key,
        product_name: it.product_name,
        normalized_product_name: it.product_name.toLowerCase(),
        sku: it.sku,
        category: it.category,
        first_sold_date: d,
        last_sold_date: d,
        total_quantity_sold: it.quantity,
        total_revenue: round2(revenue),
      });
    } else {
      existing.sku ??= it.sku;
      existing.category ??= it.category;
      existing.first_sold_date = minDate(existing.first_sold_date, d);
      existing.last_sold_date = maxDate(existing.last_sold_date, d);
      existing.total_quantity_sold = round2(existing.total_quantity_sold + it.quantity);
      existing.total_revenue = round2(existing.total_revenue + revenue);
    }
  }

  return {
    orders,
    items,
    customers: Array.from(custMap.values()),
    products: Array.from(prodMap.values()),
  };
}

function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}
