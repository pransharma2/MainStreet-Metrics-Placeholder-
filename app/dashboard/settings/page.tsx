import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireActiveSession } from "@/lib/workspace";
import { BusinessProfileForm } from "@/components/settings/business-profile-form";

export default async function SettingsPage() {
  const session = await requireActiveSession();
  const business = session.business;

  return (
    <DashboardShell
      title="Settings"
      description="Update your business profile and preferences."
    >
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_2fr]">
        <nav className="rounded-2xl border border-border/70 bg-white p-3 text-sm shadow-soft h-fit">
          {[
            { label: "Business", active: true },
            { label: "Team" },
            { label: "Sources & connections" },
            { label: "Mapping templates" },
            { label: "Notifications" },
            { label: "Billing" },
          ].map((n) => (
            <div
              key={n.label}
              className={
                "rounded-xl px-3 py-2.5 " +
                (n.active
                  ? "bg-brand-50 text-brand-800 font-medium"
                  : "text-muted-foreground")
              }
            >
              {n.label}
              {!n.active && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Soon
                </span>
              )}
            </div>
          ))}
        </nav>

        <div className="space-y-6">
          {!business.onboarded_at && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 px-5 py-4 text-sm text-brand-900">
              <span>
                You haven't finished onboarding yet — it only takes a minute and
                helps us tailor your dashboard.
              </span>
              <Button asChild size="sm" variant="subtle">
                <Link href="/dashboard/onboarding">
                  Finish onboarding
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Business profile</CardTitle>
              <CardDescription>
                This shapes how we describe your dashboard, reports, and
                recommendations. Changes save to this workspace only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessProfileForm
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected sources</CardTitle>
              <CardDescription>
                Upload-based for now. Direct connectors coming soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Shopify CSV exports", status: "Active", variant: "success" },
                { name: "Square CSV exports", status: "Active", variant: "success" },
                { name: "Etsy CSV exports", status: "Active", variant: "success" },
                { name: "Excel & Google Sheets", status: "Active", variant: "success" },
                { name: "Shopify API", status: "Coming soon", variant: "outline" },
                { name: "Square API", status: "Coming soon", variant: "outline" },
              ].map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
                >
                  <div className="text-sm font-medium">{r.name}</div>
                  <Badge variant={r.variant as any}>{r.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Signed in as{" "}
                <span className="font-medium text-foreground">
                  {session.user.email ?? "your account"}
                </span>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Need to delete your workspace or transfer ownership?{" "}
              <a
                href="mailto:hello@mainstreetmetrics.app"
                className="font-medium text-brand-700 hover:underline"
              >
                Email us
              </a>{" "}
              and we'll take care of it. We keep this gated to a real conversation
              while we're in beta.
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
