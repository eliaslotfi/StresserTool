"use client"
import { AsciiLogo } from "@/components/ascii-logo"
import { TestForm } from "@/components/test-form"
import { ConnectionStatus } from "@/components/connection-status"
import { SecurityWarning } from "@/components/security-warning"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <AsciiLogo />
            <ConnectionStatus />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Security Warning */}
          <SecurityWarning />

          {/* Test Configuration */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">{">"} CONFIGURE STRESS TEST</h2>
                <p className="text-muted-foreground">Set up your load testing parameters below</p>
              </div>

              <TestForm />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
