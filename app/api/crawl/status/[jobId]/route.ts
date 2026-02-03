/**
 * GET /api/crawl/status/[jobId]
 *
 * Gets the status of a crawl job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getJob, toJobResponse } from '@/lib/jobs/service';

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { jobId } = await params;

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

    // Verify it's a crawl job
    if (job.type !== 'crawl') {
      return NextResponse.json(
        {
          error: 'Invalid job type',
          code: 'INVALID_JOB_TYPE',
          message: 'This endpoint is only for crawl jobs',
        },
        { status: 400 }
      );
    }

    // Return job status
    const response = toJobResponse(job);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting crawl status:', error);
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
