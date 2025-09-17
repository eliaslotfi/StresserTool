"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface LatencyChartProps {
  latencies: {
    p50: number
    p95: number
    p99: number
  }
}

export function LatencyChart({ latencies }: LatencyChartProps) {
  const data = [
    {
      percentile: "P50",
      latency: latencies.p50,
      fill: "hsl(var(--chart-2))",
    },
    {
      percentile: "P95",
      latency: latencies.p95,
      fill: "hsl(var(--chart-3))",
    },
    {
      percentile: "P99",
      latency: latencies.p99,
      fill: "hsl(var(--chart-4))",
    },
  ]

  const chartConfig = {
    latency: {
      label: "Latency (ms)",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="h-[200px]">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="percentile"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(0)}ms`}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="latency" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
