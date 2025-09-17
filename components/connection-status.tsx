"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { api } from "@/lib/api"

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await api.checkHealth()
      setIsConnected(connected)
    }

    checkConnection()
    const interval = setInterval(checkConnection, 10000) // Check every 10s

    return () => clearInterval(interval)
  }, [])

  if (isConnected === null) {
    return (
      <Badge variant="secondary" className="font-mono">
        <Wifi className="w-4 h-4 mr-1" />
        CHECKING...
      </Badge>
    )
  }

  return (
    <Badge variant={isConnected ? "default" : "destructive"} className="font-mono">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 mr-1" />
          BACKEND ONLINE
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 mr-1" />
          BACKEND OFFLINE
        </>
      )}
    </Badge>
  )
}
