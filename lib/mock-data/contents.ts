/**
 * Mock Content Data
 *
 * Contains mock content items with original and optimized versions.
 * Includes GEO scores, entity data, and optimization tips.
 */

import type { Content, Entity, EntityDensity } from '@/types/database';
import { MOCK_SITE_IDS } from './sites';

// ============================================================================
// MOCK CONTENT IDS (hardcoded UUIDs for consistency)
// ============================================================================

export const MOCK_CONTENT_IDS = {
  ACME_API_DOCS: 'dd0e8400-e29b-41d4-a716-446655440001',
  ACME_GETTING_STARTED: 'dd0e8400-e29b-41d4-a716-446655440002',
  ACME_PRICING: 'dd0e8400-e29b-41d4-a716-446655440003',
  ACME_BLOG_POST: 'dd0e8400-e29b-41d4-a716-446655440004',
  GREENLEAF_PRODUCT: 'dd0e8400-e29b-41d4-a716-446655440005',
  GREENLEAF_ABOUT: 'dd0e8400-e29b-41d4-a716-446655440006',
} as const;

// ============================================================================
// MOCK ENTITIES
// ============================================================================

const apiDocsEntities: Entity[] = [
  { name: 'REST API', type: 'tech', status: 'detected' },
  { name: 'OAuth 2.0', type: 'tech', status: 'detected' },
  { name: 'JSON', type: 'tech', status: 'detected' },
  { name: 'API Gateway', type: 'concept', status: 'detected' },
  { name: 'Rate Limiting', type: 'concept', status: 'detected' },
  { name: 'Webhooks', type: 'tech', status: 'weak' },
  { name: 'GraphQL', type: 'tech', status: 'missing' },
];

const gettingStartedEntities: Entity[] = [
  { name: 'API Key', type: 'concept', status: 'detected' },
  { name: 'Authentication', type: 'concept', status: 'detected' },
  { name: 'SDK', type: 'tech', status: 'detected' },
  { name: 'Acme Tech', type: 'brand', status: 'detected' },
  { name: 'Quick Start', type: 'concept', status: 'detected' },
  { name: 'Environment Variables', type: 'tech', status: 'weak' },
];

const pricingEntities: Entity[] = [
  { name: 'Enterprise Plan', type: 'concept', status: 'detected' },
  { name: 'API Calls', type: 'concept', status: 'detected' },
  { name: 'SLA', type: 'concept', status: 'detected' },
  { name: 'Free Tier', type: 'concept', status: 'weak' },
  { name: 'Usage-Based Pricing', type: 'concept', status: 'missing' },
];

const blogPostEntities: Entity[] = [
  { name: 'Microservices', type: 'concept', status: 'detected' },
  { name: 'Cloud Architecture', type: 'concept', status: 'detected' },
  { name: 'Scalability', type: 'concept', status: 'detected' },
  { name: 'DevOps', type: 'concept', status: 'weak' },
  { name: 'Kubernetes', type: 'tech', status: 'missing' },
];

const productEntities: Entity[] = [
  { name: 'Organic', type: 'concept', status: 'detected' },
  { name: 'USDA Certified', type: 'concept', status: 'weak' },
  { name: 'Non-GMO', type: 'concept', status: 'weak' },
  { name: 'Sustainable Farming', type: 'concept', status: 'missing' },
  { name: 'Nutritional Value', type: 'concept', status: 'missing' },
];

const aboutEntities: Entity[] = [
  { name: 'Greenleaf Organic', type: 'brand', status: 'detected' },
  { name: 'Farm-to-Table', type: 'concept', status: 'detected' },
  { name: 'Sustainability', type: 'concept', status: 'weak' },
  { name: 'Local Farms', type: 'concept', status: 'weak' },
  { name: 'Carbon Neutral', type: 'concept', status: 'missing' },
];

// ============================================================================
// MOCK CONTENTS
// ============================================================================

/**
 * Acme Tech - API Documentation page
 * High-performing technical content
 */
export const mockAcmeApiDocs: Content = {
  id: MOCK_CONTENT_IDS.ACME_API_DOCS,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  url: 'https://acme-tech.com/docs/api-reference',
  title: 'API Reference Documentation',
  original_content: `# API Reference

Welcome to the Acme Tech API documentation. Our API provides programmatic access to our platform's features.

## Overview

The Acme Tech API is organized around REST principles. Our API has predictable resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.

## Authentication

The Acme Tech API uses API keys to authenticate requests. You can view and manage your API keys in the Dashboard.

Your API keys carry many privileges, so be sure to keep them secure. Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.

## Rate Limits

The API has rate limits to ensure fair usage. The default limit is 1000 requests per minute for standard plans and 10000 requests per minute for enterprise plans.`,
  optimized_content: `# API Reference Documentation

**Quick Start:** Authenticate with OAuth 2.0 using your API key, then make REST calls to our JSON endpoints. Rate limits: 1000 req/min (standard) or 10000 req/min (enterprise).

## What is the Acme Tech API?

The Acme Tech API is a RESTful interface that provides programmatic access to our enterprise data integration platform. It uses:
- **REST architecture** with predictable, resource-oriented URLs
- **JSON format** for all request and response bodies
- **OAuth 2.0** for secure authentication
- **Standard HTTP codes** for clear error handling

## How to Authenticate

1. Get your API key from the [Dashboard](/dashboard/api-keys)
2. Include it in the Authorization header: \`Authorization: Bearer YOUR_API_KEY\`
3. Never expose keys in client-side code or public repositories

## Rate Limits Explained

| Plan | Requests/Minute | Burst Limit |
|------|-----------------|-------------|
| Free | 100 | 150 |
| Standard | 1,000 | 1,500 |
| Enterprise | 10,000 | 15,000 |

Exceeding limits returns HTTP 429. Use exponential backoff for retries.`,
  geo_score: 85,
  entity_density: 'high',
  citation_potential: 8.5,
  entities: apiDocsEntities,
  optimization_tips: [
    'Add FAQ schema for common API questions',
    'Include code examples in multiple languages',
    'Add troubleshooting section for common errors',
  ],
  last_optimized_at: '2026-02-01T10:00:00.000Z',
  created_at: '2025-12-01T09:00:00.000Z',
  updated_at: '2026-02-01T10:00:00.000Z',
};

/**
 * Acme Tech - Getting Started guide
 * Good content with room for improvement
 */
export const mockAcmeGettingStarted: Content = {
  id: MOCK_CONTENT_IDS.ACME_GETTING_STARTED,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  url: 'https://acme-tech.com/docs/getting-started',
  title: 'Getting Started with Acme Tech',
  original_content: `# Getting Started

This guide will help you get started with Acme Tech's platform.

## Prerequisites

Before you begin, make sure you have:
- An Acme Tech account
- Basic knowledge of REST APIs
- A development environment set up

## Step 1: Create an Account

Visit our website and sign up for a free account. You'll receive an email to verify your address.

## Step 2: Get Your API Key

Once logged in, navigate to Settings > API Keys and generate a new key.

## Step 3: Make Your First Request

Use curl or your preferred HTTP client to make a test request.`,
  optimized_content: `# Getting Started with Acme Tech

**Get running in 5 minutes:** Sign up, grab your API key, and make your first API call with our SDK or curl.

## Quick Start Checklist

✅ Create free account at [acme-tech.com/signup](/signup)
✅ Generate API key in [Dashboard > API Keys](/dashboard/api-keys)
✅ Install SDK: \`npm install @acme-tech/sdk\`
✅ Make your first request (see below)

## Your First API Call

\`\`\`javascript
import { AcmeTech } from '@acme-tech/sdk';

const client = new AcmeTech({ apiKey: process.env.ACME_API_KEY });

const result = await client.data.list();
console.log(result);
\`\`\`

## What You'll Need

| Requirement | Details |
|-------------|---------|
| Account | Free tier available, no credit card required |
| API Key | Generated in dashboard, keep secure |
| Environment | Node.js 18+, Python 3.9+, or any HTTP client |

## Next Steps

- [API Reference](/docs/api-reference) - Full endpoint documentation
- [SDKs](/docs/sdks) - Official libraries in 12+ languages
- [Examples](/docs/examples) - Real-world integration patterns`,
  geo_score: 78,
  entity_density: 'medium',
  citation_potential: 7.2,
  entities: gettingStartedEntities,
  optimization_tips: [
    'Add HowTo schema for the setup steps',
    'Include estimated time for each step',
    'Add video tutorial embed',
  ],
  last_optimized_at: '2026-01-25T14:30:00.000Z',
  created_at: '2025-12-01T09:30:00.000Z',
  updated_at: '2026-01-25T14:30:00.000Z',
};

/**
 * Acme Tech - Pricing page
 * Needs optimization for AI visibility
 */
export const mockAcmePricing: Content = {
  id: MOCK_CONTENT_IDS.ACME_PRICING,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  url: 'https://acme-tech.com/pricing',
  title: 'Pricing Plans',
  original_content: `# Pricing

Choose the plan that's right for your business.

## Free
$0/month
- 100 API calls/day
- Community support
- Basic analytics

## Pro
$99/month
- 10,000 API calls/day
- Email support
- Advanced analytics
- Custom integrations

## Enterprise
Custom pricing
- Unlimited API calls
- Dedicated support
- SLA guarantee
- Custom features

Contact sales for enterprise pricing.`,
  optimized_content: null,
  geo_score: 52,
  entity_density: 'low',
  citation_potential: 4.5,
  entities: pricingEntities,
  optimization_tips: [
    'Add Product schema with pricing information',
    'Include comparison table with competitors',
    'Add FAQ section addressing common pricing questions',
    'Clarify what "custom pricing" means for enterprise',
  ],
  last_optimized_at: null,
  created_at: '2025-12-15T11:00:00.000Z',
  updated_at: '2025-12-15T11:00:00.000Z',
};

/**
 * Acme Tech - Blog post
 * Thought leadership content
 */
export const mockAcmeBlogPost: Content = {
  id: MOCK_CONTENT_IDS.ACME_BLOG_POST,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  url: 'https://acme-tech.com/blog/microservices-best-practices-2026',
  title: 'Microservices Best Practices for 2026',
  original_content: `# Microservices Best Practices for 2026

The microservices architecture continues to evolve. Here are the best practices we've learned from working with hundreds of enterprise clients.

## 1. Start with a Monolith

Contrary to popular belief, starting with microservices isn't always the best approach. Many successful companies started with a monolith and gradually extracted services.

## 2. Define Clear Service Boundaries

Each microservice should have a single responsibility. Use domain-driven design to identify natural boundaries.

## 3. Implement Proper Observability

You can't manage what you can't measure. Implement distributed tracing, centralized logging, and metrics from day one.

## 4. Plan for Failure

In a distributed system, failures are inevitable. Design your services to be resilient with circuit breakers, retries, and fallbacks.`,
  optimized_content: `# Microservices Best Practices for 2026: A Complete Guide

**Key Takeaway:** Start with a monolith, extract services based on domain boundaries, and invest heavily in observability from day one.

## What Are Microservices?

Microservices architecture is a design approach where applications are built as a collection of loosely coupled, independently deployable services. Each service handles a specific business capability and communicates via APIs.

## The 4 Essential Best Practices

### 1. Start with a Monolith First

**Why it matters:** Premature decomposition leads to distributed monoliths—the worst of both worlds.

- Build your MVP as a modular monolith
- Identify service boundaries through real usage patterns
- Extract services only when you have clear scaling or team needs

### 2. Define Clear Service Boundaries Using DDD

**Domain-Driven Design** helps identify natural service boundaries:
- Map business capabilities to services
- Keep related data within service boundaries
- Use events for cross-service communication

### 3. Implement Observability from Day One

Essential observability stack:
| Component | Purpose | Tools |
|-----------|---------|-------|
| Distributed Tracing | Request flow visibility | Jaeger, Zipkin |
| Centralized Logging | Aggregated log analysis | ELK, Loki |
| Metrics | Performance monitoring | Prometheus, Datadog |

### 4. Design for Failure

Resilience patterns every service needs:
- **Circuit Breakers** - Prevent cascade failures
- **Retries with Backoff** - Handle transient errors
- **Fallbacks** - Graceful degradation

## Conclusion

Successful microservices require patience, clear boundaries, and robust observability. Start simple, measure everything, and evolve based on real needs.`,
  geo_score: 72,
  entity_density: 'medium',
  citation_potential: 6.8,
  entities: blogPostEntities,
  optimization_tips: [
    'Add Article schema with author information',
    'Include statistics and research citations',
    'Add related posts section',
    'Include downloadable checklist',
  ],
  last_optimized_at: '2026-01-20T09:00:00.000Z',
  created_at: '2026-01-15T08:00:00.000Z',
  updated_at: '2026-01-20T09:00:00.000Z',
};

/**
 * Greenleaf - Product page
 * E-commerce content needing optimization
 */
export const mockGreenleafProduct: Content = {
  id: MOCK_CONTENT_IDS.GREENLEAF_PRODUCT,
  site_id: MOCK_SITE_IDS.GREENLEAF_ORGANIC,
  url: 'https://greenleaf-organic.com/products/organic-avocados',
  title: 'Organic Avocados - 6 Pack',
  original_content: `# Organic Avocados

Fresh organic avocados from California farms.

## Product Details

- 6 avocados per pack
- USDA Organic certified
- Non-GMO
- Price: $12.99

## Description

Our avocados are hand-picked at peak ripeness and delivered fresh to your door. Perfect for guacamole, salads, or toast.

## Shipping

Free shipping on orders over $50. Delivered in eco-friendly packaging.`,
  optimized_content: null,
  geo_score: 45,
  entity_density: 'low',
  citation_potential: 3.5,
  entities: productEntities,
  optimization_tips: [
    'Add Product schema with all required fields',
    'Include nutritional information',
    'Add customer reviews section',
    'Explain organic certification in detail',
    'Add recipe suggestions',
  ],
  last_optimized_at: null,
  created_at: '2026-01-15T10:00:00.000Z',
  updated_at: '2026-01-15T10:00:00.000Z',
};

/**
 * Greenleaf - About page
 * Brand story content
 */
export const mockGreenleafAbout: Content = {
  id: MOCK_CONTENT_IDS.GREENLEAF_ABOUT,
  site_id: MOCK_SITE_IDS.GREENLEAF_ORGANIC,
  url: 'https://greenleaf-organic.com/about',
  title: 'About Greenleaf Organic',
  original_content: `# About Us

Greenleaf Organic was founded in 2020 with a simple mission: bring fresh, organic produce directly from farms to families.

## Our Story

We started as a small farm stand in Northern California. Today, we partner with over 50 sustainable farms to deliver organic produce nationwide.

## Our Values

- Quality: Only the freshest, certified organic produce
- Sustainability: Eco-friendly packaging and carbon-neutral delivery
- Community: Supporting local farmers and sustainable agriculture

## Our Team

Our team of food lovers and sustainability advocates works hard to bring you the best organic produce available.`,
  optimized_content: null,
  geo_score: 55,
  entity_density: 'medium',
  citation_potential: 4.2,
  entities: aboutEntities,
  optimization_tips: [
    'Add Organization schema',
    'Include specific sustainability metrics',
    'Add team member profiles with Person schema',
    'Include farm partner information',
    'Add timeline of company milestones',
  ],
  last_optimized_at: null,
  created_at: '2026-01-15T10:30:00.000Z',
  updated_at: '2026-01-15T10:30:00.000Z',
};

// ============================================================================
// MOCK CONTENTS ARRAY
// ============================================================================

export const mockContents: Content[] = [
  mockAcmeApiDocs,
  mockAcmeGettingStarted,
  mockAcmePricing,
  mockAcmeBlogPost,
  mockGreenleafProduct,
  mockGreenleafAbout,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a mock content by ID
 */
export function getMockContentById(id: string): Content | undefined {
  return mockContents.find((content) => content.id === id);
}

/**
 * Get all mock contents for a site
 */
export function getMockContentsBySiteId(siteId: string): Content[] {
  return mockContents.filter((content) => content.site_id === siteId);
}

/**
 * Get mock content by URL
 */
export function getMockContentByUrl(url: string): Content | undefined {
  return mockContents.find((content) => content.url === url);
}

/**
 * Get mock contents by entity density
 */
export function getMockContentsByEntityDensity(
  density: EntityDensity
): Content[] {
  return mockContents.filter((content) => content.entity_density === density);
}

/**
 * Get mock contents that need optimization (no optimized_content)
 */
export function getMockContentsNeedingOptimization(siteId: string): Content[] {
  return mockContents.filter(
    (content) =>
      content.site_id === siteId && content.optimized_content === null
  );
}

/**
 * Get mock contents sorted by GEO score (lowest first)
 */
export function getMockContentsByGeoScore(
  siteId: string,
  ascending: boolean = true
): Content[] {
  return mockContents
    .filter((content) => content.site_id === siteId && content.geo_score !== null)
    .sort((a, b) => {
      const scoreA = a.geo_score || 0;
      const scoreB = b.geo_score || 0;
      return ascending ? scoreA - scoreB : scoreB - scoreA;
    });
}

/**
 * Get all mock contents
 */
export function getMockContents(): Content[] {
  return mockContents;
}

/**
 * Calculate average GEO score for a site
 */
export function getMockAverageGeoScore(siteId: string): number {
  const siteContents = mockContents.filter(
    (content) => content.site_id === siteId && content.geo_score !== null
  );
  if (siteContents.length === 0) return 0;

  const totalScore = siteContents.reduce(
    (sum, content) => sum + (content.geo_score || 0),
    0
  );
  return Math.round(totalScore / siteContents.length);
}

/**
 * Get entity statistics for a site
 */
export function getMockEntityStats(siteId: string): {
  detected: number;
  weak: number;
  missing: number;
} {
  const siteContents = mockContents.filter(
    (content) => content.site_id === siteId
  );

  let detected = 0;
  let weak = 0;
  let missing = 0;

  siteContents.forEach((content) => {
    content.entities.forEach((entity) => {
      if (entity.status === 'detected') detected++;
      else if (entity.status === 'weak') weak++;
      else if (entity.status === 'missing') missing++;
    });
  });

  return { detected, weak, missing };
}
