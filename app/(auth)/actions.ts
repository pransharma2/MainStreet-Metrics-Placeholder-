"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthFormState = { error?: string } | null;

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z
    .string()
    .min(8, "Your password needs to be at least 8 characters."),
  fullName: z.string().min(1, "Tell us your name.").max(100),
  businessName: z
    .string()
    .min(1, "What should we call your business?")
    .max(120),
});

// Friendly mapping for Supabase auth errors --------------------------------
function friendlyAuthError(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("invalid login")) {
    return "That email and password don't match. Try again, or reset your password.";
  }
  if (s.includes("email not confirmed")) {
    return "Please confirm your email before logging in — we sent you a link.";
  }
  if (s.includes("user already") || s.includes("already registered")) {
    return "An account with that email already exists. Try logging in.";
  }
  if (s.includes("rate limit")) {
    return "Too many attempts for now. Please wait a minute and try again.";
  }
  return "Something went wrong on our side. Please try again.";
}

// --------------------------------------------------------------------------
// Login
// --------------------------------------------------------------------------
export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// --------------------------------------------------------------------------
// Signup  — also provisions a default business + membership.
// --------------------------------------------------------------------------
export async function signupAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    businessName: formData.get("businessName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }
  const { email, password, fullName, businessName } = parsed.data;

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error || !data.user) {
    return {
      error: error ? friendlyAuthError(error.message) : "We couldn't create your account. Please try again.",
    };
  }

  // Provision default business + membership using the service role client
  // (the user's session may not be persisted yet, and RLS would block inserts).
  try {
    const admin = createAdminClient();

    const { data: business, error: bizError } = await admin
      .from("businesses")
      .insert({
        name: businessName,
        created_by: data.user.id,
        industry: "Small business",
      })
      .select("id")
      .single();

    if (bizError || !business) throw bizError ?? new Error("business insert failed");

    const { error: memberError } = await admin.from("business_users").insert({
      business_id: business.id,
      user_id: data.user.id,
      role: "owner",
    });
    if (memberError) throw memberError;
  } catch (err) {
    console.error("[signup] failed to provision default business:", err);
    return {
      error:
        "Your account was created, but we couldn't set up your workspace. Please contact support.",
    };
  }

  // If email confirmation is disabled in Supabase, the user is signed in now.
  // Otherwise, they'll need to confirm. Either way, send them somewhere safe.
  revalidatePath("/", "layout");

  if (data.session) {
    redirect("/dashboard");
  }
  redirect("/login?confirm=1");
}

// --------------------------------------------------------------------------
// Logout
// --------------------------------------------------------------------------
export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
