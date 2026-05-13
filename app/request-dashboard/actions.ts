"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type LeadFormState =
  | {
      ok?: boolean;
      error?: string;
      fieldErrors?: Partial<Record<string, string>>;
    }
  | null;

// Strict-but-friendly email pattern. Zod's built-in `.email()` is RFC-permissive
// and lets things like "user@gmail" (no TLD) and "user@.com" through. We want
// the obvious bad cases rejected before a row hits early_access_leads.
//
// Rules enforced by the regex:
//   - exactly one @
//   - no spaces or stray punctuation
//   - local part starts and ends with an alphanumeric
//   - domain label starts and ends with an alphanumeric (no leading dot, no
//     "label-" / "-label", no "..")
//   - a TLD of 2–24 ASCII letters
const EMAIL_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;

const EMAIL_ERROR = "Please enter a valid email address, like owner@example.com.";

const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(120, "That name is a bit long — keep it under 120 characters."),
  email: z
    .string()
    .trim()
    .min(1, EMAIL_ERROR)
    .max(254, EMAIL_ERROR)
    .regex(EMAIL_PATTERN, EMAIL_ERROR)
    .refine((v) => !v.includes(".."), EMAIL_ERROR)
    .transform((v) => v.toLowerCase()),
  business_name: z.string().trim().max(160).optional().or(z.literal("")),
  business_type: z.string().trim().max(80).optional().or(z.literal("")),
  sales_source: z.string().trim().max(80).optional().or(z.literal("")),
  estimated_monthly_orders: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  goal: z.string().trim().max(120).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .max(1000, "Please keep your message under 1,000 characters.")
    .optional()
    .or(z.literal("")),
  source_page: z.string().trim().max(200).optional().or(z.literal("")),
  // Honeypot — real visitors leave this blank. Bots tend to fill every field.
  company_url: z.string().max(0).optional().or(z.literal("")),
});

function nullable(v: string | undefined | null): string | null {
  const s = (v ?? "").toString().trim();
  return s.length > 0 ? s : null;
}

export async function submitLeadAction(
  _prev: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    business_name: formData.get("business_name"),
    business_type: formData.get("business_type"),
    sales_source: formData.get("sales_source"),
    estimated_monthly_orders: formData.get("estimated_monthly_orders"),
    goal: formData.get("goal"),
    message: formData.get("message"),
    source_page: formData.get("source_page"),
    company_url: formData.get("company_url"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.[0];
    return {
      error: issue?.message ?? "Please check the form and try again.",
      fieldErrors: path ? { [path as string]: issue!.message } : undefined,
    };
  }

  // Honeypot tripped — pretend success so bots don't get a useful signal,
  // but never write the row.
  if (parsed.data.company_url && parsed.data.company_url.length > 0) {
    return { ok: true };
  }

  const supabase = createClient();

  // Best-effort capture of who submitted (lets us link a lead back to a
  // signed-in account for follow-up). Anonymous visitors stay anonymous.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertRow = {
    name: parsed.data.name,
    email: parsed.data.email,
    business_name: nullable(parsed.data.business_name),
    business_type: nullable(parsed.data.business_type),
    sales_source: nullable(parsed.data.sales_source),
    estimated_monthly_orders: nullable(parsed.data.estimated_monthly_orders),
    goal: nullable(parsed.data.goal),
    message: nullable(parsed.data.message),
    source_page: nullable(parsed.data.source_page),
    user_id: user?.id ?? null,
  };

  const { error } = await supabase
    .from("early_access_leads")
    .insert(insertRow);

  if (error) {
    console.error("[submitLeadAction] insert failed:", error);
    return {
      error: "We couldn't send your request. Please try again.",
    };
  }

  return { ok: true };
}
