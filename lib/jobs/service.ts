/**
 * Job Service
 *
 * Service for managing background jobs in the GEO Optimizer platform.
 * Handles job creation, status updates, and retrieval.
 */

import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Job, JobType, JobStatus } from '@/types/database';
import type {
  CreateJobInput,
  UpdateJobStatusInput,
  UpdateJobProgressInput,
  JobResponse,
  JobFilters,
  JobPayload,
  JobResult,
} from './types';

/**
 * Creates a new job in the database
 *
 * @param input - Job creation input
 * @returns The created job
 * @throws Error if job creation fails
 */
export async function createJob(input: CreateJobInput): Promise<Job> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      user_id: input.userId,
      type: input.type,
      payload: input.payload as unknown as Record<string, unknown>,
      status: 'pending' as JobStatus,
    } as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }

  return data as Job;
}

/**
 * Updates the status of a job
 *
 * @param input - Job status update input
 * @returns The updated job
 * @throws Error if update fails
 */
export async function updateJobStatus(
  input: UpdateJobStatusInput
): Promise<Job> {
  const supabase = await createAdminClient();

  const updateData: Record<string, unknown> = {
    status: input.status,
  };

  if (input.progress !== undefined) {
    updateData.progress = input.progress;
  }

  if (input.progressMessage !== undefined) {
    updateData.progress_message = input.progressMessage;
  }

  if (input.result !== undefined) {
    updateData.result = input.result;
  }

  if (input.error !== undefined) {
    updateData.error = input.error;
  }

  if (input.errorDetails !== undefined) {
    updateData.error_details = input.errorDetails;
  }

  // Set timestamps based on status
  if (input.status === 'running') {
    updateData.started_at = new Date().toISOString();
  }

  if (
    input.status === 'completed' ||
    input.status === 'failed' ||
    input.status === 'cancelled'
  ) {
    updateData.completed_at = new Date().toISOString();
    updateData.progress = input.status === 'completed' ? 100 : updateData.progress;
  }

  const { data, error } = await supabase
    .from('jobs')
    .update(updateData as never)
    .eq('id', input.jobId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update job status: ${error.message}`);
  }

  return data as Job;
}

/**
 * Updates the progress of a job
 *
 * @param input - Job progress update input
 * @returns The updated job
 * @throws Error if update fails
 */
export async function updateJobProgress(
  input: UpdateJobProgressInput
): Promise<Job> {
  const supabase = await createAdminClient();

  const updateData: Record<string, unknown> = {
    progress: input.progress,
  };

  if (input.progressMessage !== undefined) {
    updateData.progress_message = input.progressMessage;
  }

  const { data, error } = await supabase
    .from('jobs')
    .update(updateData as never)
    .eq('id', input.jobId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update job progress: ${error.message}`);
  }

  return data as Job;
}

/**
 * Gets a job by ID
 *
 * @param jobId - The job ID
 * @param userId - Optional user ID for authorization check
 * @returns The job or null if not found
 */
export async function getJob(
  jobId: string,
  userId?: string
): Promise<Job | null> {
  const supabase = await createServerClient();

  let query = supabase.from('jobs').select('*').eq('id', jobId);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get job: ${error.message}`);
  }

  return data as Job;
}

/**
 * Gets jobs with optional filters
 *
 * @param filters - Optional filters for the query
 * @returns Array of jobs
 */
export async function getJobs(filters: JobFilters = {}): Promise<Job[]> {
  const supabase = await createServerClient();

  let query = supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get jobs: ${error.message}`);
  }

  return (data || []) as Job[];
}

/**
 * Cancels a running job
 *
 * @param jobId - The job ID to cancel
 * @param userId - User ID for authorization check
 * @returns The cancelled job
 * @throws Error if job cannot be cancelled
 */
export async function cancelJob(jobId: string, userId: string): Promise<Job> {
  const job = await getJob(jobId, userId);

  if (!job) {
    throw new Error('Job not found');
  }

  if (job.status === 'completed' || job.status === 'failed') {
    throw new Error('Cannot cancel a completed or failed job');
  }

  if (job.status === 'cancelled') {
    throw new Error('Job is already cancelled');
  }

  return updateJobStatus({
    jobId,
    status: 'cancelled',
    progressMessage: 'Job cancelled by user',
  });
}

/**
 * Converts a database Job to a JobResponse for API responses
 *
 * @param job - The database job
 * @returns The job response
 */
export function toJobResponse(job: Job): JobResponse {
  return {
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    progressMessage: job.progress_message || undefined,
    result: job.result as unknown as JobResult | undefined,
    error: job.error || undefined,
    createdAt: job.created_at,
    startedAt: job.started_at || undefined,
    completedAt: job.completed_at || undefined,
  };
}

/**
 * Checks if a job of a specific type is already running for a site
 *
 * @param siteId - The site ID
 * @param type - The job type
 * @returns True if a job is running
 */
export async function isJobRunning(
  siteId: string,
  type: JobType
): Promise<boolean> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('jobs')
    .select('id')
    .eq('type', type)
    .in('status', ['pending', 'running'])
    .contains('payload', { siteId })
    .limit(1);

  if (error) {
    throw new Error(`Failed to check running jobs: ${error.message}`);
  }

  return (data?.length || 0) > 0;
}

/**
 * Gets the payload from a job with proper typing
 *
 * @param job - The job
 * @returns The typed payload
 */
export function getJobPayload<T extends JobPayload>(job: Job): T {
  return job.payload as unknown as T;
}
