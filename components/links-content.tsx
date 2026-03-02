"use client"

import { ChevronDown, Plus, Search, SlidersHorizontal, ListChecks, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { LinkCard } from "@/components/link-card"

const sampleLinks = [
  {
    shortUrl: "https://lnk.ly/design-sys",
    originalUrl: "https://www.figma.com/community/file/design-system-components",
    favicon: "https://www.google.com/s2/favicons?domain=figma.com&sz=64",
    description: "Figma design system file for the Q3 rebrand project",
    clicks: 2847,
    createdAt: "2h ago",
    isActive: true,
  },
  {
    shortUrl: "https://lnk.ly/api-docs",
    originalUrl: "https://docs.stripe.com/api/payment-intents",
    favicon: "https://www.google.com/s2/favicons?domain=stripe.com&sz=64",
    description: "Stripe Payment Intents API documentation for checkout",
    clicks: 1293,
    createdAt: "5h ago",
    isActive: true,
  },
  {
    shortUrl: "https://lnk.ly/launch",
    originalUrl: "https://www.producthunt.com/posts/linkly-2",
    favicon: "https://www.google.com/s2/favicons?domain=producthunt.com&sz=64",
    description: "Product Hunt launch page for Linkly v2.0",
    clicks: 8341,
    createdAt: "1d ago",
    isActive: true,
  },
  {
    shortUrl: "https://lnk.ly/blog-seo",
    originalUrl: "https://blog.hubspot.com/marketing/seo-strategy",
    favicon: "https://www.google.com/s2/favicons?domain=hubspot.com&sz=64",
    description: "HubSpot SEO strategy guide shared in newsletter",
    clicks: 672,
    createdAt: "2d ago",
    isActive: false,
  },
  {
    shortUrl: "https://lnk.ly/careers",
    originalUrl: "https://jobs.lever.co/linkly/senior-engineer",
    favicon: "https://www.google.com/s2/favicons?domain=lever.co&sz=64",
    description: "Senior engineer job posting on Lever",
    clicks: 419,
    createdAt: "3d ago",
    isActive: true,
  },
  {
    shortUrl: "https://lnk.ly/demo",
    originalUrl: "https://cal.com/linkly/product-demo",
    favicon: "https://www.google.com/s2/favicons?domain=cal.com&sz=64",
    description: "Booking link for product demo calls",
    clicks: 1056,
    createdAt: "5d ago",
    isActive: true,
  },
  {
    shortUrl: "https://lnk.ly/gh-repo",
    originalUrl: "https://github.com/linkly/linkly-sdk",
    favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    description: "Open-source Linkly SDK repository on GitHub",
    clicks: 3215,
    createdAt: "1w ago",
    isActive: true,
  },
  {
    shortUrl: "https://lnk.ly/onboard",
    originalUrl: "https://app.notion.so/linkly/onboarding-guide",
    favicon: "https://www.google.com/s2/favicons?domain=notion.so&sz=64",
    description: "New hire onboarding guide on Notion",
    clicks: 189,
    createdAt: "2w ago",
    isActive: false,
  },
]

interface LinksContentProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function LinksContent({ collapsed, onToggleCollapse }: LinksContentProps) {
  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
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
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
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
          {sampleLinks.map((link) => (
            <LinkCard key={link.shortUrl} {...link} />
          ))}
        </div>
      </div>
    </main>
  )
}
