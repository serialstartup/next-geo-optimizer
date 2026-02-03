/**
 * POST /api/ai/analyze
 *
 * Runs GEO analysis on crawled content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { createJob, updateJobStatus, isJobRunning } from '@/lib/jobs/service';
import { analyzeContent } from '@/lib/services/ai';
import type { AnalyzeJobPayload } from '@/lib/jobs/types';
import type { Audit, BrandVoice } from '@/types/database';

/**
 * Request body schema
 */
const analyzeSchema = z.object({
  auditId: z.string().uuid('Invalid audit ID'),
  crawlDataUrl: z.string().optional(),
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
    const parseResult = analyzeSchema.safeParse(body);

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

    const { auditId, crawlDataUrl } = parseResult.data;

    // Get the audit and verify ownership
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*, sites!inner(*)')
      .eq('id', auditId)
      .single();

    if (auditError || !audit) {
      return NextResponse.json(
        {
          error: 'Audit not found',
          code: 'AUDIT_NOT_FOUND',
          message: 'Audit does not exist',
        },
        { status: 404 }
      );
    }

    const typedAudit = audit as Audit & { sites: { id: string; user_id: string } };

    // Verify user owns the site
    if (typedAudit.sites.user_id !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          code: 'FORBIDDEN',
          message: 'You do not have access to this audit',
        },
        { status: 403 }
      );
    }

    // Check if analysis is already running
    const analysisRunning = await isJobRunning(typedAudit.sites.id, 'analyze');
    if (analysisRunning) {
      return NextResponse.json(
        {
          error: 'Analysis in progress',
          code: 'ANALYSIS_IN_PROGRESS',
          message: 'Analysis is already running for this audit',
        },
        { status: 409 }
      );
    }

    // Get crawl data URL
    const dataUrl = crawlDataUrl || typedAudit.crawl_data_url;
    if (!dataUrl) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          code: 'INVALID_REQUEST',
          message: 'No crawl data available for analysis',
        },
        { status: 400 }
      );
    }

    // Create job payload
    const payload: AnalyzeJobPayload = {
      auditId,
      siteId: typedAudit.sites.id,
      crawlDataUrl: dataUrl,
    };

    // Create the job
    const job = await createJob({
      type: 'analyze',
      payload,
      userId: user.id,
    });

    // Update audit status
    await supabase
      .from('audits')
      .update({ status: 'analyzing', job_id: job.id } as never)
      .eq('id', auditId);

    // Start analysis in background (in production, this would be a queue)
    // For now, we'll run it inline but not await it
    runAnalysis(job.id, auditId, typedAudit.sites.id, dataUrl, supabase).catch(
      (error) => console.error('Analysis error:', error)
    );

    return NextResponse.json(
      {
        jobId: job.id,
        status: 'running',
        message: 'Analysis started',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error starting analysis:', error);
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
 * Runs the analysis in the background
 */
async function runAnalysis(
  jobId: string,
  auditId: string,
  siteId: string,
  crawlDataUrl: string,
  supabase: Awaited<ReturnType<typeof createServerClient>>
) {
  try {
    // Update job status to running
    await updateJobStatus({ jobId, status: 'running', progress: 10, progressMessage: 'Starting analysis...' });

    // Get brand voice for context
    const { data: brandVoice } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('site_id', siteId)
      .single();

    const typedBrandVoice = brandVoice as BrandVoice | null;

    // In a real implementation, we would fetch the crawl data from storage
    // For now, we'll use mock content
    const mockContent = 'Sample content for analysis...';

    await updateJobStatus({ jobId, status: 'running', progress: 30, progressMessage: 'Analyzing content...' });

    // Run AI analysis
    const analysisResult = await analyzeContent({
      content: mockContent,
      url: crawlDataUrl,
      brandVoice: typedBrandVoice
        ? {
            positioning: typedBrandVoice.positioning || undefined,
            differentiators: typedBrandVoice.differentiators,
            audience: typedBrandVoice.audience,
          }
        : undefined,
    });

    await updateJobStatus({ jobId, status: 'running', progress: 80, progressMessage: 'Saving results...' });

    // Update audit with results
    await supabase
      .from('audits')
      .update({
        status: 'completed',
        overall_score: analysisResult.overallScore,
        sub_scores: analysisResult.subScores,
        insights: analysisResult.insights,
        perception_tags: analysisResult.perceptionTags,
        ai_keywords: analysisResult.aiKeywords,
        completed_at: new Date().toISOString(),
      } as never)
      .eq('id', auditId);

    // Update job as completed
    await updateJobStatus({
      jobId,
      status: 'completed',
      progress: 100,
      progressMessage: 'Analysis complete',
      result: {
        overallScore: analysisResult.overallScore,
        subScores: {
          contentClarity: analysisResult.subScores.content_clarity?.score || 0,
          entityCoverage: analysisResult.subScores.entity_coverage?.score || 0,
          answerFirst: analysisResult.subScores.answer_first?.score || 0,
          aiReadability: analysisResult.subScores.ai_readability?.score || 0,
        },
        insightsCount: analysisResult.insights.length,
        recommendationsCount: 0,
      },
    });
  } catch (error) {
    console.error('Analysis failed:', error);

    // Update job as failed
    await updateJobStatus({
      jobId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Analysis failed',
    });

    // Update audit status
    await supabase.from('audits').update({ status: 'failed' } as never).eq('id', auditId);
  }
}
