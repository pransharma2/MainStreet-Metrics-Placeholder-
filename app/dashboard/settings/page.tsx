import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoBusiness } from "@/lib/sample-data";

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Settings"
      description="Manage your workspace, team, and preferences."
    >
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_2fr]">
        <nav className="rounded-2xl border border-border/70 bg-white p-3 text-sm shadow-soft">
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
                  : "text-muted-foreground hover:bg-muted")
              }
            >
              {n.label}
            </div>
          ))}
        </nav>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business profile</CardTitle>
              <CardDescription>
                This shapes how we describe your dashboard and insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Business name</Label>
                  <Input defaultValue={demoBusiness.name} />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Input defaultValue={demoBusiness.industry} />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input defaultValue={demoBusiness.currency} />
                </div>
                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Input defaultValue={demoBusiness.timezone} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tagline</Label>
                <Input defaultValue={demoBusiness.tagline} />
              </div>
              <div className="flex justify-end">
                <Button>Save changes</Button>
              </div>
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
                { name: "Shopify API", status: "Coming soon", variant: "outline" },
                { name: "Google Sheets", status: "Coming soon", variant: "outline" },
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
              <CardTitle>Danger zone</CardTitle>
              <CardDescription>
                Clear sample data or delete this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Deleting is permanent. We recommend exporting your dashboards first.
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Clear sample data</Button>
                <Button variant="destructive">Delete workspace</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
