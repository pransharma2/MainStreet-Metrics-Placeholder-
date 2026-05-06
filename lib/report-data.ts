import type {
  BusinessInsight,
  ChannelSlice,
  CustomerSegment,
  DataQualityItem,
  OverviewMetric,
  SalesPoint,
  TopProduct,
} from "@/lib/sample-data";
import type { FileUploadRow } from "@/lib/types/db";

/**
 * Pure, server-or-client-safe report enrichment.
 *
 * The dashboard already loads everything we need (lib/dashboard-data.ts).
 * This module just derives plain-English summaries and deterministic
 * recommendations from that shape, so the same logic works for the
 * authenticated dashboard report and the public demo report.
 *
 * NOTE: this file deliberately does NOT import "server-only" or
 * lib/supabase/* — it must be safe to use from /demo/* report pages,
 * which are public.
 */

export interface ReportInput {
  businessName: string;
  hasRealData: boolean;
  currency: string;
  overviewMetrics: OverviewMetric[];
  salesTrend: SalesPoint[];
  channelRevenue: ChannelSlice[] | null;
  topProducts: TopProduct[];
  customerSegments: CustomerSegment[];
  insights: BusinessInsight[];
  latestUpload?: FileUploadRow | null;
  dataQualityItems?: DataQualityItem[] | null;
}

export interface Recommendation {
  id: string;
  title: string;
  body: string;
}

export interface ReportSummary {
  generatedOnLabel: string;
  windowLabel: string;
  sourceLabel: string;
  badgeLabel: "Based on your uploaded sales data" | "Demo data";
  executiveSummary: string;
  totals: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
  };
  recommendations: Recommendation[];
}

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

function fmtDate(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

export function buildReportSummary(input: ReportInput): ReportSummary {
  const generatedOnLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Totals — derived from salesTrend (raw numbers).
  const revenue = input.salesTrend.reduce((s, p) => s + (p.revenue || 0), 0);
  const orders = input.salesTrend.reduce((s, p) => s + (p.orders || 0), 0);
  const averageOrderValue = orders > 0 ? revenue / orders : 0;

  const start = input.salesTrend[0]?.date;
  const end = input.salesTrend[input.salesTrend.length - 1]?.date;
  const windowLabel =
    start && end
      ? `${fmtDate(start)} – ${fmtDate(end)}`
      : "Recent activity";

  const sourceLabel = input.hasRealData && input.latestUpload
    ? `Latest upload: ${input.latestUpload.filename}`
    : input.hasRealData
    ? "Your processed sales data"
    : "Sample data — upload your own file to see your numbers";

  const badgeLabel: ReportSummary["badgeLabel"] = input.hasRealData
    ? "Based on your uploaded sales data"
    : "Demo data";

  // Executive summary — deterministic, friendly, no jargon.
  const repeatPct = repeatPercentage(input.customerSegments);
  const topProduct = input.topProducts[0]?.name;
  const slowMoverInsight = input.insights.find(
    (i) => i.type === "slow_moving_product"
  );
  const trendInsight = input.insights.find((i) => i.type === "revenue_growth");

  const summaryParts: string[] = [];
  if (input.hasRealData) {
    summaryParts.push(
      `Here's how ${input.businessName} performed ${
        start && end ? `from ${fmtDate(start)} to ${fmtDate(end)}` : "recently"
      }.`
    );
  } else {
    summaryParts.push(
      `This is a sample report for ${input.businessName} so you can see what your own report will look like once you upload a sales file.`
    );
  }

  if (revenue > 0 && orders > 0) {
    summaryParts.push(
      `You brought in ${fmtMoney(revenue, input.currency)} across ${orders.toLocaleString()} orders, with an average order value of ${fmtMoney(
        averageOrderValue,
        input.currency
      )}.`
    );
  }

  if (topProduct) {
    summaryParts.push(
      `${topProduct} is doing the most work — it's your top product by revenue.`
    );
  }

  if (repeatPct !== null && repeatPct >= 25) {
    summaryParts.push(
      `Repeat customers are a meaningful part of your business — about ${repeatPct}% of your customers have come back.`
    );
  } else if (repeatPct !== null && repeatPct > 0) {
    summaryParts.push(
      `Most of your customers are new — there's room to bring more of them back for a second visit.`
    );
  }

  if (slowMoverInsight) {
    summaryParts.push(
      `A few products haven't moved much lately and may be worth a closer look.`
    );
  } else if (trendInsight && trendInsight.severity === "positive") {
    summaryParts.push(`Recent sales are trending in the right direction.`);
  }

  const executiveSummary = summaryParts.join(" ");

  // Recommendations — deterministic from data.
  const recommendations: Recommendation[] = [];

  const top3 = input.topProducts.slice(0, 3).map((p) => p.name).filter(Boolean);
  if (top3.length > 0) {
    recommendations.push({
      id: "promote_top",
      title: `Promote your top ${top3.length} ${
        top3.length === 1 ? "product" : "products"
      } again`,
      body: `Lean into what's already working: ${top3.join(
        ", "
      )}. A small social post or email featuring these can lift sales without adding inventory risk.`,
    });
  }

  if (slowMoverInsight) {
    recommendations.push({
      id: "review_slow",
      title: "Review products that haven't sold recently",
      body:
        slowMoverInsight.body ??
        "Some items haven't sold in a while. Consider a small discount, a bundle, or moving them off the front page.",
    });
  }

  if (input.salesTrend.length >= 7) {
    recommendations.push({
      id: "strongest_days",
      title: "Look for patterns in your strongest sales days",
      body: "If certain days consistently outperform others, plan promotions, restocks, or staffing around them.",
    });
  }

  if (repeatPct !== null && repeatPct > 0) {
    recommendations.push({
      id: "repeat_followup",
      title: "Encourage repeat customers with a simple follow-up",
      body: "A short thank-you email or a small returning-customer offer is one of the cheapest ways to lift revenue. Your existing customers already trust you.",
    });
  }

  const hasMissingEmail =
    (input.dataQualityItems ?? []).some(
      (d) => d.severity !== "success" && /email/i.test(`${d.title} ${d.body}`)
    ) ||
    input.insights.some(
      (i) => /email/i.test(`${i.title} ${i.body}`) && i.severity === "warning"
    );

  if (hasMissingEmail) {
    recommendations.push({
      id: "fill_emails",
      title: "Capture more customer emails",
      body: "Some of your orders are missing customer email addresses. Adding them at checkout will sharpen your repeat-customer view and unlock follow-up campaigns.",
    });
  }

  if (input.channelRevenue && input.channelRevenue.length > 1) {
    const top = input.channelRevenue[0];
    recommendations.push({
      id: "channel_focus",
      title: `Double down on ${top.channel}`,
      body: `${top.channel} is your strongest sales channel right now. Worth investing a little more time and inventory there before spreading thin across other channels.`,
    });
  }

  // Always include a gentle, generic action so the section never looks empty.
  if (recommendations.length === 0) {
    recommendations.push({
      id: "start_simple",
      title: "Upload your first sales file to get tailored advice",
      body: "Once we can read your real numbers, this report fills in with recommendations specific to your products, customers, and channels.",
    });
  }

  return {
    generatedOnLabel,
    windowLabel,
    sourceLabel,
    badgeLabel,
    executiveSummary,
    totals: {
      revenue,
      orders,
      averageOrderValue,
    },
    recommendations,
  };
}

function repeatPercentage(segments: CustomerSegment[]): number | null {
  if (!segments || segments.length === 0) return null;
  const total = segments.reduce((s, g) => s + (g.value || 0), 0);
  if (total <= 0) return null;
  const repeat = segments
    .filter((g) => /repeat|returning|vip/i.test(g.label))
    .reduce((s, g) => s + (g.value || 0), 0);
  return Math.round((repeat / total) * 100);
}
