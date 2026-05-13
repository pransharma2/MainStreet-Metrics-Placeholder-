import Link from "next/link";
import { ArrowLeft, FileText, UploadCloud, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportSection } from "@/components/report/report-section";
import { ReportMetricCard } from "@/components/report/report-metric-card";
import { RecommendationCard } from "@/components/report/recommendation-card";
import { PrintReportButton } from "@/components/report/print-report-button";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";
import { CustomerInsights } from "@/components/dashboard/customer-insights";
import { InsightCard } from "@/components/dashboard/insight-card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { buildReportSummary, type ReportInput } from "@/lib/report-data";

export interface ReportViewProps {
  input: ReportInput;
  /** Where the "Back" link should go (e.g. "/dashboard" or "/demo/boutique"). */
  backHref: string;
  backLabel: string;
  /** Where the "Upload another file" CTA points (or null to hide). */
  uploadHref?: string | null;
  uploadLabel?: string;
}

export function ReportView({
  input,
  backHref,
  backLabel,
  uploadHref = null,
  uploadLabel = "Upload another file",
}: ReportViewProps) {
  const summary = buildReportSummary(input);
  const {
    businessName,
    currency,
    overviewMetrics,
    salesTrend,
    topProducts,
    customerSegments,
    insights,
    latestUpload,
    dataQualityItems,
    hasRealData,
  } = input;

  const top6Insights = insights.slice(0, 6);
  const repeatTotal = customerSegments.reduce((s, g) => s + (g.value || 0), 0);
  const repeatGroup = customerSegments.find((g) => /repeat|returning|vip/i.test(g.label));
  const newGroup = customerSegments.find((g) => /^new/i.test(g.label));

  return (
    <div className="report-page mx-auto max-w-5xl space-y-6 pb-12">
      {/* Toolbar — hidden on print */}
      <div className="no-print sticky top-0 z-20 -mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-white/90 sm:px-5 sm:py-3 sm:shadow-soft">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <div className="flex items-center gap-2">
          {uploadHref && (
            <Button asChild variant="secondary" size="sm">
              <Link href={uploadHref}>
                <UploadCloud className="h-4 w-4" />
                {uploadLabel}
              </Link>
            </Button>
          )}
          <PrintReportButton />
        </div>
      </div>

      {/* 1. Report Header */}
      <header className="report-section break-inside-avoid overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-brand-50 via-white to-warm-50 p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-800">
              <FileText className="h-4 w-4" />
              Sales insight report
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {businessName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {summary.sourceLabel}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
            <Badge variant={hasRealData ? "success" : "warm"}>
              {summary.badgeLabel}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Generated {summary.generatedOnLabel}
            </div>
            <div className="text-xs text-muted-foreground">
              Period: {summary.windowLabel}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Executive Summary */}
      <ReportSection
        number={1}
        title="Executive summary"
        description="A short, plain-English read on how the business is doing right now."
      >
        <p className="text-base leading-relaxed text-foreground/90 sm:text-[17px]">
          {summary.executiveSummary}
        </p>
      </ReportSection>

      {/* 3. Key Metrics */}
      <ReportSection
        number={2}
        title="Key metrics"
        description="The headline numbers, in one place."
      >
        {overviewMetrics.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {overviewMetrics.map((m, i) => (
              <ReportMetricCard
                key={m.id}
                label={m.label}
                value={m.value}
                sublabel={m.sublabel}
                accent={m.accent ?? (i === 0 ? "brand" : i === 4 ? "warm" : "neutral")}
              />
            ))}
          </div>
        ) : (
          <EmptyNote text="Once you upload a sales file, your headline numbers will appear here." />
        )}
      </ReportSection>

      {/* 4. Revenue Overview */}
      <ReportSection
        number={3}
        title="Revenue overview"
        description="How sales have moved over the period covered by this report."
      >
        {salesTrend.length > 0 ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-white p-4 sm:p-5">
              <SalesTrendChart data={salesTrend} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ReportMetricCard
                label="Revenue this period"
                value={formatCurrency(summary.totals.revenue, currency)}
                sublabel={summary.windowLabel}
                accent="brand"
              />
              <ReportMetricCard
                label="Orders"
                value={formatNumber(summary.totals.orders)}
                sublabel="Total in the period"
              />
              <ReportMetricCard
                label="Average order value"
                value={formatCurrency(summary.totals.averageOrderValue, currency)}
                sublabel="Revenue ÷ orders"
              />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This view helps you see whether sales are growing, dipping, or
              staying steady over time. Look for the days that stand out — they
              often hide useful patterns about timing, promotions, or weather.
            </p>
          </div>
        ) : (
          <EmptyNote text="Upload a file with order dates to see your sales trend here." />
        )}
      </ReportSection>

      {/* 5. Product Highlights */}
      <ReportSection
        number={4}
        title="Product highlights"
        description="The products doing the most work for your business."
      >
        {topProducts.length > 0 ? (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-border/70">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">#</th>
                    <th className="px-4 py-2.5 text-left font-medium">Product</th>
                    <th className="px-4 py-2.5 text-right font-medium">Revenue</th>
                    <th className="px-4 py-2.5 text-right font-medium">Units</th>
                    <th className="px-4 py-2.5 text-right font-medium">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {topProducts.slice(0, 6).map((p, i) => (
                    <tr key={p.id} className="bg-white">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.name}</div>
                        {p.category && (
                          <div className="text-xs text-muted-foreground">
                            {p.category}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(p.revenue, currency)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatNumber(p.units)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatNumber(p.orders)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your top products are the items doing the most work for your
              business. These are good candidates for restocks, promotions, or
              social content. Items further down the list may need a price
              change, a bundle, or simply less shelf real estate.
            </p>
          </div>
        ) : (
          <EmptyNote text="Once your file is processed, your best-selling products will appear here." />
        )}
      </ReportSection>

      {/* 6. Customer Highlights */}
      <ReportSection
        number={5}
        title="Customer highlights"
        description="Who is buying — and how often they come back."
      >
        {repeatTotal > 0 ? (
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-border/70 bg-white p-5">
              <CustomerInsights segments={customerSegments} />
            </div>
            <div className="space-y-3">
              {newGroup && (
                <ReportMetricCard
                  label="New customers"
                  value={formatNumber(newGroup.value)}
                  sublabel="Their first purchase from you"
                />
              )}
              {repeatGroup && (
                <ReportMetricCard
                  label="Repeat customers"
                  value={formatNumber(repeatGroup.value)}
                  sublabel={`${Math.round(
                    (repeatGroup.value / repeatTotal) * 100
                  )}% of all customers`}
                  accent="warm"
                />
              )}
              <p className="text-sm leading-relaxed text-muted-foreground">
                Repeat customers can be a strong sign that people like what you
                sell and are willing to come back. Even small, friendly
                follow-ups (a thank-you note, a small returning-customer perk)
                can lift this number.
              </p>
            </div>
          </div>
        ) : (
          <EmptyNote text="Once you have customer data, you'll see new vs. returning customers here." />
        )}
      </ReportSection>

      {/* 7. Key Insights */}
      <ReportSection
        number={6}
        title="Key insights"
        description="Patterns we noticed in your numbers, with a suggested next step on each."
      >
        {top6Insights.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {top6Insights.map((ins) => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        ) : (
          <EmptyNote text="Insights show up here once your file has been processed." />
        )}
      </ReportSection>

      {/* 8. Recommended Next Steps */}
      <ReportSection
        number={7}
        title="Recommended next steps"
        description="Small, practical actions you can take this week."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {summary.recommendations.map((r, i) => (
            <RecommendationCard key={r.id} recommendation={r} index={i} />
          ))}
        </div>
      </ReportSection>

      {/* 9. Data Quality Notes */}
      <ReportSection
        number={8}
        title="Data quality notes"
        description="A friendly check on your latest upload so you know where your data could use a little love."
      >
        <div className="space-y-4">
          {latestUpload && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {latestUpload.filename}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {latestUpload.source} ·{" "}
                  {((latestUpload.size_bytes ?? 0) / 1024).toFixed(0)} KB ·{" "}
                  {(latestUpload.row_count ?? 0).toLocaleString()} rows
                </div>
              </div>
              <Badge
                variant={
                  latestUpload.status === "processed"
                    ? "success"
                    : latestUpload.status === "failed"
                    ? "danger"
                    : "warning"
                }
              >
                {latestUpload.status}
              </Badge>
            </div>
          )}
          {dataQualityItems && dataQualityItems.length > 0 ? (
            <ul className="space-y-2">
              {dataQualityItems.slice(0, 5).map((d) => (
                <li
                  key={d.id}
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-white p-3"
                >
                  <span
                    className={
                      d.severity === "error"
                        ? "mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-red-500"
                        : d.severity === "warning"
                        ? "mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500"
                        : d.severity === "success"
                        ? "mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                        : "mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-sky-500"
                    }
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{d.title}</div>
                    <div className="text-xs leading-relaxed text-muted-foreground">
                      {d.body}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              No file checks to flag right now. As you upload more data, this
              section will surface anything worth a quick look.
            </p>
          )}
          <p className="text-sm leading-relaxed text-muted-foreground">
            A few rows may need attention, but your dashboard can still be
            useful. Some insights — like repeat-customer patterns — get sharper
            once customer details are filled in.
          </p>
        </div>
      </ReportSection>

      {/* 10. Footer CTA — hidden on print */}
      <div className="no-print rounded-3xl border border-border/70 bg-white p-6 text-center shadow-soft sm:p-8">
        <Sparkles className="mx-auto h-6 w-6 text-brand-600" />
        <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
          That's your report
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
          Print it, save it, or come back next month for a fresh one once you
          upload new data.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild variant="secondary">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
          {uploadHref && (
            <Button asChild>
              <Link href={uploadHref}>
                <UploadCloud className="h-4 w-4" />
                {uploadLabel}
              </Link>
            </Button>
          )}
          <PrintReportButton variant="outline" />
        </div>
      </div>

      {/* Print-only footer */}
      <div className="print-only mt-6 text-center text-xs text-muted-foreground">
        Generated by MainStreet Metrics · {summary.generatedOnLabel}
      </div>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
