/**
 * Supabase Browser Client
 *
 * Creates a Supabase client for use in Client Components (browser).
 * This client uses cookies for session management and is suitable
 * for client-side operations.
 *
 * @example
 * ```tsx
 * 'use client';
 * import { createBrowserClient } from '@/lib/supabase/client';
 *
 * export function MyComponent() {
 *   const supabase = createBrowserClient();
 *   // Use supabase client...
 * }
 * ```
 */

import { createBrowserClient as createClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for browser/client-side usage.
 * Uses environment variables for configuration.
 *
 * @returns Supabase client instance typed with database schema
 * @throws Error if environment variables are not configured
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
