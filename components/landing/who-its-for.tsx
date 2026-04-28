import { Coffee, Shirt, Sparkles, Store } from "lucide-react";

const kinds = [
  {
    icon: Shirt,
    title: "Boutiques & retail",
    body: "Track bestselling styles, size runs, and repeat shoppers across in-store and Shopify.",
  },
  {
    icon: Coffee,
    title: "Cafés & bakeries",
    body: "Understand your peak hours, day-of-week patterns, and top-selling menu items from Square.",
  },
  {
    icon: Sparkles,
    title: "Handmade & Etsy sellers",
    body: "See which listings drive revenue, watch repeat buyers, and cut fees you didn't realize were eating profit.",
  },
  {
    icon: Store,
    title: "Markets & pop-ups",
    body: "Upload CSVs from events, reconcile sales, and compare performance across locations and weekends.",
  },
];

export function WhoItsFor() {
  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Who it's for
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for the people who run Main Street.
          </h2>
          <p className="mt-4 text-muted-foreground">
            If you sell products and have a spreadsheet (or three), this is for
            you.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kinds.map((k) => (
            <div
              key={k.title}
              className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white p-6 shadow-soft"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-warm-50 text-warm-700 ring-1 ring-warm-200">
                <k.icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold tracking-tight">
                {k.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {k.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
