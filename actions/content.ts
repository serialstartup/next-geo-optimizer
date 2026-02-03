/**
 * Content Server Actions
 *
 * Server actions for managing content items and optimizations.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { generateOptimization } from '@/lib/services/ai';
import type { Content, BrandVoice } from '@/types/database';

// ============================================================================
// SCHEMAS
// ============================================================================

const updateContentSchema = z.object({
  contentId: z.string().uuid('Invalid content ID'),
  title: z.string().nullable().optional(),
  optimizedContent: z.string().nullable().optional(),
  geoScore: z.number().min(0).max(100).nullable().optional(),
});

const applyOptimizationSchema = z.object({
  contentId: z.string().uuid('Invalid content ID'),
  options: z
    .object({
      preserveTone: z.boolean().default(true),
      targetScore: z.number().min(0).max(100).default(85),
      focusAreas: z
        .array(z.enum(['entities', 'structure', 'clarity', 'citations']))
        .default(['entities', 'structure']),
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

export interface ContentFilters {
  siteId?: string;
  minScore?: number;
  maxScore?: number;
  hasOptimization?: boolean;
  limit?: number;
  offset?: number;
}

export interface OptimizationResult {
  content: Content;
  originalScore: number;
  optimizedScore: number;
  changes: Array<{
    type: 'addition' | 'modification' | 'restructure';
    description: string;
    before?: string;
    after: string;
  }>;
  tips: string[];
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Gets content items with optional filters
 *
 * @param filters - Optional filters
 * @returns Action result with content array
 */
export async function getContents(
  filters: ContentFilters = {}
): Promise<ActionResult<Content[]>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Build query
    let query = supabase
      .from('contents')
      .select(`
        *,
        sites!inner (user_id)
      `)
      .order('created_at', { ascending: false });

    if (filters.siteId) {
      query = query.eq('site_id', filters.siteId);
    }

    if (filters.minScore !== undefined) {
      query = query.gte('geo_score', filters.minScore);
    }

    if (filters.maxScore !== undefined) {
      query = query.lte('geo_score', filters.maxScore);
    }

    if (filters.hasOptimization !== undefined) {
      if (filters.hasOptimization) {
        query = query.not('optimized_content', 'is', null);
      } else {
        query = query.is('optimized_content', null);
      }
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data: contents, error } = await query;

    if (error) {
      console.error('Error getting contents:', error);
      return { success: false, error: 'Failed to get contents' };
    }

    // Filter by user ownership
    const userContents = (contents || []).filter((content) => {
      const typedContent = content as Content & { sites: { user_id: string } };
      return typedContent.sites.user_id === user.id;
    });

    return { success: true, data: userContents as Content[] };
  } catch (error) {
    console.error('Error in getContents:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates content with optimizations
 *
 * @param input - Content update data
 * @returns Action result with updated content
 */
export async function updateContent(
  input: z.infer<typeof updateContentSchema>
): Promise<ActionResult<Content>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parseResult = updateContentSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || 'Validation failed' };
    }

    const { contentId, title, optimizedContent, geoScore } = parseResult.data;

    // Verify ownership
    const { data: content, error: fetchError } = await supabase
      .from('contents')
      .select(`
        *,
        sites!inner (user_id)
      `)
      .eq('id', contentId)
      .single();

    if (fetchError || !content) {
      return { success: false, error: 'Content not found' };
    }

    const typedContent = content as Content & { sites: { user_id: string } };

    if (typedContent.sites.user_id !== user.id) {
      return { success: false, error: 'Content not found' };
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (optimizedContent !== undefined) {
      updateData.optimized_content = optimizedContent;
      updateData.last_optimized_at = new Date().toISOString();
    }
    if (geoScore !== undefined) updateData.geo_score = geoScore;

    // Update content
    const { data: updated, error: updateError } = await supabase
      .from('contents')
      .update(updateData as never)
      .eq('id', contentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating content:', updateError);
      return { success: false, error: 'Failed to update content' };
    }

    revalidatePath('/content');
    revalidatePath('/workspace');

    return { success: true, data: updated as Content };
  } catch (error) {
    console.error('Error in updateContent:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Applies AI optimization to content
 *
 * @param input - Content ID and optimization options
 * @returns Action result with optimization result
 */
export async function applyOptimization(
  input: z.infer<typeof applyOptimizationSchema>
): Promise<ActionResult<OptimizationResult>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parseResult = applyOptimizationSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || 'Validation failed' };
    }

    const { contentId, options } = parseResult.data;
    const optimizationOptions = {
      preserveTone: options?.preserveTone ?? true,
      targetScore: options?.targetScore ?? 85,
      focusAreas: options?.focusAreas ?? ['entities', 'structure'] as Array<'entities' | 'structure' | 'clarity' | 'citations'>,
    };

    // Get content with site info
    const { data: content, error: fetchError } = await supabase
      .from('contents')
      .select(`
        *,
        sites!inner (id, user_id)
      `)
      .eq('id', contentId)
      .single();

    if (fetchError || !content) {
      return { success: false, error: 'Content not found' };
    }

    const typedContent = content as Content & { sites: { id: string; user_id: string } };

    if (typedContent.sites.user_id !== user.id) {
      return { success: false, error: 'Content not found' };
    }

    // Get brand voice for context
    const { data: brandVoice } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('site_id', typedContent.sites.id)
      .single();

    const typedBrandVoice = brandVoice as BrandVoice | null;

    // Run optimization
    const result = await generateOptimization({
      content: typedContent.original_content || '',
      url: typedContent.url,
      title: typedContent.title || undefined,
      options: optimizationOptions,
      brandVoice: typedBrandVoice
        ? {
            positioning: typedBrandVoice.positioning || undefined,
            differentiators: typedBrandVoice.differentiators,
            guardrails: typedBrandVoice.guardrails,
          }
        : undefined,
    });

    // Update content with optimization
    const { data: updated, error: updateError } = await supabase
      .from('contents')
      .update({
        optimized_content: result.optimizedContent,
        geo_score: result.optimizedScore,
        optimization_tips: result.tips,
        entities: result.entities,
        last_optimized_at: new Date().toISOString(),
      } as never)
      .eq('id', contentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error saving optimization:', updateError);
      return { success: false, error: 'Failed to save optimization' };
    }

    revalidatePath('/content');
    revalidatePath('/workspace');

    return {
      success: true,
      data: {
        content: updated as Content,
        originalScore: result.originalScore,
        optimizedScore: result.optimizedScore,
        changes: result.changes,
        tips: result.tips,
      },
    };
  } catch (error) {
    console.error('Error in applyOptimization:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
