import "server-only";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { env, requireServiceRoleKey } from "@/lib/env";

/**
 * Privileged Supabase client — bypasses RLS.
 *
 * SECURITY: This MUST only be imported from Server Actions / Route Handlers
 * (the `server-only` import will fail the build if a client component
 * accidentally imports it).
 *
 * Use cases: creating the default business + membership immediately after
 * a new user signs up (before they have RLS-visible rows).
 */
export function createAdminClient() {
  return createServiceClient(env.SUPABASE_URL, requireServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
