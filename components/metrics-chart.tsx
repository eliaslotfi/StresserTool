"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MetricsChartProps {
  rps: number
  duration: number
}

export function MetricsChart({ rps, duration }: MetricsChartProps) {
  // Generate simulated RPS data over time (in real implementation, this would come from backend)
  const data = Array.from({ length: Math.min(duration, 60) }, (_, i) => ({
    time: i + 1,
    rps: rps + (Math.random() - 0.5) * rps * 0.2, // Simulate variance
  }))

  const chartConfig = {
    rps: {
      label: "RPS",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <div className="h-[200px]">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
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
              tickFormatter={(value) => `${value.toFixed(0)}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="rps" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
