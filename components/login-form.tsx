"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield, AlertTriangle } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        redirect: 'manual', // important pour détecter la redirection
      });

      // Si redirection, suivre la redirection côté client
      if (response.status === 302 || response.type === 'opaqueredirect') {
        window.location.href = '/';
        return;
      }

      // Sinon, traiter la réponse JSON (erreur de login)
      const data = await response.json();
      if (data.success) {
        onLogin();
      } else {
        setError(data.error);
        setRemainingAttempts(data.remainingAttempts ?? null);
        setBlocked(data.blocked ?? false);
        setRemainingTime(data.remainingTime ?? null);
        setPassword('');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Accès Sécurisé</CardTitle>
            <CardDescription>
              Veuillez entrer le mot de passe pour accéder au système
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant={blocked ? "destructive" : "default"} className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {remainingAttempts !== null && remainingAttempts > 0 && !blocked && (
            <Alert className="mb-4">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {remainingAttempts} tentative(s) restante(s) avant blocage
              </AlertDescription>
            </Alert>
          )}

          {blocked && remainingTime && (
            <Alert variant="destructive" className="mb-4">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Accès bloqué pendant encore {remainingTime} minute(s)
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || blocked}
                className="w-full"
                autoFocus
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || blocked || !password}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-xs text-muted-foreground text-center space-y-1">
            <p>🔒 Protection anti-bruteforce activée</p>
            <p>⚠️ Blocage automatique après 5 tentatives échouées</p>
            <p>⏱️ Durée de blocage : 1 heure</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}