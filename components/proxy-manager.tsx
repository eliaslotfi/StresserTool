"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Upload, Download, Shield } from "lucide-react"

interface ProxyManagerProps {
  proxies: string[]
  onProxiesChange: (proxies: string[]) => void
}

export function ProxyManager({ proxies, onProxiesChange }: ProxyManagerProps) {
  const [newProxy, setNewProxy] = useState("")
  const [bulkProxies, setBulkProxies] = useState("")

  const addProxy = () => {
    if (newProxy.trim() && !proxies.includes(newProxy.trim())) {
      onProxiesChange([...proxies, newProxy.trim()])
      setNewProxy("")
    }
  }

  const removeProxy = (index: number) => {
    onProxiesChange(proxies.filter((_, i) => i !== index))
  }

  const addBulkProxies = () => {
    const newProxies = bulkProxies
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !proxies.includes(line))

    onProxiesChange([...proxies, ...newProxies])
    setBulkProxies("")
  }

  const clearAllProxies = () => {
    onProxiesChange([])
  }

  const exportProxies = () => {
    const dataStr = proxies.join("\n")
    const dataBlob = new Blob([dataStr], { type: "text/plain" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `proxies-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importProxies = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const importedProxies = content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0 && !proxies.includes(line))

        onProxiesChange([...proxies, ...importedProxies])
      }
      reader.readAsText(file)
    }
    event.target.value = ""
  }

  const getProxyType = (proxy: string) => {
    if (proxy.startsWith("socks5://")) return "SOCKS5"
    if (proxy.startsWith("socks4://")) return "SOCKS4"
    if (proxy.startsWith("http://")) return "HTTP"
    if (proxy.startsWith("https://")) return "HTTPS"
    return "UNKNOWN"
  }

  const getProxyTypeColor = (type: string) => {
    switch (type) {
      case "SOCKS5":
        return "bg-primary text-primary-foreground"
      case "SOCKS4":
        return "bg-accent text-accent-foreground"
      case "HTTP":
        return "bg-chart-3 text-foreground"
      case "HTTPS":
        return "bg-chart-2 text-foreground"
      default:
        return "bg-destructive text-destructive-foreground"
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary font-mono">PROXY MANAGEMENT</h3>
            <p className="text-sm text-muted-foreground">Configure proxies for distributed load testing</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              {proxies.length} PROXIES
            </Badge>
            {proxies.length > 0 && (
              <Button onClick={clearAllProxies} variant="destructive" size="sm" className="font-mono">
                <Trash2 className="w-4 h-4 mr-1" />
                CLEAR ALL
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single" className="font-mono">
              SINGLE
            </TabsTrigger>
            <TabsTrigger value="bulk" className="font-mono">
              BULK
            </TabsTrigger>
            <TabsTrigger value="manage" className="font-mono">
              MANAGE
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="new-proxy" className="text-primary font-mono">
                  ADD PROXY
                </Label>
                <Input
                  id="new-proxy"
                  placeholder="socks5://user:pass@proxy.com:1080"
                  value={newProxy}
                  onChange={(e) => setNewProxy(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addProxy()}
                  className="font-mono bg-input border-border focus:border-primary"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={addProxy}
                  disabled={!newProxy.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  ADD
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-mono">Supported formats:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>socks5://proxy.com:1080</li>
                <li>socks5://user:pass@proxy.com:1080</li>
                <li>http://proxy.com:8080</li>
                <li>https://proxy.com:8080</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <div>
              <Label htmlFor="bulk-proxies" className="text-primary font-mono">
                BULK ADD PROXIES
              </Label>
              <Textarea
                id="bulk-proxies"
                placeholder="socks5://proxy1.com:1080&#10;http://proxy2.com:8080&#10;socks5://user:pass@proxy3.com:1080"
                value={bulkProxies}
                onChange={(e) => setBulkProxies(e.target.value)}
                className="font-mono bg-input border-border focus:border-primary min-h-[120px]"
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">One proxy per line. Duplicates will be ignored.</p>
            </div>

            <Button
              onClick={addBulkProxies}
              disabled={!bulkProxies.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
            >
              <Plus className="w-4 h-4 mr-1" />
              ADD BULK PROXIES
            </Button>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={exportProxies}
                disabled={proxies.length === 0}
                variant="outline"
                className="font-mono bg-transparent"
              >
                <Download className="w-4 h-4 mr-1" />
                EXPORT
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".txt"
                  onChange={importProxies}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="font-mono bg-transparent">
                  <Upload className="w-4 h-4 mr-1" />
                  IMPORT
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Export: Save current proxy list to a text file</p>
              <p>Import: Load proxies from a text file (one per line)</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Proxy List */}
        {proxies.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-muted-foreground font-mono">CONFIGURED PROXIES</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {proxies.map((proxy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge className={`${getProxyTypeColor(getProxyType(proxy))} font-mono text-xs`}>
                      {getProxyType(proxy)}
                    </Badge>
                    <code className="text-sm font-mono truncate flex-1">{proxy}</code>
                  </div>
                  <Button
                    onClick={() => removeProxy(index)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Panel */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-primary font-mono text-sm">PROXY USAGE NOTES</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Proxies distribute load across multiple IP addresses</li>
                <li>• SOCKS5 proxies generally offer better performance</li>
                <li>• Authentication is supported (user:pass@host:port)</li>
                <li>• Invalid proxies will be skipped during testing</li>
                <li>• Use your own proxies or trusted proxy services only</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  )
}
