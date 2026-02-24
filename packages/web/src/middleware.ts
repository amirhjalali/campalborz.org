import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js middleware for route protection.
 *
 * Since auth tokens are stored in localStorage (not accessible server-side),
 * this middleware uses a lightweight "auth-session" cookie as a hint.
 * The cookie is set client-side when users log in and cleared on logout.
 *
 * This provides defense-in-depth:
 * - Server-side: middleware redirects to /login if no session cookie
 * - Client-side: AuthContext validates the actual JWT and redirects if invalid
 * - API-side: tRPC procedures verify the JWT on every request
 */

const PROTECTED_PATHS = ['/portal', '/admin', '/members'];
const AUTH_PAGES = ['/login', '/admin/login', '/forgot-password', '/reset-password', '/register'];
const SESSION_COOKIE = 'ca-auth-session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === '1';

  // Check if the current path is protected
  const isProtectedPath = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // Allow /admin/login through even though /admin is protected
  const isAdminLoginPage = pathname === '/admin/login';

  // Check if the current path is an auth page (login, register, etc.)
  const isAuthPage = AUTH_PAGES.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // Protected routes: redirect to login if no session cookie
  if (isProtectedPath && !isAdminLoginPage && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages: redirect to portal if already has session cookie
  // (client-side will handle proper role-based redirect)
  if (isAuthPage && hasSession) {
    const portalUrl = new URL('/portal', request.url);
    return NextResponse.redirect(portalUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected and auth paths
    '/portal/:path*',
    '/admin/:path*',
    '/members/:path*',
    '/login',
    '/admin/login',
    '/forgot-password',
    '/reset-password',
    '/register',
  ],
};
