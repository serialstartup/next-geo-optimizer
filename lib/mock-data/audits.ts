/**
 * Mock Audit Data
 *
 * Contains mock GEO audit results with scores and insights.
 * Includes audits with different statuses and score ranges.
 */

import type {
  Audit,
  SubScores,
  SubScore,
  Insight,
  PerceptionTags,
  AuditStatus,
} from '@/types/database';
import { MOCK_SITE_IDS } from './sites';
import { MOCK_JOB_IDS } from './jobs';

// ============================================================================
// MOCK AUDIT IDS (hardcoded UUIDs for consistency)
// ============================================================================

export const MOCK_AUDIT_IDS = {
  ACME_LATEST: '770e8400-e29b-41d4-a716-446655440001',
  ACME_PREVIOUS: '770e8400-e29b-41d4-a716-446655440002',
  GREENLEAF_LATEST: '770e8400-e29b-41d4-a716-446655440003',
  ACME_PENDING: '770e8400-e29b-41d4-a716-446655440004',
} as const;

// ============================================================================
// HELPER FUNCTIONS FOR CREATING SUB-SCORES
// ============================================================================

function createSubScore(
  score: number,
  description: string
): SubScore {
  let status: SubScore['status'];
  if (score >= 85) status = 'excellent';
  else if (score >= 70) status = 'optimal';
  else if (score >= 50) status = 'improving';
  else status = 'needs_focus';

  return { score, status, description };
}

// ============================================================================
// MOCK SUB-SCORES
// ============================================================================

const acmeLatestSubScores: SubScores = {
  content_clarity: createSubScore(
    78,
    'Content structure is well-organized with clear headings. Consider adding more concise summaries at the beginning of key sections.'
  ),
  entity_coverage: createSubScore(
    82,
    'Strong entity coverage for core technology terms. Missing some industry-specific entities that competitors mention.'
  ),
  answer_first: createSubScore(
    65,
    'Many pages bury the main answer. Restructure to lead with key information before supporting details.'
  ),
  ai_readability: createSubScore(
    88,
    'Excellent AI readability. Content is well-structured for machine parsing with clear semantic markup.'
  ),
};

const acmePreviousSubScores: SubScores = {
  content_clarity: createSubScore(
    72,
    'Content structure needs improvement. Some sections lack clear hierarchy.'
  ),
  entity_coverage: createSubScore(
    75,
    'Good entity coverage but missing key technical terms that AI models look for.'
  ),
  answer_first: createSubScore(
    58,
    'Content tends to provide background before answers. Consider restructuring.'
  ),
  ai_readability: createSubScore(
    80,
    'Good AI readability with room for improvement in semantic markup.'
  ),
};

const greenleafSubScores: SubScores = {
  content_clarity: createSubScore(
    62,
    'Product descriptions need clearer structure. Consider using consistent formatting across all product pages.'
  ),
  entity_coverage: createSubScore(
    55,
    'Limited entity coverage for organic food terms. Add more specific ingredient and certification entities.'
  ),
  answer_first: createSubScore(
    48,
    'Product benefits are often buried. Lead with key selling points and nutritional information.'
  ),
  ai_readability: createSubScore(
    70,
    'Moderate AI readability. Add structured data for products and recipes.'
  ),
};

// ============================================================================
// MOCK INSIGHTS
// ============================================================================

const acmeLatestInsights: Insight[] = [
  {
    type: 'opportunity',
    title: 'High Citation Potential Detected',
    description:
      'Your technical documentation pages have strong citation potential. AI models frequently reference similar content when answering technical queries.',
    severity: 'success',
  },
  {
    type: 'warning',
    title: 'Answer-First Structure Needed',
    description:
      '12 pages have important information buried below the fold. Restructuring these could improve AI visibility by 15-20%.',
    severity: 'warning',
  },
  {
    type: 'improvement',
    title: 'Entity Gap Identified',
    description:
      'Competitors mention "cloud-native architecture" and "microservices" more frequently. Consider adding content around these topics.',
    severity: 'info',
  },
  {
    type: 'success',
    title: 'Schema Markup Excellence',
    description:
      'Your FAQ and HowTo schema implementations are being recognized by AI models, contributing to higher visibility.',
    severity: 'success',
  },
];

const greenleafInsights: Insight[] = [
  {
    type: 'critical',
    title: 'Missing Product Schema',
    description:
      'Product pages lack structured data. Adding Product schema could significantly improve AI understanding of your offerings.',
    severity: 'error',
  },
  {
    type: 'opportunity',
    title: 'Recipe Content Opportunity',
    description:
      'Recipe pages have high engagement but low AI visibility. Adding Recipe schema and clearer ingredient lists would help.',
    severity: 'info',
  },
  {
    type: 'warning',
    title: 'Certification Claims Need Structure',
    description:
      'Organic and sustainability certifications are mentioned but not structured. AI models may miss these important differentiators.',
    severity: 'warning',
  },
];

// ============================================================================
// MOCK PERCEPTION TAGS
// ============================================================================

const acmePerceptionTags: PerceptionTags = {
  'enterprise software': 92,
  'cloud solutions': 88,
  'B2B technology': 85,
  'API platform': 82,
  'developer tools': 78,
  'data integration': 75,
  'scalable infrastructure': 72,
  'technical expertise': 70,
};

const greenleafPerceptionTags: PerceptionTags = {
  'organic food': 78,
  'healthy eating': 72,
  'sustainable': 65,
  'farm-to-table': 58,
  'natural ingredients': 55,
  'eco-friendly': 52,
};

// ============================================================================
// MOCK AUDITS
// ============================================================================

/**
 * Acme Tech - Latest completed audit
 * Shows good overall score with specific areas for improvement
 */
export const mockAcmeLatestAudit: Audit = {
  id: MOCK_AUDIT_IDS.ACME_LATEST,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  job_id: MOCK_JOB_IDS.COMPLETED_CRAWL,
  status: 'completed',
  overall_score: 78,
  score_change: 6,
  sub_scores: acmeLatestSubScores,
  insights: acmeLatestInsights,
  perception_tags: acmePerceptionTags,
  ai_keywords: [
    'enterprise API',
    'cloud platform',
    'data integration',
    'developer experience',
    'scalability',
    'microservices',
    'REST API',
    'webhooks',
  ],
  crawl_data_url: 'https://storage.example.com/crawls/acme-tech-2026-02-01.json',
  created_at: '2026-02-01T06:00:00.000Z',
  completed_at: '2026-02-01T06:15:00.000Z',
};

/**
 * Acme Tech - Previous audit for comparison
 * Shows lower scores to demonstrate improvement
 */
export const mockAcmePreviousAudit: Audit = {
  id: MOCK_AUDIT_IDS.ACME_PREVIOUS,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  job_id: null,
  status: 'completed',
  overall_score: 72,
  score_change: 4,
  sub_scores: acmePreviousSubScores,
  insights: [
    {
      type: 'warning',
      title: 'Content Structure Issues',
      description: 'Several key pages have unclear content hierarchy.',
      severity: 'warning',
    },
  ],
  perception_tags: {
    'enterprise software': 85,
    'cloud solutions': 80,
    'B2B technology': 78,
  },
  ai_keywords: ['enterprise API', 'cloud platform', 'data integration'],
  crawl_data_url: 'https://storage.example.com/crawls/acme-tech-2026-01-15.json',
  created_at: '2026-01-15T06:00:00.000Z',
  completed_at: '2026-01-15T06:20:00.000Z',
};

/**
 * Greenleaf Organic - Latest audit
 * Shows a site with more room for improvement
 */
export const mockGreenleafAudit: Audit = {
  id: MOCK_AUDIT_IDS.GREENLEAF_LATEST,
  site_id: MOCK_SITE_IDS.GREENLEAF_ORGANIC,
  job_id: null,
  status: 'completed',
  overall_score: 58,
  score_change: null,
  sub_scores: greenleafSubScores,
  insights: greenleafInsights,
  perception_tags: greenleafPerceptionTags,
  ai_keywords: [
    'organic produce',
    'healthy food',
    'sustainable farming',
    'natural ingredients',
  ],
  crawl_data_url: 'https://storage.example.com/crawls/greenleaf-2026-01-28.json',
  created_at: '2026-01-28T10:30:00.000Z',
  completed_at: '2026-01-28T10:45:00.000Z',
};

/**
 * Acme Tech - Pending audit (in progress)
 * Shows an audit that's currently being processed
 */
export const mockAcmePendingAudit: Audit = {
  id: MOCK_AUDIT_IDS.ACME_PENDING,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  job_id: MOCK_JOB_IDS.RUNNING_CRAWL,
  status: 'analyzing',
  overall_score: null,
  score_change: null,
  sub_scores: {},
  insights: [],
  perception_tags: {},
  ai_keywords: [],
  crawl_data_url: null,
  created_at: '2026-02-02T08:00:00.000Z',
  completed_at: null,
};

// ============================================================================
// MOCK AUDITS ARRAY
// ============================================================================

export const mockAudits: Audit[] = [
  mockAcmeLatestAudit,
  mockAcmePreviousAudit,
  mockGreenleafAudit,
  mockAcmePendingAudit,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the latest completed audit for the current site
 */
export function getMockLatestAudit(): Audit {
  return mockAcmeLatestAudit;
}

/**
 * Get a mock audit by ID
 */
export function getMockAuditById(id: string): Audit | undefined {
  return mockAudits.find((audit) => audit.id === id);
}

/**
 * Get all mock audits for a site
 */
export function getMockAuditsBySiteId(siteId: string): Audit[] {
  return mockAudits.filter((audit) => audit.site_id === siteId);
}

/**
 * Get completed audits for a site (sorted by date, newest first)
 */
export function getMockCompletedAuditsBySiteId(siteId: string): Audit[] {
  return mockAudits
    .filter((audit) => audit.site_id === siteId && audit.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

/**
 * Get all mock audits
 */
export function getMockAudits(): Audit[] {
  return mockAudits;
}

/**
 * Get mock audits by status
 */
export function getMockAuditsByStatus(status: AuditStatus): Audit[] {
  return mockAudits.filter((audit) => audit.status === status);
}
