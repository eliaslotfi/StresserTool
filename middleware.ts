import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionTokenFromCookies, verifySessionToken } from '@/lib/auth';

// Routes publiques (à adapter si besoin)
const PUBLIC_PATHS = ['/login', '/api/auth'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((publicPath) =>
    pathname === publicPath || pathname.startsWith(publicPath + '/')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get('cookie');
  const sessionToken = getSessionTokenFromCookies(cookieHeader);

  if (!sessionToken || !verifySessionToken(sessionToken)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};