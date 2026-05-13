import { Lightbulb } from "lucide-react";
import type { Recommendation } from "@/lib/report-data";

export function RecommendationCard({
  recommendation,
  index,
}: {
  recommendation: Recommendation;
  index: number;
}) {
  return (
    <div className="break-inside-avoid rounded-2xl border border-border/70 bg-gradient-to-br from-warm-50/40 to-white p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warm-100 text-warm-800 ring-1 ring-warm-200">
          <Lightbulb className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-warm-800">
              Suggestion {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="mt-1 text-[15px] font-semibold leading-snug tracking-tight">
            {recommendation.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {recommendation.body}
          </p>
        </div>
      </div>
    </div>
  );
}
