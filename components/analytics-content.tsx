"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { BarChart3, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClicksChart } from "@/components/clicks-chart"
import { getAuthUser, getAnalyticsForUserLinks, getLinksForUser } from "@/lib/supabase/client"

interface AnalyticsContentProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export interface DailyClicks {
  date: string
  clicks: number
}

interface UserLink {
  id: string
  slug: string
  description: string | null
}

type DateRange = "7d" | "30d" | "all"

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "all", label: "All Time" },
]

type AnalyticsRow = { clicked_at: string; link_id: string }

function getDateRangeCutoff(range: DateRange): Date | null {
  if (range === "all") return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  now.setDate(now.getDate() - (range === "7d" ? 7 : 30))
  return now
}

function groupByDay(rows: { clicked_at: string }[]): DailyClicks[] {
  const map = new Map<string, number>()
  for (const row of rows) {
    const day = row.clicked_at.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + 1)
  }
  const entries = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  return entries.map(([date, clicks]) => ({ date, clicks }))
}

function linkLabel(link: UserLink): string {
  if (link.description) return `${link.description} (/${link.slug})`
  return `/${link.slug}`
}

export function AnalyticsContent({ collapsed, onToggleCollapse }: AnalyticsContentProps) {
  const [analyticsRows, setAnalyticsRows] = useState<AnalyticsRow[]>([])
  const [userLinks, setUserLinks] = useState<UserLink[]>([])
  const [selectedLinkId, setSelectedLinkId] = useState("all")
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>("30d")
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    const { user } = await getAuthUser()
    if (!user) {
      setAnalyticsRows([])
      setUserLinks([])
      setLoading(false)
      return
    }

    const [analyticsResult, linksResult] = await Promise.all([
      getAnalyticsForUserLinks(user.id),
      getLinksForUser(user.id),
    ])

    if (analyticsResult.error || !analyticsResult.data) {
      console.error("Failed to load analytics", analyticsResult.error)
    }
    setAnalyticsRows((analyticsResult.data ?? []) as AnalyticsRow[])

    if (linksResult.error) {
      console.error("Failed to load links", linksResult.error)
    }
    setUserLinks(
      (linksResult.data ?? []).map((r: Record<string, unknown>) => ({
        id: (r.id as string) ?? "",
        slug: (r.slug as string) ?? "",
        description: (r.description as string) ?? null,
      }))
    )

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const filteredRows = useMemo(() => {
    let rows = selectedLinkId === "all"
      ? analyticsRows
      : analyticsRows.filter((r) => r.link_id === selectedLinkId)

    const cutoff = getDateRangeCutoff(selectedDateRange)
    if (cutoff) {
      const cutoffIso = cutoff.toISOString()
      rows = rows.filter((r) => r.clicked_at >= cutoffIso)
    }

    return rows
  }, [analyticsRows, selectedLinkId, selectedDateRange])

  const totalClicks = filteredRows.length
  const chartData = useMemo(() => groupByDay(filteredRows), [filteredRows])

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
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
        <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <BarChart3 className="h-5 w-5" />
          Analytics
        </div>
      </div>

      <Separator className="mx-6" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="flex flex-col gap-6">
            <div className="h-9 w-48 animate-pulse rounded-md border border-border bg-secondary" />
            <div className="h-24 w-64 animate-pulse rounded-lg border border-border bg-secondary" />
            <div className="h-80 animate-pulse rounded-lg border border-border bg-secondary" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedLinkId} onValueChange={setSelectedLinkId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="All Links" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Links</SelectItem>
                  {userLinks.map((link) => (
                    <SelectItem key={link.id} value={link.id}>
                      {linkLabel(link)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDateRange} onValueChange={(v) => setSelectedDateRange(v as DateRange)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary card */}
            <div className="inline-flex w-fit flex-col gap-1 rounded-lg border border-border bg-secondary/50 px-6 py-4">
              <span className="text-sm text-muted-foreground">Total clicks</span>
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {totalClicks.toLocaleString()}
              </span>
            </div>

            {/* Chart */}
            <div className="rounded-lg border border-border bg-secondary/50 p-6">
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                Clicks per day
              </h2>
              {chartData.length > 0 ? (
                <ClicksChart data={chartData} />
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No click data yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
