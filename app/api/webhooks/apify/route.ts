/**
 * POST /api/webhooks/apify
 *
 * Handles Apify webhook callbacks for crawl completion.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { updateJobStatus } from '@/lib/jobs/service';
import { handleWebhook, getCrawlResults, storeCrawlResults } from '@/lib/services/apify';
import type { ApifyWebhookPayload } from '@/lib/services/apify';
import type { Job } from '@/types/database';
import type { CrawlJobPayload } from '@/lib/jobs/types';

export async function POST(request: NextRequest) {
  try {
    // Parse webhook payload
    const payload: ApifyWebhookPayload = await request.json();

    console.log('Received Apify webhook:', payload.eventType, payload.eventData.actorRunId);

    // Get admin client (webhooks don't have user context)
    const supabase = await createAdminClient();

    // Find the job by external ID
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('external_id', payload.eventData.actorRunId)
      .eq('external_service', 'apify')
      .single();

    if (jobError || !job) {
      console.error('Job not found for Apify run:', payload.eventData.actorRunId);
      return NextResponse.json(
        { error: 'Job not found', message: 'No job found for this Apify run' },
        { status: 404 }
      );
    }

    const typedJob = job as Job;
    const jobPayload = typedJob.payload as unknown as CrawlJobPayload;

    // Handle the webhook based on event type
    if (payload.eventType === 'ACTOR.RUN.SUCCEEDED') {
      try {
        // Update job progress
        await updateJobStatus({
          jobId: typedJob.id,
          status: 'running',
          progress: 80,
          progressMessage: 'Processing crawl results...',
        });

        // Get crawl results
        const results = await getCrawlResults(payload.eventData.actorRunId);

        // Store results
        const crawlDataUrl = await storeCrawlResults(results, jobPayload.siteId);

        // Process webhook to get result
        const crawlResult = await handleWebhook(payload);

        if (crawlResult) {
          // Update job as completed
          await updateJobStatus({
            jobId: typedJob.id,
            status: 'completed',
            progress: 100,
            progressMessage: 'Crawl completed successfully',
            result: {
              ...crawlResult,
              crawlDataUrl,
            },
          });

          // Update site's last crawl timestamp
          await supabase
            .from('sites')
            .update({ last_crawl_at: new Date().toISOString() } as never)
            .eq('id', jobPayload.siteId);

          // Create or update audit with crawl data
          const { data: existingAudit } = await supabase
            .from('audits')
            .select('id')
            .eq('site_id', jobPayload.siteId)
            .eq('status', 'crawling')
            .single();

          const typedExistingAudit = existingAudit as { id: string } | null;

          if (typedExistingAudit) {
            await supabase
              .from('audits')
              .update({
                crawl_data_url: crawlDataUrl,
                status: 'pending',
              } as never)
              .eq('id', typedExistingAudit.id);
          } else {
            await supabase.from('audits').insert({
              site_id: jobPayload.siteId,
              crawl_data_url: crawlDataUrl,
              status: 'pending',
            } as never);
          }
        }

        return NextResponse.json({ success: true, message: 'Crawl completed' });
      } catch (processError) {
        console.error('Error processing crawl results:', processError);

        await updateJobStatus({
          jobId: typedJob.id,
          status: 'failed',
          error: processError instanceof Error ? processError.message : 'Failed to process crawl results',
        });

        return NextResponse.json(
          { error: 'Processing failed', message: 'Failed to process crawl results' },
          { status: 500 }
        );
      }
    } else if (
      payload.eventType === 'ACTOR.RUN.FAILED' ||
      payload.eventType === 'ACTOR.RUN.ABORTED'
    ) {
      // Update job as failed
      await updateJobStatus({
        jobId: typedJob.id,
        status: 'failed',
        error: `Apify crawl ${payload.eventType === 'ACTOR.RUN.FAILED' ? 'failed' : 'was aborted'}`,
      });

      return NextResponse.json({
        success: false,
        message: `Crawl ${payload.eventType === 'ACTOR.RUN.FAILED' ? 'failed' : 'aborted'}`,
      });
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Error processing Apify webhook:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Verify Apify webhook signature (optional security measure)
 * In production, you should verify the webhook signature
 */
// function verifyWebhookSignature(request: NextRequest, payload: string): boolean {
//   const signature = request.headers.get('x-apify-signature');
//   if (!signature) return false;
//
//   const secret = process.env.APIFY_WEBHOOK_SECRET;
//   if (!secret) return true; // Skip verification if no secret configured
//
//   const hmac = crypto.createHmac('sha256', secret);
//   hmac.update(payload);
//   const expectedSignature = hmac.digest('hex');
//
//   return signature === expectedSignature;
// }
