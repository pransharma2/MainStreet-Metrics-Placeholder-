"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dismissOnboardingAction } from "@/app/dashboard/onboarding/actions";

export function OnboardingCard({ businessName }: { businessName: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-warm-50 p-5 shadow-soft">
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-200 shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="max-w-2xl">
            <div className="text-sm font-semibold text-brand-900">
              Finish setting up {businessName}.
            </div>
            <p className="mt-1 text-sm text-brand-900/80">
              Tell us a bit about your business so we can label your dashboard,
              tailor recommendations, and lead with the metrics you care about
              most. Takes about a minute.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/onboarding">
              Complete setup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                void dismissOnboardingAction();
              })
            }
            className="text-brand-900/70 hover:text-brand-900"
            aria-label="Dismiss onboarding card"
          >
            <X className="h-4 w-4" />
            {pending ? "Hiding…" : "Skip for now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
