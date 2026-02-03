/**
 * Site Server Actions
 *
 * Server actions for managing sites in the GEO Optimizer platform.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import type { Site, CrawlConfig } from '@/types/database';

// ============================================================================
// SCHEMAS
// ============================================================================

const createSiteSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/, 'Invalid domain format'),
  name: z.string().optional(),
  crawlConfig: z
    .object({
      max_pages: z.number().min(1).max(500).default(50),
      include_patterns: z.array(z.string()).default([]),
      exclude_patterns: z.array(z.string()).default([]),
      respect_robots: z.boolean().default(true),
    })
    .optional(),
});

const updateSiteSchema = z.object({
  id: z.string().uuid(),
  domain: z.string().optional(),
  name: z.string().nullable().optional(),
  crawlConfig: z
    .object({
      max_pages: z.number().min(1).max(500),
      include_patterns: z.array(z.string()),
      exclude_patterns: z.array(z.string()),
      respect_robots: z.boolean(),
    })
    .optional(),
});

// ============================================================================
// TYPES
// ============================================================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Creates a new site
 *
 * @param formData - Form data or object with site details
 * @returns Action result with created site
 */
export async function createSite(
  input: z.infer<typeof createSiteSchema>
): Promise<ActionResult<Site>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parseResult = createSiteSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || 'Validation failed' };
    }

    const { domain, name, crawlConfig } = parseResult.data;

    // Check if site already exists for this user
    const { data: existingSite } = await supabase
      .from('sites')
      .select('id')
      .eq('user_id', user.id)
      .eq('domain', domain)
      .single();

    if (existingSite) {
      return { success: false, error: 'Site with this domain already exists' };
    }

    // Create site
    const { data: site, error } = await supabase
      .from('sites')
      .insert({
        user_id: user.id,
        domain,
        name: name || null,
        crawl_config: crawlConfig || {
          max_pages: 50,
          include_patterns: [],
          exclude_patterns: [],
          respect_robots: true,
        },
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating site:', error);
      return { success: false, error: 'Failed to create site' };
    }

    revalidatePath('/setup');
    revalidatePath('/');

    return { success: true, data: site as Site };
  } catch (error) {
    console.error('Error in createSite:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates an existing site
 *
 * @param input - Site update data
 * @returns Action result with updated site
 */
export async function updateSite(
  input: z.infer<typeof updateSiteSchema>
): Promise<ActionResult<Site>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parseResult = updateSiteSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || 'Validation failed' };
    }

    const { id, domain, name, crawlConfig } = parseResult.data;

    // Verify ownership
    const { data: existingSite } = await supabase
      .from('sites')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingSite) {
      return { success: false, error: 'Site not found' };
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (domain !== undefined) updateData.domain = domain;
    if (name !== undefined) updateData.name = name;
    if (crawlConfig !== undefined) updateData.crawl_config = crawlConfig;

    // Update site
    const { data: site, error } = await supabase
      .from('sites')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating site:', error);
      return { success: false, error: 'Failed to update site' };
    }

    revalidatePath('/setup');
    revalidatePath('/');

    return { success: true, data: site as Site };
  } catch (error) {
    console.error('Error in updateSite:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Deletes a site
 *
 * @param siteId - Site ID to delete
 * @returns Action result
 */
export async function deleteSite(siteId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const { data: existingSite } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (!existingSite) {
      return { success: false, error: 'Site not found' };
    }

    // Delete site (cascades to related records)
    const { error } = await supabase.from('sites').delete().eq('id', siteId);

    if (error) {
      console.error('Error deleting site:', error);
      return { success: false, error: 'Failed to delete site' };
    }

    revalidatePath('/setup');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error in deleteSite:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets all sites for the current user
 *
 * @returns Action result with sites array
 */
export async function getSites(): Promise<ActionResult<Site[]>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: sites, error } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting sites:', error);
      return { success: false, error: 'Failed to get sites' };
    }

    return { success: true, data: (sites || []) as Site[] };
  } catch (error) {
    console.error('Error in getSites:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets a single site by ID
 *
 * @param siteId - Site ID
 * @returns Action result with site
 */
export async function getSiteById(siteId: string): Promise<ActionResult<Site>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: site, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Site not found' };
      }
      console.error('Error getting site:', error);
      return { success: false, error: 'Failed to get site' };
    }

    return { success: true, data: site as Site };
  } catch (error) {
    console.error('Error in getSiteById:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
