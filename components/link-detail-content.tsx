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
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getStoredLinks, saveStoredLinks, type LinkData } from "@/lib/links-data"

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
  const [description, setDescription] = useState(link.description)
  const [tagsInput, setTagsInput] = useState(initialTags)
  const [conversionTracking, setConversionTracking] = useState(link.conversionTracking)
  const [saved, setSaved] = useState(false)

  const hasChanges =
    originalUrl !== link.originalUrl ||
    description !== link.description ||
    tagsInput !== initialTags ||
    conversionTracking !== link.conversionTracking

  const handleCopy = () => {
    navigator.clipboard.writeText(link.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (!hasChanges) return

    const storedLinks = getStoredLinks()
    const existingIndex = storedLinks.findIndex((stored) => stored.slug === link.slug)
    const base: LinkData = existingIndex >= 0 ? storedLinks[existingIndex] : link
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const updated: LinkData = {
      ...base,
      originalUrl,
      description,
      tags,
      conversionTracking,
    }

    const nextLinks =
      existingIndex >= 0
        ? storedLinks.map((stored, idx) => (idx === existingIndex ? updated : stored))
        : [...storedLinks, updated]

    saveStoredLinks(nextLinks)
    window.dispatchEvent(new Event("links:updated"))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <TooltipProvider delayDuration={0}>
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
                {link.shortUrl.replace("https://", "")}
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
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border text-foreground hover:bg-accent"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
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
                  defaultValue={link.shortCode}
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
              Created by{" "}
              <span className="text-foreground">{link.createdBy}</span>
              {" "}on {link.createdDate}
            </p>
          </div>
        </div>
      </main>
    </TooltipProvider>
  )
}
