import { getServerUser } from "@/lib/supabase/server";
import { MagicAuth } from "@/components/magic-auth";
import { AnalyticsPage } from "@/components/analytics-page";

export default async function AnalyticsRoute() {
  const { user } = await getServerUser();

  if (!user) {
    return <MagicAuth />;
  }

  return <AnalyticsPage />;
}
