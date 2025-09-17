"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Activity, Clock, Zap, Target } from "lucide-react"
import type { TestResult } from "@/lib/api"
import { MetricsChart } from "@/components/metrics-chart"
import { LatencyChart } from "@/components/latency-chart"

interface TestResultsProps {
  results: TestResult
}

export function TestResults({ results }: TestResultsProps) {
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `stress-test-results-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const csvData = [
      ["Metric", "Value", "Unit"],
      ["Requests Sent", results.requests_sent.toString(), "requests"],
      ["RPS", results.rps.toFixed(2), "req/sec"],
      ["Duration", results.duration_s.toString(), "seconds"],
      ["Latency P50", results.latency_ms.p50.toFixed(2), "ms"],
      ["Latency P95", results.latency_ms.p95.toFixed(2), "ms"],
      ["Latency P99", results.latency_ms.p99.toFixed(2), "ms"],
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const dataBlob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `stress-test-results-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-primary font-mono">{">"} TEST RESULTS</h3>
        <div className="flex gap-2">
          <Button onClick={handleExportJSON} variant="outline" size="sm" className="font-mono bg-transparent">
            <Download className="w-4 h-4 mr-1" />
            JSON
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="font-mono bg-transparent">
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-mono">REQUESTS</p>
              <p className="text-2xl font-bold text-primary font-mono">{results.requests_sent.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-mono">RPS</p>
              <p className="text-2xl font-bold text-accent font-mono">{results.rps.toFixed(1)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-3/20 rounded-lg">
              <Activity className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-mono">P50 LATENCY</p>
              <p className="text-2xl font-bold text-chart-3 font-mono">{results.latency_ms.p50.toFixed(0)}ms</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-4/20 rounded-lg">
              <Clock className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-mono">DURATION</p>
              <p className="text-2xl font-bold text-chart-4 font-mono">{results.duration_s}s</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Analysis */}
      <Card className="p-6">
        <h4 className="text-lg font-bold text-primary font-mono mb-4">PERFORMANCE ANALYSIS</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RPS Chart */}
          <div>
            <h5 className="text-sm font-bold text-muted-foreground font-mono mb-3">REQUESTS PER SECOND</h5>
            <MetricsChart rps={results.rps} duration={results.duration_s} />
          </div>

          {/* Latency Distribution */}
          <div>
            <h5 className="text-sm font-bold text-muted-foreground font-mono mb-3">LATENCY DISTRIBUTION</h5>
            <LatencyChart latencies={results.latency_ms} />
          </div>
        </div>
      </Card>

      {/* Detailed Metrics */}
      <Card className="p-6">
        <h4 className="text-lg font-bold text-primary font-mono mb-4">DETAILED METRICS</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-mono">LATENCY PERCENTILES</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-mono">P50:</span>
                <Badge variant="secondary" className="font-mono">
                  {results.latency_ms.p50.toFixed(2)}ms
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-mono">P95:</span>
                <Badge variant="secondary" className="font-mono">
                  {results.latency_ms.p95.toFixed(2)}ms
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-mono">P99:</span>
                <Badge variant="secondary" className="font-mono">
                  {results.latency_ms.p99.toFixed(2)}ms
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-mono">THROUGHPUT</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-mono">Total Requests:</span>
                <Badge variant="secondary" className="font-mono">
                  {results.requests_sent.toLocaleString()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-mono">Avg RPS:</span>
                <Badge variant="secondary" className="font-mono">
                  {results.rps.toFixed(2)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-mono">Duration:</span>
                <Badge variant="secondary" className="font-mono">
                  {results.duration_s}s
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-mono">PERFORMANCE GRADE</p>
            <div className="space-y-1">
              {/* Simple performance grading based on RPS and latency */}
              <div className="flex justify-between">
                <span className="text-sm font-mono">RPS Grade:</span>
                <Badge
                  variant={results.rps > 100 ? "default" : results.rps > 50 ? "secondary" : "destructive"}
                  className="font-mono"
                >
                  {results.rps > 100 ? "EXCELLENT" : results.rps > 50 ? "GOOD" : "NEEDS WORK"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-mono">Latency Grade:</span>
                <Badge
                  variant={
                    results.latency_ms.p95 < 100
                      ? "default"
                      : results.latency_ms.p95 < 500
                        ? "secondary"
                        : "destructive"
                  }
                  className="font-mono"
                >
                  {results.latency_ms.p95 < 100 ? "EXCELLENT" : results.latency_ms.p95 < 500 ? "GOOD" : "NEEDS WORK"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
