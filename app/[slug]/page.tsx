import { redirect } from "next/navigation";
import { getLinkBySlug } from "@/lib/supabase/server";

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

  redirect(data.destination_url);
}
