import type {
  OrderSilverInsert,
  OrderItemSilverInsert,
} from "@/lib/processing/silver";

export interface GoldDailySalesInsert {
  business_id: string;
  sales_date: string;
  total_revenue: number;
  net_revenue: number;
  total_orders: number;
  total_units_sold: number;
  average_order_value: number;
  new_customers: number;
  returning_customers: number;
}

export interface GoldMonthlySalesInsert {
  business_id: string;
  month_start: string;
  total_revenue: number;
  net_revenue: number;
  total_orders: number;
  total_units_sold: number;
  average_order_value: number;
  repeat_customer_rate: number;
}

export interface GoldProductPerformanceInsert {
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
}

export interface GoldCustomerSummaryInsert {
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
}

export interface GoldBuildInput {
  businessId: string;
  orders: (OrderSilverInsert & { _localId: string })[];
  items: OrderItemSilverInsert[];
}

export interface GoldBuildOutput {
  daily: GoldDailySalesInsert[];
  monthly: GoldMonthlySalesInsert[];
  products: GoldProductPerformanceInsert[];
  customers: GoldCustomerSummaryInsert[];
}

function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function monthStart(iso: string): string {
  // iso is YYYY-MM-DD
  return `${iso.slice(0, 7)}-01`;
}

const INACTIVE_DAYS = 90;

export function buildGold(input: GoldBuildInput): GoldBuildOutput {
  const { businessId, orders, items } = input;

  // ---- Units per order (for daily/monthly units) ------------------------
  const unitsByLocalOrderId = new Map<string, number>();
  for (const it of items) {
    const prev = unitsByLocalOrderId.get(it.order_silver_local_id) ?? 0;
    unitsByLocalOrderId.set(it.order_silver_local_id, prev + (it.quantity || 0));
  }

  // ---- Customer first-order date (for new vs returning classification) --
  const customerFirstDate = new Map<string, string>();
  for (const o of orders) {
    if (!o.customer_key || !o.order_date) continue;
    const prev = customerFirstDate.get(o.customer_key);
    if (!prev || o.order_date < prev) customerFirstDate.set(o.customer_key, o.order_date);
  }

  // ==================== DAILY =========================================
  interface DailyAccum {
    revenue: number;
    net: number;
    orders: number;
    units: number;
    newCustomers: Set<string>;
    returningCustomers: Set<string>;
  }
  const dailyMap = new Map<string, DailyAccum>();
  for (const o of orders) {
    if (!o.order_date) continue;
    const d = o.order_date;
    let acc = dailyMap.get(d);
    if (!acc) {
      acc = {
        revenue: 0,
        net: 0,
        orders: 0,
        units: 0,
        newCustomers: new Set(),
        returningCustomers: new Set(),
      };
      dailyMap.set(d, acc);
    }
    acc.revenue += o.total_amount;
    acc.net += o.net_amount;
    acc.orders += 1;
    acc.units += unitsByLocalOrderId.get(o._localId) ?? 0;
    if (o.customer_key) {
      const first = customerFirstDate.get(o.customer_key);
      if (first === d) acc.newCustomers.add(o.customer_key);
      else acc.returningCustomers.add(o.customer_key);
    }
  }
  const daily: GoldDailySalesInsert[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, acc]) => ({
      business_id: businessId,
      sales_date: date,
      total_revenue: round2(acc.revenue),
      net_revenue: round2(acc.net),
      total_orders: acc.orders,
      total_units_sold: round2(acc.units),
      average_order_value: round2(acc.orders > 0 ? acc.revenue / acc.orders : 0),
      new_customers: acc.newCustomers.size,
      returning_customers: acc.returningCustomers.size,
    }));

  // ==================== MONTHLY =======================================
  interface MonthlyAccum {
    revenue: number;
    net: number;
    orders: number;
    units: number;
    customerOrderCounts: Map<string, number>;
  }
  const monthlyMap = new Map<string, MonthlyAccum>();
  for (const o of orders) {
    if (!o.order_date) continue;
    const m = monthStart(o.order_date);
    let acc = monthlyMap.get(m);
    if (!acc) {
      acc = {
        revenue: 0,
        net: 0,
        orders: 0,
        units: 0,
        customerOrderCounts: new Map(),
      };
      monthlyMap.set(m, acc);
    }
    acc.revenue += o.total_amount;
    acc.net += o.net_amount;
    acc.orders += 1;
    acc.units += unitsByLocalOrderId.get(o._localId) ?? 0;
    if (o.customer_key) {
      acc.customerOrderCounts.set(
        o.customer_key,
        (acc.customerOrderCounts.get(o.customer_key) ?? 0) + 1
      );
    }
  }
  const monthly: GoldMonthlySalesInsert[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([m, acc]) => {
      const customers = acc.customerOrderCounts.size;
      const repeat = Array.from(acc.customerOrderCounts.values()).filter(
        (c) => c > 1
      ).length;
      return {
        business_id: businessId,
        month_start: m,
        total_revenue: round2(acc.revenue),
        net_revenue: round2(acc.net),
        total_orders: acc.orders,
        total_units_sold: round2(acc.units),
        average_order_value: round2(acc.orders > 0 ? acc.revenue / acc.orders : 0),
        repeat_customer_rate:
          customers > 0 ? round2((repeat / customers) * 100) : 0,
      };
    });

  // ==================== PRODUCTS =======================================
  interface ProductAccum {
    product_key: string | null;
    product_name: string | null;
    sku: string | null;
    category: string | null;
    revenue: number;
    quantity: number;
    orderLocals: Set<string>;
    unitPriceSum: number;
    unitPriceCount: number;
    first: string | null;
    last: string | null;
  }
  const orderDateByLocal = new Map<string, string | null>();
  for (const o of orders) orderDateByLocal.set(o._localId, o.order_date);

  const prodMap = new Map<string, ProductAccum>();
  for (const it of items) {
    if (!it.product_key) continue;
    let acc = prodMap.get(it.product_key);
    if (!acc) {
      acc = {
        product_key: it.product_key,
        product_name: it.product_name,
        sku: it.sku,
        category: it.category,
        revenue: 0,
        quantity: 0,
        orderLocals: new Set(),
        unitPriceSum: 0,
        unitPriceCount: 0,
        first: null,
        last: null,
      };
      prodMap.set(it.product_key, acc);
    }
    const rev = it.net_item_amount || it.gross_item_amount;
    acc.revenue += rev;
    acc.quantity += it.quantity || 0;
    acc.orderLocals.add(it.order_silver_local_id);
    if (it.unit_price > 0) {
      acc.unitPriceSum += it.unit_price;
      acc.unitPriceCount += 1;
    }
    const d = orderDateByLocal.get(it.order_silver_local_id) ?? null;
    if (d) {
      if (!acc.first || d < acc.first) acc.first = d;
      if (!acc.last || d > acc.last) acc.last = d;
    }
  }
  const productArr = Array.from(prodMap.values());
  // Ranks
  const byRev = [...productArr].sort((a, b) => b.revenue - a.revenue);
  const byQty = [...productArr].sort((a, b) => b.quantity - a.quantity);
  const revenueRank = new Map(byRev.map((p, i) => [p.product_key ?? "", i + 1]));
  const quantityRank = new Map(byQty.map((p, i) => [p.product_key ?? "", i + 1]));

  const products: GoldProductPerformanceInsert[] = productArr.map((p) => ({
    business_id: businessId,
    product_key: p.product_key,
    product_name: p.product_name,
    sku: p.sku,
    category: p.category,
    total_revenue: round2(p.revenue),
    total_quantity_sold: round2(p.quantity),
    total_orders: p.orderLocals.size,
    average_unit_price: round2(
      p.unitPriceCount > 0 ? p.unitPriceSum / p.unitPriceCount : 0
    ),
    first_sold_date: p.first,
    last_sold_date: p.last,
    revenue_rank: revenueRank.get(p.product_key ?? "") ?? null,
    quantity_rank: quantityRank.get(p.product_key ?? "") ?? null,
  }));

  // ==================== CUSTOMERS ======================================
  interface CustAccum {
    customer_key: string;
    customer_name: string | null;
    customer_email: string | null;
    first: string | null;
    last: string | null;
    orders: number;
    spend: number;
  }
  const custMap = new Map<string, CustAccum>();
  for (const o of orders) {
    if (!o.customer_key) continue;
    let acc = custMap.get(o.customer_key);
    if (!acc) {
      acc = {
        customer_key: o.customer_key,
        customer_name: o.customer_name,
        customer_email: o.customer_email,
        first: o.order_date,
        last: o.order_date,
        orders: 0,
        spend: 0,
      };
      custMap.set(o.customer_key, acc);
    }
    acc.customer_name ??= o.customer_name;
    acc.customer_email ??= o.customer_email;
    if (o.order_date) {
      if (!acc.first || o.order_date < acc.first) acc.first = o.order_date;
      if (!acc.last || o.order_date > acc.last) acc.last = o.order_date;
    }
    acc.orders += 1;
    acc.spend += o.net_amount;
  }
  // Determine "recent" cutoff relative to most recent order in data.
  const mostRecent = daily.length > 0 ? daily[daily.length - 1].sales_date : null;
  const customers: GoldCustomerSummaryInsert[] = Array.from(custMap.values()).map(
    (c) => {
      let type = "new";
      if (c.orders > 1) type = "repeat";
      if (mostRecent && c.last) {
        const lastD = new Date(`${c.last}T00:00:00Z`).getTime();
        const refD = new Date(`${mostRecent}T00:00:00Z`).getTime();
        if ((refD - lastD) / (1000 * 86400) > INACTIVE_DAYS) type = "inactive";
      }
      return {
        business_id: businessId,
        customer_key: c.customer_key,
        customer_name: c.customer_name,
        customer_email: c.customer_email,
        first_order_date: c.first,
        last_order_date: c.last,
        total_orders: c.orders,
        total_spend: round2(c.spend),
        average_order_value: round2(c.orders > 0 ? c.spend / c.orders : 0),
        customer_type: type,
      };
    }
  );

  return { daily, monthly, products, customers };
}
