import { AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"

export function SecurityWarning() {
  return (
    <Card className="p-4 border-destructive bg-destructive/10">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="font-bold text-destructive font-mono">SECURITY WARNING</h3>
          <p className="text-sm text-destructive-foreground">
            This tool is designed for educational purposes and testing your own servers only. Any unauthorized use
            against third-party systems is illegal and unethical. Always ensure you have explicit permission before
            conducting load tests.
          </p>
          <p className="text-xs text-destructive-foreground/80 font-mono">Use responsibly. Test only what you own.</p>
        </div>
      </div>
    </Card>
  )
}
