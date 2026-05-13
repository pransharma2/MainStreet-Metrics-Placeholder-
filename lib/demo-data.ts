/**
 * Public demo data for /demo and /demo/[businessType].
 *
 * Three sample businesses — Boutique, Café, Etsy-style shop — that reuse
 * the same types as lib/sample-data.ts so the existing dashboard
 * components render them unchanged.
 *
 * This file contains only static, non-sensitive placeholder data.
 * Safe to import from public (unauthenticated) pages.
 */

import type {
  BusinessInsight,
  ChannelSlice,
  CustomerSegment,
  DataQualityItem,
  DemoBusiness,
  OverviewMetric,
  SalesPoint,
  TopProduct,
} from "@/lib/sample-data";
import {
  businessInsights as boutiqueInsights,
  channelRevenue as boutiqueChannels,
  customerSegments as boutiqueSegments,
  dataQualityItems as boutiqueDq,
  demoBusiness as boutiqueBusiness,
  overviewMetrics as boutiqueMetrics,
  salesTrend as boutiqueTrend,
  topProducts as boutiqueProducts,
} from "@/lib/sample-data";

export type DemoBusinessType = "boutique" | "cafe" | "etsy";

export interface DemoSummary {
  slug: DemoBusinessType;
  /**
   * Canonical public demo URL for this business.
   * Always `/demo/${slug}`. Never `/dashboard`.
   * Computed once, at data time, so UI components cannot accidentally
   * point the card at the authenticated dashboard.
   */
  href: `/demo/${DemoBusinessType}`;
  business: DemoBusiness;
  headline: string;
  description: string;
  monthlyRevenue: string;
  topItemLabel: string;
  topItemValue: string;
  ordersLabel: string;
  customersLabel: string;
  accent: "brand" | "warm" | "neutral";
}

export interface DemoDashboardData {
  business: DemoBusiness;
  overviewMetrics: OverviewMetric[];
  salesTrend: SalesPoint[];
  channelRevenue: ChannelSlice[];
  topProducts: TopProduct[];
  customerSegments: CustomerSegment[];
  insights: BusinessInsight[];
  dataQualityItems: DataQualityItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTrend(
  startISO: string,
  days: number,
  base: number,
  weeklySpike: number,
  orderPerRevenue: number
): SalesPoint[] {
  const out: SalesPoint[] = [];
  const start = new Date(`${startISO}T00:00:00Z`);
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const dow = d.getUTCDay(); // 0 sun .. 6 sat
    // Gentle weekly rhythm — Fri/Sat highest, Sun medium, weekday dip
    const rhythm =
      dow === 6 ? weeklySpike : dow === 5 ? weeklySpike * 0.82 : dow === 0 ? 0.92 : 0.78 + ((i % 3) * 0.05);
    const noise = 0.9 + (((i * 37) % 21) / 100); // deterministic pseudo-noise
    const revenue = Math.round(base * rhythm * noise);
    const orders = Math.max(1, Math.round(revenue * orderPerRevenue));
    out.push({ date: d.toISOString().slice(0, 10), revenue, orders });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Boutique — reuses the existing Willow & Sage sample
// ---------------------------------------------------------------------------

const BOUTIQUE: DemoDashboardData = {
  business: boutiqueBusiness,
  overviewMetrics: boutiqueMetrics,
  salesTrend: boutiqueTrend,
  channelRevenue: boutiqueChannels,
  topProducts: boutiqueProducts,
  customerSegments: boutiqueSegments,
  insights: boutiqueInsights,
  dataQualityItems: boutiqueDq,
};

// ---------------------------------------------------------------------------
// Café — Morning Mug Café
// ---------------------------------------------------------------------------

const cafeBusiness: DemoBusiness = {
  id: "biz_morning_mug",
  name: "Morning Mug Café",
  industry: "Coffee shop & bakery",
  currency: "USD",
  timezone: "America/Denver",
  tagline: "A neighborhood café with great coffee and even better pastries.",
};

const cafeTrend = makeTrend("2026-03-28", 30, 1450, 1.42, 0.11);
const cafeRevenue = cafeTrend.reduce((s, d) => s + d.revenue, 0);
const cafeOrders = cafeTrend.reduce((s, d) => s + d.orders, 0);

const cafeMetrics: OverviewMetric[] = [
  {
    id: "total_revenue",
    label: "Total revenue",
    value: `$${cafeRevenue.toLocaleString()}`,
    sublabel: "Last 30 days",
    delta: { value: 8.9, direction: "up" },
    accent: "brand",
  },
  {
    id: "net_revenue",
    label: "Net revenue",
    value: `$${Math.round(cafeRevenue * 0.96).toLocaleString()}`,
    sublabel: "After refunds & comps",
    delta: { value: 7.1, direction: "up" },
  },
  {
    id: "orders",
    label: "Tickets",
    value: cafeOrders.toLocaleString(),
    sublabel: "Last 30 days",
    delta: { value: 5.4, direction: "up" },
  },
  {
    id: "aov",
    label: "Average ticket",
    value: `$${(cafeRevenue / cafeOrders).toFixed(2)}`,
    sublabel: "vs $8.92 prior 30 days",
    delta: { value: 3.2, direction: "up" },
  },
  {
    id: "repeat_rate",
    label: "Regulars rate",
    value: "38.4%",
    sublabel: "Customers back 2+ times this month",
    delta: { value: 4.6, direction: "up" },
    accent: "warm",
  },
  {
    id: "top_product",
    label: "Top item",
    value: "Oat Milk Latte",
    sublabel: "$3,920 this month",
    delta: { value: 11.3, direction: "up" },
  },
];

const cafeChannels: ChannelSlice[] = [
  { channel: "In-store", revenue: Math.round(cafeRevenue * 0.68), color: "#059669" },
  { channel: "Square Online", revenue: Math.round(cafeRevenue * 0.19), color: "#34d399" },
  { channel: "DoorDash", revenue: Math.round(cafeRevenue * 0.09), color: "#b45309" },
  { channel: "Catering", revenue: Math.round(cafeRevenue * 0.04), color: "#f59e0b" },
];

const cafeProducts: TopProduct[] = [
  { id: "p_oat_latte",    name: "Oat Milk Latte",        sku: "MM-DRK-OML",  category: "Drinks",   revenue: 3920, units: 614, orders: 610, trend: 11.3 },
  { id: "p_drip",         name: "House Drip Coffee",     sku: "MM-DRK-DRP",  category: "Drinks",   revenue: 3410, units: 982, orders: 976, trend: 3.1 },
  { id: "p_croissant",    name: "Butter Croissant",      sku: "MM-BKY-CRS",  category: "Pastry",   revenue: 2880, units: 720, orders: 640, trend: 6.8 },
  { id: "p_matcha",       name: "Matcha Latte",          sku: "MM-DRK-MAT",  category: "Drinks",   revenue: 2210, units: 340, orders: 338, trend: 14.9 },
  { id: "p_avo_toast",    name: "Avocado Toast",         sku: "MM-KIT-AVO",  category: "Kitchen",  revenue: 2040, units: 204, orders: 200, trend: -2.1 },
  { id: "p_choc_chip",    name: "Chocolate Chip Cookie", sku: "MM-BKY-CHC",  category: "Pastry",   revenue: 1180, units: 590, orders: 540, trend: 9.4 },
];

const cafeSegments: CustomerSegment[] = [
  { label: "New",      value: 412, color: "#6ee7b7" },
  { label: "Regulars", value: 318, color: "#059669" },
  { label: "VIP (10+ visits)", value: 64, color: "#b07d3a" },
];

const cafeInsights: BusinessInsight[] = [
  {
    id: "ci1",
    type: "top_product",
    title: "Oat Milk Latte is your highest-earning drink",
    body: "It beats the House Drip on revenue even though fewer cups are sold. A small price bump or a seasonal variant could pay off.",
    metric: "$3,920 this month",
    action: "Test a seasonal oat latte",
    severity: "positive",
  },
  {
    id: "ci2",
    type: "seasonality",
    title: "Saturday mornings are your peak",
    body: "Saturdays average $2,060 — 42% above your weekday average. Make sure you're fully staffed before 10 AM.",
    metric: "+42% vs weekday avg",
    action: "Add a barista on Sat",
    severity: "info",
  },
  {
    id: "ci3",
    type: "repeat_customer_change",
    title: "Regulars are spending more per visit",
    body: "Your regulars rate moved from 34.1% to 38.4%, and they spend 22% more per ticket. A small punch-card perk could push this higher.",
    metric: "38.4% regulars rate",
    action: "Launch a 10-visit perk",
    severity: "positive",
  },
  {
    id: "ci4",
    type: "channel_performance",
    title: "DoorDash is a small but growing slice",
    body: "DoorDash is 9% of revenue but grew 18% this month. Consider a DoorDash-only combo to keep the momentum.",
    metric: "DoorDash +18% MoM",
    action: "Launch a combo deal",
    severity: "info",
  },
  {
    id: "ci5",
    type: "slow_moving_product",
    title: "Two pastries haven't sold in 21+ days",
    body: "Lemon Poppy Muffin and Almond Danish look stagnant. Try pairing them with a drink or rotating them off the menu.",
    metric: "2 slow movers",
    action: "Bundle or rotate out",
    severity: "warning",
  },
  {
    id: "ci6",
    type: "revenue_growth",
    title: "Revenue is up 8.9% month over month",
    body: "Growth is driven by higher-ticket drinks and steady pastry attach. Keep the oat-milk and matcha features visible.",
    metric: "+8.9% MoM",
    action: "Keep feature menu up",
    severity: "positive",
  },
];

const cafeDq: DataQualityItem[] = [
  { id: "cdq1", severity: "success", title: "All required columns mapped",     body: "Ticket date, total and item name look valid across 4,120 rows." },
  { id: "cdq2", severity: "success", title: "We cleaned mixed time formats",   body: "Converted 412 rows from AM/PM to 24-hour time so hourly trends line up." },
  { id: "cdq3", severity: "warning", title: "38 tickets are missing a channel",body: "We'll default those to 'In-store'. You can adjust on the mapping page." },
  { id: "cdq4", severity: "info",    title: "Currency looks like USD",         body: "We detected USD based on the totals in your file." },
];

const CAFE: DemoDashboardData = {
  business: cafeBusiness,
  overviewMetrics: cafeMetrics,
  salesTrend: cafeTrend,
  channelRevenue: cafeChannels,
  topProducts: cafeProducts,
  customerSegments: cafeSegments,
  insights: cafeInsights,
  dataQualityItems: cafeDq,
};

// ---------------------------------------------------------------------------
// Etsy-style shop — North Star Handmade
// ---------------------------------------------------------------------------

const etsyBusiness: DemoBusiness = {
  id: "biz_north_star",
  name: "North Star Handmade",
  industry: "Etsy & handmade",
  currency: "USD",
  timezone: "America/New_York",
  tagline: "Hand-poured candles and small-batch ceramics, shipped from Brooklyn.",
};

const etsyTrend = makeTrend("2026-03-28", 30, 980, 1.28, 0.022);
const etsyRevenue = etsyTrend.reduce((s, d) => s + d.revenue, 0);
const etsyOrders = etsyTrend.reduce((s, d) => s + d.orders, 0);

const etsyMetrics: OverviewMetric[] = [
  {
    id: "total_revenue",
    label: "Total revenue",
    value: `$${etsyRevenue.toLocaleString()}`,
    sublabel: "Last 30 days",
    delta: { value: 14.2, direction: "up" },
    accent: "brand",
  },
  {
    id: "net_revenue",
    label: "Net revenue",
    value: `$${Math.round(etsyRevenue * 0.91).toLocaleString()}`,
    sublabel: "After Etsy fees & refunds",
    delta: { value: 12.6, direction: "up" },
  },
  {
    id: "orders",
    label: "Orders",
    value: etsyOrders.toLocaleString(),
    sublabel: "Last 30 days",
    delta: { value: 10.5, direction: "up" },
  },
  {
    id: "aov",
    label: "Average order value",
    value: `$${(etsyRevenue / etsyOrders).toFixed(2)}`,
    sublabel: "vs $42.80 prior 30 days",
    delta: { value: 4.1, direction: "up" },
  },
  {
    id: "repeat_rate",
    label: "Repeat customer rate",
    value: "14.8%",
    sublabel: "Typical for handmade & gift shops",
    delta: { value: 1.9, direction: "up" },
    accent: "warm",
  },
  {
    id: "top_product",
    label: "Top product",
    value: "Cedar & Moss Candle",
    sublabel: "$3,640 this month",
    delta: { value: 22.7, direction: "up" },
  },
];

const etsyChannels: ChannelSlice[] = [
  { channel: "Etsy",           revenue: Math.round(etsyRevenue * 0.74), color: "#c99a50" },
  { channel: "Shopify",        revenue: Math.round(etsyRevenue * 0.16), color: "#34d399" },
  { channel: "Craft fairs",    revenue: Math.round(etsyRevenue * 0.07), color: "#f59e0b" },
  { channel: "Wholesale",      revenue: Math.round(etsyRevenue * 0.03), color: "#6366f1" },
];

const etsyProducts: TopProduct[] = [
  { id: "p_cedar_moss",   name: "Cedar & Moss Candle",        sku: "NS-CDL-CDM",  category: "Candles",   revenue: 3640, units: 182, orders: 178, trend: 22.7 },
  { id: "p_ceramic_mug",  name: "Speckled Ceramic Mug",       sku: "NS-CER-MUG",  category: "Ceramics",  revenue: 2910, units: 142, orders: 140, trend: 8.9 },
  { id: "p_linen_sachet", name: "Linen Lavender Sachet",      sku: "NS-HOM-SCH",  category: "Home",      revenue: 1820, units: 202, orders: 198, trend: 5.2 },
  { id: "p_ceramic_bowl", name: "Hand-thrown Serving Bowl",   sku: "NS-CER-BWL",  category: "Ceramics",  revenue: 1680, units: 48,  orders: 48,  trend: -3.1 },
  { id: "p_candle_set",   name: "Mini Candle Gift Set",       sku: "NS-CDL-MGS",  category: "Gift sets", revenue: 1520, units: 64,  orders: 62,  trend: 31.4 },
  { id: "p_incense",      name: "Hand-rolled Incense Bundle", sku: "NS-HOM-INC",  category: "Home",      revenue:  940, units: 118, orders: 115, trend: -8.6 },
];

const etsySegments: CustomerSegment[] = [
  { label: "New",       value: 520, color: "#6ee7b7" },
  { label: "Returning", value:  92, color: "#059669" },
  { label: "VIP (3+ orders)", value: 14, color: "#b07d3a" },
];

const etsyInsights: BusinessInsight[] = [
  {
    id: "ei1",
    type: "top_product",
    title: "Cedar & Moss Candle is pulling ahead",
    body: "It's up 22.7% month over month and still has room to grow. Consider running an Etsy-ads test focused on this listing.",
    metric: "$3,640 this month",
    action: "Boost this Etsy listing",
    severity: "positive",
  },
  {
    id: "ei2",
    type: "seasonality",
    title: "Sundays and Mondays drive gifting orders",
    body: "Your best 3 hours are Sunday 8-11 PM — buyers finalizing gifts. Schedule new listings to publish just before that window.",
    metric: "Sun/Mon +34% vs avg",
    action: "Schedule Sunday listings",
    severity: "info",
  },
  {
    id: "ei3",
    type: "top_product",
    title: "Mini Candle Gift Set is your fastest riser",
    body: "Units are up 31% with a healthy AOV. A holiday-themed variant could be a quick win for Q4.",
    metric: "+31% MoM",
    action: "Plan a holiday variant",
    severity: "positive",
  },
  {
    id: "ei4",
    type: "channel_performance",
    title: "Etsy is 74% of revenue — Shopify is your hedge",
    body: "Etsy fees eat ~9% of net revenue. Your Shopify store has higher margin per sale; promoting it on inserts could shift the mix.",
    metric: "Shopify margin +9pts",
    action: "Add insert cards",
    severity: "info",
  },
  {
    id: "ei5",
    type: "slow_moving_product",
    title: "Incense Bundle and Serving Bowl are cooling",
    body: "Both dropped this month. Consider refreshing the photography or testing a bundle with a top seller.",
    metric: "2 slow movers",
    action: "Refresh listings",
    severity: "warning",
  },
  {
    id: "ei6",
    type: "repeat_customer_change",
    title: "Repeat rate is quietly improving",
    body: "14.8% is healthy for handmade gift shops. A thank-you insert with a return-visit code could push it higher.",
    metric: "14.8% repeat rate",
    action: "Add a thank-you code",
    severity: "info",
  },
];

const etsyDq: DataQualityItem[] = [
  { id: "edq1", severity: "success", title: "All required columns mapped",    body: "Order date, total and item title are present in 1,180 rows." },
  { id: "edq2", severity: "success", title: "Etsy fees detected",              body: "We separated transaction and payment fees so net revenue reflects what actually landed in your account." },
  { id: "edq3", severity: "warning", title: "22 orders are missing a SKU",     body: "That's fine — we'll group them by product title instead." },
  { id: "edq4", severity: "info",    title: "Currency looks like USD",         body: "We detected USD from your Etsy payout report." },
];

const ETSY: DemoDashboardData = {
  business: etsyBusiness,
  overviewMetrics: etsyMetrics,
  salesTrend: etsyTrend,
  channelRevenue: etsyChannels,
  topProducts: etsyProducts,
  customerSegments: etsySegments,
  insights: etsyInsights,
  dataQualityItems: etsyDq,
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const REGISTRY: Record<DemoBusinessType, DemoDashboardData> = {
  boutique: BOUTIQUE,
  cafe: CAFE,
  etsy: ETSY,
};

export function isDemoBusinessType(v: string): v is DemoBusinessType {
  return v === "boutique" || v === "cafe" || v === "etsy";
}

export function getDemoDashboard(type: DemoBusinessType): DemoDashboardData {
  return REGISTRY[type];
}

function fmtRev(n: number): string {
  return `$${n.toLocaleString()}`;
}

export const demoSummaries: DemoSummary[] = [
  {
    slug: "boutique",
    href: "/demo/boutique",
    business: BOUTIQUE.business,
    headline: "Willow & Sage Boutique",
    description:
      "A neighborhood apparel boutique selling across Shopify, in-store, and weekend markets.",
    monthlyRevenue: fmtRev(
      BOUTIQUE.salesTrend.reduce((s, d) => s + d.revenue, 0)
    ),
    topItemLabel: "Top product",
    topItemValue: BOUTIQUE.topProducts[0].name,
    ordersLabel: `${BOUTIQUE.salesTrend.reduce((s, d) => s + d.orders, 0).toLocaleString()} orders / 30 days`,
    customersLabel: `${BOUTIQUE.customerSegments.reduce((s, c) => s + c.value, 0).toLocaleString()} customers`,
    accent: "brand",
  },
  {
    slug: "cafe",
    href: "/demo/cafe",
    business: CAFE.business,
    headline: "Morning Mug Café",
    description:
      "A coffee shop + bakery blending in-store tickets with Square Online and DoorDash.",
    monthlyRevenue: fmtRev(cafeRevenue),
    topItemLabel: "Top item",
    topItemValue: CAFE.topProducts[0].name,
    ordersLabel: `${cafeOrders.toLocaleString()} tickets / 30 days`,
    customersLabel: `${CAFE.customerSegments.reduce((s, c) => s + c.value, 0).toLocaleString()} customers`,
    accent: "warm",
  },
  {
    slug: "etsy",
    href: "/demo/etsy",
    business: ETSY.business,
    headline: "North Star Handmade",
    description:
      "An Etsy-style handmade shop selling candles and ceramics, with a side Shopify store.",
    monthlyRevenue: fmtRev(etsyRevenue),
    topItemLabel: "Top product",
    topItemValue: ETSY.topProducts[0].name,
    ordersLabel: `${etsyOrders.toLocaleString()} orders / 30 days`,
    customersLabel: `${ETSY.customerSegments.reduce((s, c) => s + c.value, 0).toLocaleString()} customers`,
    accent: "neutral",
  },
];
