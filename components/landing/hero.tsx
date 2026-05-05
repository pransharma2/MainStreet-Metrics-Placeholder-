"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileUp, LineChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-fade" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-grid-soft [background-size:32px_32px] mask-fade-b" />
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-brand-200/30 blur-3xl" />

      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-brand-800 shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            Built for small shops — no data team required
          </div>

          <h1 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Turn messy sales exports into{" "}
            <span className="relative whitespace-nowrap text-brand-700">
              clean dashboards
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 right-0 h-[6px] rounded-full bg-brand-400/50"
              />
            </span>
            .
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Upload your Square, Shopify, Etsy, or Excel sales files. We clean,
            standardize, and explain the data — so you can see what sold, who
            came back, and what to do next.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/demo">
                <LineChart className="h-4 w-4" />
                View demo dashboard
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/dashboard/upload">
                <FileUp className="h-4 w-4" />
                Upload sample file
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Ready in under 48 hours
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Your data stays private
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
