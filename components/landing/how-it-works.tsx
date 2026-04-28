import { FileUp, Settings2, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: FileUp,
    badge: "Step 1",
    title: "Upload your sales file",
    body: "Drag and drop a CSV or Excel export from Square, Shopify, Etsy, or your own spreadsheet. We handle messy columns and mixed formats.",
  },
  {
    icon: Settings2,
    badge: "Step 2",
    title: "Review the column mapping",
    body: "We auto-detect your columns and suggest a clean mapping. You confirm or adjust — we save it for next time so uploads are 1-click after that.",
  },
  {
    icon: BarChart3,
    badge: "Step 3",
    title: "Get your dashboard",
    body: "Revenue trends, top products, customer insights, and plain-English recommendations — all waiting for you, no SQL required.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            How it works
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Three simple steps from messy file to clean dashboard.
          </h2>
          <p className="mt-4 text-muted-foreground">
            No migration project. No data team. Just your sales file and a
            dashboard that actually tells you what to do.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-white p-7 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-100/60 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {step.badge}
                </span>
              </div>
              <h3 className="relative mt-5 text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              <div className="relative mt-6 text-xs font-medium text-muted-foreground/80">
                0{i + 1} / 03
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
