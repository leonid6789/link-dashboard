export const LINKS_STORAGE_KEY = "link-dashboard.links"

export interface LinkData {
  slug: string
  shortUrl: string
  shortCode: string
  domain: string
  originalUrl: string
  favicon: string
  description: string
  clicks: number
  createdAt: string
  createdBy: string
  createdDate: string
  isActive: boolean
  tags: string[]
  folder: string
  conversionTracking: boolean
}

/** Reads persisted links from localStorage. Returns [] if none or invalid. Client-only. */
export function getStoredLinks(): LinkData[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(LINKS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as LinkData[]
  } catch {
    return []
  }
}

/** Writes the full links list to localStorage. Client-only. */
export function saveStoredLinks(links: LinkData[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links))
  } catch {
    // ignore
  }
}

export const sampleLinks: LinkData[] = [
  {
    slug: "design-sys",
    shortUrl: "https://lnk.ly/design-sys",
    shortCode: "design-sys",
    domain: "lnk.ly",
    originalUrl: "https://www.figma.com/community/file/design-system-components",
    favicon: "https://www.google.com/s2/favicons?domain=figma.com&sz=64",
    description: "Figma design system file for the Q3 rebrand project",
    clicks: 2847,
    createdAt: "2h ago",
    createdBy: "adamsmith@gmail.com",
    createdDate: "Feb 27, 2026 at 10:23 AM",
    isActive: true,
    tags: ["design", "figma"],
    folder: "Links",
    conversionTracking: false,
  },
  {
    slug: "api-docs",
    shortUrl: "https://lnk.ly/api-docs",
    shortCode: "api-docs",
    domain: "lnk.ly",
    originalUrl: "https://docs.stripe.com/api/payment-intents",
    favicon: "https://www.google.com/s2/favicons?domain=stripe.com&sz=64",
    description: "Stripe Payment Intents API documentation for checkout",
    clicks: 1293,
    createdAt: "5h ago",
    createdBy: "adamsmith@gmail.com",
    createdDate: "Feb 27, 2026 at 7:15 AM",
    isActive: true,
    tags: ["api", "payments"],
    folder: "Links",
    conversionTracking: true,
  },
  {
    slug: "launch",
    shortUrl: "https://lnk.ly/launch",
    shortCode: "launch",
    domain: "lnk.ly",
    originalUrl: "https://www.producthunt.com/posts/linkly-2",
    favicon: "https://www.google.com/s2/favicons?domain=producthunt.com&sz=64",
    description: "Product Hunt launch page for Linkly v2.0",
    clicks: 8341,
    createdAt: "1d ago",
    createdBy: "adamsmith@gmail.com",
    createdDate: "Feb 26, 2026 at 9:00 AM",
    isActive: true,
    tags: ["marketing", "launch"],
    folder: "Links",
    conversionTracking: true,
  },
  {
    slug: "blog-seo",
    shortUrl: "https://lnk.ly/blog-seo",
    shortCode: "blog-seo",
    domain: "lnk.ly",
    originalUrl: "https://blog.hubspot.com/marketing/seo-strategy",
    favicon: "https://www.google.com/s2/favicons?domain=hubspot.com&sz=64",
    description: "HubSpot SEO strategy guide shared in newsletter",
    clicks: 672,
    createdAt: "2d ago",
    createdBy: "adamsmith@gmail.com",
    createdDate: "Feb 25, 2026 at 2:30 PM",
    isActive: false,
    tags: ["seo", "content"],
    folder: "Links",
    conversionTracking: false,
  },
  {
    slug: "careers",
    shortUrl: "https://lnk.ly/careers",
    shortCode: "careers",
    domain: "lnk.ly",
    originalUrl: "https://jobs.lever.co/linkly/senior-engineer",
    favicon: "https://www.google.com/s2/favicons?domain=lever.co&sz=64",
    description: "Senior engineer job posting on Lever",
    clicks: 419,
    createdAt: "3d ago",
    createdBy: "adamsmith@gmail.com",
    createdDate: "Feb 24, 2026 at 11:45 AM",
    isActive: true,
    tags: ["hiring"],
    folder: "Links",
    conversionTracking: false,
  },
  {
    slug: "demo",
    shortUrl: "https://lnk.ly/demo",
    shortCode: "demo",
    domain: "lnk.ly",
    originalUrl: "https://cal.com/linkly/product-demo",
    favicon: "https://www.google.com/s2/favicons?domain=cal.com&sz=64",
    description: "Booking link for product demo calls",
    clicks: 1056,
    createdAt: "5d ago",
    createdBy: "adamsmith@gmail.com",
    createdDate: "Feb 22, 2026 at 4:00 PM",
    isActive: true,
    tags: ["sales", "demo"],
    folder: "Links",
    conversionTracking: true,
  },
  {
    slug: "gh-repo",
    shortUrl: "https://lnk.ly/gh-repo",
    shortCode: "gh-repo",
    domain: "lnk.ly",
    originalUrl: "https://github.com/linkly/linkly-sdk",
    favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    description: "Open-source Linkly SDK repository on GitHub",
    clicks: 3215,
    createdAt: "1w ago",
    createdBy: "adamsmith@gmail.com",
    createdDate: "Feb 20, 2026 at 8:30 AM",
    isActive: true,
    tags: ["open-source", "sdk"],
    folder: "Links",
    conversionTracking: false,
  },
  {
    slug: "onboard",
    shortUrl: "https://lnk.ly/onboard",
    shortCode: "onboard",
    domain: "lnk.ly",
    originalUrl: "https://app.notion.so/linkly/onboarding-guide",
    favicon: "https://www.google.com/s2/favicons?domain=notion.so&sz=64",
    description: "New hire onboarding guide on Notion",
    clicks: 189,
    createdAt: "2w ago",
    createdBy: "adamsmith@gmail.com",
    createdDate: "Feb 13, 2026 at 1:15 PM",
    isActive: false,
    tags: ["internal", "onboarding"],
    folder: "Links",
    conversionTracking: false,
  },
]

/** Resolves a link by slug: stored links first, then sampleLinks. Client-only for storage. */
export function getLinkBySlug(slug: string): LinkData | undefined {
  const fromStored = getStoredLinks().find((link) => link.slug === slug)
  if (fromStored) return fromStored
  return sampleLinks.find((link) => link.slug === slug)
}
