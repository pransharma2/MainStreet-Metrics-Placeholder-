import Link from "next/link";
import { Download, Filter, Sparkles, UploadCloud, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { InsightCard } from "@/components/dashboard/insight-card";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";
import { RevenueByChannelChart } from "@/components/dashboard/revenue-by-channel-chart";
import { TopProductsTable } from "@/components/dashboard/top-products-table";
import { CustomerInsights } from "@/components/dashboard/customer-insights";
import { DataQualityCard } from "@/components/dashboard/data-quality-card";
import { requireActiveSession } from "@/lib/workspace";
import { loadDashboardData } from "@/lib/dashboard-data";
import {
  businessInsights as demoInsights,
  channelRevenue as demoChannels,
  customerSegments as demoSegments,
  dataQualityItems as demoDqItems,
  overviewMetrics as demoMetrics,
  salesTrend as demoSalesTrend,
  topProducts as demoTopProducts,
} from "@/lib/sample-data";

export default async function DashboardPage() {
  const session = await requireActiveSession();
  const data = await loadDashboardData(
    session.business.id,
    session.business.currency ?? "USD"
  );

  const latestUpload = data.latestUpload;
  const showDemoBanner = !data.hasRealData;

  const displayName =
    session.user.profile?.full_name?.split(" ")[0] ??
    session.user.email?.split("@")[0] ??
    "there";

  // Pick real or demo datasets for each section.
  const overviewMetrics = data.hasRealData ? data.overviewMetrics : demoMetrics;
  const salesTrend = data.hasRealData ? data.salesTrend : demoSalesTrend;
  const channels =
    data.hasRealData && data.channelRevenue && data.channelRevenue.length > 0
      ? data.channelRevenue
      : demoChannels;
  const topProducts =
    data.hasRealData && data.topProducts.length > 0
      ? data.topProducts
      : demoTopProducts;
  const segments =
    data.hasRealData && data.customerSegments.length > 0
      ? data.customerSegments
      : demoSegments;
  const insights =
    data.hasRealData && data.insights.length > 0 ? data.insights : demoInsights;
  const dqItems =
    data.hasRealData && data.dataQualityItems && data.dataQualityItems.length > 0
      ? data.dataQualityItems
      : demoDqItems;

  return (
    <DashboardShell
      title={`Hi ${displayName} — here's how ${session.business.name} is doing.`}
      description={
        data.hasRealData && latestUpload
          ? `Latest upload: ${latestUpload.filename} · ${(
              latestUpload.row_count ?? 0
            ).toLocaleString()} rows · ${latestUpload.source}`
          : latestUpload
          ? `Latest upload: ${latestUpload.filename} — finish mapping to see real numbers.`
          : "You're viewing demo data — upload your first sales file to start building your own dashboard."
      }
      actions={
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="secondary" size="sm" disabled>
            <Filter className="h-4 w-4" />
            Last 30 days
          </Button>
          <Button variant="secondary" size="sm" disabled>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {showDemoBanner && (
          <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-warm-50 p-5 shadow-soft">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-200/40 blur-3xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-200 shadow-soft">
                  <Info className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-brand-900">
                    You're viewing demo data.
                  </div>
                  <p className="mt-1 max-w-xl text-sm text-brand-900/80">
                    {latestUpload
                      ? "Finish mapping your uploaded file and click Build my dashboard to see your real numbers."
                      : "Upload a sales file to start building your own dashboard. We'll parse your columns, suggest a clean mapping, and let you review everything before processing."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild>
                  <Link
                    href={
                      latestUpload
                        ? `/dashboard/mapping/${latestUpload.id}`
                        : "/dashboard/upload"
                    }
                  >
                    <UploadCloud className="h-4 w-4" />
                    {latestUpload ? "Finish your dashboard" : "Upload your first file"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Overview metrics */}
        <section>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {overviewMetrics.map((m) => (
              <MetricCard key={m.id} metric={m} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle>Sales trend</CardTitle>
                <CardDescription>
                  {data.hasRealData
                    ? "Revenue over the last 30 days from your uploaded file."
                    : "Revenue over the last 30 days — Saturdays lead the pack."}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-border/70 bg-white p-0.5 text-xs">
                <button className="rounded-full bg-brand-600 px-3 py-1 font-medium text-white">
                  Daily
                </button>
                <button className="rounded-full px-3 py-1 text-muted-foreground">
                  Weekly
                </button>
                <button className="rounded-full px-3 py-1 text-muted-foreground">
                  Monthly
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <SalesTrendChart data={salesTrend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by channel</CardTitle>
              <CardDescription>
                {data.hasRealData && data.channelRevenue
                  ? "Where your sales are coming from."
                  : "Where your sales are coming from (demo)."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueByChannelChart data={channels} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle>Top products</CardTitle>
                <CardDescription>
                  {data.hasRealData
                    ? "Your best sellers by revenue."
                    : "Your best sellers by revenue, with month-over-month trend."}
                </CardDescription>
              </div>
              {!data.hasRealData && <Badge variant="brand">Demo</Badge>}
            </CardHeader>
            <CardContent>
              <TopProductsTable products={topProducts} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer mix</CardTitle>
              <CardDescription>
                {data.hasRealData
                  ? "New vs. repeat vs. inactive."
                  : "New vs. returning vs. VIP (3+ orders)."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerInsights segments={segments} />
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                What your data says
              </h2>
              <p className="text-sm text-muted-foreground">
                {data.hasRealData
                  ? "Plain-English insights, each with a suggested next step."
                  : "Plain-English insights, each with a suggested next step. Upload your file to see real ones."}
              </p>
            </div>
            <Button variant="ghost" size="sm" disabled>
              <Sparkles className="h-4 w-4" />
              Regenerate
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((ins) => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
          <Card>
            <CardHeader>
              <CardTitle>Latest upload</CardTitle>
              <CardDescription>
                {latestUpload
                  ? "Your freshest data snapshot."
                  : "You haven't uploaded anything yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestUpload ? (
                <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
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
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 bg-white p-4 text-sm text-muted-foreground">
                  Upload a CSV or Excel file to see your real numbers here.
                </div>
              )}
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/dashboard/upload">Upload a new file</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle>File check</CardTitle>
                <CardDescription>
                  {data.hasRealData && data.dataQualityItems
                    ? "We checked your latest file — here's what we found."
                    : latestUpload
                    ? "Sample preview of what file checks look like."
                    : "Sample preview of what file checks look like."}
                </CardDescription>
              </div>
              <Badge
                variant={
                  data.hasRealData
                    ? "success"
                    : latestUpload
                    ? "warning"
                    : "outline"
                }
              >
                {data.hasRealData
                  ? "Processed"
                  : latestUpload
                  ? "Ready to process"
                  : "Demo"}
              </Badge>
            </CardHeader>
            <CardContent>
              <DataQualityCard items={dqItems} compact />
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}
