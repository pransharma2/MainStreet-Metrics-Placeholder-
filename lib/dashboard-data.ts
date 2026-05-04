import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  BusinessInsight,
  ChannelSlice,
  CustomerSegment,
  DataQualityItem,
  OverviewMetric,
  SalesPoint,
  TopProduct,
} from "@/lib/sample-data";
import type {
  DataQualityResultRow,
  FileUploadRow,
  GoldBusinessInsightRow,
  GoldCustomerSummaryRow,
  GoldDailySalesRow,
  GoldMonthlySalesRow,
  GoldProductPerformanceRow,
  OrderSilverRow,
} from "@/lib/types/db";

export interface DashboardData {
  hasRealData: boolean;
  currency: string;
  overviewMetrics: OverviewMetric[];
  salesTrend: SalesPoint[];
  channelRevenue: ChannelSlice[] | null;
  topProducts: TopProduct[];
  customerSegments: CustomerSegment[];
  insights: BusinessInsight[];
  latestUpload: FileUploadRow | null;
  dataQualityItems: DataQualityItem[] | null;
}

const CHANNEL_COLORS = ["#14532d", "#22c55e", "#b45309", "#6366f1", "#e11d48", "#0891b2"];

function fmtMoney(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}

function pct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

function momDelta(current: number, prev: number): { value: number; direction: "up" | "down" | "flat" } {
  if (prev <= 0) return { value: 0, direction: "flat" };
  const v = ((current - prev) / prev) * 100;
  return {
    value: Math.abs(Math.round(v * 10) / 10),
    direction: v > 0.5 ? "up" : v < -0.5 ? "down" : "flat",
  };
}

function mapInsightToCardType(t: string): BusinessInsight["type"] {
  switch (t) {
    case "revenue_trend":
      return "revenue_growth";
    case "top_product_concentration":
    case "high_value_product":
      return "top_product";
    case "repeat_customer_value":
      return "repeat_customer_change";
    case "slow_moving_products":
      return "slow_moving_product";
    case "strongest_day":
      return "seasonality";
    default:
      return "revenue_growth";
  }
}

export async function loadDashboardData(
  businessId: string,
  currency = "USD"
): Promise<DashboardData> {
  const supabase = createClient();

  // Latest upload (for header + empty state).
  const { data: uploads } = await supabase
    .from("file_uploads")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1);
  const latestUpload = (uploads?.[0] as FileUploadRow | undefined) ?? null;

  // Real data check: any gold daily rows for this business?
  const { data: dailyData } = await supabase
    .from("gold_daily_sales")
    .select("*")
    .eq("business_id", businessId)
    .order("sales_date", { ascending: true });
  const daily = (dailyData ?? []) as GoldDailySalesRow[];

  if (daily.length === 0) {
    return {
      hasRealData: false,
      currency,
      overviewMetrics: [],
      salesTrend: [],
      channelRevenue: null,
      topProducts: [],
      customerSegments: [],
      insights: [],
      latestUpload,
      dataQualityItems: null,
    };
  }

  // Load the rest of the gold tables + a sales-channel slice from silver.
  const [
    { data: monthlyData },
    { data: productData },
    { data: customerData },
    { data: insightData },
    { data: orderChannelData },
  ] = await Promise.all([
    supabase
      .from("gold_monthly_sales")
      .select("*")
      .eq("business_id", businessId)
      .order("month_start", { ascending: true }),
    supabase
      .from("gold_product_performance")
      .select("*")
      .eq("business_id", businessId)
      .order("revenue_rank", { ascending: true })
      .limit(20),
    supabase
      .from("gold_customer_summary")
      .select("*")
      .eq("business_id", businessId),
    supabase
      .from("gold_business_insights")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders_silver")
      .select("sales_channel, total_amount")
      .eq("business_id", businessId),
  ]);
  const monthly = (monthlyData ?? []) as GoldMonthlySalesRow[];
  const products = (productData ?? []) as GoldProductPerformanceRow[];
  const customers = (customerData ?? []) as GoldCustomerSummaryRow[];
  const insightsRows = (insightData ?? []) as GoldBusinessInsightRow[];
  const orderChannels = (orderChannelData ?? []) as Pick<
    OrderSilverRow,
    "sales_channel" | "total_amount"
  >[];

  // ---- Last 30 days window (calendar days ending at most-recent sales_date) --
  const last = daily[daily.length - 1];
  const endDate = new Date(`${last.sales_date}T00:00:00Z`);
  const windowStart = new Date(endDate);
  windowStart.setUTCDate(windowStart.getUTCDate() - 29);
  const prevWindowEnd = new Date(windowStart);
  prevWindowEnd.setUTCDate(prevWindowEnd.getUTCDate() - 1);
  const prevWindowStart = new Date(prevWindowEnd);
  prevWindowStart.setUTCDate(prevWindowStart.getUTCDate() - 29);

  function inRange(iso: string, from: Date, to: Date): boolean {
    const t = new Date(`${iso}T00:00:00Z`).getTime();
    return t >= from.getTime() && t <= to.getTime();
  }

  const windowDaily = daily.filter((d) => inRange(d.sales_date, windowStart, endDate));
  const prevWindowDaily = daily.filter((d) =>
    inRange(d.sales_date, prevWindowStart, prevWindowEnd)
  );

  const sum = <T, K extends keyof T>(arr: T[], k: K) =>
    arr.reduce((s, r) => s + (Number(r[k] as unknown as number) || 0), 0);

  const revenue = sum(windowDaily, "total_revenue");
  const netRevenue = sum(windowDaily, "net_revenue");
  const orders = sum(windowDaily, "total_orders");
  const prevRevenue = sum(prevWindowDaily, "total_revenue");
  const prevNet = sum(prevWindowDaily, "net_revenue");
  const prevOrders = sum(prevWindowDaily, "total_orders");

  const aov = orders > 0 ? revenue / orders : 0;
  const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;

  const monthlyLast = monthly[monthly.length - 1];
  const repeatRate = monthlyLast?.repeat_customer_rate ?? 0;
  const monthlyPrev = monthly[monthly.length - 2];
  const repeatPrev = monthlyPrev?.repeat_customer_rate ?? 0;

  const topProduct = products[0];

  // ---- Overview metrics ----
  const overviewMetrics: OverviewMetric[] = [
    {
      id: "total_revenue",
      label: "Total revenue",
      value: fmtMoney(revenue, currency),
      sublabel: "Last 30 days",
      delta: momDelta(revenue, prevRevenue),
      accent: "brand",
    },
    {
      id: "net_revenue",
      label: "Net revenue",
      value: fmtMoney(netRevenue, currency),
      sublabel: "After refunds & discounts",
      delta: momDelta(netRevenue, prevNet),
    },
    {
      id: "orders",
      label: "Orders",
      value: orders.toLocaleString(),
      sublabel: "Last 30 days",
      delta: momDelta(orders, prevOrders),
    },
    {
      id: "aov",
      label: "Average order value",
      value: fmtMoney(aov, currency),
      sublabel: prevAov > 0 ? `vs ${fmtMoney(prevAov, currency)} prior 30 days` : undefined,
      delta: momDelta(aov, prevAov),
    },
    {
      id: "repeat_rate",
      label: "Repeat customer rate",
      value: `${pct(repeatRate)}%`,
      sublabel: monthlyLast ? `Month of ${monthlyLast.month_start.slice(0, 7)}` : undefined,
      delta: momDelta(repeatRate, repeatPrev),
      accent: "warm",
    },
    {
      id: "top_product",
      label: "Top product",
      value: topProduct?.product_name ?? "—",
      sublabel: topProduct
        ? `${fmtMoney(Number(topProduct.total_revenue), currency)} total`
        : undefined,
    },
  ];

  // ---- Sales trend (last 30 days, zero-filled) ----
  const trendByDate = new Map(windowDaily.map((d) => [d.sales_date, d]));
  const salesTrend: SalesPoint[] = [];
  const cursor = new Date(windowStart);
  while (cursor.getTime() <= endDate.getTime()) {
    const iso = cursor.toISOString().slice(0, 10);
    const row = trendByDate.get(iso);
    salesTrend.push({
      date: iso,
      revenue: row ? Number(row.total_revenue) : 0,
      orders: row ? Number(row.total_orders) : 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // ---- Channel revenue (if sales_channel present) ----
  let channelRevenue: ChannelSlice[] | null = null;
  if (orderChannels.some((o) => o.sales_channel)) {
    const byChannel = new Map<string, number>();
    for (const o of orderChannels) {
      const c = (o.sales_channel ?? "Other") || "Other";
      byChannel.set(c, (byChannel.get(c) ?? 0) + Number(o.total_amount || 0));
    }
    channelRevenue = Array.from(byChannel.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([channel, rev], i) => ({
        channel,
        revenue: Math.round(rev),
        color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
      }));
  }

  // ---- Top products table ----
  const topProducts: TopProduct[] = products.slice(0, 6).map((p, i) => ({
    id: p.product_key ?? `p-${i}`,
    name: p.product_name ?? "Unknown product",
    sku: p.sku ?? "",
    category: p.category ?? "",
    revenue: Math.round(Number(p.total_revenue) || 0),
    units: Math.round(Number(p.total_quantity_sold) || 0),
    orders: Number(p.total_orders) || 0,
    trend: 0, // MoM product trend deferred to a later phase
  }));

  // ---- Customer segments ----
  const newC = customers.filter((c) => (c.customer_type ?? "new") === "new").length;
  const repeatC = customers.filter((c) => c.customer_type === "repeat").length;
  const inactiveC = customers.filter((c) => c.customer_type === "inactive").length;
  const customerSegments: CustomerSegment[] = [
    { label: "New", value: newC, color: "#22c55e" },
    { label: "Repeat", value: repeatC, color: "#0891b2" },
    { label: "Inactive", value: inactiveC, color: "#94a3b8" },
  ].filter((s) => s.value > 0) as CustomerSegment[];

  // ---- Insights ----
  const insights: BusinessInsight[] = insightsRows.slice(0, 6).map((r) => ({
    id: r.id,
    type: mapInsightToCardType(r.insight_type),
    title: r.title,
    body: r.description,
    metric: r.metric_value !== null ? String(r.metric_value) : undefined,
    action: r.recommended_action ?? undefined,
    severity:
      r.severity === "critical"
        ? "warning"
        : r.severity === "positive"
        ? "positive"
        : r.severity === "warning"
        ? "warning"
        : "info",
  }));

  // ---- Data quality items for the "File check" card ----
  let dataQualityItems: DataQualityItem[] | null = null;
  if (latestUpload) {
    const { data: results } = await supabase
      .from("data_quality_results")
      .select("*")
      .eq("file_upload_id", latestUpload.id)
      .order("severity", { ascending: false })
      .limit(5);
    const rows = (results ?? []) as DataQualityResultRow[];
    if (rows.length > 0) {
      dataQualityItems = rows.map((r) => ({
        id: r.id,
        severity:
          r.severity === "error"
            ? "error"
            : r.severity === "warning"
            ? "warning"
            : "info",
        title: r.rule_name.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
        body: r.message,
      }));
    }
  }

  return {
    hasRealData: true,
    currency,
    overviewMetrics,
    salesTrend,
    channelRevenue,
    topProducts,
    customerSegments,
    insights,
    latestUpload,
    dataQualityItems,
  };
}
