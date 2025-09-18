// Version client-side de l'authentification pour déploiement statique

const MASTER_PASSWORD = 'BrockLesnar77'; // En production, vous pourriez vouloir hasher ceci
const SESSION_KEY = 'stress_test_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h

export interface AuthSession {
  authenticated: boolean;
  timestamp: number;
  ip?: string;
}

// Vérifier le mot de passe (côté client)
export function verifyPassword(password: string): boolean {
  return password === MASTER_PASSWORD;
}

// Créer une session
export function createSession(): AuthSession {
  const session: AuthSession = {
    authenticated: true,
    timestamp: Date.now(),
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  
  return session;
}

// Vérifier la session
export function verifySession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }
    
    const session: AuthSession = JSON.parse(sessionData);
    const now = Date.now();
    
    // Vérifier si la session n'est pas expirée
    if (now - session.timestamp > SESSION_DURATION) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

// Déconnecter
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

// Hook pour l'authentification
export function useAuthStatic() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const session = verifySession();
    setIsAuthenticated(!!session);
    setLoading(false);
  }, []);
  
  const login = (password: string): boolean => {
    if (verifyPassword(password)) {
      createSession();
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  
  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };
  
  return {
    isAuthenticated,
    loading,
    login,
    logout: handleLogout,
  };
}

// Import React pour useState et useEffect
import { useState, useEffect } from 'react';
