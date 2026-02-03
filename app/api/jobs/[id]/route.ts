/**
 * GET /api/jobs/[id]
 * POST /api/jobs/[id]
 *
 * Get job status or perform job actions (cancel).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { getJob, cancelJob, toJobResponse } from '@/lib/jobs/service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - Get job status
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: jobId } = await params;

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

    // Validate jobId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          code: 'INVALID_REQUEST',
          message: 'Invalid job ID format',
        },
        { status: 400 }
      );
    }

    // Get the job
    const job = await getJob(jobId, user.id);

    if (!job) {
      return NextResponse.json(
        {
          error: 'Job not found',
          code: 'JOB_NOT_FOUND',
          message: 'Job does not exist or you do not have access',
        },
        { status: 404 }
      );
    }

    // Return job status
    return NextResponse.json(toJobResponse(job));
  } catch (error) {
    console.error('Error getting job:', error);
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

/**
 * POST body schema
 */
const jobActionSchema = z.object({
  action: z.enum(['cancel']),
});

/**
 * POST - Perform job action (cancel)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: jobId } = await params;

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

    // Validate jobId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          code: 'INVALID_REQUEST',
          message: 'Invalid job ID format',
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = jobActionSchema.safeParse(body);

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

    const { action } = parseResult.data;

    if (action === 'cancel') {
      try {
        const job = await cancelJob(jobId, user.id);
        return NextResponse.json(toJobResponse(job));
      } catch (cancelError) {
        const message = cancelError instanceof Error ? cancelError.message : 'Failed to cancel job';

        if (message === 'Job not found') {
          return NextResponse.json(
            {
              error: 'Job not found',
              code: 'JOB_NOT_FOUND',
              message: 'Job does not exist or you do not have access',
            },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            error: 'Cannot cancel job',
            code: 'CANCEL_FAILED',
            message,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Invalid action',
        code: 'INVALID_ACTION',
        message: 'Unknown action',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error performing job action:', error);
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
