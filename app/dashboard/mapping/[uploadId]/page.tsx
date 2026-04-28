import { notFound } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MappingTable } from "@/components/mapping/mapping-table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Save } from "lucide-react";
import type { DetectedColumnRow, FileUploadRow } from "@/lib/types/db";

export default async function MappingForUploadPage({
  params,
}: {
  params: { uploadId: string };
}) {
  const supabase = createClient();

  const { data: upload } = await supabase
    .from("file_uploads")
    .select("id, filename, source, size_bytes, row_count, status, created_at")
    .eq("id", params.uploadId)
    .maybeSingle<FileUploadRow>();

  if (!upload) notFound();

  const { data: cols } = await supabase
    .from("detected_columns")
    .select("id, file_upload_id, original, sample, suggestion, confidence, ignored, position")
    .eq("file_upload_id", upload.id)
    .order("position", { ascending: true });

  const columns = (cols ?? []) as DetectedColumnRow[];

  return (
    <DashboardShell
      title="Column mapping"
      description={`Map your columns from ${upload.filename} to our standard fields.`}
      actions={
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/upload">
              <Save className="h-4 w-4" />
              Upload another
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/data-quality/${upload.id}`}>
              Continue to file check
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{upload.filename}</div>
              <div className="text-xs text-muted-foreground">
                {upload.source} ·{" "}
                {((upload.size_bytes ?? 0) / 1024).toFixed(0)} KB ·{" "}
                {(upload.row_count ?? 0).toLocaleString()} rows · status:{" "}
                {upload.status}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              We detected {columns.length} columns
            </div>
          </div>
        </div>

        {columns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-white p-10 text-center">
            <div className="mx-auto max-w-sm">
              <h3 className="font-display text-base font-semibold tracking-tight">
                We couldn't find any columns
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This file looks empty. Try uploading another CSV or Excel file
                with a header row.
              </p>
              <Button className="mt-5" asChild>
                <Link href="/dashboard/upload">Upload another file</Link>
              </Button>
            </div>
          </div>
        ) : (
          <MappingTable uploadId={upload.id} initial={columns} />
        )}
      </div>
    </DashboardShell>
  );
}
