import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Déconnexion réussie' },
    { status: 200 }
  );
  
  // Supprimer le cookie de session
  response.headers.set('Set-Cookie', clearSessionCookie());
  
  return response;
}