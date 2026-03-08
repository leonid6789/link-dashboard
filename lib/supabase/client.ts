import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

// --- Helper functions (use createClient() for frontend) ---

export async function getUser(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users_tbl")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

export async function updateUser(
  userId: string,
  updates: { name?: string; email?: string }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users_tbl")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  return { data, error };
}

export async function getLink(linkId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("links_tbl")
    .select("*")
    .eq("id", linkId)
    .single();
  return { data, error };
}

export async function createLink(linkData: {
  user_id: string;
  destination_url: string;
  slug: string;
  tags?: unknown;
  conversion_tracking?: boolean;
  folder?: string;
  description?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("links_tbl")
    .insert(linkData)
    .select()
    .single();
  return { data, error };
}

export async function updateLink(
  linkId: string,
  updates: Partial<{
    destination_url: string;
    slug: string;
    tags: unknown;
    conversion_tracking: boolean;
    folder: string;
    description: string;
  }>
) {
  const supabase = createClient();
  // Ensure tags is passed through when present - never strip empty arrays (needed to clear tags in DB)
  const payload = { ...updates };
  if (Object.prototype.hasOwnProperty.call(updates, "tags")) {
    payload.tags = Array.isArray(updates.tags) ? updates.tags : [];
  }
  const { data, error } = await supabase
    .from("links_tbl")
    .update(payload)
    .eq("id", linkId)
    .select()
    .single();
  return { data, error };
}

export async function deleteLink(linkId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("links_tbl")
    .delete()
    .eq("id", linkId);
  return { data, error };
}

export async function getAnalytics(linkId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("analytics_tbl")
    .select("*")
    .eq("link_id", linkId)
    .order("clicked_at", { ascending: false });
  return { data, error };
}

// --- Auth helpers ---

/** Cookie name used to pass signup name to auth callback (short-lived). */
export const SIGNUP_NAME_COOKIE = "signup_name";

/**
 * Send a magic link to the given email. Optionally pass emailRedirectTo (e.g. current app origin + /auth/callback).
 * Caller can set a cookie for signup name before calling this so the callback can upsert users_tbl with it.
 */
export async function signInWithMagicLink(
  email: string,
  options?: { emailRedirectTo?: string }
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: options?.emailRedirectTo,
    },
  });
  return { data, error };
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

/**
 * Sign up with email and password. Pass optional name for user_metadata and users_tbl.
 * When Supabase has "Confirm Email" disabled, a session is returned and we upsert users_tbl
 * so the sidebar shows name/email. When confirmation is required, no session is returned;
 * the caller should show a "Check your email" message.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  name?: string | null
) {
  const supabase = createClient();
  const nameValue = name?.trim() || null;
  const { data, error } = await supabase.auth.signUp(
    { email, password },
    nameValue != null ? { data: { name: nameValue } } : undefined,
  );

  if (!error && data.user && data.session) {
    await supabase.from("users_tbl").upsert(
      {
        id: data.user.id,
        email: data.user.email ?? null,
        name: nameValue,
      },
      { onConflict: "id" },
    );
  }

  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function signOutUser() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getAuthUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/** Profile fields from users_tbl for the current authenticated user (RLS: users_tbl.id = auth.uid()). */
export type CurrentUserProfile = { name: string | null; email: string | null };

/**
 * Gets the currently authenticated user's profile (name, email) from users_tbl.
 * Uses auth.uid() via getUser(); no hardcoded ids or localStorage. RLS-compliant.
 */
export async function getCurrentUserProfile(): Promise<{
  data: CurrentUserProfile | null;
  error: Error | null;
}> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: authError ?? new Error("Not authenticated") };
  }
  const { data, error } = await supabase
    .from("users_tbl")
    .select("name, email")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    return { data: null, error };
  }
  return {
    data: data ? { name: data.name ?? null, email: data.email ?? null } : null,
    error: null,
  };
}
export async function getLinksForUser(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("links_tbl")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

/**
 * Returns click counts per link_id for all of a user's links.
 * Keys are link IDs, values are counts from analytics_tbl.
 */
export async function getClickCountsForUserLinks(
  userId: string
): Promise<{ data: Record<string, number> | null; error: Error | null }> {
  const supabase = createClient();
  const { data: links, error: linksError } = await supabase
    .from("links_tbl")
    .select("id")
    .eq("user_id", userId);
  if (linksError || !links?.length) {
    return { data: linksError ? null : {}, error: linksError ?? null };
  }
  const linkIds = links.map((r) => r.id);
  const { data: rows, error } = await supabase
    .from("analytics_tbl")
    .select("link_id")
    .in("link_id", linkIds);
  if (error) {
    return { data: null, error };
  }
  const counts: Record<string, number> = {};
  for (const id of linkIds) {
    counts[id] = 0;
  }
  for (const row of rows ?? []) {
    const lid = row.link_id as string;
    if (lid in counts) {
      counts[lid] += 1;
    }
  }
  return { data: counts, error: null };
}

export async function getLinkBySlug(slug: string, userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("links_tbl")
    .select("*")
    .eq("slug", slug)
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}