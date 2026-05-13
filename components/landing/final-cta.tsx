import Link from "next/link";
import { ArrowRight, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-warm-50 p-10 shadow-card sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-warm-200/50 blur-3xl" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to see what your sales data is trying to tell you?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start with a sample dashboard, then upload your own sales file
              when you&apos;re ready. No credit card, no data team.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/demo">
                  <LineChart className="h-4 w-4" />
                  View demo dashboard
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Want us to build it for you?{" "}
              <Link
                href="/request-dashboard"
                className="font-medium text-brand-700 hover:underline"
              >
                Request a dashboard setup
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
