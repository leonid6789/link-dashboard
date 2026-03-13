"use client";

import { useState, useCallback } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LinksContent } from "@/components/links-content";

export function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const handleToggleCollapse = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar collapsed={collapsed} />
      <LinksContent
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />
    </div>
  );
}
