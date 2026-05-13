import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoShell } from "@/components/demo/demo-shell";
import { ReportView } from "@/components/report/report-view";
import {
  demoSummaries,
  getDemoDashboard,
  isDemoBusinessType,
  type DemoBusinessType,
} from "@/lib/demo-data";
import type { ReportInput } from "@/lib/report-data";

export function generateStaticParams() {
  return demoSummaries.map((s) => ({ businessType: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { businessType: string };
}): Metadata {
  if (!isDemoBusinessType(params.businessType)) {
    return { title: "Demo report · MainStreet Metrics" };
  }
  const data = getDemoDashboard(params.businessType);
  return {
    title: `${data.business.name} report · MainStreet Metrics`,
    description: `Sample sales insight report for ${data.business.name}. A printable, plain-English summary you can share or save.`,
  };
}

export default function DemoReportPage({
  params,
}: {
  params: { businessType: string };
}) {
  if (!isDemoBusinessType(params.businessType)) notFound();
  const slug = params.businessType as DemoBusinessType;
  const data = getDemoDashboard(slug);

  const input: ReportInput = {
    businessName: data.business.name,
    hasRealData: false,
    currency: data.business.currency,
    overviewMetrics: data.overviewMetrics,
    salesTrend: data.salesTrend,
    channelRevenue: data.channelRevenue,
    topProducts: data.topProducts,
    customerSegments: data.customerSegments,
    insights: data.insights,
    latestUpload: null,
    dataQualityItems: data.dataQualityItems,
  };

  return (
    <DemoShell
      backHref={`/demo/${slug}`}
      backLabel={`Back to ${data.business.name} demo`}
      title="Sample sales insight report"
      description="Printable, plain-English summary — same layout small businesses see for their own data."
    >
      <ReportView
        input={input}
        backHref={`/demo/${slug}`}
        backLabel={`Back to ${data.business.name} demo`}
        uploadHref="/signup"
        uploadLabel="Try with your own file"
      />
    </DemoShell>
  );
}
