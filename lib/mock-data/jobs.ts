/**
 * Mock Job Data
 *
 * Contains mock job data for long-running tasks like crawls, analysis, etc.
 * Includes jobs with different types and statuses.
 */

import type { Job, JobType, JobStatus } from '@/types/database';
import { MOCK_USER_IDS } from './users';
import { MOCK_SITE_IDS } from './sites';

// ============================================================================
// MOCK JOB IDS (hardcoded UUIDs for consistency)
// ============================================================================

export const MOCK_JOB_IDS = {
  COMPLETED_CRAWL: '880e8400-e29b-41d4-a716-446655440001',
  RUNNING_CRAWL: '880e8400-e29b-41d4-a716-446655440002',
  FAILED_ANALYZE: '880e8400-e29b-41d4-a716-446655440003',
  PENDING_SIMULATE: '880e8400-e29b-41d4-a716-446655440004',
  COMPLETED_OPTIMIZE: '880e8400-e29b-41d4-a716-446655440005',
  COMPLETED_EXPORT: '880e8400-e29b-41d4-a716-446655440006',
} as const;

// ============================================================================
// MOCK JOBS
// ============================================================================

/**
 * Completed crawl job - Successfully finished
 */
export const mockCompletedCrawlJob: Job = {
  id: MOCK_JOB_IDS.COMPLETED_CRAWL,
  user_id: MOCK_USER_IDS.PRO_USER,
  type: 'crawl',
  status: 'completed',
  progress: 100,
  progress_message: 'Crawl completed successfully',
  payload: {
    site_id: MOCK_SITE_IDS.ACME_TECH,
    max_pages: 100,
    include_patterns: ['/blog/*', '/products/*', '/solutions/*'],
  },
  result: {
    pages_crawled: 87,
    pages_analyzed: 87,
    total_words: 125000,
    avg_page_score: 76,
    crawl_duration_ms: 45000,
  },
  error: null,
  error_details: null,
  retry_count: 0,
  max_retries: 3,
  external_id: 'apify-run-abc123',
  external_service: 'apify',
  created_at: '2026-02-01T06:00:00.000Z',
  started_at: '2026-02-01T06:00:05.000Z',
  completed_at: '2026-02-01T06:15:00.000Z',
};

/**
 * Running crawl job - Currently in progress
 */
export const mockRunningCrawlJob: Job = {
  id: MOCK_JOB_IDS.RUNNING_CRAWL,
  user_id: MOCK_USER_IDS.PRO_USER,
  type: 'crawl',
  status: 'running',
  progress: 45,
  progress_message: 'Crawling page 45 of ~100...',
  payload: {
    site_id: MOCK_SITE_IDS.ACME_TECH,
    max_pages: 100,
    include_patterns: ['/blog/*', '/products/*', '/solutions/*'],
  },
  result: null,
  error: null,
  error_details: null,
  retry_count: 0,
  max_retries: 3,
  external_id: 'apify-run-def456',
  external_service: 'apify',
  created_at: '2026-02-02T08:00:00.000Z',
  started_at: '2026-02-02T08:00:10.000Z',
  completed_at: null,
};

/**
 * Failed analyze job - Encountered an error
 */
export const mockFailedAnalyzeJob: Job = {
  id: MOCK_JOB_IDS.FAILED_ANALYZE,
  user_id: MOCK_USER_IDS.PRO_USER,
  type: 'analyze',
  status: 'failed',
  progress: 65,
  progress_message: 'Analysis failed at content parsing stage',
  payload: {
    site_id: MOCK_SITE_IDS.ACME_TECH,
    audit_id: '770e8400-e29b-41d4-a716-446655440099',
  },
  result: null,
  error: 'Content parsing failed: Invalid HTML structure detected',
  error_details: {
    stage: 'content_parsing',
    page_url: 'https://acme-tech.com/products/legacy-page',
    error_code: 'PARSE_ERROR',
    stack_trace: 'Error: Invalid HTML structure...',
  },
  retry_count: 2,
  max_retries: 3,
  external_id: null,
  external_service: null,
  created_at: '2026-01-30T14:00:00.000Z',
  started_at: '2026-01-30T14:00:05.000Z',
  completed_at: '2026-01-30T14:05:30.000Z',
};

/**
 * Pending simulate job - Waiting to start
 */
export const mockPendingSimulateJob: Job = {
  id: MOCK_JOB_IDS.PENDING_SIMULATE,
  user_id: MOCK_USER_IDS.PRO_USER,
  type: 'simulate',
  status: 'pending',
  progress: 0,
  progress_message: 'Waiting in queue...',
  payload: {
    site_id: MOCK_SITE_IDS.ACME_TECH,
    queries: [
      'best enterprise API platform',
      'cloud data integration solutions',
      'developer-friendly API tools',
    ],
    engines: ['gpt-4o', 'claude-3', 'perplexity'],
  },
  result: null,
  error: null,
  error_details: null,
  retry_count: 0,
  max_retries: 3,
  external_id: null,
  external_service: null,
  created_at: '2026-02-02T09:30:00.000Z',
  started_at: null,
  completed_at: null,
};

/**
 * Completed optimize job - Content optimization finished
 */
export const mockCompletedOptimizeJob: Job = {
  id: MOCK_JOB_IDS.COMPLETED_OPTIMIZE,
  user_id: MOCK_USER_IDS.PRO_USER,
  type: 'optimize',
  status: 'completed',
  progress: 100,
  progress_message: 'Content optimization completed',
  payload: {
    site_id: MOCK_SITE_IDS.ACME_TECH,
    content_id: '990e8400-e29b-41d4-a716-446655440001',
    optimization_type: 'full',
  },
  result: {
    original_score: 65,
    optimized_score: 82,
    improvements: [
      'Added answer-first structure',
      'Enhanced entity coverage',
      'Improved semantic markup',
    ],
    tokens_used: 2500,
  },
  error: null,
  error_details: null,
  retry_count: 0,
  max_retries: 3,
  external_id: null,
  external_service: null,
  created_at: '2026-02-01T10:00:00.000Z',
  started_at: '2026-02-01T10:00:02.000Z',
  completed_at: '2026-02-01T10:00:45.000Z',
};

/**
 * Completed export job - Report export finished
 */
export const mockCompletedExportJob: Job = {
  id: MOCK_JOB_IDS.COMPLETED_EXPORT,
  user_id: MOCK_USER_IDS.PRO_USER,
  type: 'export',
  status: 'completed',
  progress: 100,
  progress_message: 'Export completed',
  payload: {
    site_id: MOCK_SITE_IDS.ACME_TECH,
    audit_id: '770e8400-e29b-41d4-a716-446655440001',
    format: 'pdf',
    include_recommendations: true,
  },
  result: {
    file_url: 'https://storage.example.com/exports/acme-tech-report-2026-02-01.pdf',
    file_size_bytes: 2450000,
    pages: 24,
  },
  error: null,
  error_details: null,
  retry_count: 0,
  max_retries: 3,
  external_id: null,
  external_service: null,
  created_at: '2026-02-01T11:00:00.000Z',
  started_at: '2026-02-01T11:00:01.000Z',
  completed_at: '2026-02-01T11:00:15.000Z',
};

// ============================================================================
// MOCK JOBS ARRAY
// ============================================================================

export const mockJobs: Job[] = [
  mockCompletedCrawlJob,
  mockRunningCrawlJob,
  mockFailedAnalyzeJob,
  mockPendingSimulateJob,
  mockCompletedOptimizeJob,
  mockCompletedExportJob,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a mock job by ID
 */
export function getMockJobById(id: string): Job | undefined {
  return mockJobs.find((job) => job.id === id);
}

/**
 * Get all mock jobs for a user
 */
export function getMockJobsByUserId(userId: string): Job[] {
  return mockJobs.filter((job) => job.user_id === userId);
}

/**
 * Get mock jobs by status
 */
export function getMockJobsByStatus(status: JobStatus): Job[] {
  return mockJobs.filter((job) => job.status === status);
}

/**
 * Get mock jobs by type
 */
export function getMockJobsByType(type: JobType): Job[] {
  return mockJobs.filter((job) => job.type === type);
}

/**
 * Get active (pending or running) jobs for a user
 */
export function getMockActiveJobsByUserId(userId: string): Job[] {
  return mockJobs.filter(
    (job) =>
      job.user_id === userId &&
      (job.status === 'pending' || job.status === 'running')
  );
}

/**
 * Get all mock jobs
 */
export function getMockJobs(): Job[] {
  return mockJobs;
}

/**
 * Get recent jobs (sorted by created_at, newest first)
 */
export function getMockRecentJobs(limit: number = 10): Job[] {
  return [...mockJobs]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);
}
