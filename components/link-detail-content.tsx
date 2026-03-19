"use client"

import {
  Copy,
  MoreHorizontal,
  HelpCircle,
  RefreshCw,
  ChevronDown,
  Tag,
  Link2,
  Timer,
  Lock,
  Crosshair,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { updateLink, getLinkBySlug, deleteLink, isValidHttpUrl } from "@/lib/supabase/client"
import type { LinkData } from "@/lib/links-data"
import { ToastNotification } from "@/components/toast-notification"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface LinkDetailContentProps {
  link: LinkData
  collapsed: boolean
  onToggleCollapse: () => void
}

export function LinkDetailContent({ link, collapsed, onToggleCollapse }: LinkDetailContentProps) {
  const router = useRouter()
  const initialTags = link.tags.join(", ")
  const [copied, setCopied] = useState(false)
  const [originalUrl, setOriginalUrl] = useState(link.originalUrl)
  const [slugInput, setSlugInput] = useState(link.slug)
  const [description, setDescription] = useState(link.description)
  const [tagsInput, setTagsInput] = useState(initialTags)
  const [conversionTracking, setConversionTracking] = useState(link.conversionTracking)
  const [saved, setSaved] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState<"success" | "error">("success")
  const [toastTitle, setToastTitle] = useState("")
  const [toastMessage, setToastMessage] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setSlugInput(link.slug)
  }, [link.slug])

  const hasChanges =
    originalUrl !== link.originalUrl ||
    slugInput.trim() !== link.slug ||
    description !== link.description ||
    tagsInput !== initialTags ||
    conversionTracking !== link.conversionTracking

  const handleCopy = () => {
    navigator.clipboard.writeText(link.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (!hasChanges || !link.id) return

    if (!isValidHttpUrl(originalUrl)) {
      setToastType("error")
      setToastTitle("Invalid URL")
      setToastMessage("Destination URL must start with http:// or https://.")
      setToastVisible(true)
      return
    }

    const trimmedSlug = slugInput.trim()
    if (!trimmedSlug) {
      setToastType("error")
      setToastTitle("Invalid slug")
      setToastMessage("Short link cannot be empty.")
      setToastVisible(true)
      return
    }

    if (trimmedSlug !== link.slug) {
      const { data: existing } = await getLinkBySlug(trimmedSlug, link.createdBy)
      if (existing && (existing as { id?: string }).id !== link.id) {
        setToastType("error")
        setToastTitle("Short link already in use")
        setToastMessage("Another link already uses this short link.")
        setToastVisible(true)
        return
      }
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const updates: Parameters<typeof updateLink>[1] = {
      destination_url: originalUrl,
      description,
      tags: tags, // Always include - empty array clears tags in DB; omit would leave old value
      conversion_tracking: conversionTracking,
      folder: link.folder,
    }
    if (trimmedSlug !== link.slug) {
      updates.slug = trimmedSlug
    }

    const { error } = await updateLink(link.id, updates)

    if (error) {
      setToastType("error")
      setToastTitle("Save failed")
      setToastMessage(error.message)
      setToastVisible(true)
      return
    }

    window.dispatchEvent(new Event("links:updated"))
    setSaved(true)
    setSlugInput(trimmedSlug)
    setToastType("success")
    setToastTitle("Link saved")
    setToastMessage("Your changes have been saved.")
    setToastVisible(true)
    window.setTimeout(() => setSaved(false), 2000)

    if (trimmedSlug !== link.slug) {
      router.replace(`/links/${trimmedSlug}`)
    }
  }

  const handleConfirmDelete = async () => {
    if (!link.id) return
    setDeleting(true)
    const { error } = await deleteLink(link.id)
    setDeleting(false)
    setDeleteDialogOpen(false)
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
    router.push("/")
  }

  return (
    <TooltipProvider delayDuration={0}>
      {toastVisible && (
        <ToastNotification
          title={toastTitle}
          message={toastMessage}
          type={toastType}
          onClose={() => setToastVisible(false)}
        />
      )}
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Top Bar */}
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
            <nav className="flex items-center gap-1.5 text-sm">
              <button
                onClick={() => router.push("/")}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Links
              </button>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium text-foreground">
                {link.shortUrl.replace(/^https?:\/\//, "")}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border text-foreground hover:bg-accent"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border text-foreground hover:bg-accent"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-border bg-popover">
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator className="mx-6" />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Destination URL */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-foreground">Destination URL</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>The URL your short link redirects to</TooltipContent>
                </Tooltip>
              </div>
              <Input
                value={originalUrl}
                onChange={(event) => setOriginalUrl(event.target.value)}
                className="border-border bg-input text-sm text-foreground"
              />
            </div>

            {/* Short Link */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Short Link</label>
                <button className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center gap-0">
                <div className="flex h-9 items-center rounded-l-md border border-r-0 border-border bg-secondary px-3">
                  <span className="flex items-center gap-1.5 text-sm text-foreground">
                    {link.domain}
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </span>
                </div>
                <Input
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  className="rounded-l-none border-border bg-input text-sm text-foreground"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-foreground">Tags</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Organize your links with tags</TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Select tags"
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.target.value)}
                  className="border-border bg-input pl-9 text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Conversion Tracking */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-foreground">Conversion Tracking</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Track conversions from this link</TooltipContent>
                </Tooltip>
              </div>
              <Switch
                checked={conversionTracking}
                onCheckedChange={setConversionTracking}
              />
            </div>

            <Separator />

            {/* Folder */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-foreground">Folder</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Organize links into folders</TooltipContent>
                </Tooltip>
              </div>
              <button className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-input px-3 text-sm text-foreground transition-colors hover:bg-accent/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/20">
                    <FolderOpen className="h-3 w-3 text-primary" />
                  </span>
                  {link.folder}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a short description here..."
                className="min-h-20 resize-none border-border bg-input text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                UTM
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent">
                <Crosshair className="h-3.5 w-3.5 text-muted-foreground" />
                Targeting
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent">
                <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                Expiration
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                Password
              </button>
            </div>

            <Separator />

            <div className="flex items-center justify-end gap-3">
              {saved && <span className="text-sm text-muted-foreground">Saved</span>}
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save changes
              </Button>
            </div>

            {/* Footer */}
            <p className="text-xs text-muted-foreground">
              Created on {link.createdDate}
            </p>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="border-border bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Delete Link</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to delete this link? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-foreground hover:bg-accent">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleConfirmDelete()
                }}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </TooltipProvider>
  )
}
