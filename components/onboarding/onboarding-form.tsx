"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Building2, Check, Compass, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  CURRENCY_OPTIONS,
  GOAL_OPTIONS,
  INDUSTRY_OPTIONS,
  SOURCE_OPTIONS,
} from "@/lib/onboarding-options";
import {
  completeOnboardingAction,
  type ProfileFormState,
} from "@/app/dashboard/onboarding/actions";

type Defaults = {
  name: string;
  industry: string;
  currency: string;
  timezone: string;
  tagline: string;
  main_source: string;
  primary_goal: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="min-w-[180px]">
      {pending ? "Saving your profile…" : "Finish setup"}
    </Button>
  );
}

function SectionCard({
  step,
  icon,
  title,
  description,
  children,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            {icon}
          </span>
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Step {step}
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
        </div>
        <CardDescription className="pt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

export function OnboardingForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction] = useFormState<ProfileFormState, FormData>(
    completeOnboardingAction,
    null
  );

  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Step 1 — Business basics */}
      <SectionCard
        step={1}
        icon={<Building2 className="h-5 w-5" />}
        title="Business basics"
        description="The essentials we use to label your dashboard and reports."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Business name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={defaults.name}
              placeholder="Willow & Sage Boutique"
              aria-invalid={fieldErrors.name ? "true" : undefined}
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-700">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="industry">What kind of business is this?</Label>
            <select
              id="industry"
              name="industry"
              defaultValue={defaults.industry}
              className="flex h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:border-brand-400"
            >
              <option value="">Pick one (optional)</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              name="currency"
              defaultValue={defaults.currency || "USD"}
              className="flex h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:border-brand-400"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              name="timezone"
              defaultValue={defaults.timezone || "America/Chicago"}
              placeholder="America/Chicago"
            />
            <p className="text-xs text-muted-foreground">
              Used to label your daily and monthly numbers.
            </p>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="tagline">One-line description (optional)</Label>
            <Input
              id="tagline"
              name="tagline"
              defaultValue={defaults.tagline}
              placeholder="A small-batch boutique in Austin, TX"
              maxLength={160}
            />
          </div>
        </div>
      </SectionCard>

      {/* Step 2 — Sales source */}
      <SectionCard
        step={2}
        icon={<Receipt className="h-5 w-5" />}
        title="Where do your sales come from?"
        description="Tells us what kind of CSV or Excel file to expect first. You can change this anytime."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {SOURCE_OPTIONS.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-white px-3.5 py-3 text-sm shadow-soft transition-colors hover:bg-muted/40 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/60 has-[:checked]:text-brand-900"
            >
              <input
                type="radio"
                name="main_source"
                value={opt}
                defaultChecked={defaults.main_source === opt}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="font-medium">{opt}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Step 3 — What do you want to learn? */}
      <SectionCard
        step={3}
        icon={<Compass className="h-5 w-5" />}
        title="What do you want to learn first?"
        description="We'll lead with this insight on your dashboard. Pick whichever feels most useful."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {GOAL_OPTIONS.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-white px-3.5 py-3 text-sm shadow-soft transition-colors hover:bg-muted/40 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/60 has-[:checked]:text-brand-900"
            >
              <input
                type="radio"
                name="primary_goal"
                value={opt}
                defaultChecked={defaults.primary_goal === opt}
                className="mt-0.5 h-4 w-4 accent-brand-600"
              />
              <span className="font-medium leading-snug">{opt}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Step 4 — Finish setup */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
            <div className="flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Step 4
              </div>
              <CardTitle>Finish setup</CardTitle>
            </div>
          </div>
          <CardDescription className="pt-1">
            We'll save your profile and take you back to your dashboard. Up next:
            upload your first sales file.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Don't worry about getting every field perfect — you can change any
            answer later from <span className="font-medium text-foreground">Settings</span>.
          </p>
          <SubmitButton />
        </CardContent>
      </Card>
    </form>
  );
}
