"use client"
import { AsciiLogo } from "@/components/ascii-logo"
import { TestForm } from "@/components/test-form"
import { ConnectionStatus } from "@/components/connection-status"
import { SecurityWarning } from "@/components/security-warning"
import { LoginForm } from "@/components/login-form"
import { AuthHeader } from "@/components/auth-header"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
  const { isAuthenticated, loading, login, logout } = useAuth();

  // Affichage du loader pendant la vérification d'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Affichage du formulaire de connexion si non authentifié
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  // Affichage de l'application si authentifié
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <AsciiLogo />
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              <AuthHeader onLogout={logout} />
            </div>
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
