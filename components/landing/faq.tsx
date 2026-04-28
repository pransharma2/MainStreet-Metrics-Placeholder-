"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Do I need a data team or any technical skills?",
    a: "No. If you can export a CSV from Shopify, Square, Etsy, or Excel, you can use MainStreet Metrics. We handle the cleanup, mapping, and math.",
  },
  {
    q: "What file formats can I upload?",
    a: "CSV and Excel today. In the next phase we'll support Google Sheets links and direct connectors for Shopify, Square, and Etsy.",
  },
  {
    q: "What if my columns are named oddly?",
    a: "That's the whole point. We auto-detect columns and suggest a clean mapping. You confirm it once, and we save it for next time.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your uploads belong to your business only. We isolate each workspace and never share or train on your data.",
  },
  {
    q: "How long does it take to get a dashboard?",
    a: "For a single CSV, usually a few minutes. We promise a working dashboard within 48 hours even for messier multi-file setups.",
  },
  {
    q: "Can I use this alongside Power BI or Looker?",
    a: "Yes. Our clean tables (Silver and Gold layers) are designed to plug into any BI tool you want later.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-24 bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            FAQ
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Common questions.
          </h2>
        </div>
        <div className="mt-10 divide-y divide-border/70 overflow-hidden rounded-3xl border border-border/70 bg-white shadow-soft">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-sm font-medium text-foreground sm:text-base">
                  {f.q}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                    open === i && "rotate-180 text-brand-700"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid overflow-hidden transition-all",
                  open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="min-h-0 px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
