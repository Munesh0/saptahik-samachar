import { createBrowserClient } from "@supabase/ssr";
import { normalizeSupabaseUrl } from "./url";

export const createClient = () =>
  createBrowserClient(
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || ""),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
