/**
 * Supabase Server Client
 *
 * Creates Supabase clients for use in Server Components, Route Handlers,
 * and Server Actions. Uses cookies for session management.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { createServerClient } from '@/lib/supabase/server';
 *
 * export default async function Page() {
 *   const supabase = await createServerClient();
 *   const { data } = await supabase.from('sites').select('*');
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In a Route Handler
 * import { createServerClient } from '@/lib/supabase/server';
 *
 * export async function GET() {
 *   const supabase = await createServerClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   return Response.json({ user });
 * }
 * ```
 */

import { createServerClient as createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for server-side usage.
 * Handles cookie management for session persistence.
 *
 * @returns Promise resolving to Supabase client instance typed with database schema
 * @throws Error if environment variables are not configured
 */
export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const cookieStore = await cookies();

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Creates a Supabase admin client with service role key.
 * Use this for operations that need to bypass Row Level Security.
 *
 * WARNING: Only use this in secure server-side contexts.
 * Never expose the service role key to the client.
 *
 * @returns Promise resolving to Supabase admin client instance
 * @throws Error if environment variables are not configured
 */
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  const cookieStore = await cookies();

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore errors from Server Components
        }
      },
    },
  });
}

/**
 * Gets the current authenticated user from the server.
 * Returns null if no user is authenticated.
 *
 * @returns Promise resolving to the current user or null
 */
export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Gets the current session from the server.
 * Returns null if no session exists.
 *
 * @returns Promise resolving to the current session or null
 */
export async function getSession() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
