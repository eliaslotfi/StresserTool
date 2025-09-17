"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Square, Terminal } from "lucide-react"

interface RealTimeMonitorProps {
  isRunning: boolean
  duration: number
  onStop?: () => void
  testId?: string | null
  wsUrlFactory?: (id: string) => string
}

interface LogEntry {
  timestamp: string
  level: "info" | "success" | "warning" | "error"
  message: string
}

export function RealTimeMonitor({ isRunning, duration, onStop, testId, wsUrlFactory }: RealTimeMonitorProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [progress, setProgress] = useState(0)
  const [currentRPS, setCurrentRPS] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const addLog = (level: LogEntry["level"], message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    }
    setLogs((prev) => [...prev, newLog])
  }

  useEffect(() => {
    if (isRunning && !startTimeRef.current) {
      startTimeRef.current = Date.now()
      setLogs([])
      setProgress(0)
      setCurrentRPS(0)
      setTotalRequests(0)
      setElapsedTime(0)
      addLog("info", "Initializing stress test...")
      addLog("info", `Target duration: ${duration} seconds`)

      // WebSocket hookup
      if (testId && wsUrlFactory) {
        try {
          const ws = new WebSocket(wsUrlFactory(testId))
          wsRef.current = ws
          ws.onopen = () => addLog("success", "WebSocket connected")
          ws.onerror = () => addLog("error", "WebSocket error")
          ws.onclose = () => addLog("warning", "WebSocket closed")
          ws.onmessage = (evt) => {
            try {
              const msg = JSON.parse(evt.data)
              if (msg.type === "progress") {
                setElapsedTime(msg.elapsed_s ?? 0)
                setCurrentRPS(msg.rps ?? 0)
                setTotalRequests(msg.requests_sent ?? 0)
                if ((msg.errors ?? 0) > 0 && msg.elapsed_s % 5 === 0) {
                  addLog("warning", `Errors so far: ${msg.errors}`)
                }
              } else if (msg.type === "final") {
                addLog("success", "Final results received")
              }
            } catch {}
          }
        } catch {
          addLog("error", "Failed to open WebSocket")
        }
      }
    } else if (!isRunning && startTimeRef.current) {
      startTimeRef.current = null
      addLog("info", "Test completed")
      if (wsRef.current) {
        try { wsRef.current.close() } catch {}
        wsRef.current = null
      }
    }
  }, [isRunning, duration, testId, wsUrlFactory])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      if (!startTimeRef.current) return

      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const progressPercent = Math.min((elapsed / duration) * 100, 100)

      setProgress(progressPercent)

      if (elapsed >= duration) {
        addLog("success", "Test duration reached - awaiting final results...")
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, duration])

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [logs])

  const getLogColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "text-primary"
      case "warning":
        return "text-chart-3"
      case "error":
        return "text-destructive"
      default:
        return "text-foreground"
    }
  }

  const getLogPrefix = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "[OK]"
      case "warning":
        return "[WARN]"
      case "error":
        return "[ERR]"
      default:
        return "[INFO]"
    }
  }

  if (!isRunning && logs.length === 0) {
    return null
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity className={`w-5 h-5 ${isRunning ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <h3 className="text-lg font-bold text-primary font-mono">REAL-TIME MONITOR</h3>
            </div>
            {isRunning && (
              <Badge variant="default" className="font-mono animate-pulse">
                RUNNING
              </Badge>
            )}
          </div>

          {isRunning && onStop && (
            <Button onClick={onStop} variant="destructive" size="sm" className="font-mono">
              <Square className="w-4 h-4 mr-1" />
              STOP TEST
            </Button>
          )}
        </div>

        {/* Progress and Metrics */}
        {isRunning && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-mono">
                <span>Progress</span>
                <span>
                  {elapsedTime}s / {duration}s
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary font-mono">{currentRPS}</p>
                <p className="text-xs text-muted-foreground font-mono">CURRENT RPS</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent font-mono">{totalRequests.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-mono">TOTAL REQUESTS</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-3 font-mono">
                  {Math.floor((totalRequests / Math.max(elapsedTime, 1)) * 10) / 10}
                </p>
                <p className="text-xs text-muted-foreground font-mono">AVG RPS</p>
              </div>
            </div>
          </div>
        )}

        {/* Console Logs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-primary font-mono">CONSOLE OUTPUT</h4>
          </div>

          <Card className="bg-black/50 border-primary/20">
            <ScrollArea className="h-64 p-4" ref={scrollAreaRef}>
              <div className="space-y-1 font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground">Waiting for test to start...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-muted-foreground text-xs">{log.timestamp}</span>
                      <span className={`text-xs ${getLogColor(log.level)}`}>{getLogPrefix(log.level)}</span>
                      <span className={getLogColor(log.level)}>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>{isRunning ? "Test in progress..." : logs.length > 0 ? "Test completed" : "Ready to start"}</span>
          <span>{logs.length} log entries</span>
        </div>
      </div>
    </Card>
  )
}
