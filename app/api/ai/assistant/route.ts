/**
 * POST /api/ai/assistant
 *
 * GEO Assistant chat endpoint with streaming response.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { chat } from '@/lib/services/ai';
import type { Site, Audit } from '@/types/database';

/**
 * Request body schema
 */
const assistantSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  context: z
    .object({
      currentPage: z.string().optional(),
      selectedText: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access this resource',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = assistantSchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          code: 'INVALID_REQUEST',
          message: firstIssue?.message || 'Validation failed',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { siteId, message, context } = parseResult.data;

    // Get the site and verify ownership
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (siteError || !site) {
      return new Response(
        JSON.stringify({
          error: 'Site not found',
          code: 'SITE_NOT_FOUND',
          message: 'Site does not exist or you do not have access',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const typedSite = site as Site;

    // Get recent audit score for context
    const { data: recentAudit } = await supabase
      .from('audits')
      .select('overall_score')
      .eq('site_id', siteId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const typedAudit = recentAudit as Pick<Audit, 'overall_score'> | null;

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const chatGenerator = chat({
            messages: [{ role: 'user', content: message }],
            siteContext: {
              domain: typedSite.domain,
              currentPage: context?.currentPage,
              selectedText: context?.selectedText,
              recentAuditScore: typedAudit?.overall_score || undefined,
            },
          });

          for await (const event of chatGenerator) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.close();
        } catch (error) {
          const errorEvent = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in assistant:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
