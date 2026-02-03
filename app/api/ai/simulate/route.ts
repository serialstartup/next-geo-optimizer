/**
 * POST /api/ai/simulate
 *
 * Runs an AI recommendation simulation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { simulateRecommendation } from '@/lib/services/ai';
import type { Site, BrandVoice, AIEngine } from '@/types/database';

/**
 * Request body schema
 */
const simulateSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  query: z.string().min(1, 'Query is required').max(500, 'Query too long'),
  engine: z.enum(['gpt-4o', 'claude-3', 'gemini', 'perplexity']).default('gpt-4o'),
});

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
    const parseResult = simulateSchema.safeParse(body);

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

    const { siteId, query, engine } = parseResult.data;

    // Get the site and verify ownership
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        {
          error: 'Site not found',
          code: 'SITE_NOT_FOUND',
          message: 'Site does not exist or you do not have access',
        },
        { status: 404 }
      );
    }

    const typedSite = site as Site;

    // Get brand voice for context
    const { data: brandVoice } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('site_id', siteId)
      .single();

    const typedBrandVoice = brandVoice as BrandVoice | null;

    // Run simulation
    const result = await simulateRecommendation({
      query,
      engine: engine as AIEngine,
      brandContext: typedBrandVoice
        ? {
            name: typedSite.name || typedSite.domain,
            positioning: typedBrandVoice.positioning || undefined,
            differentiators: typedBrandVoice.differentiators,
          }
        : {
            name: typedSite.name || typedSite.domain,
          },
    });

    // Save simulation to database
    const { data: simulation, error: insertError } = await supabase
      .from('simulations')
      .insert({
        site_id: siteId,
        query,
        engine: engine as AIEngine,
        ai_response: result.aiResponse,
        brand_mentioned: result.brandMentioned,
        tone_match: result.toneMatch,
        reasoning_path: result.reasoningPath,
        geo_tip: result.geoTip,
      } as never)
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save simulation:', insertError);
    }

    const simulationRecord = simulation as { id: string } | null;

    return NextResponse.json({
      id: simulationRecord?.id || crypto.randomUUID(),
      query,
      engine,
      aiResponse: result.aiResponse,
      brandMentioned: result.brandMentioned,
      toneMatch: result.toneMatch,
      reasoningPath: result.reasoningPath,
      geoTip: result.geoTip,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error running simulation:', error);
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
