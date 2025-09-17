// Système de stockage en mémoire pour les tentatives de connexion
// En production, vous devriez utiliser une base de données ou Redis

interface LoginAttempt {
  ip: string;
  attempts: number;
  lastAttempt: Date;
  blockedUntil?: Date;
}

class AuthStorage {
  private attempts: Map<string, LoginAttempt> = new Map();
  
  // Nettoyage automatique des anciennes tentatives toutes les 10 minutes
  constructor() {
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000); // 10 minutes
  }

  private cleanup() {
    const now = new Date();
    for (const [ip, attempt] of this.attempts.entries()) {
      // Supprimer les tentatives anciennes de plus de 24h
      if (now.getTime() - attempt.lastAttempt.getTime() > 24 * 60 * 60 * 1000) {
        this.attempts.delete(ip);
      }
    }
  }

  getAttempts(ip: string): LoginAttempt | undefined {
    return this.attempts.get(ip);
  }

  recordFailedAttempt(ip: string): LoginAttempt {
    const now = new Date();
    const existing = this.attempts.get(ip);
    
    if (existing) {
      existing.attempts += 1;
      existing.lastAttempt = now;
      
      // Bloquer après le nombre maximum de tentatives configuré
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      const blockDuration = parseInt(process.env.BLOCK_DURATION || '3600000'); // 1h par défaut
      
      if (existing.attempts >= maxAttempts) {
        existing.blockedUntil = new Date(now.getTime() + blockDuration);
      }
    } else {
      this.attempts.set(ip, {
        ip,
        attempts: 1,
        lastAttempt: now
      });
    }
    
    return this.attempts.get(ip)!;
  }

  recordSuccessfulLogin(ip: string) {
    // Réinitialiser les tentatives après une connexion réussie
    this.attempts.delete(ip);
  }

  isBlocked(ip: string): boolean {
    const attempt = this.attempts.get(ip);
    if (!attempt || !attempt.blockedUntil) return false;
    
    const now = new Date();
    if (now < attempt.blockedUntil) {
      return true;
    }
    
    // Le blocage a expiré, réinitialiser
    attempt.attempts = 0;
    attempt.blockedUntil = undefined;
    return false;
  }

  getBlockedUntil(ip: string): Date | null {
    const attempt = this.attempts.get(ip);
    return attempt?.blockedUntil || null;
  }

  getRemainingAttempts(ip: string): number {
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
    const attempt = this.attempts.get(ip);
    if (!attempt) return maxAttempts;
    return Math.max(0, maxAttempts - attempt.attempts);
  }
}

export const authStorage = new AuthStorage();