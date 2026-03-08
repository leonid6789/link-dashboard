"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { AnalyticsContent } from "@/components/analytics-content";

export function AnalyticsPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar collapsed={collapsed} />
      <AnalyticsContent
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
    </div>
  );
}
