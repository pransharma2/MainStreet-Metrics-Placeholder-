import type { InsightSeverity } from "@/lib/types/db";
import type {
  GoldDailySalesInsert,
  GoldMonthlySalesInsert,
  GoldProductPerformanceInsert,
  GoldCustomerSummaryInsert,
} from "@/lib/processing/gold";

export interface InsightInsert {
  business_id: string;
  file_upload_id: string | null;
  insight_type: string;
  title: string;
  description: string;
  metric_value: number | null;
  comparison_value: number | null;
  severity: InsightSeverity;
  recommended_action: string | null;
}

export interface InsightBuildInput {
  businessId: string;
  fileUploadId: string | null;
  currency: string | null;
  daily: GoldDailySalesInsert[];
  monthly: GoldMonthlySalesInsert[];
  products: GoldProductPerformanceInsert[];
  customers: GoldCustomerSummaryInsert[];
  missingEmailPct: number; // 0-100
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function fmtMoney(n: number, currency: string | null): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}

function pct(n: number): string {
  return `${Math.round(n)}%`;
}

export function buildInsights(input: InsightBuildInput): InsightInsert[] {
  const { businessId, fileUploadId, currency, daily, monthly, products, customers } = input;
  const out: InsightInsert[] = [];

  // 1. Top product concentration
  if (products.length > 0) {
    const sorted = [...products].sort((a, b) => b.total_revenue - a.total_revenue);
    const total = sorted.reduce((s, p) => s + p.total_revenue, 0);
    if (total > 0) {
      const topN = Math.min(5, sorted.length);
      const topRev = sorted.slice(0, topN).reduce((s, p) => s + p.total_revenue, 0);
      const share = (topRev / total) * 100;
      out.push({
        business_id: businessId,
        file_upload_id: fileUploadId,
        insight_type: "top_product_concentration",
        title: "Your top products are driving most of your revenue",
        description: `Your top ${topN} products generated ${pct(share)} of total revenue.`,
        metric_value: Math.round(share * 10) / 10,
        comparison_value: null,
        severity: share > 70 ? "warning" : "info",
        recommended_action:
          share > 70
            ? "A few products are carrying a lot of weight. Consider widening your product mix."
            : "Keep leaning into what's working — your bestsellers are clear.",
      });
    }
  }

  // 2. Strongest sales day-of-week
  if (daily.length >= 7) {
    const byDow = new Array<number>(7).fill(0);
    const countDow = new Array<number>(7).fill(0);
    for (const d of daily) {
      const dow = new Date(`${d.sales_date}T00:00:00Z`).getUTCDay();
      byDow[dow] += d.total_revenue;
      countDow[dow] += 1;
    }
    // Use average per day-of-week to avoid bias from partial weeks.
    let bestDow = 0;
    let bestAvg = 0;
    for (let i = 0; i < 7; i++) {
      const avg = countDow[i] > 0 ? byDow[i] / countDow[i] : 0;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestDow = i;
      }
    }
    if (bestAvg > 0) {
      out.push({
        business_id: businessId,
        file_upload_id: fileUploadId,
        insight_type: "strongest_day",
        title: `${DAYS[bestDow]} is your strongest sales day`,
        description: `On average, ${DAYS[bestDow]}s bring in the most revenue — about ${fmtMoney(bestAvg, currency)} per day.`,
        metric_value: Math.round(bestAvg),
        comparison_value: null,
        severity: "positive",
        recommended_action: `Consider launching new products or promos on ${DAYS[bestDow]}s.`,
      });
    }
  }

  // 3. Repeat customer value
  if (customers.length > 0) {
    const repeatSpend = customers
      .filter((c) => c.total_orders > 1)
      .reduce((s, c) => s + c.total_spend, 0);
    if (repeatSpend > 0) {
      out.push({
        business_id: businessId,
        file_upload_id: fileUploadId,
        insight_type: "repeat_customer_value",
        title: "Your repeat customers are a real asset",
        description: `Repeat customers generated ${fmtMoney(repeatSpend, currency)} in total.`,
        metric_value: Math.round(repeatSpend),
        comparison_value: null,
        severity: "positive",
        recommended_action:
          "Consider a small thank-you or early-access offer for returning shoppers.",
      });
    }
  }

  // 4. High-value product (low units, high revenue-per-order)
  if (products.length >= 3) {
    const candidate = [...products]
      .filter((p) => p.total_orders > 0)
      .sort((a, b) => b.total_revenue / b.total_orders - a.total_revenue / a.total_orders)[0];
    if (candidate && candidate.total_quantity_sold > 0) {
      const medianQty = [...products]
        .map((p) => p.total_quantity_sold)
        .sort((a, b) => a - b)[Math.floor(products.length / 2)];
      if (candidate.total_quantity_sold <= medianQty) {
        const rpo = candidate.total_revenue / candidate.total_orders;
        out.push({
          business_id: businessId,
          file_upload_id: fileUploadId,
          insight_type: "high_value_product",
          title: "A quiet bestseller is punching above its weight",
          description: `${
            candidate.product_name ?? "One of your products"
          } sells fewer units, but earns ${fmtMoney(rpo, currency)} on average per order.`,
          metric_value: Math.round(rpo),
          comparison_value: null,
          severity: "positive",
          recommended_action: "Give this product more visibility in your store.",
        });
      }
    }
  }

  // 5. Slow-moving products — only meaningful when the dataset spans long
  // enough for a 45-day "no sale" gap to be a real signal rather than an
  // artefact of a short file.
  if (products.length > 0 && daily.length > 0) {
    const mostRecent = daily[daily.length - 1].sales_date;
    const earliest = daily[0].sales_date;
    const refMs = new Date(`${mostRecent}T00:00:00Z`).getTime();
    const earliestMs = new Date(`${earliest}T00:00:00Z`).getTime();
    const spanDays = (refMs - earliestMs) / (1000 * 86400) + 1;
    const slow =
      spanDays >= 60
        ? products.filter((p) => {
            if (!p.last_sold_date) return false;
            const lastMs = new Date(`${p.last_sold_date}T00:00:00Z`).getTime();
            const days = (refMs - lastMs) / (1000 * 86400);
            return days >= 45;
          })
        : [];
    if (slow.length > 0) {
      out.push({
        business_id: businessId,
        file_upload_id: fileUploadId,
        insight_type: "slow_moving_products",
        title: "Some products have gone quiet",
        description: `${slow.length} product${
          slow.length === 1 ? " has" : "s have"
        } not sold in 45+ days.`,
        metric_value: slow.length,
        comparison_value: null,
        severity: "warning",
        recommended_action:
          "Consider a bundle, discount, or removing them from your featured lineup.",
      });
    }
  }

  // 6. Revenue trend (MoM)
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    if (prev.total_revenue > 0) {
      const change = ((last.total_revenue - prev.total_revenue) / prev.total_revenue) * 100;
      const up = change >= 0;
      out.push({
        business_id: businessId,
        file_upload_id: fileUploadId,
        insight_type: "revenue_trend",
        title: up ? "Revenue is trending up" : "Revenue dipped from last month",
        description: `Revenue ${up ? "increased" : "decreased"} ${Math.abs(
          Math.round(change)
        )}% compared to the previous month.`,
        metric_value: Math.round(change * 10) / 10,
        comparison_value: prev.total_revenue,
        severity: up ? "positive" : "warning",
        recommended_action: up
          ? "Keep doing what's working and consider stocking up."
          : "Look at which products or channels slowed down most.",
      });
    }
  }

  // 7. Average order value
  const totalOrders = monthly.reduce((s, m) => s + m.total_orders, 0);
  const totalRevenue = monthly.reduce((s, m) => s + m.total_revenue, 0);
  if (totalOrders > 0) {
    const aov = totalRevenue / totalOrders;
    out.push({
      business_id: businessId,
      file_upload_id: fileUploadId,
      insight_type: "average_order_value",
      title: "Average order value",
      description: `Average order value is ${fmtMoney(aov, currency)}.`,
      metric_value: Math.round(aov * 100) / 100,
      comparison_value: null,
      severity: "info",
      recommended_action:
        "Bundles, minimum-order perks, and product recommendations can nudge this up.",
    });
  }

  // 8. Missing data warning
  if (input.missingEmailPct >= 20) {
    out.push({
      business_id: businessId,
      file_upload_id: fileUploadId,
      insight_type: "missing_customer_emails",
      title: "Customer insights may be incomplete",
      description: `About ${Math.round(
        input.missingEmailPct
      )}% of orders are missing customer emails.`,
      metric_value: Math.round(input.missingEmailPct),
      comparison_value: null,
      severity: "warning",
      recommended_action:
        "Ask your store to capture email at checkout so you can tell new vs. returning buyers apart.",
    });
  }

  return out;
}
