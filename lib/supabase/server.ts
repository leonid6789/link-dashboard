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

const ANALYTICS_DEDUP_WINDOW_MS = 2000;

/**
 * Inserts an analytics row unless one already exists for the same link
 * within `ANALYTICS_DEDUP_WINDOW_MS`.
 */
export async function createAnalyticsIfNotDuplicate(linkId: string) {
  try {
    const supabase = await createClient();
    const cutoffIso = new Date(Date.now() - ANALYTICS_DEDUP_WINDOW_MS).toISOString();

    // Lightweight de-duplication: if we already saw this link "very recently",
    // don't add another click row.
    const { data: existingRows, error: lookupError } = await supabase
      .from("analytics_tbl")
      .select("id")
      .eq("link_id", linkId)
      .gte("clicked_at", cutoffIso)
      .limit(1);

    if (lookupError) {
      return { error: lookupError };
    }

    const hasRecent = Array.isArray(existingRows) && existingRows.length > 0;
    if (hasRecent) {
      return { error: null };
    }

    const { error: insertError } = await supabase
      .from("analytics_tbl")
      .insert({ link_id: linkId });

    return { error: insertError };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { error };
  }
}

export async function createAnalytics(linkId: string) {
  return createAnalyticsIfNotDuplicate(linkId);
}
