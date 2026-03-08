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

export async function getLinkBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("links_tbl")
    .select("id, destination_url")
    .eq("slug", slug)
    .maybeSingle();
  return { data, error };
}

export async function createAnalytics(linkId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("analytics_tbl")
    .insert({ link_id: linkId });
  return { error };
}
