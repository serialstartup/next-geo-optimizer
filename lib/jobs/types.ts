/**
 * Job System Types
 *
 * Type definitions for the job processing system.
 * Jobs are used for long-running operations like crawling and AI analysis.
 */

import type { JobType, JobStatus } from '@/types/database';

// ============================================================================
// JOB PAYLOAD TYPES
// ============================================================================

/**
 * Payload for crawl jobs
 */
export interface CrawlJobPayload {
  siteId: string;
  domain: string;
  config: {
    maxPages: number;
    includePatterns: string[];
    excludePatterns: string[];
    respectRobots: boolean;
  };
}

/**
 * Payload for analyze jobs
 */
export interface AnalyzeJobPayload {
  auditId: string;
  siteId: string;
  crawlDataUrl: string;
}

/**
 * Payload for simulate jobs
 */
export interface SimulateJobPayload {
  simulationId: string;
  siteId: string;
  query: string;
  engine: 'gpt-4o' | 'claude-3' | 'gemini' | 'perplexity';
}

/**
 * Payload for optimize jobs
 */
export interface OptimizeJobPayload {
  contentId: string;
  siteId: string;
  options: {
    preserveTone: boolean;
    targetScore: number;
    focusAreas: Array<'entities' | 'structure' | 'clarity' | 'citations'>;
  };
}

/**
 * Payload for export jobs
 */
export interface ExportJobPayload {
  siteId: string;
  auditId?: string;
  format: 'pdf' | 'csv' | 'json';
  includeRecommendations: boolean;
  includeContent: boolean;
}

/**
 * Union type for all job payloads
 */
export type JobPayload =
  | CrawlJobPayload
  | AnalyzeJobPayload
  | SimulateJobPayload
  | OptimizeJobPayload
  | ExportJobPayload;

// ============================================================================
// JOB RESULT TYPES
// ============================================================================

/**
 * Result for crawl jobs
 */
export interface CrawlJobResult {
  pagesCount: number;
  crawlDataUrl: string;
  duration: number;
  errors?: string[];
}

/**
 * Result for analyze jobs
 */
export interface AnalyzeJobResult {
  overallScore: number;
  subScores: {
    contentClarity: number;
    entityCoverage: number;
    answerFirst: number;
    aiReadability: number;
  };
  insightsCount: number;
  recommendationsCount: number;
}

/**
 * Result for simulate jobs
 */
export interface SimulateJobResult {
  simulationId: string;
  brandMentioned: boolean;
  toneMatch: number;
}

/**
 * Result for optimize jobs
 */
export interface OptimizeJobResult {
  contentId: string;
  originalScore: number;
  optimizedScore: number;
  changesCount: number;
}

/**
 * Result for export jobs
 */
export interface ExportJobResult {
  downloadUrl: string;
  fileSize: number;
  expiresAt: string;
}

/**
 * Union type for all job results
 */
export type JobResult =
  | CrawlJobResult
  | AnalyzeJobResult
  | SimulateJobResult
  | OptimizeJobResult
  | ExportJobResult;

// ============================================================================
// JOB CREATION TYPES
// ============================================================================

/**
 * Input for creating a new job
 */
export interface CreateJobInput {
  type: JobType;
  payload: JobPayload;
  userId: string;
}

/**
 * Job status update input
 */
export interface UpdateJobStatusInput {
  jobId: string;
  status: JobStatus;
  progress?: number;
  progressMessage?: string;
  result?: JobResult;
  error?: string;
  errorDetails?: Record<string, unknown>;
}

/**
 * Job progress update input
 */
export interface UpdateJobProgressInput {
  jobId: string;
  progress: number;
  progressMessage?: string;
}

// ============================================================================
// JOB RESPONSE TYPES
// ============================================================================

/**
 * Standard job response for API endpoints
 */
export interface JobResponse {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  progressMessage?: string;
  result?: JobResult;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Job list response
 */
export interface JobListResponse {
  jobs: JobResponse[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// JOB FILTER TYPES
// ============================================================================

/**
 * Filters for querying jobs
 */
export interface JobFilters {
  type?: JobType;
  status?: JobStatus;
  userId?: string;
  siteId?: string;
  limit?: number;
  offset?: number;
}
