"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  INDUSTRY_OPTIONS,
  SOURCE_OPTIONS,
} from "@/lib/onboarding-options";
import { submitLeadAction, type LeadFormState } from "@/app/request-dashboard/actions";

const MONTHLY_ORDERS_OPTIONS = [
  "Under 50",
  "50 to 250",
  "250 to 1,000",
  "1,000+",
  "Not sure",
] as const;

const LEAD_GOAL_OPTIONS = [
  "Understand revenue trends",
  "Find top products",
  "Understand repeat customers",
  "Track sales by channel",
  "Clean messy sales files",
  "Get a simple business report",
  "Done-for-you dashboard setup",
] as const;

const SELECT_CLASSES =
  "flex h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:border-brand-400";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="min-w-[220px]">
      {pending ? "Sending your request…" : "Request dashboard setup"}
    </Button>
  );
}

export function LeadForm({ sourcePage = "/request-dashboard" }: { sourcePage?: string }) {
  const [state, formAction] = useFormState<LeadFormState, FormData>(
    submitLeadAction,
    null
  );

  if (state?.ok) {
    return (
      <Card className="border-brand-200 bg-gradient-to-br from-brand-50/70 via-white to-warm-50/40">
        <CardContent className="flex flex-col items-start gap-4 p-8 sm:p-10">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-700 ring-1 ring-brand-200 shadow-soft">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Thanks, we got your request.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              We&apos;ll follow up by email with next steps and what kind of
              sales file to send. Most replies go out within a business day.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            We&apos;ll only use this information to follow up about MainStreet
            Metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="source_page" value={sourcePage} />
      {/* Honeypot — real visitors will not see or fill this. */}
      <div aria-hidden="true" className="sr-only" tabIndex={-1}>
        <label>
          Company website (leave blank)
          <input
            type="text"
            name="company_url"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tell us a bit about you</CardTitle>
          <CardDescription>
            Just the basics so we can write back. Everything else is optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Your name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Jordan Lee"
                aria-invalid={fieldErrors.name ? "true" : undefined}
                autoComplete="name"
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-700">{fieldErrors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email <span className="text-red-600">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jordan@yourbusiness.com"
                aria-invalid={fieldErrors.email ? "true" : undefined}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-700">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="business_name">Business name</Label>
              <Input
                id="business_name"
                name="business_name"
                placeholder="Willow & Sage Boutique"
                autoComplete="organization"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="business_type">Business type</Label>
              <select
                id="business_type"
                name="business_type"
                defaultValue=""
                className={SELECT_CLASSES}
              >
                <option value="">Pick one (optional)</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your sales setup</CardTitle>
          <CardDescription>
            This helps us know what kind of file to expect. You can change any
            answer when you write back.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sales_source">Main sales source</Label>
              <select
                id="sales_source"
                name="sales_source"
                defaultValue=""
                className={SELECT_CLASSES}
              >
                <option value="">Pick one (optional)</option>
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estimated_monthly_orders">
                Estimated monthly orders
              </Label>
              <select
                id="estimated_monthly_orders"
                name="estimated_monthly_orders"
                defaultValue=""
                className={SELECT_CLASSES}
              >
                <option value="">Pick one (optional)</option>
                {MONTHLY_ORDERS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal">Main goal</Label>
            <select
              id="goal"
              name="goal"
              defaultValue=""
              className={SELECT_CLASSES}
            >
              <option value="">Pick one (optional)</option>
              {LEAD_GOAL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              We&apos;ll lead with this when we send back your dashboard.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Anything else we should know?</Label>
            <textarea
              id="message"
              name="message"
              rows={4}
              maxLength={1000}
              placeholder="Tell us what kind of sales files you have or what you want help understanding."
              className="flex w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:border-brand-400"
              aria-invalid={fieldErrors.message ? "true" : undefined}
            />
            {fieldErrors.message && (
              <p className="text-xs text-red-700">{fieldErrors.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
          We&apos;ll only use this information to follow up about MainStreet
          Metrics.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
