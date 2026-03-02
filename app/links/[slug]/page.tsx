"use client"

import { useState } from "react"
import { useParams, notFound } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { LinkDetailContent } from "@/components/link-detail-content"
import { getLinkBySlug } from "@/lib/links-data"

export default function LinkDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const link = getLinkBySlug(slug)
  const [collapsed, setCollapsed] = useState(false)

  if (!link) {
    notFound()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar collapsed={collapsed} />
      <LinkDetailContent
        link={link}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
    </div>
  )
}
