export interface TestRequest {
  url: string
  duration: number
  concurrency: number
  proxies: string[]
}

export interface TestResult {
  requests_sent: number
  rps: number
  latency_ms: {
    p50: number
    p95: number
    p99: number
  }
  duration_s: number
  errors?: number
  test_id?: string
  started_at?: string
  finished_at?: string | null
}

export interface StartTestResponse {
  test_id: string
  started_at: string
}

export class StressTestAPI {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl = "http://localhost:8000", apiKey?: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_STRESS_API_KEY : undefined)
  }

  get websocketBase(): string {
    const url = new URL(this.baseUrl)
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
    return url.origin
  }

  async runTest(request: TestRequest): Promise<TestResult> {
    const response = await fetch(`${this.baseUrl}/run_test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { "x-api-key": this.apiKey } : {}),
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Test failed")
    }

    return response.json()
  }

  async startTest(request: TestRequest): Promise<StartTestResponse> {
    const response = await fetch(`${this.baseUrl}/tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(this.apiKey ? { "x-api-key": this.apiKey } : {}) },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || "Failed to start test")
    }
    return response.json()
  }

  async getStatus(testId: string): Promise<TestResult> {
    const res = await fetch(`${this.baseUrl}/tests/${testId}`, {
      headers: { ...(this.apiKey ? { "x-api-key": this.apiKey } : {}) },
    })
    if (!res.ok) throw new Error("Failed to get status")
    return res.json()
  }

  async cancelTest(testId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/tests/${testId}/cancel`, {
      method: "POST",
      headers: { ...(this.apiKey ? { "x-api-key": this.apiKey } : {}) },
    })
    if (!res.ok) throw new Error("Failed to cancel test")
  }

  async downloadReport(testId: string, format: "json" | "csv" = "json"): Promise<Blob> {
    const res = await fetch(`${this.baseUrl}/tests/${testId}/report?format=${format}`, {
      headers: { ...(this.apiKey ? { "x-api-key": this.apiKey } : {}) },
    })
    if (!res.ok) throw new Error("Failed to fetch report")
    return res.blob()
  }

  wsUrl(testId: string): string {
    const url = new URL(`${this.websocketBase}/ws/tests/${testId}`)
    if (this.apiKey) url.searchParams.set("key", this.apiKey)
    return url.toString()
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        headers: { ...(this.apiKey ? { "x-api-key": this.apiKey } : {}) },
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const api = new StressTestAPI(
  process.env.NEXT_PUBLIC_STRESS_API_BASE || "http://localhost:8000",
  process.env.NEXT_PUBLIC_STRESS_API_KEY
)
