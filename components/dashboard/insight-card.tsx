import { Badge } from "@/components/ui/badge";
import type { BusinessInsight } from "@/lib/sample-data";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  CircleAlert,
  Users,
  Package,
  Store,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<BusinessInsight["type"], React.ComponentType<any>> = {
  revenue_growth: TrendingUp,
  top_product: Package,
  repeat_customer_change: Users,
  slow_moving_product: TrendingDown,
  seasonality: Calendar,
  channel_performance: Store,
};

export function InsightCard({ insight }: { insight: BusinessInsight }) {
  const Icon = iconMap[insight.type] ?? Sparkles;

  const tone =
    insight.severity === "positive"
      ? { ring: "ring-emerald-100", bg: "bg-emerald-50", icon: "text-emerald-700" }
      : insight.severity === "warning"
      ? { ring: "ring-amber-100", bg: "bg-amber-50", icon: "text-amber-700" }
      : { ring: "ring-sky-100", bg: "bg-sky-50", icon: "text-sky-700" };

  const ToneIcon =
    insight.severity === "warning" ? CircleAlert : Icon;

  const badgeVariant =
    insight.severity === "positive"
      ? "success"
      : insight.severity === "warning"
      ? "warning"
      : "info";

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white p-5 shadow-soft transition-shadow hover:shadow-card">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1",
            tone.bg,
            tone.ring
          )}
        >
          <ToneIcon className={cn("h-[18px] w-[18px]", tone.icon)} />
        </span>
        <Badge variant={badgeVariant as any}>
          {insight.type.replace(/_/g, " ")}
        </Badge>
      </div>

      <h3 className="mt-4 text-[15px] font-semibold leading-snug tracking-tight">
        {insight.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {insight.body}
      </p>

      <div className="mt-auto flex items-center justify-between pt-5 text-xs">
        {insight.metric && (
          <span className="font-medium text-brand-700">{insight.metric}</span>
        )}
        {insight.action && (
          <span className="text-muted-foreground transition-colors group-hover:text-foreground">
            {insight.action} →
          </span>
        )}
      </div>
    </div>
  );
}
