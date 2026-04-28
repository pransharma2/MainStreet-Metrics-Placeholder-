/**
 * Sample data for the frontend-only Phase 1 demo.
 * Everything here is static. It models a small boutique called
 * "Willow & Sage Boutique" so the dashboard feels real.
 */

export type DemoBusiness = {
  id: string;
  name: string;
  industry: string;
  currency: string;
  timezone: string;
  tagline: string;
};

export type MetricDelta = {
  value: number; // percent
  direction: "up" | "down" | "flat";
};

export type OverviewMetric = {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
  delta?: MetricDelta;
  accent?: "brand" | "neutral" | "warm";
};

export type SalesPoint = {
  date: string; // ISO day
  revenue: number;
  orders: number;
};

export type ChannelSlice = {
  channel: string;
  revenue: number;
  color: string;
};

export type TopProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  revenue: number;
  units: number;
  orders: number;
  trend: number; // pct
};

export type CustomerSegment = {
  label: string;
  value: number;
  color: string;
};

export type BusinessInsight = {
  id: string;
  type:
    | "revenue_growth"
    | "top_product"
    | "repeat_customer_change"
    | "slow_moving_product"
    | "seasonality"
    | "channel_performance";
  title: string;
  body: string;
  metric?: string;
  action?: string;
  severity: "info" | "positive" | "warning";
};

export type UploadRecord = {
  id: string;
  filename: string;
  source: "Shopify" | "Square" | "Etsy" | "CSV" | "Excel";
  size: string;
  rows: number;
  uploadedAt: string;
  status: "Ready" | "Processing" | "Needs review" | "Failed";
};

export type DetectedColumn = {
  original: string;
  sample: string;
  suggestion: string;
  confidence: "high" | "medium" | "low";
  ignored?: boolean;
};

export type DataQualityItem = {
  id: string;
  severity: "info" | "warning" | "error" | "success";
  title: string;
  body: string;
  fix?: string;
};

// ---- The demo business --------------------------------------------------

export const demoBusiness: DemoBusiness = {
  id: "biz_willow_sage",
  name: "Willow & Sage Boutique",
  industry: "Apparel & Accessories",
  currency: "USD",
  timezone: "America/Chicago",
  tagline: "A cozy neighborhood boutique in Oak Park.",
};

// ---- Overview cards -----------------------------------------------------

export const overviewMetrics: OverviewMetric[] = [
  {
    id: "total_revenue",
    label: "Total revenue",
    value: "$84,210",
    sublabel: "Last 30 days",
    delta: { value: 12.4, direction: "up" },
    accent: "brand",
  },
  {
    id: "net_revenue",
    label: "Net revenue",
    value: "$79,604",
    sublabel: "After refunds & discounts",
    delta: { value: 9.1, direction: "up" },
  },
  {
    id: "orders",
    label: "Orders",
    value: "1,284",
    sublabel: "Last 30 days",
    delta: { value: 6.8, direction: "up" },
  },
  {
    id: "aov",
    label: "Average order value",
    value: "$65.58",
    sublabel: "vs $61.04 last month",
    delta: { value: 7.4, direction: "up" },
  },
  {
    id: "repeat_rate",
    label: "Repeat customer rate",
    value: "22.7%",
    sublabel: "291 returning customers",
    delta: { value: 3.2, direction: "up" },
    accent: "warm",
  },
  {
    id: "top_product",
    label: "Top product",
    value: "Linen Midi Dress",
    sublabel: "$11,204 this month",
    delta: { value: 18.6, direction: "up" },
  },
];

// ---- Sales trend (last 30 days) ----------------------------------------

export const salesTrend: SalesPoint[] = [
  { date: "2026-03-28", revenue: 2010, orders: 31 },
  { date: "2026-03-29", revenue: 1780, orders: 26 },
  { date: "2026-03-30", revenue: 2345, orders: 36 },
  { date: "2026-03-31", revenue: 2890, orders: 44 },
  { date: "2026-04-01", revenue: 2120, orders: 32 },
  { date: "2026-04-02", revenue: 2460, orders: 39 },
  { date: "2026-04-03", revenue: 3380, orders: 52 },
  { date: "2026-04-04", revenue: 4120, orders: 63 },
  { date: "2026-04-05", revenue: 2560, orders: 40 },
  { date: "2026-04-06", revenue: 2040, orders: 30 },
  { date: "2026-04-07", revenue: 2210, orders: 33 },
  { date: "2026-04-08", revenue: 2780, orders: 41 },
  { date: "2026-04-09", revenue: 3020, orders: 47 },
  { date: "2026-04-10", revenue: 3610, orders: 55 },
  { date: "2026-04-11", revenue: 4280, orders: 66 },
  { date: "2026-04-12", revenue: 2900, orders: 44 },
  { date: "2026-04-13", revenue: 2190, orders: 31 },
  { date: "2026-04-14", revenue: 2420, orders: 34 },
  { date: "2026-04-15", revenue: 2760, orders: 42 },
  { date: "2026-04-16", revenue: 3140, orders: 48 },
  { date: "2026-04-17", revenue: 3890, orders: 58 },
  { date: "2026-04-18", revenue: 4620, orders: 70 },
  { date: "2026-04-19", revenue: 3080, orders: 46 },
  { date: "2026-04-20", revenue: 2310, orders: 33 },
  { date: "2026-04-21", revenue: 2620, orders: 39 },
  { date: "2026-04-22", revenue: 2960, orders: 45 },
  { date: "2026-04-23", revenue: 3220, orders: 50 },
  { date: "2026-04-24", revenue: 3940, orders: 60 },
  { date: "2026-04-25", revenue: 4830, orders: 73 },
  { date: "2026-04-26", revenue: 3510, orders: 54 },
];

// ---- Revenue by channel -------------------------------------------------

export const channelRevenue: ChannelSlice[] = [
  { channel: "In-store", revenue: 38420, color: "#059669" },
  { channel: "Shopify", revenue: 27880, color: "#34d399" },
  { channel: "Etsy", revenue: 11240, color: "#c99a50" },
  { channel: "Markets", revenue: 6670, color: "#f59e0b" },
];

// ---- Top products -------------------------------------------------------

export const topProducts: TopProduct[] = [
  {
    id: "p_linen_midi",
    name: "Linen Midi Dress",
    sku: "WS-DR-LNM-02",
    category: "Dresses",
    revenue: 11204,
    units: 118,
    orders: 112,
    trend: 18.6,
  },
  {
    id: "p_sage_sweater",
    name: "Sage Cable Knit Sweater",
    sku: "WS-TOP-SCKS",
    category: "Tops",
    revenue: 9460,
    units: 172,
    orders: 160,
    trend: 9.2,
  },
  {
    id: "p_everyday_tote",
    name: "Everyday Canvas Tote",
    sku: "WS-ACC-TOTE-01",
    category: "Accessories",
    revenue: 7120,
    units: 296,
    orders: 284,
    trend: 4.7,
  },
  {
    id: "p_gold_hoops",
    name: "Brushed Gold Hoops",
    sku: "WS-JWL-HOOP-G",
    category: "Jewelry",
    revenue: 6280,
    units: 204,
    orders: 198,
    trend: -2.3,
  },
  {
    id: "p_willow_candle",
    name: "Willow & Cedar Candle",
    sku: "WS-HOM-CND-WC",
    category: "Home",
    revenue: 4310,
    units: 246,
    orders: 230,
    trend: 12.1,
  },
  {
    id: "p_linen_pant",
    name: "Wide-Leg Linen Pant",
    sku: "WS-BTM-LNP",
    category: "Bottoms",
    revenue: 3980,
    units: 72,
    orders: 70,
    trend: -6.4,
  },
];

// ---- Customer insights --------------------------------------------------

export const customerSegments: CustomerSegment[] = [
  { label: "New", value: 992, color: "#6ee7b7" },
  { label: "Returning", value: 291, color: "#059669" },
  { label: "VIP (3+ orders)", value: 74, color: "#b07d3a" },
];

// ---- Plain-English insight cards ---------------------------------------

export const businessInsights: BusinessInsight[] = [
  {
    id: "i1",
    type: "top_product",
    title: "Your top 5 products drove 42% of revenue",
    body: "Linen Midi Dress, Sage Cable Knit, Everyday Tote, Gold Hoops and Willow Candle led the month. Consider restocking these first.",
    metric: "$35,374 from top 5",
    action: "Review restock levels",
    severity: "positive",
  },
  {
    id: "i2",
    type: "seasonality",
    title: "Saturday is your strongest sales day",
    body: "Saturdays average $4,330 in revenue — 41% higher than your weekday average. Consider scheduling more staff or promos.",
    metric: "+41% vs weekday avg",
    action: "Plan Saturday promos",
    severity: "info",
  },
  {
    id: "i3",
    type: "repeat_customer_change",
    title: "Repeat customers generated $2,430 this month",
    body: "Your repeat customer rate moved from 19.5% to 22.7%. Returning buyers spend 28% more per order on average.",
    metric: "22.7% repeat rate",
    action: "Launch a loyalty perk",
    severity: "positive",
  },
  {
    id: "i4",
    type: "top_product",
    title: "Linen Midi Dress earns more per sale than Sage Sweater",
    body: "Sage Cable Knit sells more units, but the Linen Midi Dress generates the highest revenue per order. Feature it on your homepage.",
    metric: "$100 avg / order",
    action: "Feature on storefront",
    severity: "info",
  },
  {
    id: "i5",
    type: "slow_moving_product",
    title: "3 products haven't sold in 45+ days",
    body: "Wool Beanie (Natural), Ribbed Midi Skirt and Woven Leather Belt are stagnant. Consider a bundle, markdown, or featured post.",
    metric: "3 slow movers",
    action: "Create a bundle",
    severity: "warning",
  },
  {
    id: "i6",
    type: "channel_performance",
    title: "In-store is 46% of revenue, Shopify is climbing",
    body: "In-store still leads, but Shopify grew 22% month over month. Consider shifting a small ad budget online.",
    metric: "Shopify +22% MoM",
    action: "Test a $50 ad budget",
    severity: "info",
  },
];

// ---- Recent uploads -----------------------------------------------------

export const recentUploads: UploadRecord[] = [
  {
    id: "u_001",
    filename: "shopify_orders_apr_2026.csv",
    source: "Shopify",
    size: "842 KB",
    rows: 1284,
    uploadedAt: "Today, 9:42 AM",
    status: "Ready",
  },
  {
    id: "u_002",
    filename: "square_in_store_week16.xlsx",
    source: "Square",
    size: "312 KB",
    rows: 408,
    uploadedAt: "Yesterday",
    status: "Needs review",
  },
  {
    id: "u_003",
    filename: "etsy_shop_sales_q1.csv",
    source: "Etsy",
    size: "1.1 MB",
    rows: 2211,
    uploadedAt: "Apr 22",
    status: "Ready",
  },
  {
    id: "u_004",
    filename: "farmers_market_mar.csv",
    source: "CSV",
    size: "44 KB",
    rows: 86,
    uploadedAt: "Apr 18",
    status: "Ready",
  },
];

// ---- Column mapping suggestions (mockup) -------------------------------

export const detectedColumns: DetectedColumn[] = [
  {
    original: "Order #",
    sample: "1001",
    suggestion: "order_id",
    confidence: "high",
  },
  {
    original: "Date",
    sample: "04/26/2026",
    suggestion: "order_date",
    confidence: "high",
  },
  {
    original: "Customer Email",
    sample: "ava@example.com",
    suggestion: "customer_email",
    confidence: "high",
  },
  {
    original: "Product",
    sample: "Linen Midi Dress",
    suggestion: "product_name",
    confidence: "high",
  },
  {
    original: "SKU",
    sample: "WS-DR-LNM-02",
    suggestion: "sku",
    confidence: "high",
  },
  {
    original: "Category",
    sample: "Dresses",
    suggestion: "category",
    confidence: "medium",
  },
  {
    original: "Qty",
    sample: "1",
    suggestion: "quantity",
    confidence: "high",
  },
  {
    original: "Price",
    sample: "$98.00",
    suggestion: "unit_price",
    confidence: "medium",
  },
  {
    original: "Discount",
    sample: "-$8.00",
    suggestion: "discount_amount",
    confidence: "medium",
  },
  {
    original: "Tax",
    sample: "$7.21",
    suggestion: "tax_amount",
    confidence: "medium",
  },
  {
    original: "Total",
    sample: "$97.21",
    suggestion: "total_amount",
    confidence: "high",
  },
  {
    original: "Channel",
    sample: "In-store",
    suggestion: "sales_channel",
    confidence: "medium",
  },
  {
    original: "Notes",
    sample: "Gift wrap",
    suggestion: "Ignore",
    confidence: "low",
    ignored: true,
  },
];

// ---- Data quality items ------------------------------------------------

export const dataQualityItems: DataQualityItem[] = [
  {
    id: "dq1",
    severity: "success",
    title: "All required columns mapped",
    body: "Order date, total and product name are present and look valid.",
  },
  {
    id: "dq2",
    severity: "success",
    title: "We cleaned mixed date formats",
    body: "Found 2 different date formats and converted 1,284 rows to a consistent format.",
  },
  {
    id: "dq3",
    severity: "warning",
    title: "12 rows are missing customer emails",
    body: "You can still continue. Those orders will show as “Guest” in customer insights.",
    fix: "You can add emails later if needed.",
  },
  {
    id: "dq4",
    severity: "warning",
    title: "3 rows have refunds or negative totals",
    body: "We'll treat these as refunds so your net revenue stays accurate.",
  },
  {
    id: "dq5",
    severity: "info",
    title: "Currency looks like USD",
    body: "We detected USD based on the currency symbol in your file.",
  },
  {
    id: "dq6",
    severity: "warning",
    title: "2 product names look like duplicates",
    body: "“Linen Midi Dress” and “linen midi dress” look like the same product.",
    fix: "We'll merge them. You can split them later in settings.",
  },
];
