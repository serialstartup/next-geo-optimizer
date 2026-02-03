# GEO Optimizer - API Routes Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Route Handlers](#3-route-handlers)
4. [Server Actions](#4-server-actions)
5. [Webhook Endpoints](#5-webhook-endpoints)
6. [Error Handling](#6-error-handling)
7. [Rate Limiting](#7-rate-limiting)

---

## 1. Overview

The GEO Optimizer API follows a hybrid approach using Next.js App Router:

- **Route Handlers** (`/api/*`): For external service integrations, webhooks, and long-running operations
- **Server Actions**: For form submissions, data mutations, and internal operations

### Base URL

```
Production: https://geo-optimizer.vercel.app
Development: http://localhost:3000
```

### API Versioning

Currently, all endpoints are unversioned. Future versions will use path-based versioning:
```
/api/v1/crawl/start
/api/v2/crawl/start
```

---

## 2. Authentication

### Authentication Method

All authenticated endpoints require a valid Supabase session. The session is automatically managed via cookies.

### Headers

```http
Cookie: sb-<project-ref>-auth-token=<session-token>
Content-Type: application/json
```

### Authentication Errors

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | No valid session found |
| 403 | `FORBIDDEN` | User lacks permission for this resource |

### Example Error Response

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED",
  "message": "You must be logged in to access this resource"
}
```

---

## 3. Route Handlers

### 3.1 Crawl API

#### POST /api/crawl/start

Start a website crawl job.

**Authentication**: Required

**Request Body**:
```typescript
interface StartCrawlRequest {
  siteId: string;           // UUID of the site to crawl
  config?: {
    maxPages?: number;      // Maximum pages to crawl (default: 50)
    includePatterns?: string[];  // URL patterns to include
    excludePatterns?: string[];  // URL patterns to exclude
    respectRobots?: boolean;     // Respect robots.txt (default: true)
  };
}
```

**Example Request**:
```json
{
  "siteId": "550e8400-e29b-41d4-a716-446655440000",
  "config": {
    "maxPages": 100,
    "includePatterns": ["/blog/*", "/products/*"],
    "excludePatterns": ["/admin/*"],
    "respectRobots": true
  }
}
```

**Response** (201 Created):
```typescript
interface StartCrawlResponse {
  jobId: string;            // UUID of the created job
  status: 'pending';
  message: string;
}
```

**Example Response**:
```json
{
  "jobId": "660e8400-e29b-41d4-a716-446655440001",
  "status": "pending",
  "message": "Crawl job started successfully"
}
```

**Error Responses**:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Missing or invalid siteId |
| 404 | `SITE_NOT_FOUND` | Site does not exist or user lacks access |
| 409 | `CRAWL_IN_PROGRESS` | A crawl is already running for this site |
| 429 | `RATE_LIMITED` | Too many crawl requests |

---

#### GET /api/crawl/status/[jobId]

Get the status of a crawl job.

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `jobId` | UUID | The job identifier |

**Response** (200 OK):
```typescript
interface CrawlStatusResponse {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;           // 0-100
  progressMessage?: string;
  result?: {
    pagesCount: number;
    crawlDataUrl: string;
  };
  error?: string;
  startedAt?: string;         // ISO 8601
  completedAt?: string;       // ISO 8601
}
```

**Example Response** (Running):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "status": "running",
  "progress": 45,
  "progressMessage": "Crawling page 23 of 50...",
  "startedAt": "2024-01-15T10:30:00Z"
}
```

**Example Response** (Completed):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "status": "completed",
  "progress": 100,
  "progressMessage": "Crawl completed successfully",
  "result": {
    "pagesCount": 47,
    "crawlDataUrl": "https://storage.supabase.co/crawls/..."
  },
  "startedAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:35:42Z"
}
```

**Error Responses**:

| Status | Code | Description |
|--------|------|-------------|
| 404 | `JOB_NOT_FOUND` | Job does not exist or user lacks access |

---

### 3.2 AI Analysis API

#### POST /api/ai/analyze

Run GEO analysis on crawled content.

**Authentication**: Required

**Request Body**:
```typescript
interface AnalyzeRequest {
  auditId: string;          // UUID of the audit
  crawlDataUrl?: string;    // URL to crawl data (optional if already stored)
}
```

**Example Request**:
```json
{
  "auditId": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Response** (202 Accepted):
```typescript
interface AnalyzeResponse {
  jobId: string;
  status: 'running';
  message: string;
}
```

**Example Response**:
```json
{
  "jobId": "880e8400-e29b-41d4-a716-446655440003",
  "status": "running",
  "message": "Analysis started"
}
```

**Error Responses**:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Missing auditId or no crawl data available |
| 404 | `AUDIT_NOT_FOUND` | Audit does not exist |
| 409 | `ANALYSIS_IN_PROGRESS` | Analysis already running for this audit |

---

#### POST /api/ai/simulate

Run an AI recommendation simulation.

**Authentication**: Required

**Request Body**:
```typescript
interface SimulateRequest {
  siteId: string;           // UUID of the site
  query: string;            // User query to simulate
  engine?: 'gpt-4o' | 'claude-3' | 'gemini' | 'perplexity';  // Default: 'gpt-4o'
}
```

**Example Request**:
```json
{
  "siteId": "550e8400-e29b-41d4-a716-446655440000",
  "query": "What is the best CRM for small businesses?",
  "engine": "gpt-4o"
}
```

**Response** (200 OK):
```typescript
interface SimulateResponse {
  id: string;               // Simulation record ID
  query: string;
  engine: string;
  aiResponse: string;       // Generated AI response
  brandMentioned: boolean;  // Was the brand mentioned?
  toneMatch: number;        // 0-100 tone alignment score
  reasoningPath: Array<{
    step: string;
    description: string;
  }>;
  geoTip: string;           // GEO optimization tip
  createdAt: string;        // ISO 8601
}
```

**Example Response**:
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "query": "What is the best CRM for small businesses?",
  "engine": "gpt-4o",
  "aiResponse": "For small businesses, I'd recommend considering several CRM options based on your specific needs...",
  "brandMentioned": true,
  "toneMatch": 78,
  "reasoningPath": [
    {
      "step": "input_classification",
      "description": "Identified search intent as 'product comparison' for SMB segment"
    },
    {
      "step": "knowledge_retrieval",
      "description": "Retrieved information from 15 sources including G2, Capterra, and official sites"
    },
    {
      "step": "final_selection",
      "description": "Ranked based on SMB-specific features, pricing, and user reviews"
    }
  ],
  "geoTip": "Consider adding more specific use-case content for small business scenarios to improve AI recommendation likelihood.",
  "createdAt": "2024-01-15T11:00:00Z"
}
```

**Error Responses**:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Missing siteId or query |
| 404 | `SITE_NOT_FOUND` | Site does not exist |
| 429 | `RATE_LIMITED` | Too many simulation requests |

---

#### POST /api/ai/optimize

Generate content optimization suggestions.

**Authentication**: Required

**Request Body**:
```typescript
interface OptimizeRequest {
  contentId: string;        // UUID of the content to optimize
  options?: {
    preserveTone?: boolean; // Preserve original tone (default: true)
    targetScore?: number;   // Target GEO score (default: 85)
    focusAreas?: Array<'entities' | 'structure' | 'clarity' | 'citations'>;
  };
}
```

**Example Request**:
```json
{
  "contentId": "aa0e8400-e29b-41d4-a716-446655440005",
  "options": {
    "preserveTone": true,
    "targetScore": 90,
    "focusAreas": ["entities", "structure"]
  }
}
```

**Response** (200 OK):
```typescript
interface OptimizeResponse {
  contentId: string;
  originalScore: number;
  optimizedScore: number;
  optimizedContent: string;
  changes: Array<{
    type: 'addition' | 'modification' | 'restructure';
    description: string;
    before?: string;
    after: string;
  }>;
  entities: Array<{
    name: string;
    type: string;
    status: 'detected' | 'added' | 'enhanced';
  }>;
  tips: string[];
}
```

**Example Response**:
```json
{
  "contentId": "aa0e8400-e29b-41d4-a716-446655440005",
  "originalScore": 62,
  "optimizedScore": 87,
  "optimizedContent": "# Cloud Security Best Practices\n\nCloud security is essential for protecting...",
  "changes": [
    {
      "type": "restructure",
      "description": "Moved key answer to the beginning of the content",
      "after": "Cloud security protects your data through encryption, access controls, and monitoring."
    },
    {
      "type": "addition",
      "description": "Added FAQ section for common questions",
      "after": "## Frequently Asked Questions\n\n### What is cloud security?..."
    }
  ],
  "entities": [
    { "name": "Cloud Security", "type": "topic", "status": "detected" },
    { "name": "Zero Trust", "type": "concept", "status": "added" },
    { "name": "AWS", "type": "brand", "status": "enhanced" }
  ],
  "tips": [
    "Consider adding schema.org markup for FAQPage",
    "Link to authoritative sources for key claims"
  ]
}
```

**Error Responses**:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Missing contentId |
| 404 | `CONTENT_NOT_FOUND` | Content does not exist |

---

#### POST /api/ai/assistant

Stream a GEO Assistant response.

**Authentication**: Required

**Request Body**:
```typescript
interface AssistantRequest {
  siteId: string;           // UUID of the site context
  message: string;          // User message
  context?: {
    currentPage?: string;   // Current page URL for context
    selectedText?: string;  // Selected text for context
  };
}
```

**Example Request**:
```json
{
  "siteId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "How can I improve my pricing page for AI visibility?",
  "context": {
    "currentPage": "/pricing"
  }
}
```

**Response** (200 OK - Server-Sent Events):
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type": "start"}

data: {"type": "content", "text": "Based on your "}

data: {"type": "content", "text": "pricing page analysis, "}

data: {"type": "content", "text": "here are my recommendations..."}

data: {"type": "done", "usage": {"promptTokens": 150, "completionTokens": 320}}
```

**Error Responses**:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Missing siteId or message |
| 404 | `SITE_NOT_FOUND` | Site does not exist |

---

### 3.3 Jobs API

#### GET /api/jobs/[id]

Get job status and details.

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The job identifier |

**Response** (200 OK):
```typescript
interface JobResponse {
  id: string;
  type: 'crawl' | 'analyze' | 'simulate' | 'optimize' | 'export';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  progressMessage?: string;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}
```

**Example Response**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "type": "analyze",
  "status": "running",
  "progress": 67,
  "progressMessage": "Analyzing content clarity...",
  "payload": {
    "auditId": "770e8400-e29b-41d4-a716-446655440002"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "startedAt": "2024-01-15T10:30:05Z"
}
```

**Error Responses**:

| Status | Code | Description |
|--------|------|-------------|
| 404 | `JOB_NOT_FOUND` | Job does not exist or user lacks access |

---

#### POST /api/jobs/[id]/cancel

Cancel a running job.

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The job identifier |

**Response** (200 OK):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "status": "cancelled",
  "message": "Job cancelled successfully"
}
```

**Error Responses**:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `CANNOT_CANCEL` | Job is not in a cancellable state |
| 404 | `JOB_NOT_FOUND` | Job does not exist |

---

## 4. Server Actions

Server Actions are used for form submissions and data mutations. They are called directly from React components.

### 4.1 Site Management

#### createSite

Create a new site.

**Location**: `actions/sites.ts`

**Parameters**:
```typescript
interface CreateSiteParams {
  domain: string;           // Website domain
  name?: string;            // Friendly name
  crawlConfig?: CrawlConfig;
}
```

**Returns**:
```typescript
interface CreateSiteResult {
  site: Site;
  error?: string;
}
```

**Usage**:
```tsx
import { createSite } from '@/actions/sites';

const result = await createSite({
  domain: 'example.com',
  name: 'My Website'
});
```

---

#### updateSite

Update site settings.

**Location**: `actions/sites.ts`

**Parameters**:
```typescript
interface UpdateSiteParams {
  siteId: string;
  name?: string;
  crawlConfig?: Partial<CrawlConfig>;
}
```

**Returns**:
```typescript
interface UpdateSiteResult {
  site: Site;
  error?: string;
}
```

---

#### deleteSite

Delete a site and all associated data.

**Location**: `actions/sites.ts`

**Parameters**:
```typescript
interface DeleteSiteParams {
  siteId: string;
}
```

**Returns**:
```typescript
interface DeleteSiteResult {
  success: boolean;
  error?: string;
}
```

---

### 4.2 Audit Management

#### startAudit

Start a new GEO audit.

**Location**: `actions/audits.ts`

**Parameters**:
```typescript
interface StartAuditParams {
  siteId: string;
  crawlConfig?: CrawlConfig;
}
```

**Returns**:
```typescript
interface StartAuditResult {
  audit: Audit;
  jobId: string;
  error?: string;
}
```

**Side Effects**:
- Creates audit record
- Creates job record
- Triggers crawl via API
- Redirects to audit page

---

#### refreshAudit

Re-run an audit for a site.

**Location**: `actions/audits.ts`

**Parameters**:
```typescript
interface RefreshAuditParams {
  auditId: string;
}
```

**Returns**:
```typescript
interface RefreshAuditResult {
  newAuditId: string;
  jobId: string;
  error?: string;
}
```

---

### 4.3 Brand Voice Configuration

#### saveBrandVoice

Save or update brand voice configuration.

**Location**: `actions/brand-voice.ts`

**Parameters**:
```typescript
interface SaveBrandVoiceParams {
  siteId: string;
  positioning: 'budget' | 'premium' | 'niche' | 'expert';
  positioningDescription?: string;
  audience: {
    demographicContext: string;
    intentSignals?: string[];
    decisionFactors?: string[];
  };
  differentiators: string[];
  guardrails: Array<{
    avoid: string;
    reason: string;
  }>;
}
```

**Returns**:
```typescript
interface SaveBrandVoiceResult {
  brandVoice: BrandVoice;
  machineProfile: MachineProfile;
  alignmentScore: number;
  error?: string;
}
```

**Side Effects**:
- Generates machine-readable profile via AI
- Calculates alignment score
- Revalidates brand-voice page

---

#### addGuardrail

Add a new guardrail to brand voice.

**Location**: `actions/brand-voice.ts`

**Parameters**:
```typescript
interface AddGuardrailParams {
  siteId: string;
  guardrail: {
    avoid: string;
    reason: string;
  };
}
```

**Returns**:
```typescript
interface AddGuardrailResult {
  guardrails: Guardrail[];
  error?: string;
}
```

---

#### removeGuardrail

Remove a guardrail from brand voice.

**Location**: `actions/brand-voice.ts`

**Parameters**:
```typescript
interface RemoveGuardrailParams {
  siteId: string;
  index: number;
}
```

---

### 4.4 Recommendation Actions

#### updateRecommendationStatus

Update the status of a recommendation.

**Location**: `actions/recommendations.ts`

**Parameters**:
```typescript
interface UpdateRecommendationStatusParams {
  recommendationId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}
```

**Returns**:
```typescript
interface UpdateRecommendationStatusResult {
  recommendation: Recommendation;
  error?: string;
}
```

---

#### applyFix

Apply a recommended fix.

**Location**: `actions/recommendations.ts`

**Parameters**:
```typescript
interface ApplyFixParams {
  recommendationId: string;
}
```

**Returns**:
```typescript
interface ApplyFixResult {
  success: boolean;
  contentId?: string;       // If fix was applied to content
  error?: string;
}
```

**Side Effects**:
- Updates recommendation status to 'in_progress'
- May create or update content records
- Revalidates recommendations page

---

#### dismissRecommendation

Dismiss a recommendation.

**Location**: `actions/recommendations.ts`

**Parameters**:
```typescript
interface DismissRecommendationParams {
  recommendationId: string;
  reason?: string;
}
```

---

### 4.5 Content Operations

#### applyOptimization

Apply AI-generated optimization to content.

**Location**: `actions/content.ts`

**Parameters**:
```typescript
interface ApplyOptimizationParams {
  contentId: string;
  optimizedContent: string;
}
```

**Returns**:
```typescript
interface ApplyOptimizationResult {
  content: Content;
  previousScore: number;
  newScore: number;
  error?: string;
}
```

---

#### revertOptimization

Revert content to original version.

**Location**: `actions/content.ts`

**Parameters**:
```typescript
interface RevertOptimizationParams {
  contentId: string;
}
```

---

### 4.6 Alert Management

#### markAlertRead

Mark an alert as read.

**Location**: `actions/alerts.ts`

**Parameters**:
```typescript
interface MarkAlertReadParams {
  alertId: string;
}
```

---

#### dismissAlert

Dismiss an alert.

**Location**: `actions/alerts.ts`

**Parameters**:
```typescript
interface DismissAlertParams {
  alertId: string;
}
```

---

#### markAllAlertsRead

Mark all alerts as read for a site.

**Location**: `actions/alerts.ts`

**Parameters**:
```typescript
interface MarkAllAlertsReadParams {
  siteId: string;
}
```

---

### 4.7 Team Management

#### inviteTeamMember

Invite a user to a site team.

**Location**: `actions/team.ts`

**Parameters**:
```typescript
interface InviteTeamMemberParams {
  siteId: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
}
```

**Returns**:
```typescript
interface InviteTeamMemberResult {
  invitation: TeamMember;
  error?: string;
}
```

---

#### updateTeamMemberRole

Update a team member's role.

**Location**: `actions/team.ts`

**Parameters**:
```typescript
interface UpdateTeamMemberRoleParams {
  memberId: string;
  role: 'admin' | 'member' | 'viewer';
}
```

---

#### removeTeamMember

Remove a team member.

**Location**: `actions/team.ts`

**Parameters**:
```typescript
interface RemoveTeamMemberParams {
  memberId: string;
}
```

---

#### acceptInvitation

Accept a team invitation.

**Location**: `actions/team.ts`

**Parameters**:
```typescript
interface AcceptInvitationParams {
  memberId: string;
}
```

---

## 5. Webhook Endpoints

### 5.1 Apify Webhook

#### POST /api/webhooks/apify

Handle Apify crawl completion webhook.

**Authentication**: Webhook signature verification

**Headers**:
```http
X-Apify-Webhook-Signature: <signature>
Content-Type: application/json
```

**Request Body**:
```typescript
interface ApifyWebhookPayload {
  eventType: 'ACTOR.RUN.SUCCEEDED' | 'ACTOR.RUN.FAILED' | 'ACTOR.RUN.ABORTED';
  eventData: {
    actorId: string;
    actorRunId: string;
  };
  resource: {
    id: string;
    status: string;
    stats: {
      pagesCount: number;
      requestsFinished: number;
    };
    defaultDatasetId: string;
  };
}
```

**Response** (200 OK):
```json
{
  "received": true
}
```

**Side Effects**:
- Updates job status
- Fetches crawl results
- Triggers analysis if crawl succeeded
- Creates alert if crawl failed

---

### 5.2 Stripe Webhook

#### POST /api/webhooks/stripe

Handle Stripe payment events.

**Authentication**: Stripe signature verification

**Headers**:
```http
Stripe-Signature: <signature>
Content-Type: application/json
```

**Handled Events**:
- `checkout.session.completed` - Subscription created
- `customer.subscription.updated` - Plan changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_failed` - Payment failed

**Response** (200 OK):
```json
{
  "received": true
}
```

---

## 6. Error Handling

### Error Response Format

All API errors follow a consistent format:

```typescript
interface ErrorResponse {
  error: string;            // Human-readable error message
  code: string;             // Machine-readable error code
  message?: string;         // Detailed error description
  details?: unknown;        // Additional error details
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Handling Example

```typescript
// Route handler error handling
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    if (!body.siteId) {
      return NextResponse.json(
        { error: 'Missing siteId', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }
    
    // ... process request
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

---

## 7. Rate Limiting

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/crawl/start` | 5 requests | per hour |
| `/api/ai/simulate` | 20 requests | per hour |
| `/api/ai/optimize` | 30 requests | per hour |
| `/api/ai/assistant` | 50 requests | per hour |
| All other endpoints | 100 requests | per minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1705320000
```

### Rate Limit Error Response

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "message": "You have exceeded the rate limit. Please try again later.",
  "retryAfter": 3600
}
```

### Plan-Based Limits

| Plan | Crawls/month | Simulations/month | AI Optimizations/month |
|------|--------------|-------------------|------------------------|
| Free | 5 | 20 | 10 |
| Pro | 50 | 200 | 100 |
| Enterprise | Unlimited | Unlimited | Unlimited |

---

## Appendix: TypeScript Types Reference

See [`types/api.ts`](../types/api.ts) for complete TypeScript interfaces for all API requests and responses.

### Quick Reference

```typescript
// Import API types
import type {
  StartCrawlRequest,
  StartCrawlResponse,
  SimulateRequest,
  SimulateResponse,
  OptimizeRequest,
  OptimizeResponse,
  JobResponse,
  ErrorResponse
} from '@/types/api';
```
