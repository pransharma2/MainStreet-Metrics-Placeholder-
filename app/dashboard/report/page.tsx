import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ReportView } from "@/components/report/report-view";
import { requireActiveSession } from "@/lib/workspace";
import { loadDashboardData } from "@/lib/dashboard-data";
import type { ReportInput } from "@/lib/report-data";
import {
  businessInsights as demoInsights,
  channelRevenue as demoChannels,
  customerSegments as demoSegments,
  dataQualityItems as demoDqItems,
  overviewMetrics as demoMetrics,
  salesTrend as demoSalesTrend,
  topProducts as demoTopProducts,
} from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Sales insight report · MainStreet Metrics",
  description:
    "A printable, plain-English summary of your business's sales performance.",
};

export default async function DashboardReportPage() {
  const session = await requireActiveSession();
  const currency = session.business.currency ?? "USD";
  const data = await loadDashboardData(session.business.id, currency);

  // Real or demo, with the existing "fall back per-section" approach so a
  // newly signed-up user still sees a fully rendered, polished report.
  const overviewMetrics = data.hasRealData ? data.overviewMetrics : demoMetrics;
  const salesTrend = data.hasRealData ? data.salesTrend : demoSalesTrend;
  const channelRevenue =
    data.hasRealData && data.channelRevenue && data.channelRevenue.length > 0
      ? data.channelRevenue
      : demoChannels;
  const topProducts =
    data.hasRealData && data.topProducts.length > 0
      ? data.topProducts
      : demoTopProducts;
  const customerSegments =
    data.hasRealData && data.customerSegments.length > 0
      ? data.customerSegments
      : demoSegments;
  const insights =
    data.hasRealData && data.insights.length > 0 ? data.insights : demoInsights;
  const dataQualityItems =
    data.hasRealData && data.dataQualityItems && data.dataQualityItems.length > 0
      ? data.dataQualityItems
      : demoDqItems;

  const input: ReportInput = {
    businessName: session.business.name,
    hasRealData: data.hasRealData,
    currency,
    overviewMetrics,
    salesTrend,
    channelRevenue,
    topProducts,
    customerSegments,
    insights,
    latestUpload: data.latestUpload,
    dataQualityItems,
    dataCoverage: data.dataCoverage,
  };

  return (
    <DashboardShell
      title="Sales insight report"
      description={
        data.hasRealData
          ? "A clean summary of your sales — ready to print or share."
          : "Sample report — upload your own file to fill it in with your numbers."
      }
    >
      <ReportView
        input={input}
        backHref="/dashboard"
        backLabel="Back to dashboard"
        uploadHref="/dashboard/upload"
        uploadLabel="Upload another file"
      />
    </DashboardShell>
  );
}
