import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromCookies, verifySessionToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const sessionToken = getSessionTokenFromCookies(cookieHeader);
  
  if (!sessionToken || !verifySessionToken(sessionToken)) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
  
  return NextResponse.json(
    { authenticated: true },
    { status: 200 }
  );
}