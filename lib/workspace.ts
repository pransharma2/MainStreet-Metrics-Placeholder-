import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActiveSession, BusinessRow, ProfileRow } from "@/lib/types/db";

export type { ActiveSession } from "@/lib/types/db";

/**
 * Loads the current authenticated user and their default business.
 * Redirects to /login if unauthenticated.
 *
 * For Phase 2 MVP: each user has exactly one business (auto-created at signup).
 * Phase 3 can introduce a workspace switcher + cookie-pinned active workspace.
 */
export async function requireActiveSession(): Promise<ActiveSession> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const { data: membership, error: memberError } = await supabase
    .from("business_users")
    .select("business_id, businesses ( id, name, industry, currency, timezone, tagline, created_by, created_at )")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (memberError) {
    console.error("[workspace] membership lookup failed:", memberError);
  }

  const business = (membership?.businesses ?? null) as BusinessRow | null;

  if (!business) {
    // Extremely rare — happens only if the signup auto-provision failed.
    redirect("/login?error=no_workspace");
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      profile: (profile as ProfileRow | null) ?? null,
    },
    business,
  };
}
