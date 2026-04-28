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
import { createClient } from "@/lib/supabase/server";
import {
  businessInsights,
  channelRevenue,
  customerSegments,
  dataQualityItems,
  overviewMetrics,
  salesTrend,
  topProducts,
} from "@/lib/sample-data";

export default async function DashboardPage() {
  const session = await requireActiveSession();
  const supabase = createClient();

  // Does the user have any uploads yet? Phase 3 will branch on processed Gold
  // tables. For Phase 2 we just show the banner whenever there's no file yet.
  const { data: latestUploads } = await supabase
    .from("file_uploads")
    .select("id, filename, source, size_bytes, row_count, status, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  const latestUpload = latestUploads?.[0];
  const showDemoBanner = !latestUpload; // no uploads → demo mode

  const displayName =
    session.user.profile?.full_name?.split(" ")[0] ??
    session.user.email?.split("@")[0] ??
    "there";

  return (
    <DashboardShell
      title={`Hi ${displayName} — here's how ${session.business.name} is doing.`}
      description={
        latestUpload
          ? `Latest upload: ${latestUpload.filename} · ${(
              latestUpload.row_count ?? 0
            ).toLocaleString()} rows · ${latestUpload.source}`
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
                    Upload a sales file to start building your own dashboard.
                    We'll parse your columns, suggest a clean mapping, and let
                    you review everything before processing.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild>
                  <Link href="/dashboard/upload">
                    <UploadCloud className="h-4 w-4" />
                    Upload your first file
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Overview metrics (static demo) */}
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
                  Revenue over the last 30 days — Saturdays lead the pack.
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
              <CardDescription>Where your sales are coming from.</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueByChannelChart data={channelRevenue} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle>Top products</CardTitle>
                <CardDescription>
                  Your best sellers by revenue, with month-over-month trend.
                </CardDescription>
              </div>
              <Badge variant="brand">Demo</Badge>
            </CardHeader>
            <CardContent>
              <TopProductsTable products={topProducts} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer mix</CardTitle>
              <CardDescription>
                New vs. returning vs. VIP (3+ orders).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerInsights segments={customerSegments} />
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
                Plain-English insights, each with a suggested next step. Wired
                to your real data in Phase 3.
              </p>
            </div>
            <Button variant="ghost" size="sm" disabled>
              <Sparkles className="h-4 w-4" />
              Regenerate
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businessInsights.map((ins) => (
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
                    <Badge variant="success">{latestUpload.status}</Badge>
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
                  {latestUpload
                    ? "We checked your latest file — here's what we found."
                    : "Sample preview of what file checks look like."}
                </CardDescription>
              </div>
              <Badge variant={latestUpload ? "success" : "outline"}>
                {latestUpload ? "Ready to process" : "Demo"}
              </Badge>
            </CardHeader>
            <CardContent>
              <DataQualityCard items={dataQualityItems} compact />
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}
