import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireActiveSession } from "@/lib/workspace";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Button } from "@/components/ui/button";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: { redo?: string };
}) {
  const session = await requireActiveSession();

  // If they've already completed onboarding and didn't ask to redo it, send
  // them back to the dashboard. The settings page is the right place to edit
  // these fields after the fact.
  if (session.business.onboarded_at && searchParams?.redo !== "1") {
    redirect("/dashboard/settings");
  }

  const business = session.business;

  return (
    <DashboardShell
      title="Let's get your dashboard set up"
      description="A few quick questions so we can tailor your numbers and recommendations."
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-warm-50 p-6 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-200 shadow-soft">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-brand-900">
                Welcome{session.user.profile?.full_name
                  ? `, ${session.user.profile.full_name.split(" ")[0]}`
                  : ""}
                .
              </div>
              <p className="mt-1 text-sm text-brand-900/80">
                This takes about a minute. None of these answers lock you in —
                you can update everything later from Settings.
              </p>
            </div>
          </div>
        </div>

        <OnboardingForm
          defaults={{
            name: business.name ?? "",
            industry: business.industry ?? "",
            currency: business.currency ?? "USD",
            timezone: business.timezone ?? "America/Chicago",
            tagline: business.tagline ?? "",
            main_source: business.main_source ?? "",
            primary_goal: business.primary_goal ?? "",
          }}
        />

        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            You can edit anything later in Settings.
          </span>
        </div>
      </div>
    </DashboardShell>
  );
}
