import { getServerUser } from "@/lib/supabase/server";
import { MagicAuth } from "@/components/magic-auth";
import { DashboardPage } from "@/components/dashboard-page";

export default async function HomePage() {
  const { user } = await getServerUser();

  if (!user) {
    return <MagicAuth />;
  }

  return <DashboardPage />;
}
