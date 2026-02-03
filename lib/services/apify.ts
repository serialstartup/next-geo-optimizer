/**
 * Apify Service Client
 *
 * Client for interacting with Apify web crawling service.
 * Handles starting crawls, getting results, and processing webhooks.
 */

import type { CrawlJobPayload, CrawlJobResult } from '@/lib/jobs/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Apify actor run status
 */
export type ApifyRunStatus =
  | 'READY'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'TIMING-OUT'
  | 'TIMED-OUT'
  | 'ABORTING'
  | 'ABORTED';

/**
 * Apify actor run response
 */
export interface ApifyRunResponse {
  id: string;
  actId: string;
  status: ApifyRunStatus;
  startedAt: string;
  finishedAt?: string;
  buildId: string;
  defaultKeyValueStoreId: string;
  defaultDatasetId: string;
}

/**
 * Apify webhook payload
 */
export interface ApifyWebhookPayload {
  eventType: 'ACTOR.RUN.SUCCEEDED' | 'ACTOR.RUN.FAILED' | 'ACTOR.RUN.ABORTED';
  eventData: {
    actorId: string;
    actorRunId: string;
  };
  resource: ApifyRunResponse;
}

/**
 * Crawled page data from Apify
 */
export interface CrawledPage {
  url: string;
  title: string;
  text: string;
  html?: string;
  metadata?: {
    description?: string;
    keywords?: string;
    author?: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  links?: string[];
  loadedAt: string;
}

/**
 * Crawl configuration for Apify
 */
export interface ApifyCrawlConfig {
  startUrls: Array<{ url: string }>;
  maxCrawlPages: number;
  includeUrlGlobs?: string[];
  excludeUrlGlobs?: string[];
  respectRobotsTxt?: boolean;
  proxyConfiguration?: {
    useApifyProxy: boolean;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Apify API base URL
 */
const APIFY_API_BASE = 'https://api.apify.com/v2';

/**
 * Default Apify actor for web crawling
 * Using the Website Content Crawler actor
 */
const DEFAULT_CRAWLER_ACTOR = 'apify/website-content-crawler';

/**
 * Check if mock mode is enabled
 */
function isMockMode(): boolean {
  return process.env.MOCK_EXTERNAL_SERVICES === 'true';
}

/**
 * Get Apify API token
 */
function getApifyToken(): string {
  const token = process.env.APIFY_TOKEN;
  if (!token && !isMockMode()) {
    throw new Error('APIFY_TOKEN environment variable is not set');
  }
  return token || 'mock-token';
}

// ============================================================================
// MOCK DATA
// ============================================================================

/**
 * Mock crawl result for development
 */
function getMockCrawlResult(): CrawledPage[] {
  return [
    {
      url: 'https://example.com',
      title: 'Example Domain',
      text: 'This domain is for use in illustrative examples in documents.',
      loadedAt: new Date().toISOString(),
    },
    {
      url: 'https://example.com/about',
      title: 'About Us - Example',
      text: 'Learn more about our company and mission.',
      loadedAt: new Date().toISOString(),
    },
    {
      url: 'https://example.com/products',
      title: 'Products - Example',
      text: 'Explore our range of products and services.',
      loadedAt: new Date().toISOString(),
    },
  ];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Starts a web crawl using Apify
 *
 * @param payload - Crawl job payload
 * @returns The Apify run ID
 * @throws Error if crawl fails to start
 */
export async function startCrawl(payload: CrawlJobPayload): Promise<string> {
  if (isMockMode()) {
    console.log('[Mock] Starting crawl for:', payload.domain);
    return `mock-run-${Date.now()}`;
  }

  const token = getApifyToken();

  const crawlConfig: ApifyCrawlConfig = {
    startUrls: [{ url: `https://${payload.domain}` }],
    maxCrawlPages: payload.config.maxPages,
    respectRobotsTxt: payload.config.respectRobots,
    proxyConfiguration: {
      useApifyProxy: true,
    },
  };

  // Add include patterns
  if (payload.config.includePatterns.length > 0) {
    crawlConfig.includeUrlGlobs = payload.config.includePatterns.map(
      (pattern) => `https://${payload.domain}${pattern}`
    );
  }

  // Add exclude patterns
  if (payload.config.excludePatterns.length > 0) {
    crawlConfig.excludeUrlGlobs = payload.config.excludePatterns.map(
      (pattern) => `https://${payload.domain}${pattern}`
    );
  }

  const response = await fetch(
    `${APIFY_API_BASE}/acts/${DEFAULT_CRAWLER_ACTOR}/runs?token=${token}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(crawlConfig),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to start Apify crawl: ${error}`);
  }

  const data: { data: ApifyRunResponse } = await response.json();
  return data.data.id;
}

/**
 * Gets the status of an Apify run
 *
 * @param runId - The Apify run ID
 * @returns The run status
 */
export async function getCrawlStatus(runId: string): Promise<ApifyRunResponse> {
  if (isMockMode()) {
    return {
      id: runId,
      actId: 'mock-actor',
      status: 'SUCCEEDED',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      buildId: 'mock-build',
      defaultKeyValueStoreId: 'mock-kv-store',
      defaultDatasetId: 'mock-dataset',
    };
  }

  const token = getApifyToken();

  const response = await fetch(
    `${APIFY_API_BASE}/actor-runs/${runId}?token=${token}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Apify run status: ${error}`);
  }

  const data: { data: ApifyRunResponse } = await response.json();
  return data.data;
}

/**
 * Gets the crawl results from an Apify dataset
 *
 * @param runId - The Apify run ID
 * @returns Array of crawled pages
 */
export async function getCrawlResults(runId: string): Promise<CrawledPage[]> {
  if (isMockMode()) {
    return getMockCrawlResult();
  }

  const token = getApifyToken();

  // First get the run to find the dataset ID
  const runStatus = await getCrawlStatus(runId);

  const response = await fetch(
    `${APIFY_API_BASE}/datasets/${runStatus.defaultDatasetId}/items?token=${token}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Apify crawl results: ${error}`);
  }

  const data: CrawledPage[] = await response.json();
  return data;
}

/**
 * Processes an Apify webhook
 *
 * @param payload - The webhook payload
 * @returns Processed crawl result
 */
export async function handleWebhook(
  payload: ApifyWebhookPayload
): Promise<CrawlJobResult | null> {
  const { eventType, resource } = payload;

  if (eventType === 'ACTOR.RUN.SUCCEEDED') {
    const results = await getCrawlResults(resource.id);

    const startTime = new Date(resource.startedAt).getTime();
    const endTime = resource.finishedAt
      ? new Date(resource.finishedAt).getTime()
      : Date.now();

    return {
      pagesCount: results.length,
      crawlDataUrl: `apify://datasets/${resource.defaultDatasetId}`,
      duration: endTime - startTime,
    };
  }

  if (eventType === 'ACTOR.RUN.FAILED' || eventType === 'ACTOR.RUN.ABORTED') {
    return null;
  }

  return null;
}

/**
 * Aborts a running Apify crawl
 *
 * @param runId - The Apify run ID
 */
export async function abortCrawl(runId: string): Promise<void> {
  if (isMockMode()) {
    console.log('[Mock] Aborting crawl:', runId);
    return;
  }

  const token = getApifyToken();

  const response = await fetch(
    `${APIFY_API_BASE}/actor-runs/${runId}/abort?token=${token}`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to abort Apify crawl: ${error}`);
  }
}

/**
 * Stores crawl results in Supabase storage
 *
 * @param results - The crawled pages
 * @param siteId - The site ID
 * @returns The storage URL
 */
export async function storeCrawlResults(
  results: CrawledPage[],
  siteId: string
): Promise<string> {
  // In a real implementation, this would upload to Supabase Storage
  // For now, we'll return a placeholder URL
  const timestamp = Date.now();
  return `crawls/${siteId}/${timestamp}.json`;
}
