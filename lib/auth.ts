import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// Configuration depuis les variables d'environnement
const MASTER_PASSWORD = process.env.AUTH_PASSWORD || 'BrockLesnar77';
const SESSION_COOKIE_NAME = 'auth_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-super-secret-key-change-this-in-production';
const SESSION_DURATION = parseInt(process.env.SESSION_DURATION || '86400000'); // 24h par défaut

// Générer un hash pour vérifier le mot de passe
export function generatePasswordHash(): string {
  return bcrypt.hashSync(MASTER_PASSWORD, 12);
}

// Vérifier le mot de passe
export function verifyPassword(password: string): boolean {
  return password === MASTER_PASSWORD;
}

// Générer un token de session simple
export function generateSessionToken(): string {
  return Buffer.from(
    JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36),
    })
  ).toString('base64');
}

// Vérifier un token de session
export function verifySessionToken(token: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const now = Date.now();
    const tokenTime = decoded.timestamp;
    
    // Token valide pendant la durée configurée
    return (now - tokenTime) < SESSION_DURATION;
  } catch {
    return false;
  }
}

// Obtenir l'IP du client
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfIP) {
    return cfIP;
  }
  
  // Fallback pour le développement local
  return request.ip || '127.0.0.1';
}

// Créer un cookie de session sécurisé
export function createSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`;
}

// Supprimer le cookie de session
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

// Extraire le token du cookie
export function getSessionTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  
  if (!sessionCookie) return null;
  
  return sessionCookie.split('=')[1];
}