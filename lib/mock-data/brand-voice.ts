/**
 * Mock Brand Voice Data
 *
 * Contains mock brand voice configurations for different positioning types.
 * Includes audience definitions, differentiators, and guardrails.
 */

import type {
  BrandVoice,
  BrandPositioning,
  Audience,
  Guardrail,
  MachineProfile,
} from '@/types/database';
import { MOCK_SITE_IDS } from './sites';

// ============================================================================
// MOCK BRAND VOICE IDS (hardcoded UUIDs for consistency)
// ============================================================================

export const MOCK_BRAND_VOICE_IDS = {
  ACME_TECH: 'aa0e8400-e29b-41d4-a716-446655440001',
  GREENLEAF_ORGANIC: 'aa0e8400-e29b-41d4-a716-446655440002',
} as const;

// ============================================================================
// MOCK AUDIENCES
// ============================================================================

const acmeTechAudience: Audience = {
  demographic_context:
    'Technical decision-makers at mid-to-large enterprises, including CTOs, VP of Engineering, and senior developers. Typically 30-50 years old with 10+ years of industry experience.',
  intent_signals: [
    'Searching for enterprise API solutions',
    'Comparing cloud integration platforms',
    'Looking for scalable data infrastructure',
    'Evaluating developer experience tools',
    'Researching microservices architecture',
  ],
  decision_factors: [
    'Technical reliability and uptime guarantees',
    'Developer documentation quality',
    'Integration ecosystem breadth',
    'Security and compliance certifications',
    'Total cost of ownership',
    'Customer support responsiveness',
  ],
};

const greenleafAudience: Audience = {
  demographic_context:
    'Health-conscious consumers aged 25-45, primarily urban professionals and families. Values sustainability, transparency in food sourcing, and premium quality organic products.',
  intent_signals: [
    'Searching for organic food delivery',
    'Looking for sustainable food options',
    'Comparing organic produce quality',
    'Researching farm-to-table suppliers',
    'Finding healthy meal ingredients',
  ],
  decision_factors: [
    'Organic certification authenticity',
    'Product freshness and quality',
    'Sustainable packaging practices',
    'Local sourcing when possible',
    'Competitive pricing for organic',
    'Convenient delivery options',
  ],
};

// ============================================================================
// MOCK GUARDRAILS
// ============================================================================

const acmeTechGuardrails: Guardrail[] = [
  {
    avoid: 'Overpromising on performance metrics without data',
    reason:
      'Technical audiences value accuracy and will lose trust if claims cannot be substantiated',
  },
  {
    avoid: 'Using buzzwords without technical substance',
    reason:
      'Terms like "revolutionary" or "game-changing" without specifics appear marketing-driven rather than technically credible',
  },
  {
    avoid: 'Comparing directly to competitors by name',
    reason:
      'Focus on our strengths rather than competitor weaknesses to maintain professional positioning',
  },
  {
    avoid: 'Making security claims without certification references',
    reason:
      'Security-conscious enterprises require verifiable compliance and certification proof',
  },
];

const greenleafGuardrails: Guardrail[] = [
  {
    avoid: 'Using "natural" without specific organic certifications',
    reason:
      '"Natural" is unregulated and can appear misleading to informed organic consumers',
  },
  {
    avoid: 'Making health claims without scientific backing',
    reason:
      'Health-conscious consumers are skeptical of unsubstantiated wellness claims',
  },
  {
    avoid: 'Greenwashing language without concrete sustainability practices',
    reason:
      'Environmentally aware customers can identify and will reject superficial eco-claims',
  },
];

// ============================================================================
// MOCK MACHINE PROFILES
// ============================================================================

const acmeTechMachineProfile: MachineProfile = {
  intent: 'enterprise_technology_provider',
  audience_cluster: [
    'technical_decision_makers',
    'enterprise_developers',
    'it_architects',
    'devops_engineers',
  ],
  narrative_weight: {
    technical_depth: 0.9,
    reliability: 0.85,
    scalability: 0.8,
    developer_experience: 0.75,
    innovation: 0.6,
    cost_efficiency: 0.5,
  },
  forbidden_tokens: [
    'cheap',
    'basic',
    'simple solution',
    'one-size-fits-all',
    'revolutionary',
    'game-changing',
  ],
  alignmentScore: 85,
};

const greenleafMachineProfile: MachineProfile = {
  intent: 'premium_organic_food_provider',
  audience_cluster: [
    'health_conscious_consumers',
    'eco_aware_families',
    'urban_professionals',
    'sustainable_lifestyle',
  ],
  narrative_weight: {
    organic_authenticity: 0.95,
    sustainability: 0.85,
    quality: 0.8,
    transparency: 0.75,
    convenience: 0.6,
    value: 0.5,
  },
  forbidden_tokens: [
    'processed',
    'artificial',
    'cheap',
    'mass-produced',
    'conventional',
  ],
  alignmentScore: 72,
};

// ============================================================================
// MOCK BRAND VOICES
// ============================================================================

/**
 * Acme Tech - Expert positioning
 * B2B technology company with technical expertise focus
 */
export const mockAcmeTechBrandVoice: BrandVoice = {
  id: MOCK_BRAND_VOICE_IDS.ACME_TECH,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  positioning: 'expert',
  positioning_description:
    'Acme Tech positions itself as the trusted expert in enterprise API and cloud integration solutions. We combine deep technical expertise with a developer-first approach, delivering reliable, scalable infrastructure that powers mission-critical applications for Fortune 500 companies and fast-growing startups alike.',
  audience: acmeTechAudience,
  differentiators: [
    '99.99% uptime SLA with financial guarantees',
    'Comprehensive API documentation with interactive examples',
    'SOC 2 Type II and ISO 27001 certified infrastructure',
    'Dedicated technical account managers for enterprise clients',
    'Open-source SDKs in 12+ programming languages',
    'Real-time monitoring and alerting built-in',
  ],
  guardrails: acmeTechGuardrails,
  machine_profile: acmeTechMachineProfile,
  alignment_score: 85,
  created_at: '2025-11-25T15:00:00.000Z',
  updated_at: '2026-01-20T10:30:00.000Z',
};

/**
 * Greenleaf Organic - Premium positioning
 * Organic food company with sustainability focus
 */
export const mockGreenleafBrandVoice: BrandVoice = {
  id: MOCK_BRAND_VOICE_IDS.GREENLEAF_ORGANIC,
  site_id: MOCK_SITE_IDS.GREENLEAF_ORGANIC,
  positioning: 'premium',
  positioning_description:
    'Greenleaf Organic is a premium organic food provider committed to bringing farm-fresh, certified organic produce directly to health-conscious families. We partner with local sustainable farms to ensure the highest quality ingredients while minimizing environmental impact through eco-friendly packaging and carbon-neutral delivery.',
  audience: greenleafAudience,
  differentiators: [
    'USDA Organic and Non-GMO Project Verified certifications',
    'Direct partnerships with 50+ local sustainable farms',
    '100% compostable and recyclable packaging',
    'Carbon-neutral delivery within 48 hours of harvest',
    'Full supply chain transparency with farm-to-table tracking',
    'Seasonal subscription boxes curated by nutritionists',
  ],
  guardrails: greenleafGuardrails,
  machine_profile: greenleafMachineProfile,
  alignment_score: 72,
  created_at: '2026-01-15T10:00:00.000Z',
  updated_at: '2026-01-25T14:15:00.000Z',
};

// ============================================================================
// MOCK BRAND VOICES ARRAY
// ============================================================================

export const mockBrandVoices: BrandVoice[] = [
  mockAcmeTechBrandVoice,
  mockGreenleafBrandVoice,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the current mock brand voice (defaults to Acme Tech)
 */
export function getMockCurrentBrandVoice(): BrandVoice {
  return mockAcmeTechBrandVoice;
}

/**
 * Get a mock brand voice by ID
 */
export function getMockBrandVoiceById(id: string): BrandVoice | undefined {
  return mockBrandVoices.find((bv) => bv.id === id);
}

/**
 * Get a mock brand voice by site ID
 */
export function getMockBrandVoiceBySiteId(siteId: string): BrandVoice | undefined {
  return mockBrandVoices.find((bv) => bv.site_id === siteId);
}

/**
 * Get all mock brand voices
 */
export function getMockBrandVoices(): BrandVoice[] {
  return mockBrandVoices;
}

/**
 * Get mock brand voices by positioning type
 */
export function getMockBrandVoicesByPositioning(
  positioning: BrandPositioning
): BrandVoice[] {
  return mockBrandVoices.filter((bv) => bv.positioning === positioning);
}

/**
 * Create an empty brand voice template for a site
 */
export function createEmptyBrandVoice(siteId: string): Omit<BrandVoice, 'id' | 'created_at' | 'updated_at'> {
  return {
    site_id: siteId,
    positioning: null,
    positioning_description: null,
    audience: {},
    differentiators: [],
    guardrails: [],
    machine_profile: {},
    alignment_score: null,
  };
}
