import { createClient as createBrowserSupabaseClient } from "./supabase/client";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id")
);

export const supabase = isSupabaseConfigured
  ? createBrowserSupabaseClient()
  : null;
