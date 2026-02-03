/**
 * Mock Recommendations Data
 *
 * Contains mock actionable recommendations from GEO audits.
 * Includes different types, priorities, and execution steps.
 */

import type {
  Recommendation,
  RecommendationType,
  PriorityLevel,
  RecommendationStatus,
  ExecutionStep,
} from '@/types/database';
import { MOCK_AUDIT_IDS } from './audits';

// ============================================================================
// MOCK RECOMMENDATION IDS (hardcoded UUIDs for consistency)
// ============================================================================

export const MOCK_RECOMMENDATION_IDS = {
  SEMANTIC_STRUCTURE_CRITICAL: 'cc0e8400-e29b-41d4-a716-446655440001',
  ANSWER_FIRST_HIGH: 'cc0e8400-e29b-41d4-a716-446655440002',
  ENTITY_DEFINITION_HIGH: 'cc0e8400-e29b-41d4-a716-446655440003',
  SCHEMA_MARKUP_MEDIUM: 'cc0e8400-e29b-41d4-a716-446655440004',
  CITATION_HEALTH_MEDIUM: 'cc0e8400-e29b-41d4-a716-446655440005',
  CONTENT_CLARITY_LOW: 'cc0e8400-e29b-41d4-a716-446655440006',
  GREENLEAF_SCHEMA_CRITICAL: 'cc0e8400-e29b-41d4-a716-446655440007',
  GREENLEAF_ENTITY_HIGH: 'cc0e8400-e29b-41d4-a716-446655440008',
} as const;

// ============================================================================
// MOCK EXECUTION STEPS
// ============================================================================

const semanticStructureSteps: ExecutionStep[] = [
  {
    order: 1,
    action: 'Audit current heading hierarchy',
    details:
      'Review all H1-H6 tags on key pages to identify inconsistencies and missing levels.',
  },
  {
    order: 2,
    action: 'Create heading structure template',
    details:
      'Define a consistent heading hierarchy pattern for each content type (blog, product, documentation).',
  },
  {
    order: 3,
    action: 'Implement semantic HTML5 elements',
    details:
      'Replace generic divs with semantic elements: <article>, <section>, <aside>, <nav>, <header>, <footer>.',
  },
  {
    order: 4,
    action: 'Add ARIA landmarks where needed',
    details:
      'Supplement semantic HTML with ARIA roles for complex interactive components.',
  },
  {
    order: 5,
    action: 'Validate with accessibility tools',
    details:
      'Run automated checks with axe-core or Lighthouse to verify semantic structure.',
  },
];

const answerFirstSteps: ExecutionStep[] = [
  {
    order: 1,
    action: 'Identify high-intent pages',
    details:
      'Find pages targeting question-based queries or how-to searches using analytics data.',
  },
  {
    order: 2,
    action: 'Extract key answers',
    details:
      'For each page, identify the primary answer or value proposition that users seek.',
  },
  {
    order: 3,
    action: 'Restructure content flow',
    details:
      'Move the key answer to the first paragraph, followed by supporting details and context.',
  },
  {
    order: 4,
    action: 'Add TL;DR summaries',
    details:
      'Include concise summary boxes at the top of longer content pieces.',
  },
];

const entityDefinitionSteps: ExecutionStep[] = [
  {
    order: 1,
    action: 'Identify missing entities',
    details:
      'Compare your content against competitor pages to find entity gaps.',
  },
  {
    order: 2,
    action: 'Create entity glossary',
    details:
      'Build a glossary of key terms with clear, concise definitions.',
  },
  {
    order: 3,
    action: 'Add contextual definitions',
    details:
      'Include brief explanations when first introducing technical terms.',
  },
  {
    order: 4,
    action: 'Implement definition schema',
    details:
      'Add DefinedTerm schema markup for key terminology.',
  },
];

const schemaMarkupSteps: ExecutionStep[] = [
  {
    order: 1,
    action: 'Audit existing schema',
    details:
      'Use Google Rich Results Test to check current schema implementation.',
  },
  {
    order: 2,
    action: 'Identify schema opportunities',
    details:
      'Map content types to appropriate schema: FAQ, HowTo, Product, Article, Organization.',
  },
  {
    order: 3,
    action: 'Implement JSON-LD schema',
    details:
      'Add structured data using JSON-LD format in page headers.',
  },
  {
    order: 4,
    action: 'Test and validate',
    details:
      'Verify implementation with Schema.org validator and Google tools.',
  },
];

const productSchemaSteps: ExecutionStep[] = [
  {
    order: 1,
    action: 'Gather product data',
    details:
      'Collect all required Product schema fields: name, description, image, price, availability.',
  },
  {
    order: 2,
    action: 'Add Product schema to all product pages',
    details:
      'Implement JSON-LD Product schema with complete information.',
  },
  {
    order: 3,
    action: 'Include aggregate ratings',
    details:
      'Add AggregateRating schema if you have customer reviews.',
  },
  {
    order: 4,
    action: 'Add Offer schema for pricing',
    details:
      'Include price, currency, and availability information.',
  },
];

// ============================================================================
// MOCK RECOMMENDATIONS
// ============================================================================

/**
 * Critical: Semantic Structure Issues
 * High-impact recommendation for content structure
 */
export const mockSemanticStructureRec: Recommendation = {
  id: MOCK_RECOMMENDATION_IDS.SEMANTIC_STRUCTURE_CRITICAL,
  audit_id: MOCK_AUDIT_IDS.ACME_LATEST,
  type: 'semantic_structure',
  priority: 'critical',
  title: 'Fix Inconsistent Heading Hierarchy on 15 Key Pages',
  description:
    'Multiple high-traffic pages have broken heading hierarchies (jumping from H1 to H3, missing H2 levels). This confuses AI models when parsing content structure and reduces citation reliability.',
  why_matters:
    'AI models use heading structure to understand content hierarchy and extract key information. Inconsistent headings lead to misinterpretation and lower visibility in AI-generated responses.',
  action:
    'Implement consistent H1 → H2 → H3 hierarchy across all pages, ensuring each page has exactly one H1 and logical subheading progression.',
  estimated_impact: '+15% AI Readability Score',
  estimated_time: '2-3 hours',
  execution_steps: semanticStructureSteps,
  code_snippet: `<!-- Before: Broken hierarchy -->
<h1>API Documentation</h1>
<h3>Getting Started</h3>  <!-- Missing H2! -->
<h4>Authentication</h4>

<!-- After: Proper hierarchy -->
<h1>API Documentation</h1>
<h2>Getting Started</h2>
<h3>Authentication</h3>
<h3>Making Your First Request</h3>`,
  status: 'pending',
  completed_at: null,
  created_at: '2026-02-01T06:15:00.000Z',
};

/**
 * High: Answer-First Content Structure
 * Restructure content to lead with answers
 */
export const mockAnswerFirstRec: Recommendation = {
  id: MOCK_RECOMMENDATION_IDS.ANSWER_FIRST_HIGH,
  audit_id: MOCK_AUDIT_IDS.ACME_LATEST,
  type: 'answer_first',
  priority: 'high',
  title: 'Restructure 12 Pages to Lead with Key Information',
  description:
    'Analysis shows 12 high-value pages bury the main answer below introductory content. Users (and AI) must scroll past 300+ words before reaching actionable information.',
  why_matters:
    'AI models prioritize content that directly answers queries. When key information is buried, AI may cite competitors who present answers more directly.',
  action:
    'Restructure identified pages to present the core answer or value proposition in the first paragraph, with supporting details following.',
  estimated_impact: '+12% Citation Reliability',
  estimated_time: '4-5 hours',
  execution_steps: answerFirstSteps,
  code_snippet: `<!-- Before: Answer buried -->
<article>
  <p>In today's fast-paced digital landscape, 
     businesses need reliable solutions...</p>
  <p>Our company was founded in 2015 with a 
     vision to transform...</p>
  <p>The answer is: Use our REST API with 
     OAuth 2.0 authentication.</p>  <!-- Finally! -->
</article>

<!-- After: Answer first -->
<article>
  <p><strong>Quick Answer:</strong> Use our REST API 
     with OAuth 2.0 authentication for secure 
     data integration.</p>
  <p>Here's how to get started...</p>
</article>`,
  status: 'in_progress',
  completed_at: null,
  created_at: '2026-02-01T06:15:00.000Z',
};

/**
 * High: Entity Definition Gaps
 * Add missing entity definitions
 */
export const mockEntityDefinitionRec: Recommendation = {
  id: MOCK_RECOMMENDATION_IDS.ENTITY_DEFINITION_HIGH,
  audit_id: MOCK_AUDIT_IDS.ACME_LATEST,
  type: 'entity_definition',
  priority: 'high',
  title: 'Add Definitions for 8 Key Technical Terms',
  description:
    'Competitor analysis shows they define key terms like "microservices," "API gateway," and "webhook" that your content uses but never explains. This creates entity gaps in AI understanding.',
  why_matters:
    'When AI models encounter undefined terms, they may source definitions from competitors, reducing your authority on these topics.',
  action:
    'Add clear, concise definitions for identified technical terms, either inline or in a dedicated glossary with proper schema markup.',
  estimated_impact: '+8% Entity Coverage Score',
  estimated_time: '2 hours',
  execution_steps: entityDefinitionSteps,
  code_snippet: `<!-- Add inline definitions -->
<p>Our <dfn>API gateway</dfn> (a server that acts 
   as the single entry point for API requests, 
   handling authentication, rate limiting, and 
   routing) processes over 1 billion requests daily.</p>

<!-- Or use definition schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": "API Gateway",
  "description": "A server that acts as the single 
    entry point for API requests..."
}
</script>`,
  status: 'pending',
  completed_at: null,
  created_at: '2026-02-01T06:15:00.000Z',
};

/**
 * Medium: Schema Markup Enhancement
 * Add FAQ and HowTo schema
 */
export const mockSchemaMarkupRec: Recommendation = {
  id: MOCK_RECOMMENDATION_IDS.SCHEMA_MARKUP_MEDIUM,
  audit_id: MOCK_AUDIT_IDS.ACME_LATEST,
  type: 'schema_markup',
  priority: 'medium',
  title: 'Add FAQ Schema to 5 Documentation Pages',
  description:
    'Documentation pages contain FAQ-style content but lack structured data markup. Adding FAQ schema would improve AI understanding and potentially earn rich results.',
  why_matters:
    'FAQ schema helps AI models identify question-answer pairs, increasing the likelihood of being cited for specific queries.',
  action:
    'Implement FAQPage schema on identified documentation pages with properly formatted question-answer pairs.',
  estimated_impact: '+5% AI Visibility',
  estimated_time: '1-2 hours',
  execution_steps: schemaMarkupSteps,
  code_snippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How do I authenticate API requests?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Use OAuth 2.0 with your API key..."
    }
  }, {
    "@type": "Question",
    "name": "What is the rate limit?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "The default rate limit is 1000 
        requests per minute..."
    }
  }]
}
</script>`,
  status: 'pending',
  completed_at: null,
  created_at: '2026-02-01T06:15:00.000Z',
};

/**
 * Medium: Citation Health
 * Improve external linking and citations
 */
export const mockCitationHealthRec: Recommendation = {
  id: MOCK_RECOMMENDATION_IDS.CITATION_HEALTH_MEDIUM,
  audit_id: MOCK_AUDIT_IDS.ACME_LATEST,
  type: 'citation_health',
  priority: 'medium',
  title: 'Add Authoritative Citations to Technical Claims',
  description:
    'Several pages make technical claims without citing sources. Adding citations to authoritative sources improves credibility and AI trust signals.',
  why_matters:
    'AI models evaluate content credibility partly based on citation quality. Well-cited content is more likely to be referenced in AI responses.',
  action:
    'Add citations to industry standards, research papers, or official documentation for key technical claims.',
  estimated_impact: '+6% Citation Reliability',
  estimated_time: '2-3 hours',
  execution_steps: [
    {
      order: 1,
      action: 'Identify uncited claims',
      details: 'Review content for statistics, benchmarks, or technical claims without sources.',
    },
    {
      order: 2,
      action: 'Find authoritative sources',
      details: 'Locate official documentation, research papers, or industry reports to cite.',
    },
    {
      order: 3,
      action: 'Add inline citations',
      details: 'Link to sources using descriptive anchor text.',
    },
  ],
  code_snippet: `<!-- Before: Uncited claim -->
<p>REST APIs are 40% faster than SOAP for 
   most use cases.</p>

<!-- After: Properly cited -->
<p>REST APIs are 40% faster than SOAP for 
   most use cases, according to 
   <a href="https://example.org/api-benchmark-2025">
   the 2025 API Performance Benchmark</a>.</p>`,
  status: 'completed',
  completed_at: '2026-02-01T18:30:00.000Z',
  created_at: '2026-02-01T06:15:00.000Z',
};

/**
 * Low: Content Clarity Enhancement
 * Minor readability improvements
 */
export const mockContentClarityRec: Recommendation = {
  id: MOCK_RECOMMENDATION_IDS.CONTENT_CLARITY_LOW,
  audit_id: MOCK_AUDIT_IDS.ACME_LATEST,
  type: 'content_clarity',
  priority: 'low',
  title: 'Simplify Complex Sentences in 3 Blog Posts',
  description:
    'Three blog posts have average sentence lengths exceeding 30 words, which can reduce readability for both humans and AI parsing.',
  why_matters:
    'Clearer, more concise content is easier for AI to parse and extract key information from.',
  action:
    'Break down complex sentences into shorter, clearer statements while maintaining technical accuracy.',
  estimated_impact: '+3% Content Clarity Score',
  estimated_time: '1 hour',
  execution_steps: [
    {
      order: 1,
      action: 'Run readability analysis',
      details: 'Use tools like Hemingway Editor to identify complex sentences.',
    },
    {
      order: 2,
      action: 'Simplify without losing meaning',
      details: 'Break long sentences into shorter ones, use active voice.',
    },
  ],
  code_snippet: null,
  status: 'dismissed',
  completed_at: null,
  created_at: '2026-02-01T06:15:00.000Z',
};

/**
 * Greenleaf: Critical Product Schema
 * Missing product structured data
 */
export const mockGreenleafSchemaRec: Recommendation = {
  id: MOCK_RECOMMENDATION_IDS.GREENLEAF_SCHEMA_CRITICAL,
  audit_id: MOCK_AUDIT_IDS.GREENLEAF_LATEST,
  type: 'schema_markup',
  priority: 'critical',
  title: 'Add Product Schema to All Product Pages',
  description:
    'None of your 45 product pages have Product schema markup. This severely limits AI understanding of your product offerings and prevents rich results.',
  why_matters:
    'Without Product schema, AI models cannot reliably extract product information like pricing, availability, and ratings, reducing visibility in shopping-related queries.',
  action:
    'Implement Product schema with complete information on all product pages.',
  estimated_impact: '+25% Product Visibility',
  estimated_time: '4-6 hours',
  execution_steps: productSchemaSteps,
  code_snippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Organic Avocados (6-pack)",
  "description": "Fresh, ripe organic avocados 
    from sustainable California farms",
  "image": "https://greenleaf-organic.com/images/avocados.jpg",
  "brand": {
    "@type": "Brand",
    "name": "Greenleaf Organic"
  },
  "offers": {
    "@type": "Offer",
    "price": "12.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "124"
  }
}
</script>`,
  status: 'pending',
  completed_at: null,
  created_at: '2026-01-28T10:45:00.000Z',
};

/**
 * Greenleaf: High Entity Coverage
 * Missing organic food entities
 */
export const mockGreenleafEntityRec: Recommendation = {
  id: MOCK_RECOMMENDATION_IDS.GREENLEAF_ENTITY_HIGH,
  audit_id: MOCK_AUDIT_IDS.GREENLEAF_LATEST,
  type: 'entity_definition',
  priority: 'high',
  title: 'Add Certification and Ingredient Entity Definitions',
  description:
    'Product pages mention certifications (USDA Organic, Non-GMO) and ingredients without proper definitions or structured data. AI models may not recognize these as authoritative claims.',
  why_matters:
    'Properly defined certification entities help AI understand and communicate your product quality differentiators.',
  action:
    'Add clear definitions and schema markup for all certifications and key ingredients.',
  estimated_impact: '+15% Entity Coverage',
  estimated_time: '3 hours',
  execution_steps: [
    {
      order: 1,
      action: 'List all certifications',
      details: 'Compile all organic, sustainability, and quality certifications.',
    },
    {
      order: 2,
      action: 'Create certification pages',
      details: 'Build dedicated pages explaining each certification.',
    },
    {
      order: 3,
      action: 'Add certification schema',
      details: 'Implement appropriate schema for certifications.',
    },
  ],
  code_snippet: `<!-- Add certification details -->
<section itemscope itemtype="https://schema.org/Certification">
  <h3 itemprop="name">USDA Organic Certified</h3>
  <p itemprop="description">
    Our products meet the strict USDA National 
    Organic Program standards, ensuring no 
    synthetic pesticides, GMOs, or artificial 
    additives.
  </p>
  <meta itemprop="certificationStatus" 
    content="https://schema.org/CertificationActive" />
</section>`,
  status: 'pending',
  completed_at: null,
  created_at: '2026-01-28T10:45:00.000Z',
};

// ============================================================================
// MOCK RECOMMENDATIONS ARRAY
// ============================================================================

export const mockRecommendations: Recommendation[] = [
  mockSemanticStructureRec,
  mockAnswerFirstRec,
  mockEntityDefinitionRec,
  mockSchemaMarkupRec,
  mockCitationHealthRec,
  mockContentClarityRec,
  mockGreenleafSchemaRec,
  mockGreenleafEntityRec,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a mock recommendation by ID
 */
export function getMockRecommendationById(id: string): Recommendation | undefined {
  return mockRecommendations.find((rec) => rec.id === id);
}

/**
 * Get all mock recommendations for an audit
 */
export function getMockRecommendationsByAuditId(auditId: string): Recommendation[] {
  return mockRecommendations.filter((rec) => rec.audit_id === auditId);
}

/**
 * Get mock recommendations by type
 */
export function getMockRecommendationsByType(
  type: RecommendationType
): Recommendation[] {
  return mockRecommendations.filter((rec) => rec.type === type);
}

/**
 * Get mock recommendations by priority
 */
export function getMockRecommendationsByPriority(
  priority: PriorityLevel
): Recommendation[] {
  return mockRecommendations.filter((rec) => rec.priority === priority);
}

/**
 * Get mock recommendations by status
 */
export function getMockRecommendationsByStatus(
  status: RecommendationStatus
): Recommendation[] {
  return mockRecommendations.filter((rec) => rec.status === status);
}

/**
 * Get pending recommendations for an audit (sorted by priority)
 */
export function getMockPendingRecommendationsByAuditId(
  auditId: string
): Recommendation[] {
  const priorityOrder: Record<PriorityLevel, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return mockRecommendations
    .filter((rec) => rec.audit_id === auditId && rec.status === 'pending')
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Get all mock recommendations
 */
export function getMockRecommendations(): Recommendation[] {
  return mockRecommendations;
}

/**
 * Count recommendations by priority for an audit
 */
export function getMockRecommendationCountsByPriority(
  auditId: string
): Record<PriorityLevel, number> {
  const auditRecs = mockRecommendations.filter((rec) => rec.audit_id === auditId);
  return {
    critical: auditRecs.filter((r) => r.priority === 'critical').length,
    high: auditRecs.filter((r) => r.priority === 'high').length,
    medium: auditRecs.filter((r) => r.priority === 'medium').length,
    low: auditRecs.filter((r) => r.priority === 'low').length,
  };
}
