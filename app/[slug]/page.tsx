import { redirect } from "next/navigation";
import { getLinkBySlug, createAnalytics } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ShortLinkRedirectPage({ params }: Props) {
  const { slug } = await params;
  const { data, error } = await getLinkBySlug(slug);

  if (error || !data?.destination_url) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Link not found</p>
      </div>
    );
  }

  let isValidUrl = false;
  try {
    const parsed = new URL(data.destination_url);
    isValidUrl = parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {}

  if (!isValidUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">This link has an invalid destination</p>
      </div>
    );
  }

  const { error: analyticsError } = await createAnalytics(data.id);
  if (analyticsError) {
    console.error("[analytics] insert failed:", analyticsError);
  }

  redirect(data.destination_url);
}
