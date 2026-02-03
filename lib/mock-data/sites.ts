/**
 * Mock Sites Data
 *
 * Contains mock website data for development and testing.
 * Includes sites with different configurations and crawl states.
 */

import type { Site, CrawlConfig } from '@/types/database';
import { MOCK_USER_IDS } from './users';

// ============================================================================
// MOCK SITE IDS (hardcoded UUIDs for consistency)
// ============================================================================

export const MOCK_SITE_IDS = {
  ACME_TECH: '660e8400-e29b-41d4-a716-446655440001',
  GREENLEAF_ORGANIC: '660e8400-e29b-41d4-a716-446655440002',
} as const;

// ============================================================================
// DEFAULT CRAWL CONFIGS
// ============================================================================

const defaultCrawlConfig: CrawlConfig = {
  max_pages: 50,
  include_patterns: [],
  exclude_patterns: [],
  respect_robots: true,
};

const acmeTechCrawlConfig: CrawlConfig = {
  max_pages: 100,
  include_patterns: ['/blog/*', '/products/*', '/solutions/*'],
  exclude_patterns: ['/admin/*', '/api/*', '*.pdf'],
  respect_robots: true,
};

const greenleafCrawlConfig: CrawlConfig = {
  max_pages: 50,
  include_patterns: ['/products/*', '/about/*', '/recipes/*'],
  exclude_patterns: ['/checkout/*', '/account/*'],
  respect_robots: true,
};

// ============================================================================
// MOCK SITES
// ============================================================================

/**
 * Acme Tech - A B2B technology company
 * Pro user's primary site with active crawling
 */
export const mockAcmeTechSite: Site = {
  id: MOCK_SITE_IDS.ACME_TECH,
  user_id: MOCK_USER_IDS.PRO_USER,
  domain: 'acme-tech.com',
  name: 'Acme Tech Solutions',
  crawl_config: acmeTechCrawlConfig,
  last_crawl_at: '2026-02-01T06:00:00.000Z',
  created_at: '2025-11-25T14:30:00.000Z',
  updated_at: '2026-02-01T06:15:00.000Z',
};

/**
 * Greenleaf Organic - An organic food e-commerce site
 * Free user's site, newer with less crawl history
 */
export const mockGreenleafSite: Site = {
  id: MOCK_SITE_IDS.GREENLEAF_ORGANIC,
  user_id: MOCK_USER_IDS.FREE_USER,
  domain: 'greenleaf-organic.com',
  name: 'Greenleaf Organic Foods',
  crawl_config: greenleafCrawlConfig,
  last_crawl_at: '2026-01-28T10:30:00.000Z',
  created_at: '2026-01-15T09:00:00.000Z',
  updated_at: '2026-01-28T10:45:00.000Z',
};

// ============================================================================
// MOCK SITES ARRAY
// ============================================================================

export const mockSites: Site[] = [mockAcmeTechSite, mockGreenleafSite];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the current mock site (defaults to Acme Tech for richer demo)
 */
export function getMockCurrentSite(): Site {
  return mockAcmeTechSite;
}

/**
 * Get a mock site by ID
 */
export function getMockSiteById(id: string): Site | undefined {
  return mockSites.find((site) => site.id === id);
}

/**
 * Get a mock site by domain
 */
export function getMockSiteByDomain(domain: string): Site | undefined {
  return mockSites.find((site) => site.domain === domain);
}

/**
 * Get all mock sites for a user
 */
export function getMockSitesByUserId(userId: string): Site[] {
  return mockSites.filter((site) => site.user_id === userId);
}

/**
 * Get all mock sites
 */
export function getMockSites(): Site[] {
  return mockSites;
}

/**
 * Get the default crawl config
 */
export function getDefaultCrawlConfig(): CrawlConfig {
  return { ...defaultCrawlConfig };
}
