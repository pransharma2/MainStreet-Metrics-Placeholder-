import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "free while in beta",
    description: "For owners who want to try it with a single file.",
    features: [
      "1 business workspace",
      "Up to 3 file uploads",
      "CSV & Excel support",
      "Friendly column mapping",
      "Core dashboard & insights",
    ],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Main Street",
    price: "$29",
    period: "/ month",
    description: "For small shops that want a refreshed dashboard every month.",
    features: [
      "Unlimited uploads",
      "Monthly auto-refresh",
      "Saved mapping templates",
      "PDF exports",
      "Priority support",
    ],
    cta: "Pick Main Street",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Storefront",
    price: "$79",
    period: "/ month",
    description: "For shops selling across 3+ channels who want it weekly.",
    features: [
      "Everything in Main Street",
      "Weekly refresh",
      "Multi-channel reconciliation",
      "Team seats",
      "Custom insights",
    ],
    cta: "Pick Storefront",
    href: "/signup",
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
            Simple pricing, built for small businesses.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free while we're in beta. Upgrade when you're ready for
            scheduled refreshes and more channels.
          </p>
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
      </div>
    </section>
  );
}
