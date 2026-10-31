import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client initialized with the service role key.
 * Used exclusively for administrative operations (such as creating/inviting staff users).
 * Never exposed to browser or client code.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
