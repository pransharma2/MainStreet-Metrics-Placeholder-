import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileSpreadsheet, Sparkles, Wand2 } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { LeadForm } from "@/components/leads/lead-form";

export const metadata: Metadata = {
  title: "Request a dashboard · MainStreet Metrics",
  description:
    "MainStreet Metrics is in beta. Tell us about your sales files and we'll help you figure out whether they're a good fit for a dashboard.",
};

const STEPS = [
  {
    icon: FileSpreadsheet,
    title: "Send a sales export",
    body: "A CSV or Excel file from Shopify, Square, Etsy, or your spreadsheet — whatever you already have.",
  },
  {
    icon: Wand2,
    title: "We clean and map the data",
    body: "We figure out your columns, fix the messy bits, and keep your numbers consistent.",
  },
  {
    icon: Sparkles,
    title: "You get a dashboard and report",
    body: "A polished dashboard with plain-English insights and a printable report you can share.",
  },
];

const SERVICE_PREVIEW = [
  {
    name: "Starter Dashboard",
    blurb: "One sales export, basic dashboard, top 5 insights.",
  },
  {
    name: "Growth Dashboard",
    blurb: "Up to 3 exports combined, full dashboard, plain-English report.",
  },
  {
    name: "Monthly Refresh",
    blurb: "Fresh dashboard every month, ongoing mapping support.",
  },
];

export default function RequestDashboardPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-grid-soft [background-size:32px_32px] mask-fade-b" />
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[360px] w-[700px] -translate-x-1/2 rounded-full bg-brand-200/30 blur-3xl" />

          <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-xs font-medium text-warm-800">
                <Sparkles className="h-3.5 w-3.5" />
                MainStreet Metrics is in beta
              </div>
              <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                Want a dashboard built from your sales files?
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Tell us a bit about your business, and we&apos;ll help you
                figure out whether your sales exports are a good fit.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                No complicated setup. No data team needed. Start with a CSV or
                Excel export.
              </p>
            </div>

            <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
              <LeadForm sourcePage="/request-dashboard" />

              <aside className="space-y-6">
                <div className="rounded-3xl border border-border/70 bg-white p-6 shadow-soft">
                  <h2 className="font-display text-lg font-semibold tracking-tight">
                    What happens next?
                  </h2>
                  <ol className="mt-4 space-y-4">
                    {STEPS.map((step, i) => {
                      const Icon = step.icon;
                      return (
                        <li key={step.title} className="flex gap-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Step {i + 1}
                            </div>
                            <div className="text-sm font-semibold">
                              {step.title}
                            </div>
                            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                              {step.body}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-warm-50 p-6 shadow-soft">
                  <h2 className="font-display text-lg font-semibold tracking-tight">
                    Service preview
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Early pricing while MainStreet Metrics is in beta.
                  </p>
                  <ul className="mt-4 space-y-3 text-sm">
                    {SERVICE_PREVIEW.map((s) => (
                      <li
                        key={s.name}
                        className="rounded-2xl border border-border/60 bg-white/85 p-3 shadow-soft"
                      >
                        <div className="font-semibold text-foreground">
                          {s.name}
                        </div>
                        <p className="mt-0.5 text-muted-foreground">{s.blurb}</p>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/#pricing"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    See full pricing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
