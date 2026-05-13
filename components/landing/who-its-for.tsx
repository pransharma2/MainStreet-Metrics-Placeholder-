import { Coffee, Shirt, Sparkles, Store, Home, Globe2 } from "lucide-react";

const kinds = [
  {
    icon: Shirt,
    title: "Boutiques & retailers",
    body: "Track bestsellers, size runs, and repeat shoppers across in-store and Shopify.",
  },
  {
    icon: Coffee,
    title: "Cafés & bakeries",
    body: "Understand peak hours, day-of-week patterns, and top-selling menu items from Square.",
  },
  {
    icon: Sparkles,
    title: "Etsy & handmade sellers",
    body: "See which listings drive revenue, watch repeat buyers, and catch fees eating your profit.",
  },
  {
    icon: Store,
    title: "Pop-ups & markets",
    body: "Upload CSVs from events, reconcile sales, and compare weekends or locations side-by-side.",
  },
  {
    icon: Home,
    title: "Home businesses",
    body: "A spreadsheet and a Venmo log are enough. We turn them into a real dashboard.",
  },
  {
    icon: Globe2,
    title: "Small online stores",
    body: "Shopify, Squarespace, WooCommerce, Big Cartel — if it exports a CSV, we can read it.",
  },
];

export function WhoItsFor() {
  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Who it&apos;s for
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for businesses that are too busy to wrestle with spreadsheets.
          </h2>
          <p className="mt-4 text-muted-foreground">
            If you sell products and have a spreadsheet (or three), this is for
            you. No data team required.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
