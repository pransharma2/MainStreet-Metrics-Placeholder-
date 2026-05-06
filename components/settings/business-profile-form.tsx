"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  CURRENCY_OPTIONS,
  GOAL_OPTIONS,
  INDUSTRY_OPTIONS,
  SOURCE_OPTIONS,
  updateBusinessProfileAction,
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

const SELECT_CLASSES =
  "flex h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:border-brand-400";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function BusinessProfileForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction] = useFormState<ProfileFormState, FormData>(
    updateBusinessProfileAction,
    null
  );

  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.ok && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/60 px-3.5 py-3 text-sm text-brand-900"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
          <span>Saved. Your dashboard will reflect this on the next refresh.</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Business name</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={defaults.name}
            aria-invalid={fieldErrors.name ? "true" : undefined}
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-700">{fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="industry">Industry</Label>
          <select
            id="industry"
            name="industry"
            defaultValue={defaults.industry}
            className={SELECT_CLASSES}
          >
            <option value="">Not set</option>
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
            className={SELECT_CLASSES}
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="main_source">Main sales source</Label>
          <select
            id="main_source"
            name="main_source"
            defaultValue={defaults.main_source}
            className={SELECT_CLASSES}
          >
            <option value="">Not set</option>
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="primary_goal">Primary goal</Label>
          <select
            id="primary_goal"
            name="primary_goal"
            defaultValue={defaults.primary_goal}
            className={SELECT_CLASSES}
          >
            <option value="">Not set</option>
            {GOAL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            We lead with this insight on your dashboard.
          </p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            name="tagline"
            defaultValue={defaults.tagline}
            placeholder="A small-batch boutique in Austin, TX"
            maxLength={160}
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <SaveButton />
      </div>
    </form>
  );
}
