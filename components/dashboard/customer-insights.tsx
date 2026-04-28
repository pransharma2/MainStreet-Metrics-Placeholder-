import type { CustomerSegment } from "@/lib/sample-data";
import { cn, formatNumber } from "@/lib/utils";

export function CustomerInsights({ segments }: { segments: CustomerSegment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div className="space-y-4">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <div
            key={s.label}
            className="h-full"
            style={{
              width: `${(s.value / total) * 100}%`,
              backgroundColor: s.color,
            }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {segments.map((s) => {
          const pct = (s.value / total) * 100;
          return (
            <div
              key={s.label}
              className={cn(
                "rounded-xl border border-border/70 bg-white p-3"
              )}
            >
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
              </div>
              <div className="mt-1 font-display text-xl font-semibold tabular-nums">
                {formatNumber(s.value)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {pct.toFixed(1)}% of customers
              </div>
            </div>
          );
        })}
      </div>
      <p className="rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-xs leading-relaxed text-brand-800">
        Returning buyers spent <strong>28% more per order</strong> on average this
        month. Consider a simple loyalty perk to keep it growing.
      </p>
    </div>
  );
}
