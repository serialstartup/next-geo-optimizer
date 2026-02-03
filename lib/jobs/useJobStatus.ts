/**
 * useJobStatus Hook
 *
 * React hook for polling job status until completion.
 * Automatically refreshes until the job reaches a terminal state.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { JobResponse } from './types';

/**
 * Terminal job statuses that stop polling
 */
const TERMINAL_STATUSES = ['completed', 'failed', 'cancelled'] as const;

/**
 * Default polling interval in milliseconds
 */
const DEFAULT_POLL_INTERVAL = 2000;

/**
 * Options for the useJobStatus hook
 */
export interface UseJobStatusOptions {
  /** Polling interval in milliseconds (default: 2000) */
  pollInterval?: number;
  /** Whether to start polling immediately (default: true) */
  enabled?: boolean;
  /** Callback when job completes successfully */
  onComplete?: (job: JobResponse) => void;
  /** Callback when job fails */
  onError?: (error: string) => void;
  /** Callback when job is cancelled */
  onCancel?: () => void;
}

/**
 * Return type for the useJobStatus hook
 */
export interface UseJobStatusReturn {
  /** Current job data */
  job: JobResponse | null;
  /** Whether the job is currently loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Whether the job is in a terminal state */
  isComplete: boolean;
  /** Manually refresh the job status */
  refresh: () => Promise<void>;
  /** Cancel the job */
  cancel: () => Promise<void>;
}

/**
 * Hook for polling job status
 *
 * @param jobId - The job ID to poll
 * @param options - Hook options
 * @returns Job status and control functions
 *
 * @example
 * ```tsx
 * const { job, isLoading, isComplete, error } = useJobStatus(jobId, {
 *   onComplete: (job) => console.log('Job completed:', job),
 *   onError: (error) => console.error('Job failed:', error),
 * });
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * if (job) return <Progress value={job.progress} />;
 * ```
 */
export function useJobStatus(
  jobId: string | null,
  options: UseJobStatusOptions = {}
): UseJobStatusReturn {
  const {
    pollInterval = DEFAULT_POLL_INTERVAL,
    enabled = true,
    onComplete,
    onError,
    onCancel,
  } = options;

  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs for callbacks to avoid re-creating the effect
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
    onCancelRef.current = onCancel;
  }, [onComplete, onError, onCancel]);

  /**
   * Fetches the current job status
   */
  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/jobs/${jobId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch job status');
      }

      const data: JobResponse = await response.json();
      setJob(data);

      // Handle terminal states
      if (data.status === 'completed') {
        onCompleteRef.current?.(data);
      } else if (data.status === 'failed') {
        onErrorRef.current?.(data.error || 'Job failed');
      } else if (data.status === 'cancelled') {
        onCancelRef.current?.();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  /**
   * Cancels the job
   */
  const cancel = useCallback(async () => {
    if (!jobId) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to cancel job');
      }

      // Refresh to get updated status
      await fetchJobStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  }, [jobId, fetchJobStatus]);

  /**
   * Check if job is in a terminal state
   */
  const isComplete = job
    ? TERMINAL_STATUSES.includes(job.status as (typeof TERMINAL_STATUSES)[number])
    : false;

  /**
   * Set up polling
   */
  useEffect(() => {
    if (!jobId || !enabled) return;

    // Initial fetch
    fetchJobStatus();

    // Set up polling interval
    const intervalId = setInterval(() => {
      // Only poll if not in terminal state
      if (!isComplete) {
        fetchJobStatus();
      }
    }, pollInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [jobId, enabled, pollInterval, fetchJobStatus, isComplete]);

  return {
    job,
    isLoading,
    error,
    isComplete,
    refresh: fetchJobStatus,
    cancel,
  };
}

/**
 * Hook for tracking multiple jobs
 *
 * @param jobIds - Array of job IDs to track
 * @param options - Hook options
 * @returns Map of job statuses
 */
export function useMultipleJobStatus(
  jobIds: string[],
  options: Omit<UseJobStatusOptions, 'onComplete' | 'onError' | 'onCancel'> = {}
): Map<string, UseJobStatusReturn> {
  const results = new Map<string, UseJobStatusReturn>();

  // Note: This is a simplified implementation
  // In production, you might want to batch these requests
  for (const jobId of jobIds) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useJobStatus(jobId, options);
    results.set(jobId, result);
  }

  return results;
}
