import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter Dashboard",
    price: "$99",
    period: "one-time",
    description: "For owners who want to test the idea with a single file.",
    features: [
      "We clean one sales export",
      "Basic revenue & product dashboard",
      "Top 5 plain-English insights",
      "Ready in under 48 hours",
    ],
    cta: "View demo dashboard",
    href: "/demo",
    highlight: false,
  },
  {
    name: "Growth Dashboard",
    price: "$299",
    period: "one-time",
    description: "For shops juggling a few channels that need the full picture.",
    features: [
      "Up to 3 sales exports combined",
      "Revenue, product, customer & channel analysis",
      "Full plain-English insight report",
      "One round of revisions included",
    ],
    cta: "Request a Growth Dashboard",
    href: "/request-dashboard",
    highlight: true,
  },
  {
    name: "Monthly Refresh",
    price: "from $49",
    period: "/ month",
    description: "For businesses that want a fresh dashboard every month.",
    features: [
      "Monthly dashboard refresh",
      "Updated insights every month",
      "Ongoing support & mapping tweaks",
      "Cancel any time",
    ],
    cta: "Request Monthly Refresh",
    href: "/request-dashboard",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Pricing preview
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Done-for-you dashboards, priced for small shops.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Send us your sales files — we&apos;ll send back a clean dashboard
            with plain-English insights.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-xs font-medium text-warm-800">
            <Sparkles className="h-3.5 w-3.5" />
            Early pricing while MainStreet Metrics is in beta
          </div>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={cn(
                "relative flex flex-col rounded-3xl border bg-white p-7",
                t.highlight
                  ? "border-brand-300 shadow-glow ring-1 ring-brand-200"
                  : "border-border/70 shadow-soft"
              )}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-soft">
                  Most popular
                </div>
              )}
              <div className="text-sm font-semibold text-foreground">
                {t.name}
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold tracking-tight">
                  {t.price}
                </span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.description}
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Button
                  variant={t.highlight ? "default" : "secondary"}
                  className="w-full"
                  asChild
                >
                  <Link href={t.href}>{t.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prefer to try it yourself first?{" "}
          <Link href="/signup" className="font-medium text-brand-700 hover:underline">
            Start free
          </Link>{" "}
          and upload your own file — no credit card.
        </p>
      </div>
    </section>
  );
}
