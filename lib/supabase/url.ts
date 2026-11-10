/** The Supabase SDK expects the project URL and appends its own API paths. */
export function normalizeSupabaseUrl(value: string): string {
  return value.trim().replace(/(?:\/rest\/v1)+\/*$|\/+$/g, "");
}
