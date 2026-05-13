import Link from "next/link";
import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found · MainStreet Metrics",
  description:
    "We couldn't find the page you were looking for. Try the live demo or head back home.",
};

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col bg-background">
      <div className="absolute inset-0 -z-10 bg-dots opacity-60" aria-hidden />
      <div className="mx-auto w-full max-w-[1200px] px-5 pt-8 sm:px-6 lg:px-8">
        <Logo />
      </div>

      <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center px-5 pb-16 text-center sm:px-6">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
          <Compass className="h-7 w-7" strokeWidth={2} />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          404 — page not found
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          We couldn't find that page.
        </h1>
        <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground">
          The link may be broken, or the page may have moved. Try the live demo,
          head back to the homepage, or get in touch.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/demo">View the live demo</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/">Back to home</Link>
          </Button>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Still stuck?{" "}
          <a
            href="mailto:hello@mainstreetmetrics.app"
            className="font-medium text-brand-700 underline-offset-4 hover:underline"
          >
            hello@mainstreetmetrics.app
          </a>
        </p>
      </div>
    </main>
  );
}
