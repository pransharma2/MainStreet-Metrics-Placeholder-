import { businessInsights } from "@/lib/sample-data";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, CircleAlert, CircleCheck } from "lucide-react";

const iconFor = (t: (typeof businessInsights)[number]["severity"]) =>
  t === "positive" ? TrendingUp : t === "warning" ? CircleAlert : CircleCheck;

const variantFor = (t: (typeof businessInsights)[number]["severity"]) =>
  t === "positive" ? "success" : t === "warning" ? "warning" : "info";

export function InsightsPreview() {
  const picks = businessInsights.slice(0, 4);
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              Plain-English insights
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Your dashboard explains itself.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Instead of hunting through charts, you get short, practical
              insights written the way a business owner would actually read
              them — with a suggested next step on each one.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                Written in plain language — no jargon, no SQL.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                Every insight comes with a concrete recommendation.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                Data-quality warnings are friendly, not scary.
              </li>
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {picks.map((ins, i) => {
              const Icon = iconFor(ins.severity);
              const tone = variantFor(ins.severity);
              return (
                <div
                  key={ins.id}
                  className="group relative overflow-hidden rounded-2xl border border-border/70 bg-white p-5 shadow-card"
                  style={{ transform: `translateY(${i % 2 ? 10 : 0}px)` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                      <Icon className="h-4 w-4" />
                    </span>
                    <Badge variant={tone as any}>{ins.type.replace(/_/g, " ")}</Badge>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold leading-snug tracking-tight">
                    {ins.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {ins.body}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-medium text-brand-700">
                      {ins.metric}
                    </span>
                    {ins.action && (
                      <span className="text-muted-foreground">
                        {ins.action} →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
