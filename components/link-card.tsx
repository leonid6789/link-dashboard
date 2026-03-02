"use client"

import { Copy, MousePointerClick, ExternalLink } from "lucide-react"
import { useState } from "react"

interface LinkCardProps {
  shortUrl: string
  originalUrl: string
  favicon: string
  description: string
  clicks: number
  createdAt: string
  isActive: boolean
}

export function LinkCard({
  shortUrl,
  originalUrl,
  favicon,
  description,
  clicks,
  createdAt,
  isActive,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/50">
      {/* Favicon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
        <img
          src={favicon}
          alt=""
          className="h-5 w-5 rounded-sm"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none"
          }}
        />
      </div>

      {/* Link info */}
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-semibold text-foreground hover:underline"
          >
            {shortUrl.replace("https://", "")}
          </a>
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
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 truncate hover:text-foreground"
          >
            {originalUrl.replace("https://", "").replace("http://", "")}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
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
      </div>
    </div>
  )
}
