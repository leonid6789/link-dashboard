"use client"

import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { LinkDetailContent } from "@/components/link-detail-content"
import { getAuthUser, getLinkBySlug } from "@/lib/supabase/client"
import { mapRowToLinkData, type LinkData } from "@/lib/links-data"

export default function LinkDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [link, setLink] = useState<LinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { user } = await getAuthUser()
      if (!user || cancelled) {
        if (!cancelled) {
          setLink(null)
          setLoading(false)
        }
        return
      }

      const { data, error } = await getLinkBySlug(slug, user.id)
      if (cancelled) return

      if (error || !data) {
        setLink(null)
      } else {
        setLink(mapRowToLinkData(data as Record<string, unknown>))
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    const handler = () => {
      if (!link?.id) return
      getAuthUser().then(({ user }) => {
        if (user) {
          getLinkBySlug(slug, user.id).then(({ data }) => {
            if (data) {
              setLink(mapRowToLinkData(data as Record<string, unknown>))
            }
          })
        }
      })
    }
    window.addEventListener("links:updated", handler)
    return () => window.removeEventListener("links:updated", handler)
  }, [slug, link?.id])

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar collapsed={collapsed} />
        <main className="flex flex-1 items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
      </div>
    )
  }

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
