/**
 * Recommendation Server Actions
 *
 * Server actions for managing GEO recommendations.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import type { Recommendation, RecommendationStatus } from '@/types/database';

// ============================================================================
// SCHEMAS
// ============================================================================

const updateStatusSchema = z.object({
  recommendationId: z.string().uuid('Invalid recommendation ID'),
  status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']),
});

// ============================================================================
// TYPES
// ============================================================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RecommendationFilters {
  auditId?: string;
  siteId?: string;
  status?: RecommendationStatus;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  type?: string;
  limit?: number;
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Gets recommendations with optional filters
 *
 * @param filters - Optional filters
 * @returns Action result with recommendations array
 */
export async function getRecommendations(
  filters: RecommendationFilters = {}
): Promise<ActionResult<Recommendation[]>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Build query based on filters
    let query = supabase
      .from('recommendations')
      .select(`
        *,
        audits!inner (
          site_id,
          sites!inner (user_id)
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.auditId) {
      query = query.eq('audit_id', filters.auditId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data: recommendations, error } = await query;

    if (error) {
      console.error('Error getting recommendations:', error);
      return { success: false, error: 'Failed to get recommendations' };
    }

    // Filter by user ownership
    const userRecommendations = (recommendations || []).filter((rec) => {
      const typedRec = rec as Recommendation & {
        audits: { site_id: string; sites: { user_id: string } };
      };
      return typedRec.audits.sites.user_id === user.id;
    });

    // If filtering by siteId, apply that filter
    const filteredRecommendations = filters.siteId
      ? userRecommendations.filter((rec) => {
          const typedRec = rec as Recommendation & {
            audits: { site_id: string; sites: { user_id: string } };
          };
          return typedRec.audits.site_id === filters.siteId;
        })
      : userRecommendations;

    return { success: true, data: filteredRecommendations as Recommendation[] };
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates recommendation status
 *
 * @param input - Recommendation ID and new status
 * @returns Action result with updated recommendation
 */
export async function updateRecommendationStatus(
  input: z.infer<typeof updateStatusSchema>
): Promise<ActionResult<Recommendation>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parseResult = updateStatusSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || 'Validation failed' };
    }

    const { recommendationId, status } = parseResult.data;

    // Verify ownership
    const { data: recommendation, error: fetchError } = await supabase
      .from('recommendations')
      .select(`
        *,
        audits!inner (
          sites!inner (user_id)
        )
      `)
      .eq('id', recommendationId)
      .single();

    if (fetchError || !recommendation) {
      return { success: false, error: 'Recommendation not found' };
    }

    const typedRec = recommendation as Recommendation & {
      audits: { sites: { user_id: string } };
    };

    if (typedRec.audits.sites.user_id !== user.id) {
      return { success: false, error: 'Recommendation not found' };
    }

    // Update status
    const updateData: Record<string, unknown> = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabase
      .from('recommendations')
      .update(updateData as never)
      .eq('id', recommendationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating recommendation:', updateError);
      return { success: false, error: 'Failed to update recommendation' };
    }

    revalidatePath('/recommendations');
    revalidatePath('/');

    return { success: true, data: updated as Recommendation };
  } catch (error) {
    console.error('Error in updateRecommendationStatus:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Dismisses a recommendation
 *
 * @param recommendationId - Recommendation ID
 * @returns Action result
 */
export async function dismissRecommendation(
  recommendationId: string
): Promise<ActionResult<Recommendation>> {
  return updateRecommendationStatus({
    recommendationId,
    status: 'dismissed',
  });
}
