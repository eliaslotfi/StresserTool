import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionTokenFromCookies, verifySessionToken } from '@/lib/auth';

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/', // protège la page d'accueil (toutes les pages Next.js sauf login)
  '/api', // protège toutes les routes API sauf auth
];

// Routes d'authentification qui ne nécessitent pas d'être authentifié
const authRoutes = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/status',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Laisser passer les routes d'authentification
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Protéger toutes les autres routes (sauf assets publics)
  if (
    protectedRoutes.some(route => pathname === route || pathname.startsWith(route)) &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/public') &&
    !pathname.startsWith('/favicon')
  ) {
    const cookieHeader = request.headers.get('cookie');
    const sessionToken = getSessionTokenFromCookies(cookieHeader);
    if (!sessionToken || !verifySessionToken(sessionToken)) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};