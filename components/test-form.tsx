"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Loader2, Play, AlertTriangle } from "lucide-react"
import { api, type TestRequest, type TestResult } from "@/lib/api"
import { TestResults } from "@/components/test-results"
import { ProxyManager } from "@/components/proxy-manager"
import { RealTimeMonitor } from "@/components/real-time-monitor"

export function TestForm() {
  const [formData, setFormData] = useState<TestRequest>({
    url: "",
    duration: 60,
    concurrency: 10,
    proxies: [],
  })

  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testId, setTestId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRunning(true)
    setError(null)
    setResults(null)

    try {
      const started = await api.startTest(formData)
      setTestId(started.test_id)
      const poll = async () => {
        try {
          const status = await api.getStatus(started.test_id)
          if (status.finished_at) {
            setResults(status)
            setIsRunning(false)
          } else {
            setTimeout(poll, 1000)
          }
        } catch {
          setTimeout(poll, 1500)
        }
      }
      setTimeout(poll, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed")
      setIsRunning(false)
    }
  }

  const handleStopTest = async () => {
    try {
      if (testId) await api.cancelTest(testId)
      setError("Test stopped by user")
    } catch (e) {
      setError("Failed to stop test")
    } finally {
      setIsRunning(false)
    }
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return url.startsWith("http://") || url.startsWith("https://")
    } catch {
      return false
    }
  }

  const canSubmit = isValidUrl(formData.url) && formData.duration >= 5 && formData.concurrency >= 1 && !isRunning

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target URL */}
          <div className="md:col-span-2">
            <Label htmlFor="url" className="text-primary font-mono">
              TARGET URL
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="http://192.168.1.100"
              value={formData.url}
              onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              className="font-mono bg-input border-border focus:border-primary"
              required
              disabled={isRunning}
            />
            {formData.url && !isValidUrl(formData.url) && (
              <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Invalid URL format
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration" className="text-primary font-mono">
              DURATION (seconds)
            </Label>
            <Input
              id="duration"
              type="number"
              min="5"
              max="3600"
              value={formData.duration}
              onChange={(e) => setFormData((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 60 }))}
              className="font-mono bg-input border-border focus:border-primary"
              disabled={isRunning}
            />
            <p className="text-muted-foreground text-xs mt-1">Min: 5s, Max: 3600s</p>
          </div>

          {/* Concurrency */}
          <div>
            <Label htmlFor="concurrency" className="text-primary font-mono">
              CONCURRENCY
            </Label>
            <Input
              id="concurrency"
              type="number"
              min="1"
              max="1000"
              value={formData.concurrency}
              onChange={(e) => setFormData((prev) => ({ ...prev, concurrency: Number.parseInt(e.target.value) || 10 }))}
              className="font-mono bg-input border-border focus:border-primary"
              disabled={isRunning}
            />
            <p className="text-muted-foreground text-xs mt-1">Simultaneous requests (1-1000)</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-lg px-8 py-3"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                RUNNING TEST...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                LAUNCH STRESS TEST
              </>
            )}
          </Button>
        </div>
      </form>

      {/* ProxyManager - disabled during test */}
      {!isRunning && (
        <ProxyManager
          proxies={formData.proxies}
          onProxiesChange={(proxies) => setFormData((prev) => ({ ...prev, proxies }))}
        />
      )}

      {/* Real-time Monitor */}
      <RealTimeMonitor
        isRunning={isRunning}
        duration={formData.duration}
        onStop={handleStopTest}
        testId={testId}
        wsUrlFactory={(id) => api.wsUrl(id)}
      />

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-mono font-bold">ERROR:</span>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Results */}
      {results && <TestResults results={results} />}
    </div>
  )
}
