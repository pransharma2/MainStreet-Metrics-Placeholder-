import { cn } from "@/lib/utils";

/**
 * Print-friendly metric tile — calmer than the dashboard MetricCard,
 * no delta arrows, no gradients. Designed to read well on paper.
 */
export function ReportMetricCard({
  label,
  value,
  sublabel,
  accent = "neutral",
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: "brand" | "warm" | "neutral";
}) {
  const accentRing =
    accent === "brand"
      ? "ring-brand-100"
      : accent === "warm"
      ? "ring-warm-200"
      : "ring-border";
  const accentBar =
    accent === "brand"
      ? "bg-brand-500"
      : accent === "warm"
      ? "bg-warm-400"
      : "bg-muted-foreground/20";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-white p-5 shadow-soft ring-1",
        accentRing
      )}
    >
      <span className={cn("absolute left-0 top-0 h-full w-1", accentBar)} />
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-[26px]">
        {value}
      </div>
      {sublabel && (
        <div className="mt-1 text-xs leading-snug text-muted-foreground">
          {sublabel}
        </div>
      )}
    </div>
  );
}
