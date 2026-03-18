import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

export async function getServerUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getLinkBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("links_tbl")
    .select("id, destination_url")
    .eq("slug", slug)
    .maybeSingle();
  return { data, error };
}

/**
 * Atomically inserts an analytics row unless a recent duplicate exists,
 * delegating dedup logic to a Supabase SQL function.
 */
export async function createAnalyticsIfNotDuplicate(linkId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc(
      "create_analytics_if_not_duplicate",
      { link_id_input: linkId },
    );
    return { error };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { error };
  }
}

export async function createAnalytics(linkId: string) {
  return createAnalyticsIfNotDuplicate(linkId);
}
