// ABOUTME: Middleware for admin authentication
// ABOUTME: Protects admin routes using custom session-based auth

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin routes that require authentication
const protectedAdminRoutes = [
  '/admin',
  '/admin/applications',
  '/admin/manual-review',
  '/admin/waitlist',
  '/admin/contractors',
  '/admin/users',
  '/admin/audit',
];

// Admin routes that don't require authentication
const publicAdminRoutes = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an admin route
  if (pathname.startsWith('/admin')) {
    // Allow public admin routes
    if (publicAdminRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check for session cookie
    const sessionToken = request.cookies.get('suprfi_admin_session')?.value;

    if (!sessionToken) {
      // Redirect to login if no session
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists - let the API/page validate it
    // The actual session validation happens in the API routes and pages
    return NextResponse.next();
  }

  // All other routes are public
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run middleware on admin routes
    '/admin/:path*',
  ],
};
