import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { RecentUploads } from "@/components/upload/recent-uploads";
import { createClient } from "@/lib/supabase/server";
import { requireActiveSession } from "@/lib/workspace";
import type { FileUploadRow } from "@/lib/types/db";
import type { UploadRecord } from "@/lib/sample-data";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploaded(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (sameDay)
    return `Today, ${d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function statusLabel(s: FileUploadRow["status"]): UploadRecord["status"] {
  switch (s) {
    case "processed":
    case "mapped":
      return "Ready";
    case "parsed":
    case "uploaded":
      return "Needs review";
    case "failed":
      return "Failed";
    default:
      return "Processing";
  }
}

export default async function UploadPage() {
  await requireActiveSession();
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("file_uploads")
    .select("id, filename, source, size_bytes, row_count, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const uploads: UploadRecord[] = (rows ?? []).map((r) => ({
    id: r.id,
    filename: r.filename,
    source: r.source as UploadRecord["source"],
    size: formatSize(r.size_bytes ?? 0),
    rows: r.row_count ?? 0,
    uploadedAt: formatUploaded(r.created_at),
    status: statusLabel(r.status),
  }));

  return (
    <DashboardShell
      title="Upload a sales file"
      description="Drag & drop a CSV or Excel — we'll clean and map it for you."
    >
      <div className="mx-auto max-w-5xl space-y-8">
        <UploadDropzone />
        {uploads.length > 0 ? (
          <RecentUploads uploads={uploads} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-white p-10 text-center">
            <div className="mx-auto max-w-sm">
              <h3 className="font-display text-base font-semibold tracking-tight">
                No uploads yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Once you upload a file, it'll show up here so you can revisit the
                mapping or the file check.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
