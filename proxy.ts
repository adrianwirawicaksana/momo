import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPrefixes = ['/dashboard'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedDashboard = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtectedDashboard) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth_token')?.value;

  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard'],
};
