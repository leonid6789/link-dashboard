import { getServerUser } from "@/lib/supabase/server";
import { MagicAuth } from "@/components/magic-auth";
import LinkDetailClient from "./link-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LinkDetailPage({ params }: Props) {
  const { user } = await getServerUser();

  if (!user) {
    return <MagicAuth />;
  }

  const { slug } = await params;

  return <LinkDetailClient slug={slug} />;
}
