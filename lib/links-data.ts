export interface LinkData {
  id?: string
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

function getFaviconForUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return "https://www.google.com/s2/favicons?domain=example.com&sz=64";
  }
}

function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const weeks = Math.floor(days / 7);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Base URL for short links (e.g. https://linkd.sh or http://localhost:3000). */
const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://linkd.sh";

/** Domain/host for short links, derived from NEXT_PUBLIC_APP_URL. */
export function getShortLinkDomain(): string {
  return new URL(baseUrl).host;
}

/** Maps a Supabase links_tbl row to LinkData for UI display. */
export function mapRowToLinkData(row: Record<string, unknown>): LinkData {
  const id = (row.id as string) ?? "";
  const slug = (row.slug as string) ?? "";
  const destinationUrl = (row.destination_url as string) ?? "";
  const createdIso = (row.created_at as string) ?? "";
  const shortUrl = `${baseUrl.replace(/\/$/, "")}/${slug}`;
  return {
    id,
    slug,
    shortUrl,
    shortCode: slug,
    domain: new URL(shortUrl).host,
    originalUrl: destinationUrl,
    favicon: getFaviconForUrl(destinationUrl),
    description: (row.description as string) ?? "",
    clicks: 0,
    createdAt: createdIso ? relativeTime(createdIso) : "",
    createdBy: (row.user_id as string) ?? "",
    createdDate: createdIso
      ? new Date(createdIso).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "",
    isActive: true,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    folder: (row.folder as string) ?? "Links",
    conversionTracking: (row.conversion_tracking as boolean) ?? false,
  };
}
