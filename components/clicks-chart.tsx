"use client"

import { memo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DailyClicks } from "@/components/analytics-content"

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "hsl(221 83% 53%)",
  },
} satisfies ChartConfig

interface ClicksChartProps {
  data: DailyClicks[]
}

function formatDateLabel(dateStr: string) {
  const [, month, day] = dateStr.split("-")
  return `${month}/${day}`
}

export const ClicksChart = memo(function ClicksChart({ data }: ClicksChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatDateLabel}
          className="text-xs"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          allowDecimals={false}
          className="text-xs"
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
          cursor={{ fill: "hsl(var(--accent))", opacity: 0.15 }}
        />
        <Bar
          dataKey="clicks"
          fill="var(--color-clicks)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
})
