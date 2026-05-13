"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Do I need to know data or spreadsheets?",
    a: "No. MainStreet Metrics is designed for business owners who just want clear answers from their sales files. If you can export a CSV from Shopify, Square, Etsy, or Excel, you're set.",
  },
  {
    q: "What files can I upload?",
    a: "CSV and Excel files from tools like Shopify, Square, Etsy, Google Sheets, or other POS systems. We auto-detect your columns and suggest a clean mapping you can adjust.",
  },
  {
    q: "Does this connect directly to Shopify or Square yet?",
    a: "Not yet. The current version starts with exported files, which keeps setup simple and your data in your hands. Direct integrations are planned later.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Each business workspace is isolated, and your dashboard is built only from the files you upload. We never share or train on your data.",
  },
  {
    q: "Can you build the dashboard for me?",
    a: "Yes. The done-for-you Starter, Growth, and Monthly Refresh packages are designed for owners who'd rather send their files and receive a clean dashboard ready to share.",
  },
  {
    q: "Is this for large companies?",
    a: "No. It's built for small businesses — boutiques, cafés, Etsy shops, local retailers, pop-ups, and home businesses — that need simple, useful reporting without a data team.",
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
