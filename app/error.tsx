"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Unhandled app error:", error);
    }
  }, [error]);

  return (
    <main className="relative isolate flex min-h-screen flex-col bg-background">
      <div className="absolute inset-0 -z-10 bg-dots opacity-60" aria-hidden />
      <div className="mx-auto w-full max-w-[1200px] px-5 pt-8 sm:px-6 lg:px-8">
        <Logo />
      </div>

      <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center px-5 pb-16 text-center sm:px-6">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-50 text-warm-700 ring-1 ring-inset ring-warm-100">
          <LifeBuoy className="h-7 w-7" strokeWidth={2} />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-warm-700">
          Something went sideways
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          We hit an unexpected snag.
        </h1>
        <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground">
          The page didn't load the way it should. You can try again, or head
          back to safe ground while we look into it.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => reset()}>
            Try again
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/">Back to home</Link>
          </Button>
        </div>

        {error.digest ? (
          <p className="mt-10 text-xs text-muted-foreground">
            Reference code:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
              {error.digest}
            </code>
          </p>
        ) : null}

        <p className="mt-3 text-sm text-muted-foreground">
          Need a hand?{" "}
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
