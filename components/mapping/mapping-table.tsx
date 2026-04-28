"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DetectedColumnRow } from "@/lib/types/db";

const STANDARD_FIELDS = [
  "order_id",
  "order_date",
  "customer_id",
  "customer_name",
  "customer_email",
  "product_id",
  "product_name",
  "sku",
  "category",
  "quantity",
  "unit_price",
  "discount_amount",
  "tax_amount",
  "shipping_amount",
  "total_amount",
  "payment_method",
  "sales_channel",
  "fulfillment_status",
  "refund_amount",
  "inventory_quantity",
  "Ignore",
] as const;

const confidenceBadge = {
  high: { label: "High confidence", variant: "success" as const },
  medium: { label: "Medium", variant: "warning" as const },
  low: { label: "Low", variant: "outline" as const },
};

type Row = Pick<
  DetectedColumnRow,
  "id" | "original" | "sample" | "suggestion" | "confidence" | "ignored"
>;

export function MappingTable({
  uploadId,
  initial,
}: {
  uploadId: string;
  initial: Row[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial);
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const stats = useMemo(() => {
    const mapped = rows.filter((r) => r.suggestion !== "Ignore" && !r.ignored);
    return {
      mapped: mapped.length,
      total: rows.length,
      high: mapped.filter((r) => r.confidence === "high").length,
    };
  }, [rows]);

  function save(next?: () => void) {
    setError(null);
    startSaving(async () => {
      try {
        const res = await fetch(`/api/uploads/${uploadId}/mapping`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            columns: rows.map((r) => ({
              id: r.id,
              suggestion: r.suggestion,
              ignored: r.ignored || r.suggestion === "Ignore",
            })),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data?.error ?? "We couldn't save your mapping. Please try again."
          );
        }
        setSaved(true);
        if (next) next();
        else router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-brand-900">
        <div>
          <strong>Help us match your columns</strong> before we build your dashboard.
          You can adjust anything below.
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-brand-800 ring-1 ring-brand-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {stats.mapped} / {stats.total} mapped
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-brand-800 ring-1 ring-brand-200">
            {stats.high} high-confidence
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saved && !error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Mapping saved. You can keep editing or continue to file check.</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your column
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                Sample
              </th>
              <th className="px-2 py-3" />
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Maps to
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {rows.map((row, i) => {
              const ignored = row.ignored || row.suggestion === "Ignore";
              const conf = confidenceBadge[row.confidence];
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors",
                    ignored ? "bg-muted/20" : "hover:bg-muted/10"
                  )}
                >
                  <td className="px-5 py-3">
                    <div
                      className={cn(
                        "font-medium",
                        ignored ? "text-muted-foreground line-through" : ""
                      )}
                    >
                      {row.original}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">
                    {row.sample}
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={row.suggestion}
                      onChange={(e) => {
                        setSaved(false);
                        setRows((prev) =>
                          prev.map((r, idx) =>
                            idx === i
                              ? {
                                  ...r,
                                  suggestion: e.target.value,
                                  ignored: e.target.value === "Ignore",
                                }
                              : r
                          )
                        );
                      }}
                      className={cn(
                        "h-9 rounded-lg border border-border bg-white px-2.5 pr-8 text-sm shadow-soft transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:border-brand-400",
                        ignored && "text-muted-foreground"
                      )}
                    >
                      {STANDARD_FIELDS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant={conf.variant as any}>{conf.label}</Badge>
                      <button
                        onClick={() => {
                          setSaved(false);
                          setRows((prev) =>
                            prev.map((r, idx) =>
                              idx === i
                                ? {
                                    ...r,
                                    ignored: !ignored,
                                    suggestion: !ignored
                                      ? "Ignore"
                                      : r.suggestion === "Ignore"
                                      ? "order_id"
                                      : r.suggestion,
                                  }
                                : r
                            )
                          );
                        }}
                        className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-2.5 text-xs text-muted-foreground hover:border-brand-200 hover:text-brand-700"
                      >
                        <EyeOff className="h-3 w-3" />
                        {ignored ? "Use" : "Ignore"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-muted/30 p-4">
        <div className="text-xs text-muted-foreground">
          We'll reuse this mapping on future uploads with the same column names —
          no re-mapping needed.
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => save()}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save mapping"}
          </Button>
          <Button
            onClick={() =>
              save(() => router.push(`/dashboard/data-quality/${uploadId}`))
            }
            disabled={saving}
          >
            Save & continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
