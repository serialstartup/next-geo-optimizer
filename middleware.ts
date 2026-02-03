/**
 * Next.js Middleware
 *
 * Handles authentication session refresh and route protection.
 * Runs on every request to protected routes.
 */

import { NextResponse, type NextRequest } from 'next/server';
import {
  updateSession,
  isProtectedRoute,
  isAuthRoute,
} from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // DEVELOPMENT MODE: Skip auth check if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Allow access to all routes in development without Supabase
    return NextResponse.next();
  }

  // Update the session and get user
  const { supabaseResponse, user } = await updateSession(request);

  // Handle protected routes - redirect to login if not authenticated
  if (isProtectedRoute(pathname) && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes - redirect to dashboard if already authenticated
  if (isAuthRoute(pathname) && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return supabaseResponse;
}

/**
 * Matcher configuration
 *
 * Excludes:
 * - _next/static (static files)
 * - _next/image (image optimization files)
 * - favicon.ico (favicon file)
 * - public folder files (images, etc.)
 * - API routes that handle their own auth
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
