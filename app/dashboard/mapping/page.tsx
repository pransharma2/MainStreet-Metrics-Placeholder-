import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { UploadCloud } from "lucide-react";

/**
 * Base `/dashboard/mapping` route:
 *   - If the user has uploads, send them to the most recent one's mapping.
 *   - Otherwise, show a friendly empty state.
 */
export default async function MappingLandingPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("file_uploads")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data?.id) {
    redirect(`/dashboard/mapping/${data.id}`);
  }

  return (
    <DashboardShell
      title="Column mapping"
      description="Upload a file first, and we'll suggest a clean mapping."
    >
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-border/80 bg-white p-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-200">
          <UploadCloud className="h-6 w-6" />
        </span>
        <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
          Nothing to map yet
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a CSV or Excel file and we'll suggest how to map your columns
          to our standard fields.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard/upload">Upload a file</Link>
        </Button>
      </div>
    </DashboardShell>
  );
}
