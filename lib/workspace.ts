import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BusinessRow, ProfileRow } from "@/lib/types/db";

export interface ActiveSession {
  user: {
    id: string;
    email: string | null;
    profile: ProfileRow | null;
  };
  business: BusinessRow;
}

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

export function getInitials(name?: string | null, fallbackEmail?: string | null) {
  const src = (name ?? fallbackEmail ?? "").trim();
  if (!src) return "👋";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
