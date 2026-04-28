import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { UploadRecord } from "@/lib/sample-data";
import { FileSpreadsheet, FileText, MoreHorizontal } from "lucide-react";

const badgeFor = (s: UploadRecord["status"]) =>
  s === "Ready"
    ? "success"
    : s === "Needs review"
    ? "warning"
    : s === "Processing"
    ? "info"
    : "danger";

export function RecentUploads({ uploads }: { uploads: UploadRecord[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Recent uploads</div>
          <div className="text-xs text-muted-foreground">
            Your last {uploads.length} files across all sources.
          </div>
        </div>
        <Link
          href="#"
          className="text-xs font-medium text-brand-700 hover:underline"
        >
          See all →
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-white text-left">
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">File</th>
            <th className="hidden px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Source</th>
            <th className="hidden px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Rows</th>
            <th className="hidden px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Uploaded</th>
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70 bg-white">
          {uploads.map((u) => {
            const Icon = u.filename.endsWith(".xlsx") ? FileSpreadsheet : FileText;
            return (
              <tr key={u.id} className="transition-colors hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{u.filename}</div>
                      <div className="text-xs text-muted-foreground">{u.size}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{u.source}</td>
                <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground md:table-cell">{u.rows.toLocaleString()}</td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{u.uploadedAt}</td>
                <td className="px-4 py-3">
                  <Badge variant={badgeFor(u.status) as any}>{u.status}</Badge>
                </td>
                <td className="px-2">
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
