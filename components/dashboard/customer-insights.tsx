import type { CustomerSegment } from "@/lib/sample-data";
import { cn, formatNumber } from "@/lib/utils";

const REPEAT_PATTERN = /repeat|returning|vip/i;

export function CustomerInsights({ segments }: { segments: CustomerSegment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const repeatCount = segments
    .filter((s) => REPEAT_PATTERN.test(s.label))
    .reduce((sum, s) => sum + (s.value || 0), 0);
  const repeatPct = total > 0 ? Math.round((repeatCount / total) * 100) : 0;

  // Truthful, data-derived narrative. We deliberately do NOT make AOV
  // comparisons across segments here — the component only receives counts.
  let narrative: string;
  if (total === 0) {
    narrative =
      "Customer details will appear here once your sales file has customer information.";
  } else if (repeatCount === 0) {
    narrative =
      "All customers in this dataset are first-time buyers. As more orders come in, you'll start to see repeat-customer trends here.";
  } else if (repeatPct >= 25) {
    narrative = `About ${repeatPct}% of your customers have come back. Repeat business is a strong signal — a small thank-you or returning-customer perk can keep it growing.`;
  } else {
    narrative = `About ${repeatPct}% of your customers have come back. There's room to bring more of them back — a short follow-up email or a small returning-customer offer is one of the cheapest ways to lift revenue.`;
  }

  return (
    <div className="space-y-4">
      {total > 0 && (
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
      )}
      <div className="grid grid-cols-3 gap-3">
        {segments.map((s) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
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
        {narrative}
      </p>
    </div>
  );
}
