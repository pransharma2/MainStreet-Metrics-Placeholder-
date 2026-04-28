import { notFound } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DataQualityCard } from "@/components/dashboard/data-quality-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { DataQualityItem } from "@/lib/sample-data";
import type { DetectedColumnRow, FileUploadRow } from "@/lib/types/db";

function buildDqItems(
  upload: FileUploadRow,
  columns: DetectedColumnRow[]
): DataQualityItem[] {
  const items: DataQualityItem[] = [];
  const mapped = columns.filter((c) => !c.ignored && c.suggestion !== "Ignore");
  const hasDate = mapped.some((c) => c.suggestion === "order_date");
  const hasTotal = mapped.some((c) => c.suggestion === "total_amount");
  const hasEmail = mapped.some((c) => c.suggestion === "customer_email");
  const hasProduct = mapped.some((c) => c.suggestion === "product_name");

  if (hasDate && hasTotal && hasProduct) {
    items.push({
      id: "dq_required",
      severity: "success",
      title: "All required columns mapped",
      body: "Order date, total and product name are present and look valid.",
    });
  } else {
    items.push({
      id: "dq_required",
      severity: "warning",
      title: "Help us match a few more columns",
      body: "We still need order date, product name, and total amount to build your dashboard.",
    });
  }

  if (!hasEmail) {
    items.push({
      id: "dq_email",
      severity: "info",
      title: "No customer email column",
      body: "That's okay — we'll treat every row as a guest customer. You can add emails later.",
    });
  }

  const preview = Array.isArray(upload.preview_rows) ? upload.preview_rows : [];
  items.push({
    id: "dq_rows",
    severity: "info",
    title: `We read ${(upload.row_count ?? preview.length).toLocaleString()} rows`,
    body: `Previewed the first ${preview.length} rows. The full file is safely stored in your workspace.`,
  });

  if ((upload.row_count ?? 0) === 0) {
    items.push({
      id: "dq_empty",
      severity: "error",
      title: "This file looks empty",
      body: "Try uploading another CSV with a header row and at least one order.",
    });
  }

  return items;
}

export default async function DataQualityForUploadPage({
  params,
}: {
  params: { uploadId: string };
}) {
  const supabase = createClient();
  const { data: upload } = await supabase
    .from("file_uploads")
    .select("*")
    .eq("id", params.uploadId)
    .maybeSingle<FileUploadRow>();

  if (!upload) notFound();

  const { data: cols } = await supabase
    .from("detected_columns")
    .select("*")
    .eq("file_upload_id", upload.id);

  const items = buildDqItems(upload, (cols ?? []) as DetectedColumnRow[]);
  const counts = items.reduce(
    (acc, i) => ({ ...acc, [i.severity]: (acc[i.severity] ?? 0) + 1 }),
    {} as Record<string, number>
  );

  return (
    <DashboardShell
      title="File check"
      description={`We checked ${upload.filename} and summarized what we found.`}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-6 shadow-soft">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700 ring-1 ring-brand-200 shadow-soft">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <div className="text-sm font-medium text-brand-800">
                  Ready to process
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  Your file looks good.
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Full bronze→silver→gold processing lands in Phase 3. For now,
                  your workspace will continue to show the demo dashboard.
                </p>
              </div>
            </div>
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Back to dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Passed", value: counts.success ?? 0, tone: "success" },
              { label: "Warnings", value: counts.warning ?? 0, tone: "warning" },
              { label: "Info", value: counts.info ?? 0, tone: "info" },
              { label: "Errors", value: counts.error ?? 0, tone: "danger" },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-border/70 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {c.label}
                  </div>
                  <Badge variant={c.tone as any}>{c.tone}</Badge>
                </div>
                <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
                  {c.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-soft">
          <div className="mb-4">
            <h3 className="text-base font-semibold">What we found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything is in plain English. We default to warnings, not
              errors, so you stay in control.
            </p>
          </div>
          <DataQualityCard items={items} />
        </div>
      </div>
    </DashboardShell>
  );
}
