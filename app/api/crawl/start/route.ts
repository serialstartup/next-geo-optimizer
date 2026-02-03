/**
 * POST /api/crawl/start
 *
 * Starts a website crawl job for a site.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { createJob, isJobRunning } from '@/lib/jobs/service';
import { startCrawl } from '@/lib/services/apify';
import type { CrawlJobPayload } from '@/lib/jobs/types';
import type { Site } from '@/types/database';

/**
 * Request body schema
 */
const configSchema = z.object({
  maxPages: z.number().min(1).max(500).default(50),
  includePatterns: z.array(z.string()).default([]),
  excludePatterns: z.array(z.string()).default([]),
  respectRobots: z.boolean().default(true),
});

const startCrawlSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  config: configSchema.optional(),
});

/**
 * Default crawl configuration
 */
const defaultConfig = {
  maxPages: 50,
  includePatterns: [] as string[],
  excludePatterns: [] as string[],
  respectRobots: true,
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
    const parseResult = startCrawlSchema.safeParse(body);

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

    const { siteId, config: inputConfig } = parseResult.data;
    const config = { ...defaultConfig, ...inputConfig };

    // Check if site exists and belongs to user
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

    // Check if a crawl is already running for this site
    const crawlRunning = await isJobRunning(siteId, 'crawl');
    if (crawlRunning) {
      return NextResponse.json(
        {
          error: 'Crawl in progress',
          code: 'CRAWL_IN_PROGRESS',
          message: 'A crawl is already running for this site',
        },
        { status: 409 }
      );
    }

    // Create job payload
    const payload: CrawlJobPayload = {
      siteId,
      domain: typedSite.domain,
      config: {
        maxPages: config.maxPages,
        includePatterns: config.includePatterns,
        excludePatterns: config.excludePatterns,
        respectRobots: config.respectRobots,
      },
    };

    // Create the job in the database
    const job = await createJob({
      type: 'crawl',
      payload,
      userId: user.id,
    });

    // Start the Apify crawl
    try {
      const apifyRunId = await startCrawl(payload);

      // Update job with external ID
      await supabase
        .from('jobs')
        .update({
          external_id: apifyRunId,
          external_service: 'apify',
          status: 'running',
          started_at: new Date().toISOString(),
        } as never)
        .eq('id', job.id);
    } catch (crawlError) {
      // Update job as failed
      await supabase
        .from('jobs')
        .update({
          status: 'failed',
          error: crawlError instanceof Error ? crawlError.message : 'Failed to start crawl',
          completed_at: new Date().toISOString(),
        } as never)
        .eq('id', job.id);

      throw crawlError;
    }

    return NextResponse.json(
      {
        jobId: job.id,
        status: 'pending',
        message: 'Crawl job started successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error starting crawl:', error);
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
