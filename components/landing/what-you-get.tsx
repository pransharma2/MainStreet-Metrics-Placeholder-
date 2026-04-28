import {
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Calendar,
  Lightbulb,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Revenue you can actually trust",
    body: "Net revenue, refunds, taxes, and shipping are all accounted for. We clean the math so your numbers match reality.",
  },
  {
    icon: Package,
    title: "Product performance at a glance",
    body: "Know which products drive revenue, which sell most, and which are quietly sitting on the shelf.",
  },
  {
    icon: Users,
    title: "Customer & repeat insights",
    body: "See new vs. returning buyers, VIP customers, and how much loyal shoppers actually contribute each month.",
  },
  {
    icon: Calendar,
    title: "Your strongest days & months",
    body: "Find out when to staff up, when to promote, and when to rest — based on your real sales patterns.",
  },
  {
    icon: AlertTriangle,
    title: "Inventory and slow-mover alerts",
    body: "We flag products that have gone quiet, so you can bundle, promote, or mark them down before they become dead stock.",
  },
  {
    icon: Lightbulb,
    title: "Plain-English recommendations",
    body: "Every chart comes with a short, useful sentence: what happened, what to do, and why it matters.",
  },
];

export function WhatYouGet() {
  return (
    <section
      id="what-you-get"
      className="scroll-mt-24 bg-muted/30 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            What you get
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            A dashboard that tells you what to do next.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Not another spreadsheet. A focused view designed around the
            questions a small business owner actually asks.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/70 bg-white p-6 shadow-soft transition-shadow hover:shadow-card"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
