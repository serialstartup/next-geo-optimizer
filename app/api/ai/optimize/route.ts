/**
 * POST /api/ai/optimize
 *
 * Generates content optimization suggestions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { generateOptimization } from '@/lib/services/ai';
import type { Content, BrandVoice } from '@/types/database';

/**
 * Request body schema
 */
const optimizeSchema = z.object({
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

/**
 * Default optimization options
 */
const defaultOptions = {
  preserveTone: true,
  targetScore: 85,
  focusAreas: ['entities', 'structure'] as Array<'entities' | 'structure' | 'clarity' | 'citations'>,
};

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED', message: 'You must be logged in to access this resource' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = optimizeSchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          error: 'Invalid request',
          code: 'INVALID_REQUEST',
          message: firstIssue?.message || 'Validation failed',
        },
        { status: 400 }
      );
    }

    const { contentId, options: inputOptions } = parseResult.data;
    const options = { ...defaultOptions, ...inputOptions };

    // Get the content and verify ownership
    const { data: content, error: contentError } = await supabase
      .from('contents')
      .select('*, sites!inner(*)')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      return NextResponse.json(
        {
          error: 'Content not found',
          code: 'CONTENT_NOT_FOUND',
          message: 'Content does not exist',
        },
        { status: 404 }
      );
    }

    const typedContent = content as Content & { sites: { id: string; user_id: string } };

    // Verify user owns the site
    if (typedContent.sites.user_id !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          code: 'FORBIDDEN',
          message: 'You do not have access to this content',
        },
        { status: 403 }
      );
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
      options: {
        preserveTone: options.preserveTone,
        targetScore: options.targetScore,
        focusAreas: options.focusAreas,
      },
      brandVoice: typedBrandVoice
        ? {
            positioning: typedBrandVoice.positioning || undefined,
            differentiators: typedBrandVoice.differentiators,
            guardrails: typedBrandVoice.guardrails,
          }
        : undefined,
    });

    return NextResponse.json({
      contentId,
      originalScore: result.originalScore,
      optimizedScore: result.optimizedScore,
      optimizedContent: result.optimizedContent,
      changes: result.changes,
      entities: result.entities,
      tips: result.tips,
    });
  } catch (error) {
    console.error('Error generating optimization:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
