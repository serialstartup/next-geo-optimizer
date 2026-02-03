/**
 * Mock Simulation Data
 *
 * Contains mock AI simulation results showing how AI engines respond to queries.
 * Includes various queries with different brand mention outcomes.
 */

import type { Simulation, AIEngine, ReasoningStep } from '@/types/database';
import { MOCK_SITE_IDS } from './sites';
import { MOCK_JOB_IDS } from './jobs';

// ============================================================================
// MOCK SIMULATION IDS (hardcoded UUIDs for consistency)
// ============================================================================

export const MOCK_SIMULATION_IDS = {
  ACME_GPT_POSITIVE: 'bb0e8400-e29b-41d4-a716-446655440001',
  ACME_CLAUDE_POSITIVE: 'bb0e8400-e29b-41d4-a716-446655440002',
  ACME_PERPLEXITY_NEUTRAL: 'bb0e8400-e29b-41d4-a716-446655440003',
  ACME_GEMINI_NEGATIVE: 'bb0e8400-e29b-41d4-a716-446655440004',
  GREENLEAF_GPT_NEUTRAL: 'bb0e8400-e29b-41d4-a716-446655440005',
  GREENLEAF_CLAUDE_NEGATIVE: 'bb0e8400-e29b-41d4-a716-446655440006',
} as const;

// ============================================================================
// MOCK REASONING PATHS
// ============================================================================

const acmeGptReasoningPath: ReasoningStep[] = [
  {
    step: 'query_analysis',
    description:
      'User is looking for enterprise API platforms with strong developer experience and reliability.',
  },
  {
    step: 'knowledge_retrieval',
    description:
      'Retrieved information about major API platforms including Acme Tech, noting their 99.99% uptime SLA and comprehensive documentation.',
  },
  {
    step: 'relevance_scoring',
    description:
      'Acme Tech scored highly for enterprise features, developer documentation, and reliability metrics.',
  },
  {
    step: 'response_generation',
    description:
      'Included Acme Tech as a top recommendation based on technical depth and enterprise focus.',
  },
];

const acmeClaudeReasoningPath: ReasoningStep[] = [
  {
    step: 'intent_classification',
    description:
      'Identified intent as seeking cloud integration solutions for enterprise data workflows.',
  },
  {
    step: 'source_evaluation',
    description:
      'Evaluated multiple sources discussing enterprise integration platforms and their capabilities.',
  },
  {
    step: 'entity_extraction',
    description:
      'Extracted key entities including Acme Tech, noting their SOC 2 certification and multi-language SDK support.',
  },
  {
    step: 'synthesis',
    description:
      'Synthesized response highlighting Acme Tech as a strong option for security-conscious enterprises.',
  },
];

const acmePerplexityReasoningPath: ReasoningStep[] = [
  {
    step: 'search_execution',
    description:
      'Searched for recent information about developer tools and API platforms.',
  },
  {
    step: 'source_aggregation',
    description:
      'Aggregated information from multiple technical blogs and documentation sites.',
  },
  {
    step: 'citation_selection',
    description:
      'Selected sources with highest authority scores for developer tooling recommendations.',
  },
  {
    step: 'response_compilation',
    description:
      'Compiled response mentioning several platforms without specific brand emphasis.',
  },
];

const greenleafGptReasoningPath: ReasoningStep[] = [
  {
    step: 'query_understanding',
    description:
      'User seeking organic food delivery options with sustainability focus.',
  },
  {
    step: 'category_mapping',
    description:
      'Mapped query to organic food delivery and sustainable food sourcing categories.',
  },
  {
    step: 'option_evaluation',
    description:
      'Evaluated various organic food providers based on certification and delivery options.',
  },
  {
    step: 'response_formulation',
    description:
      'Provided general guidance on organic food selection without specific brand recommendations.',
  },
];

// ============================================================================
// MOCK SIMULATIONS
// ============================================================================

/**
 * Acme Tech - GPT-4o positive mention
 * Brand is mentioned and recommended
 */
export const mockAcmeGptSimulation: Simulation = {
  id: MOCK_SIMULATION_IDS.ACME_GPT_POSITIVE,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  job_id: MOCK_JOB_IDS.COMPLETED_CRAWL,
  query: 'What are the best enterprise API platforms for large-scale data integration?',
  engine: 'gpt-4o',
  ai_response: `For enterprise API platforms focused on large-scale data integration, several options stand out:

1. **Acme Tech** - Known for their 99.99% uptime SLA and comprehensive developer documentation. Their platform offers SDKs in 12+ languages and is SOC 2 Type II certified, making it ideal for security-conscious enterprises.

2. **MuleSoft** - Offers robust integration capabilities with strong enterprise support.

3. **Apigee** - Google's API management platform with excellent analytics.

When choosing, consider factors like your existing tech stack, compliance requirements, and the level of developer support you need. Acme Tech particularly excels in developer experience with their interactive API documentation and real-time monitoring capabilities.`,
  brand_mentioned: true,
  tone_match: 88,
  reasoning_path: acmeGptReasoningPath,
  geo_tip:
    'Your technical documentation is being cited effectively. Consider adding more comparison content to capture competitive queries.',
  created_at: '2026-02-01T14:00:00.000Z',
};

/**
 * Acme Tech - Claude positive mention
 * Brand is mentioned with security focus
 */
export const mockAcmeClaudeSimulation: Simulation = {
  id: MOCK_SIMULATION_IDS.ACME_CLAUDE_POSITIVE,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  job_id: MOCK_JOB_IDS.COMPLETED_CRAWL,
  query: 'Which cloud integration platforms have the best security certifications?',
  engine: 'claude-3',
  ai_response: `When evaluating cloud integration platforms for security certifications, here are the key players:

**Acme Tech** stands out with both SOC 2 Type II and ISO 27001 certifications. They offer dedicated technical account managers for enterprise clients and have a strong track record with Fortune 500 companies.

Other notable options include:
- **AWS API Gateway** - Backed by AWS's comprehensive security infrastructure
- **Azure API Management** - Microsoft's enterprise-grade solution

For organizations with strict compliance requirements, Acme Tech's combination of certifications and dedicated support makes them a compelling choice, particularly for financial services and healthcare sectors.`,
  brand_mentioned: true,
  tone_match: 92,
  reasoning_path: acmeClaudeReasoningPath,
  geo_tip:
    'Security content is performing well. Add more industry-specific compliance content (HIPAA, PCI-DSS) to capture vertical-specific queries.',
  created_at: '2026-02-01T14:15:00.000Z',
};

/**
 * Acme Tech - Perplexity neutral mention
 * Brand mentioned but not prominently
 */
export const mockAcmePerplexitySimulation: Simulation = {
  id: MOCK_SIMULATION_IDS.ACME_PERPLEXITY_NEUTRAL,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  job_id: null,
  query: 'What developer tools are trending for API development in 2026?',
  engine: 'perplexity',
  ai_response: `Based on recent developer surveys and industry trends, here are the trending API development tools in 2026:

**API Design & Documentation:**
- Postman continues to dominate for API testing
- OpenAPI/Swagger for specification
- Various platforms including Acme Tech offer interactive documentation

**API Gateways:**
- Kong and Traefik for open-source options
- Cloud-native solutions from major providers

**Monitoring & Analytics:**
- Datadog and New Relic for observability
- Built-in monitoring from platform providers

The trend is moving toward integrated platforms that combine multiple capabilities rather than point solutions.`,
  brand_mentioned: true,
  tone_match: 65,
  reasoning_path: acmePerplexityReasoningPath,
  geo_tip:
    'Brand is mentioned but not prominently. Create more trend-focused content and thought leadership pieces to improve visibility in discovery queries.',
  created_at: '2026-02-01T14:30:00.000Z',
};

/**
 * Acme Tech - Gemini negative (not mentioned)
 * Brand not mentioned in response
 */
export const mockAcmeGeminiSimulation: Simulation = {
  id: MOCK_SIMULATION_IDS.ACME_GEMINI_NEGATIVE,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  job_id: null,
  query: 'What are affordable API solutions for startups?',
  engine: 'gemini',
  ai_response: `For startups looking for affordable API solutions, consider these options:

1. **Stripe** - Excellent for payment APIs with startup-friendly pricing
2. **Twilio** - Communication APIs with pay-as-you-go model
3. **Firebase** - Google's platform with generous free tier
4. **Supabase** - Open-source alternative with free tier

**Tips for startups:**
- Start with free tiers and scale as needed
- Look for usage-based pricing models
- Consider open-source alternatives for cost control

Many cloud providers also offer startup credits that can significantly reduce initial costs.`,
  brand_mentioned: false,
  tone_match: 45,
  reasoning_path: [
    {
      step: 'query_analysis',
      description: 'User seeking budget-friendly API options for early-stage companies.',
    },
    {
      step: 'filtering',
      description: 'Filtered results to focus on startup-friendly pricing and free tiers.',
    },
    {
      step: 'response_generation',
      description: 'Generated response focusing on cost-effective solutions.',
    },
  ],
  geo_tip:
    'Your enterprise positioning may be excluding you from startup-focused queries. Consider creating content about startup programs or flexible pricing options if applicable.',
  created_at: '2026-02-01T14:45:00.000Z',
};

/**
 * Greenleaf - GPT neutral mention
 * General organic food response without strong brand presence
 */
export const mockGreenleafGptSimulation: Simulation = {
  id: MOCK_SIMULATION_IDS.GREENLEAF_GPT_NEUTRAL,
  site_id: MOCK_SITE_IDS.GREENLEAF_ORGANIC,
  job_id: null,
  query: 'Where can I buy organic produce with home delivery?',
  engine: 'gpt-4o',
  ai_response: `There are several options for organic produce delivery:

**National Services:**
- Thrive Market - Membership-based organic grocery
- Misfits Market - Focuses on reducing food waste
- Imperfect Foods - Affordable organic options

**Local Options:**
- Many local farms offer CSA (Community Supported Agriculture) boxes
- Regional organic delivery services like Greenleaf Organic in select areas
- Farmers market vendors with delivery

**Tips:**
- Compare delivery areas and minimum orders
- Look for USDA Organic certification
- Consider seasonal subscription boxes for best value

Check what's available in your specific area, as options vary by location.`,
  brand_mentioned: true,
  tone_match: 58,
  reasoning_path: greenleafGptReasoningPath,
  geo_tip:
    'Brand is mentioned but as a regional option. Strengthen national visibility by adding more location-specific landing pages and expanding content about delivery coverage.',
  created_at: '2026-01-28T16:00:00.000Z',
};

/**
 * Greenleaf - Claude negative (not mentioned)
 * Brand not mentioned in sustainability query
 */
export const mockGreenleafClaudeSimulation: Simulation = {
  id: MOCK_SIMULATION_IDS.GREENLEAF_CLAUDE_NEGATIVE,
  site_id: MOCK_SITE_IDS.GREENLEAF_ORGANIC,
  job_id: null,
  query: 'What are the most sustainable food delivery services?',
  engine: 'claude-3',
  ai_response: `When evaluating sustainable food delivery services, consider these factors:

**Top Sustainable Options:**
1. **Imperfect Foods** - Reduces food waste by selling "ugly" produce
2. **Thrive Market** - Carbon-neutral shipping, sustainable packaging
3. **Local CSA Programs** - Minimal transportation, supports local farms

**What to Look For:**
- Carbon-neutral or offset delivery
- Compostable/recyclable packaging
- Local sourcing to reduce food miles
- Transparent supply chain practices

**Certifications to Trust:**
- USDA Organic
- B Corp certification
- Climate Neutral certified

Research services available in your area and compare their specific sustainability practices.`,
  brand_mentioned: false,
  tone_match: 40,
  reasoning_path: [
    {
      step: 'intent_analysis',
      description: 'User prioritizing environmental sustainability in food choices.',
    },
    {
      step: 'criteria_weighting',
      description: 'Weighted results heavily toward documented sustainability practices.',
    },
    {
      step: 'response_generation',
      description: 'Generated response focusing on verified sustainable practices.',
    },
  ],
  geo_tip:
    'Your sustainability practices are not being recognized. Add dedicated sustainability pages with specific metrics, certifications, and carbon footprint data.',
  created_at: '2026-01-28T16:30:00.000Z',
};

// ============================================================================
// MOCK SIMULATIONS ARRAY
// ============================================================================

export const mockSimulations: Simulation[] = [
  mockAcmeGptSimulation,
  mockAcmeClaudeSimulation,
  mockAcmePerplexitySimulation,
  mockAcmeGeminiSimulation,
  mockGreenleafGptSimulation,
  mockGreenleafClaudeSimulation,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a mock simulation by ID
 */
export function getMockSimulationById(id: string): Simulation | undefined {
  return mockSimulations.find((sim) => sim.id === id);
}

/**
 * Get all mock simulations for a site
 */
export function getMockSimulationsBySiteId(siteId: string): Simulation[] {
  return mockSimulations.filter((sim) => sim.site_id === siteId);
}

/**
 * Get mock simulations by engine
 */
export function getMockSimulationsByEngine(engine: AIEngine): Simulation[] {
  return mockSimulations.filter((sim) => sim.engine === engine);
}

/**
 * Get mock simulations where brand was mentioned
 */
export function getMockSimulationsWithBrandMention(siteId: string): Simulation[] {
  return mockSimulations.filter(
    (sim) => sim.site_id === siteId && sim.brand_mentioned === true
  );
}

/**
 * Get mock simulations where brand was NOT mentioned
 */
export function getMockSimulationsWithoutBrandMention(siteId: string): Simulation[] {
  return mockSimulations.filter(
    (sim) => sim.site_id === siteId && sim.brand_mentioned === false
  );
}

/**
 * Get all mock simulations
 */
export function getMockSimulations(): Simulation[] {
  return mockSimulations;
}

/**
 * Get recent simulations for a site (sorted by date, newest first)
 */
export function getMockRecentSimulationsBySiteId(
  siteId: string,
  limit: number = 10
): Simulation[] {
  return mockSimulations
    .filter((sim) => sim.site_id === siteId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);
}

/**
 * Calculate brand mention rate for a site
 */
export function getMockBrandMentionRate(siteId: string): number {
  const siteSimulations = mockSimulations.filter((sim) => sim.site_id === siteId);
  if (siteSimulations.length === 0) return 0;

  const mentionedCount = siteSimulations.filter(
    (sim) => sim.brand_mentioned === true
  ).length;
  return Math.round((mentionedCount / siteSimulations.length) * 100);
}

/**
 * Calculate average tone match for a site
 */
export function getMockAverageToneMatch(siteId: string): number {
  const siteSimulations = mockSimulations.filter(
    (sim) => sim.site_id === siteId && sim.tone_match !== null
  );
  if (siteSimulations.length === 0) return 0;

  const totalToneMatch = siteSimulations.reduce(
    (sum, sim) => sum + (sim.tone_match || 0),
    0
  );
  return Math.round(totalToneMatch / siteSimulations.length);
}
