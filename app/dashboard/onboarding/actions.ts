"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireActiveSession } from "@/lib/workspace";

export type ProfileFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
} | null;

// Allowed values are kept as plain text in the DB so future additions don't
// need a schema migration. We just normalize/whitelist on save.

export const INDUSTRY_OPTIONS = [
  "Boutique",
  "Café / bakery",
  "Etsy / handmade shop",
  "Local retail",
  "Pop-up / market seller",
  "Home business",
  "Online store",
  "Other",
] as const;

export const CURRENCY_OPTIONS = ["USD", "CAD", "GBP", "EUR", "Other"] as const;

export const SOURCE_OPTIONS = [
  "Shopify",
  "Square",
  "Etsy",
  "Excel / spreadsheet",
  "Google Sheets",
  "Other POS",
  "Not sure yet",
] as const;

export const GOAL_OPTIONS = [
  "Understand revenue trends",
  "Find top products",
  "Understand repeat customers",
  "Track sales by channel",
  "Clean messy sales files",
  "Get a simple business report",
] as const;

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter a business name.")
    .max(120, "That name is a bit long — keep it under 120 characters."),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  currency: z.string().trim().max(8).optional().or(z.literal("")),
  timezone: z.string().trim().max(64).optional().or(z.literal("")),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  main_source: z.string().trim().max(80).optional().or(z.literal("")),
  primary_goal: z.string().trim().max(120).optional().or(z.literal("")),
});

function normalize(value: string | undefined | null): string | null {
  const v = (value ?? "").toString().trim();
  return v.length > 0 ? v : null;
}

// ---------------------------------------------------------------------------
// updateBusinessProfileAction
//   - Used by both the onboarding page and the settings page.
//   - Saves whatever fields the user provided; missing fields are left alone.
// ---------------------------------------------------------------------------
export async function updateBusinessProfileAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await requireActiveSession();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry"),
    currency: formData.get("currency"),
    timezone: formData.get("timezone"),
    tagline: formData.get("tagline"),
    main_source: formData.get("main_source"),
    primary_goal: formData.get("primary_goal"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      error: issue?.message ?? "Please check the form and try again.",
      fieldErrors: issue?.path?.[0]
        ? { [issue.path[0] as string]: issue.message }
        : undefined,
    };
  }

  const supabase = createClient();

  const update: Record<string, string | null> = {
    name: parsed.data.name,
    industry: normalize(parsed.data.industry),
    currency: normalize(parsed.data.currency) ?? "USD",
    timezone: normalize(parsed.data.timezone) ?? "America/Chicago",
    tagline: normalize(parsed.data.tagline),
    main_source: normalize(parsed.data.main_source),
    primary_goal: normalize(parsed.data.primary_goal),
  };

  const { error } = await supabase
    .from("businesses")
    .update(update)
    .eq("id", session.business.id);

  if (error) {
    console.error("[updateBusinessProfileAction] failed:", error);
    return {
      error: "We couldn't save your business profile. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/onboarding");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// completeOnboardingAction
//   - Saves the profile fields AND marks onboarded_at = now().
//   - Redirects to /dashboard on success.
// ---------------------------------------------------------------------------
export async function completeOnboardingAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await requireActiveSession();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry"),
    currency: formData.get("currency"),
    timezone: formData.get("timezone"),
    tagline: formData.get("tagline"),
    main_source: formData.get("main_source"),
    primary_goal: formData.get("primary_goal"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      error: issue?.message ?? "Please check the form and try again.",
      fieldErrors: issue?.path?.[0]
        ? { [issue.path[0] as string]: issue.message }
        : undefined,
    };
  }

  const supabase = createClient();

  const update: Record<string, string | null> = {
    name: parsed.data.name,
    industry: normalize(parsed.data.industry),
    currency: normalize(parsed.data.currency) ?? "USD",
    timezone: normalize(parsed.data.timezone) ?? "America/Chicago",
    tagline: normalize(parsed.data.tagline),
    main_source: normalize(parsed.data.main_source),
    primary_goal: normalize(parsed.data.primary_goal),
    onboarded_at: new Date().toISOString(),
    // Clear any previous dismissal so the card stays hidden going forward.
    onboarding_dismissed_at: null,
  };

  const { error } = await supabase
    .from("businesses")
    .update(update)
    .eq("id", session.business.id);

  if (error) {
    console.error("[completeOnboardingAction] failed:", error);
    return {
      error: "We couldn't save your business profile. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard?welcome=1");
}

// ---------------------------------------------------------------------------
// dismissOnboardingAction
//   - Hides the onboarding card without forcing the user to fill it in.
// ---------------------------------------------------------------------------
export async function dismissOnboardingAction(): Promise<void> {
  const session = await requireActiveSession();
  const supabase = createClient();
  const { error } = await supabase
    .from("businesses")
    .update({ onboarding_dismissed_at: new Date().toISOString() })
    .eq("id", session.business.id);

  if (error) {
    // Don't block the user — the dismiss CTA is convenience, not critical.
    console.error("[dismissOnboardingAction] failed:", error);
  }
  revalidatePath("/dashboard");
}
