import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OverviewMetric } from "@/lib/sample-data";

export function MetricCard({ metric }: { metric: OverviewMetric }) {
  const dir = metric.delta?.direction ?? "flat";
  const DeltaIcon =
    dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  const deltaColor =
    dir === "up"
      ? "text-emerald-700 bg-emerald-50 ring-emerald-100"
      : dir === "down"
      ? "text-red-700 bg-red-50 ring-red-100"
      : "text-muted-foreground bg-muted ring-border";

  const accentBg =
    metric.accent === "brand"
      ? "from-brand-50 to-white"
      : metric.accent === "warm"
      ? "from-warm-50 to-white"
      : "from-white to-white";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br p-5 shadow-soft transition-shadow hover:shadow-card",
        accentBg
      )}
    >
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {metric.label}
        </div>
        {metric.delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
              deltaColor
            )}
          >
            <DeltaIcon className="h-3 w-3" />
            {Math.abs(metric.delta.value).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-[28px]">
        {metric.value}
      </div>
      {metric.sublabel && (
        <div className="mt-1 text-xs text-muted-foreground">
          {metric.sublabel}
        </div>
      )}
    </div>
  );
}
