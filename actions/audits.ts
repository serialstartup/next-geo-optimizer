/**
 * Audit Server Actions
 *
 * Server actions for managing GEO audits.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { createJob } from '@/lib/jobs/service';
import type { Audit, AuditWithRecommendations } from '@/types/database';
import type { CrawlJobPayload } from '@/lib/jobs/types';

// ============================================================================
// SCHEMAS
// ============================================================================

const startAuditSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  crawlConfig: z
    .object({
      maxPages: z.number().min(1).max(500).default(50),
      includePatterns: z.array(z.string()).default([]),
      excludePatterns: z.array(z.string()).default([]),
      respectRobots: z.boolean().default(true),
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

export interface AuditWithJob extends Audit {
  jobId?: string;
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Starts a new GEO audit for a site
 *
 * @param input - Audit configuration
 * @returns Action result with audit and job ID
 */
export async function startAudit(
  input: z.infer<typeof startAuditSchema>
): Promise<ActionResult<AuditWithJob>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parseResult = startAuditSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || 'Validation failed' };
    }

    const { siteId, crawlConfig } = parseResult.data;

    // Verify site ownership
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (siteError || !site) {
      return { success: false, error: 'Site not found' };
    }

    const typedSite = site as { id: string; domain: string; crawl_config: Record<string, unknown> };

    // Check for existing pending/running audit
    const { data: existingAudit } = await supabase
      .from('audits')
      .select('id')
      .eq('site_id', siteId)
      .in('status', ['pending', 'crawling', 'analyzing'])
      .single();

    if (existingAudit) {
      return { success: false, error: 'An audit is already in progress for this site' };
    }

    // Create audit record
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        site_id: siteId,
        status: 'crawling',
      } as never)
      .select()
      .single();

    if (auditError || !audit) {
      console.error('Error creating audit:', auditError);
      return { success: false, error: 'Failed to create audit' };
    }

    const typedAudit = audit as Audit;

    // Create crawl job
    const config = crawlConfig || typedSite.crawl_config;
    const payload: CrawlJobPayload = {
      siteId,
      domain: typedSite.domain,
      config: {
        maxPages: (config as Record<string, unknown>).max_pages as number || 50,
        includePatterns: (config as Record<string, unknown>).include_patterns as string[] || [],
        excludePatterns: (config as Record<string, unknown>).exclude_patterns as string[] || [],
        respectRobots: (config as Record<string, unknown>).respect_robots as boolean ?? true,
      },
    };

    const job = await createJob({
      type: 'crawl',
      payload,
      userId: user.id,
    });

    // Update audit with job ID
    await supabase
      .from('audits')
      .update({ job_id: job.id } as never)
      .eq('id', typedAudit.id);

    revalidatePath('/audit');
    revalidatePath('/');

    return {
      success: true,
      data: { ...typedAudit, jobId: job.id },
    };
  } catch (error) {
    console.error('Error in startAudit:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets audit results by ID
 *
 * @param auditId - Audit ID
 * @returns Action result with audit and recommendations
 */
export async function getAuditResults(
  auditId: string
): Promise<ActionResult<AuditWithRecommendations>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get audit with recommendations
    const { data: audit, error } = await supabase
      .from('audits')
      .select(`
        *,
        recommendations (*),
        sites!inner (user_id)
      `)
      .eq('id', auditId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Audit not found' };
      }
      console.error('Error getting audit:', error);
      return { success: false, error: 'Failed to get audit' };
    }

    const typedAudit = audit as AuditWithRecommendations & { sites: { user_id: string } };

    // Verify ownership
    if (typedAudit.sites.user_id !== user.id) {
      return { success: false, error: 'Audit not found' };
    }

    return { success: true, data: typedAudit };
  } catch (error) {
    console.error('Error in getAuditResults:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets audit history for a site
 *
 * @param siteId - Site ID
 * @param limit - Maximum number of audits to return
 * @returns Action result with audits array
 */
export async function getAuditHistory(
  siteId: string,
  limit: number = 10
): Promise<ActionResult<Audit[]>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify site ownership
    const { data: site } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (!site) {
      return { success: false, error: 'Site not found' };
    }

    // Get audits
    const { data: audits, error } = await supabase
      .from('audits')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting audit history:', error);
      return { success: false, error: 'Failed to get audit history' };
    }

    return { success: true, data: (audits || []) as Audit[] };
  } catch (error) {
    console.error('Error in getAuditHistory:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
