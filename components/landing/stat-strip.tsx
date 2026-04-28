const stats = [
  { value: "48 hrs", label: "From messy file to dashboard" },
  { value: "20+", label: "POS & spreadsheet formats supported" },
  { value: "6 sec", label: "Avg. time to map a CSV" },
  { value: "100%", label: "Your data stays yours" },
];

export function StatStrip() {
  return (
    <section className="border-y border-border/60 bg-gradient-to-b from-white to-muted/30">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
        {stats.map((s) => (
          <div
            key={s.label}
            className="px-5 py-6 text-center sm:px-6 sm:py-7 lg:px-8"
          >
            <div className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {s.value}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
