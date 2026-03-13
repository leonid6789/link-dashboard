"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { ChevronDown, Plus, Search, SlidersHorizontal, ListChecks, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { LinkCard } from "@/components/link-card"
import { ToastNotification } from "@/components/toast-notification"
import { mapRowToLinkData, type LinkData } from "@/lib/links-data"
import { getAuthUser, getLinksForUser, getClickCountsForUserLinks, deleteLink } from "@/lib/supabase/client"

const CreateLinkModal = dynamic(() => import("@/components/create-link-modal"), {
  ssr: false,
})

interface LinksContentProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const SKELETON_ROWS = 8

export function LinksContent({ collapsed, onToggleCollapse }: LinksContentProps) {
  const [open, setOpen] = useState(false)
  const [modalMounted, setModalMounted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [links, setLinks] = useState<LinkData[]>([])
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState<"success" | "error">("success")
  const [toastTitle, setToastTitle] = useState("")
  const [toastMessage, setToastMessage] = useState("")

  const refreshLinks = useCallback(async () => {
    const { user } = await getAuthUser()
    if (!user) {
      setLinks([])
      return
    }
    const [linksResult, countsResult] = await Promise.all([
      getLinksForUser(user.id),
      getClickCountsForUserLinks(user.id),
    ])
    const { data: linksData, error } = linksResult
    if (error || !linksData) {
      console.error("Failed to load links", error)
      setLinks([])
      return
    }
    const clickCounts = countsResult.error ? {} : countsResult.data ?? {}
    setLinks(
      linksData.map((r) => {
        const link = mapRowToLinkData(r as Record<string, unknown>)
        return {
          ...link,
          clicks: (link.id ? clickCounts[link.id] : 0) ?? 0,
        }
      })
    )
  }, [])

  useEffect(() => {
    if (open) setModalMounted(true)
  }, [open])

  useEffect(() => {
    refreshLinks().then(() => setMounted(true))
  }, [refreshLinks])

  useEffect(() => {
    const handler = () => { refreshLinks() }
    window.addEventListener("links:updated", handler)
    window.addEventListener("auth:updated", handler)
    return () => {
      window.removeEventListener("links:updated", handler)
      window.removeEventListener("auth:updated", handler)
    }
  }, [refreshLinks])

  const handleCreateLink = (_newLink: LinkData) => {
    setToastType("success")
    setToastTitle("Link Created")
    setToastMessage("The short link was created successfully.")
    setToastVisible(true)
    setOpen(false)
  }

  const handleDeleteLink = useCallback(async (linkId: string) => {
    const { error } = await deleteLink(linkId)
    if (error) {
      setToastType("error")
      setToastTitle("Failed to delete link")
      setToastMessage(error.message)
      setToastVisible(true)
      return
    }
    window.dispatchEvent(new Event("links:updated"))
    setToastType("success")
    setToastTitle("Link deleted successfully")
    setToastMessage("")
    setToastVisible(true)
  }, [])

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      {modalMounted && (
        <CreateLinkModal
          open={open}
          onOpenChange={setOpen}
          onCreateLink={handleCreateLink}
        />
      )}
      {toastVisible && (
        <ToastNotification
          title={toastTitle}
          message={toastMessage}
          type={toastType}
          onClose={() => setToastVisible(false)}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <button className="flex items-center gap-2 text-xl font-semibold text-foreground">
            Links
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Create Link
        </Button>
      </div>

      <Separator className="mx-6" />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-6 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-accent">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Display
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-accent">
            <ListChecks className="h-3.5 w-3.5" />
            Bulk Actions
          </Button>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            className="border-border bg-secondary pl-9 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Link list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-2">
          {mounted ? (
            links.map((link) => (
              <LinkCard key={link.id || link.slug} {...link} onDelete={handleDeleteLink} />
            ))
          ) : (
            Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-lg border border-border bg-secondary"
              />
            ))
          )}
        </div>
      </div>
    </main>
  )
}
