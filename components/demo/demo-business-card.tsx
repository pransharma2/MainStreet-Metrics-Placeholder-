import Link from "next/link";
import { ArrowRight, ShoppingBag, Coffee, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DemoSummary } from "@/lib/demo-data";

const ICONS: Record<DemoSummary["slug"], React.ComponentType<{ className?: string }>> = {
  boutique: ShoppingBag,
  cafe: Coffee,
  etsy: Sparkles,
};

const ACCENT_CLASSES: Record<DemoSummary["accent"], string> = {
  brand: "bg-brand-50 text-brand-800 ring-brand-200",
  warm: "bg-warm-100 text-warm-800 ring-warm-200",
  neutral: "bg-muted text-foreground ring-border",
};

export function DemoBusinessCard({ summary }: { summary: DemoSummary }) {
  const Icon = ICONS[summary.slug];
  return (
    <Link
      href={`/demo/${summary.slug}`}
      className="group block focus:outline-none"
      aria-label={`View ${summary.headline} demo dashboard`}
    >
      <Card className="h-full overflow-hidden transition-all group-hover:-translate-y-[2px] group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-brand-500">
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-brand-50 via-white to-warm-50">
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-warm-200/50 blur-3xl" />
          <div className="relative flex h-full items-start justify-between p-4">
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 shadow-soft ${ACCENT_CLASSES[summary.accent]}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <Badge variant="outline" className="bg-white/70 backdrop-blur">
              {summary.business.industry}
            </Badge>
          </div>
        </div>
        <CardHeader className="space-y-1">
          <CardTitle className="font-display text-lg">{summary.headline}</CardTitle>
          <CardDescription>{summary.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Monthly revenue
              </dt>
              <dd className="mt-1 font-display text-lg font-semibold">
                {summary.monthlyRevenue}
              </dd>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {summary.topItemLabel}
              </dt>
              <dd className="mt-1 truncate text-sm font-medium" title={summary.topItemValue}>
                {summary.topItemValue}
              </dd>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Orders
              </dt>
              <dd className="mt-1 text-sm font-medium">{summary.ordersLabel}</dd>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Customers
              </dt>
              <dd className="mt-1 text-sm font-medium">{summary.customersLabel}</dd>
            </div>
          </dl>
          <div className="flex items-center justify-between pt-1 text-sm font-medium text-brand-700">
            <span>View demo dashboard</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
