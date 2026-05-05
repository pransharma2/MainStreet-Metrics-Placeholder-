import { FileWarning, Table2, FileQuestion, Inbox } from "lucide-react";

const pains = [
  {
    icon: FileWarning,
    title: "Exports are messy",
    body: "Mixed date formats, missing SKUs, weird column names — every store exports data a little differently.",
  },
  {
    icon: Table2,
    title: "Spreadsheets break",
    body: "Formulas drift, tabs multiply, and the \"one source of truth\" ends up stuck on one person's laptop.",
  },
  {
    icon: FileQuestion,
    title: "Reports feel too generic",
    body: "Built-in dashboards from big platforms never quite answer the question you're actually asking.",
  },
  {
    icon: Inbox,
    title: "You need answers, not more tabs",
    body: "You're running a business, not a data team. You want to know what to do next — not where to find cell F27.",
  },
];

export function Pain() {
  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            The problem
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Your sales data should not feel like homework.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Small shops collect sales from Shopify, Square, Etsy, spreadsheets,
            and the register — and none of it talks to each other. Here&apos;s
            where most owners get stuck.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pains.map((p) => (
            <div
              key={p.title}
              className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white p-6 shadow-soft transition-shadow hover:shadow-card"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-warm-50 text-warm-700 ring-1 ring-warm-200">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold tracking-tight">
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
