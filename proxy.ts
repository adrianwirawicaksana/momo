import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPrefixes = ['/dashboard'];

const isExpiredToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedDashboard = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtectedDashboard) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth_token')?.value;

  if (!authToken || isExpiredToken(authToken)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    const response = NextResponse.redirect(loginUrl);

    if (authToken) {
      response.cookies.delete('auth_token');
      response.cookies.delete('user_role');
      response.cookies.delete('guru_profile');
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard'],
};
