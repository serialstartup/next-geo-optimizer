/**
 * Supabase Middleware Helper
 *
 * Creates a Supabase client for use in Next.js middleware.
 * Handles session refresh and cookie management.
 *
 * @example
 * ```ts
 * // In middleware.ts
 * import { updateSession } from '@/lib/supabase/middleware';
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request);
 * }
 * ```
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/**
 * Result type for updateSession function
 */
export interface UpdateSessionResult {
  supabaseResponse: NextResponse;
  user: import('@supabase/supabase-js').User | null;
}

/**
 * Updates the user session and handles cookie management in middleware.
 * This should be called on every request to keep the session fresh.
 *
 * @param request - The incoming Next.js request
 * @returns Object containing NextResponse with updated cookies and user
 */
export async function updateSession(
  request: NextRequest
): Promise<UpdateSessionResult> {
  // Create a response that we can modify
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware');
    return { supabaseResponse, user: null };
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not use getSession() here as it doesn't validate the session.
  // Use getUser() instead which validates the JWT.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}

/**
 * Protected routes configuration
 */
export const protectedRoutes = [
  '/dashboard',
  '/dashboard/setup',
  '/dashboard/audit',
  '/dashboard/brand-voice',
  '/dashboard/simulation',
  '/dashboard/recommendations',
  '/dashboard/content',
  '/dashboard/monitoring',
  '/dashboard/progress',
  '/dashboard/assistant',
  '/dashboard/settings',
];

/**
 * Auth routes that should redirect to dashboard if already logged in
 */
export const authRoutes = ['/login', '/signup', '/forgot-password'];

/**
 * Checks if a path matches any of the protected routes
 *
 * @param pathname - The request pathname
 * @returns boolean indicating if the route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Checks if a path matches any of the auth routes
 *
 * @param pathname - The request pathname
 * @returns boolean indicating if the route is an auth route
 */
export function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
