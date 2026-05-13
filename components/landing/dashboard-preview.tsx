import Link from "next/link";
import { ArrowRight, CircleDollarSign, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardPreview() {
  return (
    <section id="preview" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            A closer look
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Your dashboard, at a glance.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Designed to answer real questions — what sold, who came back, and
            what to do next.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[32px] bg-gradient-to-b from-brand-200/30 via-transparent to-transparent blur-2xl" />
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-white shadow-[0_40px_80px_-30px_rgba(16,24,40,0.25)]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <div className="mx-auto flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] text-muted-foreground shadow-soft">
                <Store className="h-3 w-3" />
                mainstreetmetrics.app / willow-sage
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[260px_1fr]">
              {/* Mini-sidebar */}
              <aside className="hidden rounded-2xl border border-border/70 bg-muted/30 p-4 lg:block">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Willow & Sage
                </div>
                <nav className="mt-4 flex flex-col gap-1 text-sm">
                  {[
                    "Overview",
                    "Sales",
                    "Products",
                    "Customers",
                    "Uploads",
                    "Insights",
                  ].map((x, i) => (
                    <span
                      key={x}
                      className={`rounded-lg px-3 py-2 ${
                        i === 0
                          ? "bg-white font-medium text-brand-700 shadow-soft"
                          : "text-muted-foreground"
                      }`}
                    >
                      {x}
                    </span>
                  ))}
                </nav>
              </aside>

              {/* Content */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { k: "Revenue", v: "$84,210", t: "+12.4%" },
                    { k: "Orders", v: "1,284", t: "+6.8%" },
                    { k: "AOV", v: "$65.58", t: "+7.4%" },
                    { k: "Repeat rate", v: "22.7%", t: "+3.2%" },
                  ].map((m) => (
                    <div
                      key={m.k}
                      className="rounded-xl border border-border/70 bg-white p-3"
                    >
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {m.k}
                      </div>
                      <div className="mt-1 font-display text-xl font-semibold tracking-tight">
                        {m.v}
                      </div>
                      <div className="mt-1 text-[11px] font-medium text-emerald-600">
                        {m.t}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fake chart */}
                <div className="rounded-2xl border border-border/70 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      Revenue — last 30 days
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CircleDollarSign className="h-3.5 w-3.5" />
                      Net revenue
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 600 160"
                    className="mt-4 h-40 w-full"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,120 C40,100 80,110 120,95 C160,78 200,82 240,70 C280,58 320,70 360,55 C400,42 440,55 480,38 C520,22 560,30 600,12 L600,160 L0,160 Z"
                      fill="url(#g1)"
                    />
                    <path
                      d="M0,120 C40,100 80,110 120,95 C160,78 200,82 240,70 C280,58 320,70 360,55 C400,42 440,55 480,38 C520,22 560,30 600,12"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-white p-5">
                    <div className="text-sm font-semibold">Top products</div>
                    <ul className="mt-3 space-y-2 text-sm">
                      {[
                        ["Linen Midi Dress", "$11,204"],
                        ["Sage Cable Knit", "$9,460"],
                        ["Everyday Tote", "$7,120"],
                      ].map(([n, v]) => (
                        <li
                          key={n}
                          className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
                        >
                          <span>{n}</span>
                          <span className="font-medium">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Users className="h-4 w-4 text-brand-700" />
                      Customers
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                      {[
                        ["New", "992"],
                        ["Returning", "291"],
                        ["VIP", "74"],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-lg bg-muted/40 py-3 text-xs"
                        >
                          <div className="font-display text-lg font-semibold">
                            {v}
                          </div>
                          <div className="text-muted-foreground">{k}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link href="/demo">
                Open the full demo dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
