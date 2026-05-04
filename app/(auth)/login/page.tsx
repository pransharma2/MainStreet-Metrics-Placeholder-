"use client";

import { Suspense } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Chrome } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { loginAction, type AuthFormState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="lg" type="submit" disabled={pending}>
      {pending ? "Logging in…" : "Log in"}
    </Button>
  );
}

// Reads ?confirm=... from the URL. Wrapped in a Suspense boundary below so
// static prerendering doesn't bail out of the whole /login page.
function ConfirmEmailNotice() {
  const params = useSearchParams();
  const confirmNotice = params?.get("confirm");
  if (!confirmNotice) return null;
  return (
    <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/70 px-3.5 py-3 text-sm text-brand-900">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
      <span>
        Check your inbox — we sent you a link to confirm your email.
      </span>
    </div>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState<AuthFormState, FormData>(
    loginAction,
    null
  );

  return (
    <Card className="w-full max-w-md p-8">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Log in to your MainStreet Metrics workspace.
        </p>
      </div>

      <Suspense fallback={null}>
        <ConfirmEmailNotice />
      </Suspense>

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
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="#"
              className="text-xs text-brand-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
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
        New to MainStreet Metrics?{" "}
        <Link
          href="/signup"
          className="font-medium text-brand-700 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </Card>
  );
}
