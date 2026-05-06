import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileUp, Info, Sparkles, CalendarClock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemoShell } from "@/components/demo/demo-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { InsightCard } from "@/components/dashboard/insight-card";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";
import { RevenueByChannelChart } from "@/components/dashboard/revenue-by-channel-chart";
import { TopProductsTable } from "@/components/dashboard/top-products-table";
import { CustomerInsights } from "@/components/dashboard/customer-insights";
import { DataQualityCard } from "@/components/dashboard/data-quality-card";
import {
  demoSummaries,
  getDemoDashboard,
  isDemoBusinessType,
  type DemoBusinessType,
} from "@/lib/demo-data";

export function generateStaticParams() {
  return demoSummaries.map((s) => ({ businessType: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { businessType: string };
}): Metadata {
  if (!isDemoBusinessType(params.businessType)) {
    return { title: "Demo · MainStreet Metrics" };
  }
  const data = getDemoDashboard(params.businessType);
  return {
    title: `${data.business.name} demo · MainStreet Metrics`,
    description: `Explore a live example dashboard for ${data.business.name}. Revenue, top products, customer insights and recommended next steps — no signup required.`,
  };
}

export default function DemoDashboardPage({
  params,
}: {
  params: { businessType: string };
}) {
  if (!isDemoBusinessType(params.businessType)) notFound();
  const slug = params.businessType as DemoBusinessType;
  const data = getDemoDashboard(slug);

  return (
    <DemoShell
      backHref="/demo"
      backLabel="Back to all demos"
      title={`${data.business.name}`}
      description={`${data.business.tagline} · ${data.business.industry}`}
    >
      <div className="space-y-8">
        {/* Demo banner */}
        <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-warm-50 p-5 shadow-soft">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-200 shadow-soft">
                <Info className="h-5 w-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-900">
                  You&apos;re viewing a live demo dashboard
                  <Badge variant="warm">Sample data</Badge>
                </div>
                <p className="mt-1 max-w-xl text-sm text-brand-900/80">
                  Every chart and insight below is built from a realistic, messy
                  sales export. Upload your own file to see the same dashboard
                  for your business.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild>
                <Link href="/signup">
                  <FileUp className="h-4 w-4" />
                  Try it with your own sales file
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/demo/${slug}/report`}>
                  <FileText className="h-4 w-4" />
                  View sample report
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/request-dashboard">
                  <CalendarClock className="h-4 w-4" />
                  Get a dashboard built for you
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Overview metrics */}
        <section>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {data.overviewMetrics.map((m) => (
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
                  Revenue over the last 30 days.
                </CardDescription>
              </div>
              <Badge variant="outline">Demo</Badge>
            </CardHeader>
            <CardContent>
              <SalesTrendChart data={data.salesTrend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by channel</CardTitle>
              <CardDescription>Where sales are coming from.</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueByChannelChart data={data.channelRevenue} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Top products</CardTitle>
              <CardDescription>Best sellers by revenue.</CardDescription>
            </CardHeader>
            <CardContent>
              <TopProductsTable products={data.topProducts} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer mix</CardTitle>
              <CardDescription>New vs. returning vs. VIP.</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerInsights segments={data.customerSegments} />
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                What the data says
              </h2>
              <p className="text-sm text-muted-foreground">
                Plain-English insights, each with a suggested next step.
              </p>
            </div>
            <Badge variant="brand">
              <Sparkles className="h-3 w-3" />
              Sample insights
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.insights.map((ins) => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
          <Card>
            <CardHeader>
              <CardTitle>About this demo</CardTitle>
              <CardDescription>How this dashboard was built.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We started from a messy {data.business.industry.toLowerCase()} sales
                export — mixed date formats, missing SKUs, a few refunds — and
                ran it through the same pipeline your file will use.
              </p>
              <p>
                In your workspace, the file check panel flags anything that
                needs attention and the dashboard updates every time you upload
                a new file.
              </p>
              <Button asChild className="w-full">
                <Link href="/signup">
                  <FileUp className="h-4 w-4" />
                  Upload your first file
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle>File check</CardTitle>
                <CardDescription>
                  What we found while cleaning the sample file.
                </CardDescription>
              </div>
              <Badge variant="success">Sample clean</Badge>
            </CardHeader>
            <CardContent>
              <DataQualityCard items={data.dataQualityItems} compact />
            </CardContent>
          </Card>
        </section>

        <section className="overflow-hidden rounded-3xl border border-border/60 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Like what you see?
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Try it with your own file, or have us set up your dashboard for
                you.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/signup">Start free</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/request-dashboard">Request a dashboard setup</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/demo">Try another demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </DemoShell>
  );
}
