import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, FileUp, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoShell } from "@/components/demo/demo-shell";
import { DemoBusinessCard } from "@/components/demo/demo-business-card";
import { demoSummaries } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Live demos · MainStreet Metrics",
  description:
    "Explore example dashboards for a boutique, a café, and an Etsy-style handmade shop — no signup required.",
};

export default function DemoIndexPage() {
  return (
    <DemoShell
      title="Choose a sample business"
      description="Pick the one closest to yours to explore a full dashboard — built from a realistic, messy sales export. No signup, no setup."
      backHref="/"
      backLabel="Back to home"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {demoSummaries.map((s) => (
          <DemoBusinessCard key={s.slug} summary={s} />
        ))}
      </div>

      <section className="mt-12 overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-warm-50 p-8 shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to see your own numbers?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Upload a CSV or Excel export from Shopify, Square, Etsy, or a
              spreadsheet. We&apos;ll clean your columns and build a dashboard like
              these — usually in under a minute.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  <FileUp className="h-4 w-4" />
                  Try it with your own sales file
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/request-dashboard">
                  <CalendarClock className="h-4 w-4" />
                  Get a dashboard built for you
                </Link>
              </Button>
            </div>
          </div>
          <ul className="space-y-3 rounded-2xl border border-border/60 bg-white/80 p-5 shadow-soft backdrop-blur">
            {[
              "No credit card — free to try",
              "Your data stays private in your workspace",
              "Works with messy, real-world exports",
              "Plain-English insights, not charts to decode",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm">
                <Sparkles className="mt-0.5 h-4 w-4 text-brand-600" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </DemoShell>
  );
}
