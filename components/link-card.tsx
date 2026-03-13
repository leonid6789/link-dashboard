"use client"

import { Copy, MousePointerClick, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react"
import { memo, useState } from "react"
import { useRouter } from "next/navigation"
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
interface LinkCardProps {
  id?: string
  slug: string
  shortUrl: string
  originalUrl: string
  favicon: string
  description: string
  clicks: number
  createdAt: string
  isActive: boolean
  onDelete?: (linkId: string) => void | Promise<void>
}

export const LinkCard = memo(function LinkCard({
  id,
  slug,
  shortUrl,
  originalUrl,
  favicon,
  description,
  clicks,
  createdAt,
  isActive,
  onDelete,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button, a, [role="menuitem"], [data-no-nav="true"]')) return
    router.push(`/links/${slug}`)
  }

  const handleConfirmDelete = async () => {
    if (!id || !onDelete) return
    setDeleting(true)
    try {
      await onDelete(id)
      setDeleteDialogOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/50"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          const target = e.target as HTMLElement
          if (target.closest('button, a, [role="menuitem"], [data-no-nav="true"]')) return
          e.preventDefault()
          router.push(`/links/${slug}`)
        }
      }}
    >
      {/* Favicon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
        <img
          src={favicon}
          alt=""
          className="h-5 w-5 rounded-sm"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none"
          }}
        />
      </div>

      {/* Link info */}
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {shortUrl.replace(/^https?:\/\//, "")}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Copy link"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          {copied && (
            <span className="text-xs text-primary">Copied!</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            onClick={(e) => {
              e.stopPropagation()
              window.open(originalUrl, "_blank", "noopener,noreferrer")
            }}
            className="flex cursor-pointer items-center gap-1 truncate hover:text-foreground"
          >
            {originalUrl.replace("https://", "").replace("http://", "")}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </span>
          <span className="shrink-0">{"·"}</span>
          <span className="shrink-0">{createdAt}</span>
        </div>
      </div>

      {/* Description */}
      <p className="hidden flex-1 truncate text-center text-xs text-muted-foreground lg:block">
        {description}
      </p>

      {/* Clicks */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MousePointerClick className="h-4 w-4" />
          <span className="font-medium text-foreground">{clicks.toLocaleString()}</span>
          <span className="hidden sm:inline">clicks</span>
        </div>
        {isActive && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
        )}
        {id && onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-no-nav="true"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border bg-popover">
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.stopPropagation()
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
    </div>
  )
})
