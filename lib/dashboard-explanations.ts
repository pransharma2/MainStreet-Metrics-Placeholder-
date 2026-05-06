// Plain-English copy for the dashboard explanation layer.
// Deterministic only — no LLM, no dynamic phrasing.
// Friendly, business-owner-facing language. Avoid technical terms.

export type Explanation = {
  title: string;
  what: string;
  why: string;
  next: string;
};

// Keys match `OverviewMetric.id` values produced by lib/sample-data.ts and
// lib/dashboard-data.ts (total_revenue, net_revenue, orders, aov, repeat_rate,
// top_product). Section keys are used by chart and table cards.
export const DASHBOARD_EXPLANATIONS = {
  total_revenue: {
    title: "Total revenue",
    what: "This is the total amount of sales your business brought in over the selected period, before any refunds or discounts.",
    why: "It's the simplest measure of how much business you're doing. Watching it move week over week tells you whether sales are picking up, holding steady, or slowing down.",
    next: "Compare it to the same period last month to see whether you're trending up. If it's down, look at which products or channels softened.",
  },
  net_revenue: {
    title: "Net revenue",
    what: "This is what's left after refunds, returns, and discounts are taken out of total revenue.",
    why: "Net revenue shows the money you actually kept. A big gap between total and net can mean too many discounts, too many refunds, or both.",
    next: "If the gap looks large, review which products refund or discount the most and decide whether to adjust pricing or promotions.",
  },
  orders: {
    title: "Orders",
    what: "This is the number of separate sales transactions in the period.",
    why: "Orders tell you how often people are buying. A rise in orders with steady revenue can mean smaller basket sizes; a fall in orders with steady revenue can mean fewer but bigger sales.",
    next: "Pair this with average order value to see whether changes are coming from more customers or bigger purchases.",
  },
  aov: {
    title: "Average order value",
    what: "This is the average amount a customer spends per order.",
    why: "If this number grows, your customers may be buying more items or choosing higher-value products.",
    next: "Try bundling popular products or featuring higher-value items in your strongest sales channels.",
  },
  repeat_rate: {
    title: "Repeat customer rate",
    what: "This shows the percentage of customers who came back and purchased more than once.",
    why: "Repeat customers can be a sign that your products, service, or customer experience are encouraging people to return.",
    next: "Look at what repeat customers are buying and consider promoting those products again.",
  },
  top_product: {
    title: "Top product",
    what: "This is the single product bringing in the most revenue in the period.",
    why: "Your top product often pulls a big share of sales — knowing it helps you decide what to restock, feature, or promote first.",
    next: "Make sure your top product is in stock, easy to find, and used in your strongest marketing channel.",
  },
  sales_trend: {
    title: "Sales trend",
    what: "This chart shows how your daily revenue moves across the period.",
    why: "Trends reveal which days of the week and which weeks of the month earn the most. Patterns help you plan staffing, restocks, and promotions.",
    next: "Pick your two strongest days and try a small promotion or social post timed to them.",
  },
  revenue_by_channel: {
    title: "Revenue by channel",
    what: "This breaks down where your sales are coming from — for example Shopify, Square, Etsy, or in-person.",
    why: "Knowing which channel earns the most helps you decide where to focus your time, ads, and inventory.",
    next: "Double down on your top channel for the next month, and check whether a softer channel needs a refresh.",
  },
  top_products: {
    title: "Top products",
    what: "These are the products bringing in the most revenue or selling the most units.",
    why: "Your top products can guide restocks, promotions, displays, and social content.",
    next: "Feature your top products again and check whether slower products need a refresh.",
  },
  customer_mix: {
    title: "Customer mix",
    what: "This shows how your customers split between new, returning, and inactive.",
    why: "A healthy mix means you're winning new customers and keeping existing ones. Too few repeats can be a retention warning; too few new can be a marketing one.",
    next: "If repeats are low, try a thank-you offer for past customers. If new is low, lean on your strongest channel for outreach.",
  },
  data_quality: {
    title: "Data quality",
    what: "This card flags small issues we found in your file — like blank fields, odd dates, or duplicate rows.",
    why: "Cleaner data means more accurate numbers. A few warnings are normal; lots of warnings can mean your dashboard is missing or double-counting sales.",
    next: "Open the file check page to see the details and fix the rows that affect your headline numbers.",
  },
} as const satisfies Record<string, Explanation>;

export type ExplanationKey = keyof typeof DASHBOARD_EXPLANATIONS;
