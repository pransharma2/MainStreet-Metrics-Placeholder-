"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Check, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { signupAction, type AuthFormState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="lg" type="submit" disabled={pending}>
      {pending ? "Creating your workspace…" : "Create workspace"}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState<AuthFormState, FormData>(
    signupAction,
    null
  );

  return (
    <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div className="order-2 lg:order-1">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Create your workspace
            </h1>
            <p className="text-sm text-muted-foreground">
              Free while we're in beta. No credit card required.
            </p>
          </div>

          {state?.error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-3 text-sm text-red-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Your name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  autoComplete="name"
                  placeholder="Ava Monroe"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  required
                  placeholder="Willow & Sage Boutique"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@shop.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>

            <SubmitButton />
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            <span>or</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            type="button"
            disabled
            title="Coming soon"
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Soon
            </span>
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-brand-700 hover:underline"
            >
              Log in
            </Link>
          </p>
        </Card>
      </div>

      <div className="order-1 lg:order-2">
        <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-white to-muted/40 p-8 shadow-soft">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Why small shops choose us
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
            A dashboard without the data project.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You sell. We clean up the sales files, standardize the columns, and
            show you the numbers that matter — in plain English.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "No SQL or spreadsheet wrangling",
              "Auto-detect columns from your exports",
              "Friendly warnings, not scary errors",
              "Your data stays in your workspace, always",
            ].map((x) => (
              <li key={x} className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-foreground/80">{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
