import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateSessionToken, createSessionCookie, getClientIP } from '@/lib/auth';
import { authStorage } from '@/lib/auth-storage';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const clientIP = getClientIP(request);
    
    // Vérifier si l'IP est bloquée
    if (authStorage.isBlocked(clientIP)) {
      const blockedUntil = authStorage.getBlockedUntil(clientIP);
      const remainingTime = blockedUntil ? Math.ceil((blockedUntil.getTime() - Date.now()) / (1000 * 60)) : 0;
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Trop de tentatives échouées. Accès bloqué pendant encore ${remainingTime} minutes.`,
          blocked: true,
          remainingTime
        },
        { status: 429 }
      );
    }
    
    // Vérifier le mot de passe
    if (!password || !verifyPassword(password)) {
      // Enregistrer la tentative échouée
      const attempt = authStorage.recordFailedAttempt(clientIP);
      const remainingAttempts = authStorage.getRemainingAttempts(clientIP);
      
      let errorMessage = `Mot de passe incorrect. ${remainingAttempts} tentative(s) restante(s).`;
      
      if (remainingAttempts === 0) {
        errorMessage = 'Trop de tentatives échouées. Accès bloqué pendant 1 heure.';
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          remainingAttempts,
          blocked: remainingAttempts === 0
        },
        { status: 401 }
      );
    }
    
    // Connexion réussie
    authStorage.recordSuccessfulLogin(clientIP);
    const sessionToken = generateSessionToken();
    
    const response = NextResponse.json(
      { success: true, message: 'Connexion réussie' },
      { status: 200 }
    );
    
    // Définir le cookie de session
    response.headers.set('Set-Cookie', createSessionCookie(sessionToken));
    
    return response;
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}