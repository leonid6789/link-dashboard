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

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signUpWithPassword(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (!error && data.user) {
    await supabase.from("users_tbl").upsert(
      { id: data.user.id, email: data.user.email },
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

export async function getAuthUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
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