# GEO Optimizer - Database Schema Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Table Definitions](#3-table-definitions)
4. [JSONB Field Structures](#4-jsonb-field-structures)
5. [Index Strategy](#5-index-strategy)
6. [Row Level Security Policies](#6-row-level-security-policies)
7. [Data Migration Considerations](#7-data-migration-considerations)

---

## 1. Overview

The GEO Optimizer database is built on Supabase PostgreSQL and follows these design principles:

- **UUID Primary Keys**: All tables use UUID for primary keys to ensure global uniqueness and security
- **Timestamps**: All tables include `created_at` and `updated_at` timestamps where applicable
- **JSONB for Flexibility**: Complex, evolving data structures use JSONB columns
- **Row Level Security**: All tables have RLS policies enforcing user-based access control
- **Cascading Deletes**: Foreign keys use `ON DELETE CASCADE` to maintain referential integrity

### Database Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `brand_voices` |
| Columns | snake_case | `created_at` |
| Primary Keys | `id` | `id UUID PRIMARY KEY` |
| Foreign Keys | `{table}_id` | `site_id`, `user_id` |
| Indexes | `idx_{table}_{column}` | `idx_sites_user_id` |
| Constraints | `{table}_{description}` | `one_active_audit_per_site` |

---

## 2. Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                    auth.users                                         │
│                              (Supabase Auth - managed)                                │
└──────────────────────────────────────┬───────────────────────────────────────────────┘
                                       │ 1:1
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                     profiles                                          │
│  id (PK, FK→auth.users) │ email │ full_name │ avatar_url │ plan │ timestamps         │
└──────────────────────────────────────┬───────────────────────────────────────────────┘
                                       │ 1:N
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│         sites           │  │          jobs           │  │     team_members        │
│  id (PK)                │  │  id (PK)                │  │  id (PK)                │
│  user_id (FK→profiles)  │  │  user_id (FK→profiles)  │  │  site_id (FK→sites)     │
│  domain                 │  │  type                   │  │  user_id (FK→profiles)  │
│  name                   │  │  status                 │  │  role                   │
│  crawl_config (JSONB)   │  │  progress               │  │  invited_by             │
│  last_crawl_at          │  │  payload (JSONB)        │  │  invited_at             │
│  timestamps             │  │  result (JSONB)         │  │  accepted_at            │
└───────────┬─────────────┘  │  error                  │  └─────────────────────────┘
            │                │  timestamps             │
            │                └─────────────────────────┘
            │
            │ 1:N (sites has many related entities)
            │
    ┌───────┼───────┬───────────────┬───────────────┬───────────────┐
    │       │       │               │               │               │
    ▼       ▼       ▼               ▼               ▼               ▼
┌───────┐ ┌───────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────┐
│audits │ │brand_ │ │ simulations │ │  contents   │ │   alerts    │ │ jobs  │
│       │ │voices │ │             │ │             │ │             │ │(ref)  │
└───┬───┘ └───────┘ └─────────────┘ └─────────────┘ └─────────────┘ └───────┘
    │
    │ 1:N
    ▼
┌─────────────────────────┐
│    recommendations      │
│  id (PK)                │
│  audit_id (FK→audits)   │
│  type                   │
│  priority               │
│  title                  │
│  description            │
│  status                 │
│  timestamps             │
└─────────────────────────┘
```

### Relationship Summary

| Parent | Child | Relationship | On Delete |
|--------|-------|--------------|-----------|
| `auth.users` | `profiles` | 1:1 | CASCADE |
| `profiles` | `sites` | 1:N | CASCADE |
| `profiles` | `jobs` | 1:N | CASCADE |
| `sites` | `audits` | 1:N | CASCADE |
| `sites` | `brand_voices` | 1:1 | CASCADE |
| `sites` | `simulations` | 1:N | CASCADE |
| `sites` | `contents` | 1:N | CASCADE |
| `sites` | `alerts` | 1:N | CASCADE |
| `sites` | `team_members` | 1:N | CASCADE |
| `audits` | `recommendations` | 1:N | CASCADE |
| `jobs` | `audits` | 1:1 (optional) | SET NULL |

---

## 3. Table Definitions

### 3.1 profiles

Extends Supabase Auth users with application-specific data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK→auth.users | User identifier from Supabase Auth |
| `email` | TEXT | NOT NULL | User email address |
| `full_name` | TEXT | - | User display name |
| `avatar_url` | TEXT | - | Profile picture URL |
| `plan` | TEXT | DEFAULT 'free', CHECK | Subscription plan: free, pro, enterprise |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Trigger**: Auto-creates profile on `auth.users` INSERT via `handle_new_user()` function.

---

### 3.2 sites

Websites being analyzed for GEO optimization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Site identifier |
| `user_id` | UUID | NOT NULL, FK→profiles | Owner of the site |
| `domain` | TEXT | NOT NULL | Website domain (e.g., example.com) |
| `name` | TEXT | - | Friendly name for the site |
| `crawl_config` | JSONB | DEFAULT {...} | Crawl configuration settings |
| `last_crawl_at` | TIMESTAMPTZ | - | Last successful crawl timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Unique Constraint**: `(user_id, domain)` - One domain per user.

---

### 3.3 audits

GEO audit results with scores and insights.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Audit identifier |
| `site_id` | UUID | NOT NULL, FK→sites | Associated site |
| `job_id` | UUID | FK→jobs | Associated processing job |
| `status` | TEXT | DEFAULT 'pending', CHECK | Status: pending, crawling, analyzing, completed, failed |
| `overall_score` | INTEGER | CHECK (0-100) | GEO Visibility Score |
| `score_change` | INTEGER | - | Change vs previous audit |
| `sub_scores` | JSONB | DEFAULT '{}' | Detailed sub-scores |
| `insights` | JSONB | DEFAULT '[]' | AI-generated insights |
| `perception_tags` | JSONB | DEFAULT '{}' | AI perception analysis |
| `ai_keywords` | TEXT[] | DEFAULT '{}' | Common AI keywords |
| `crawl_data_url` | TEXT | - | Reference to stored crawl data |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `completed_at` | TIMESTAMPTZ | - | Audit completion timestamp |

**Partial Unique Constraint**: Only one active audit (pending/crawling/analyzing) per site.

---

### 3.4 brand_voices

Brand voice configurations for AI optimization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Brand voice identifier |
| `site_id` | UUID | NOT NULL, FK→sites, UNIQUE | Associated site (1:1) |
| `positioning` | TEXT | CHECK | Market positioning: budget, premium, niche, expert |
| `positioning_description` | TEXT | - | Detailed positioning description |
| `audience` | JSONB | DEFAULT '{}' | Target audience configuration |
| `differentiators` | TEXT[] | DEFAULT '{}' | Unique selling points |
| `guardrails` | JSONB | DEFAULT '[]' | AI content guardrails |
| `machine_profile` | JSONB | DEFAULT '{}' | AI-generated machine-readable profile |
| `alignment_score` | INTEGER | CHECK (0-100) | Brand alignment score |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

### 3.5 simulations

AI recommendation simulation results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Simulation identifier |
| `site_id` | UUID | NOT NULL, FK→sites | Associated site |
| `job_id` | UUID | FK→jobs | Associated processing job |
| `query` | TEXT | NOT NULL | User query being simulated |
| `engine` | TEXT | DEFAULT 'gpt-4o', CHECK | AI engine: gpt-4o, claude-3, gemini, perplexity |
| `ai_response` | TEXT | - | Generated AI response |
| `brand_mentioned` | BOOLEAN | - | Whether brand was mentioned |
| `tone_match` | INTEGER | CHECK (0-100) | Tone alignment score |
| `reasoning_path` | JSONB | DEFAULT '[]' | AI reasoning steps |
| `geo_tip` | TEXT | - | GEO optimization tip |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

---

### 3.6 recommendations

Actionable recommendations from audits.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Recommendation identifier |
| `audit_id` | UUID | NOT NULL, FK→audits | Associated audit |
| `type` | TEXT | NOT NULL, CHECK | Category: semantic_structure, citation_health, entity_definition, answer_first, schema_markup, content_clarity, other |
| `priority` | TEXT | NOT NULL, CHECK | Priority: critical, high, medium, low |
| `title` | TEXT | NOT NULL | Recommendation title |
| `description` | TEXT | - | Detailed description |
| `why_matters` | TEXT | - | Why this matters for AI |
| `action` | TEXT | - | Recommended action |
| `estimated_impact` | TEXT | - | Expected impact (e.g., "+12% Citation Reliability") |
| `estimated_time` | TEXT | - | Time estimate (e.g., "15 min") |
| `execution_steps` | JSONB | DEFAULT '[]' | Step-by-step execution guide |
| `code_snippet` | TEXT | - | Code example if applicable |
| `status` | TEXT | DEFAULT 'pending', CHECK | Status: pending, in_progress, completed, dismissed |
| `completed_at` | TIMESTAMPTZ | - | Completion timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

---

### 3.7 contents

Content items for optimization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Content identifier |
| `site_id` | UUID | NOT NULL, FK→sites | Associated site |
| `url` | TEXT | NOT NULL | Page URL |
| `title` | TEXT | - | Page title |
| `original_content` | TEXT | - | Original content text |
| `optimized_content` | TEXT | - | AI-optimized content |
| `geo_score` | INTEGER | CHECK (0-100) | Content GEO score |
| `entity_density` | TEXT | CHECK | Entity density: low, medium, high |
| `citation_potential` | NUMERIC(3,1) | - | Citation potential (0.0-10.0) |
| `entities` | JSONB | DEFAULT '[]' | Detected entities |
| `optimization_tips` | JSONB | DEFAULT '[]' | Optimization suggestions |
| `last_optimized_at` | TIMESTAMPTZ | - | Last optimization timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Unique Constraint**: `(site_id, url)` - One content record per URL per site.

---

### 3.8 jobs

Long-running job tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Job identifier |
| `user_id` | UUID | NOT NULL, FK→profiles | Job owner |
| `type` | TEXT | NOT NULL, CHECK | Job type: crawl, analyze, simulate, optimize, export |
| `status` | TEXT | DEFAULT 'pending', CHECK | Status: pending, running, completed, failed, cancelled |
| `progress` | INTEGER | DEFAULT 0, CHECK (0-100) | Progress percentage |
| `progress_message` | TEXT | - | Human-readable status message |
| `payload` | JSONB | NOT NULL, DEFAULT '{}' | Input parameters |
| `result` | JSONB | - | Output data |
| `error` | TEXT | - | Error message if failed |
| `error_details` | JSONB | - | Detailed error information |
| `retry_count` | INTEGER | DEFAULT 0 | Number of retry attempts |
| `max_retries` | INTEGER | DEFAULT 3 | Maximum retry attempts |
| `external_id` | TEXT | - | External service reference (e.g., Apify run ID) |
| `external_service` | TEXT | - | External service name |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `started_at` | TIMESTAMPTZ | - | Job start timestamp |
| `completed_at` | TIMESTAMPTZ | - | Job completion timestamp |

---

### 3.9 alerts

Monitoring alerts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Alert identifier |
| `site_id` | UUID | NOT NULL, FK→sites | Associated site |
| `type` | TEXT | NOT NULL, CHECK | Alert type: content_decay, interpretation_shift, visibility_drop, score_change, competitor_mention, system |
| `severity` | TEXT | NOT NULL, CHECK | Severity: info, warning, high, critical |
| `title` | TEXT | NOT NULL | Alert title |
| `message` | TEXT | NOT NULL | Alert message |
| `data` | JSONB | DEFAULT '{}' | Additional alert data |
| `action_url` | TEXT | - | URL for action |
| `action_label` | TEXT | - | Action button label |
| `read` | BOOLEAN | DEFAULT FALSE | Read status |
| `dismissed` | BOOLEAN | DEFAULT FALSE | Dismissed status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

---

### 3.10 team_members

Multi-user site access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Team member identifier |
| `site_id` | UUID | NOT NULL, FK→sites | Associated site |
| `user_id` | UUID | NOT NULL, FK→profiles | Team member user |
| `role` | TEXT | NOT NULL, CHECK | Role: owner, admin, member, viewer |
| `invited_by` | UUID | FK→profiles | User who sent invitation |
| `invited_at` | TIMESTAMPTZ | DEFAULT NOW() | Invitation timestamp |
| `accepted_at` | TIMESTAMPTZ | - | Acceptance timestamp |

**Unique Constraint**: `(site_id, user_id)` - One membership per user per site.

---

## 4. JSONB Field Structures

### 4.1 CrawlConfig (sites.crawl_config)

```typescript
interface CrawlConfig {
  max_pages: number;           // Maximum pages to crawl (default: 50)
  include_patterns: string[];  // URL patterns to include
  exclude_patterns: string[];  // URL patterns to exclude
  respect_robots: boolean;     // Respect robots.txt (default: true)
}
```

**Example:**
```json
{
  "max_pages": 50,
  "include_patterns": ["/blog/*", "/products/*"],
  "exclude_patterns": ["/admin/*", "/api/*"],
  "respect_robots": true
}
```

---

### 4.2 SubScores (audits.sub_scores)

```typescript
interface SubScores {
  content_clarity: SubScore;
  entity_coverage: SubScore;
  answer_first: SubScore;
  ai_readability: SubScore;
}

interface SubScore {
  score: number;                                           // 0-100
  status: 'excellent' | 'optimal' | 'improving' | 'needs_focus';
  description: string;
}
```

**Example:**
```json
{
  "content_clarity": {
    "score": 85,
    "status": "optimal",
    "description": "Content is well-structured with clear headings and concise paragraphs."
  },
  "entity_coverage": {
    "score": 64,
    "status": "improving",
    "description": "Good entity coverage but missing some key industry terms."
  },
  "answer_first": {
    "score": 42,
    "status": "needs_focus",
    "description": "Content buries key answers. Consider restructuring for AI extraction."
  },
  "ai_readability": {
    "score": 91,
    "status": "excellent",
    "description": "Excellent readability for AI systems with clear semantic structure."
  }
}
```

---

### 4.3 Insights (audits.insights)

```typescript
interface Insight {
  type: string;                                    // Insight category
  title: string;                                   // Short title
  description: string;                             // Detailed description
  severity: 'info' | 'success' | 'warning' | 'error';
}
```

**Example:**
```json
[
  {
    "type": "brand_association",
    "title": "Strong Brand Recognition",
    "description": "Your brand is consistently associated with 'enterprise solutions' across AI responses.",
    "severity": "success"
  },
  {
    "type": "knowledge_graph",
    "title": "Knowledge Graph Presence",
    "description": "Your company appears in Google's Knowledge Graph with accurate information.",
    "severity": "info"
  },
  {
    "type": "fragmentation",
    "title": "Content Fragmentation Detected",
    "description": "Key information is spread across multiple pages, reducing AI citation likelihood.",
    "severity": "warning"
  }
]
```

---

### 4.4 PerceptionTags (audits.perception_tags)

```typescript
interface PerceptionTags {
  [tag: string]: number;  // Tag name → confidence score (0-100)
}
```

**Example:**
```json
{
  "authoritative": 92,
  "innovative": 78,
  "technical": 85,
  "approachable": 34,
  "enterprise-focused": 88
}
```

---

### 4.5 Audience (brand_voices.audience)

```typescript
interface Audience {
  demographic_context: string;    // Description of target audience
  intent_signals: string[];       // Search intent indicators
  decision_factors: string[];     // Key decision-making factors
}
```

**Example:**
```json
{
  "demographic_context": "Enterprise CTOs and Lead Architects at Fortune 500 companies seeking scalable cloud solutions.",
  "intent_signals": ["technical resilience", "efficiency", "cost optimization"],
  "decision_factors": ["security", "scalability", "compliance", "support"]
}
```

---

### 4.6 Guardrails (brand_voices.guardrails)

```typescript
interface Guardrail {
  avoid: string;    // What to avoid
  reason: string;   // Why to avoid it
}
```

**Example:**
```json
[
  {
    "avoid": "Discount terminology",
    "reason": "Dilutes premium brand value and positioning"
  },
  {
    "avoid": "Out-of-the-box labels",
    "reason": "We emphasize custom, tailored solutions"
  },
  {
    "avoid": "Competitor comparisons",
    "reason": "Focus on our unique value proposition"
  }
]
```

---

### 4.7 MachineProfile (brand_voices.machine_profile)

```typescript
interface MachineProfile {
  intent: string;                              // Primary brand intent
  audience_cluster: string[];                  // Target audience segments
  narrative_weight: Record<string, number>;    // Narrative priorities (0-1)
  forbidden_tokens: string[];                  // Words/phrases to avoid
  alignmentScore?: number;                     // Overall alignment score
}
```

**Example:**
```json
{
  "intent": "premium_market_leader",
  "audience_cluster": ["enterprise_decision_makers", "technical_executives", "it_directors"],
  "narrative_weight": {
    "reliability": 0.95,
    "innovation": 0.82,
    "security": 0.90,
    "scalability": 0.88
  },
  "forbidden_tokens": ["cheap", "basic", "generic", "simple", "budget"],
  "alignmentScore": 87
}
```

---

### 4.8 ReasoningPath (simulations.reasoning_path)

```typescript
interface ReasoningStep {
  step: string;         // Step identifier
  description: string;  // What happened at this step
}
```

**Example:**
```json
[
  {
    "step": "input_classification",
    "description": "Identified search intent as 'product comparison' with enterprise focus."
  },
  {
    "step": "knowledge_retrieval",
    "description": "Retrieved information from 12 sources, ranked by authority and relevance."
  },
  {
    "step": "conflict_resolution",
    "description": "Detected conflicting claims about pricing; prioritized official sources."
  },
  {
    "step": "final_selection",
    "description": "Recommended as 'Strong Contender' based on feature alignment and reviews."
  }
]
```

---

### 4.9 Entities (contents.entities)

```typescript
interface Entity {
  name: string;                              // Entity name
  type: 'topic' | 'tech' | 'brand' | 'person' | 'concept';
  status: 'detected' | 'missing' | 'weak';   // Detection status
}
```

**Example:**
```json
[
  { "name": "Cloud Security", "type": "topic", "status": "detected" },
  { "name": "Multi-factor Authentication", "type": "tech", "status": "detected" },
  { "name": "AWS", "type": "brand", "status": "missing" },
  { "name": "Zero Trust Architecture", "type": "concept", "status": "weak" }
]
```

---

### 4.10 ExecutionSteps (recommendations.execution_steps)

```typescript
interface ExecutionStep {
  order: number;      // Step order
  action: string;     // Action to take
  details?: string;   // Additional details
}
```

**Example:**
```json
[
  { "order": 1, "action": "Navigate to the pricing page", "details": "/pricing" },
  { "order": 2, "action": "Add FAQ section below pricing table" },
  { "order": 3, "action": "Include questions about enterprise pricing, volume discounts, and support tiers" },
  { "order": 4, "action": "Use schema.org FAQPage markup" }
]
```

---

### 4.11 AlertData (alerts.data)

```typescript
// Varies by alert type
interface ContentDecayAlertData {
  page_url: string;
  previous_authority: 'primary' | 'secondary' | 'tertiary';
  current_authority: 'primary' | 'secondary' | 'tertiary';
  affected_query: string;
}

interface ScoreChangeAlertData {
  previous_score: number;
  current_score: number;
  change_percentage: number;
  affected_metrics: string[];
}

interface VisibilityDropAlertData {
  query: string;
  previous_position: number;
  current_position: number;
  competitor_gained?: string;
}
```

**Example (content_decay):**
```json
{
  "page_url": "/pricing",
  "previous_authority": "primary",
  "current_authority": "secondary",
  "affected_query": "Enterprise AI costs"
}
```

---

## 5. Index Strategy

### 5.1 Primary Indexes

All tables have implicit indexes on primary keys (UUID).

### 5.2 Foreign Key Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| `sites` | `idx_sites_user_id` | `user_id` | Fast user site lookup |
| `audits` | `idx_audits_site_id` | `site_id` | Fast site audit lookup |
| `brand_voices` | `idx_brand_voices_site_id` | `site_id` | Fast brand voice lookup |
| `simulations` | `idx_simulations_site_id` | `site_id` | Fast simulation lookup |
| `recommendations` | `idx_recommendations_audit_id` | `audit_id` | Fast recommendation lookup |
| `contents` | `idx_contents_site_id` | `site_id` | Fast content lookup |
| `jobs` | `idx_jobs_user_id` | `user_id` | Fast job lookup |
| `alerts` | `idx_alerts_site_id` | `site_id` | Fast alert lookup |
| `team_members` | `idx_team_members_site_id` | `site_id` | Fast team lookup |
| `team_members` | `idx_team_members_user_id` | `user_id` | Fast user team lookup |

### 5.3 Query Optimization Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| `sites` | `idx_sites_domain` | `domain` | Domain search |
| `audits` | `idx_audits_status` | `status` | Status filtering |
| `audits` | `idx_audits_created_at` | `created_at DESC` | Recent audits |
| `simulations` | `idx_simulations_created_at` | `created_at DESC` | Recent simulations |
| `recommendations` | `idx_recommendations_priority` | `priority` | Priority filtering |
| `recommendations` | `idx_recommendations_status` | `status` | Status filtering |
| `contents` | `idx_contents_geo_score` | `geo_score` | Score-based sorting |
| `jobs` | `idx_jobs_status` | `status` | Active job lookup |
| `jobs` | `idx_jobs_type` | `type` | Job type filtering |
| `jobs` | `idx_jobs_created_at` | `created_at DESC` | Recent jobs |
| `alerts` | `idx_alerts_created_at` | `created_at DESC` | Recent alerts |

### 5.4 Partial Indexes

| Table | Index | Condition | Purpose |
|-------|-------|-----------|---------|
| `alerts` | `idx_alerts_unread` | `WHERE read = FALSE` | Unread alert count |
| `alerts` | `idx_alerts_active` | `WHERE dismissed = FALSE` | Active alerts |
| `jobs` | `idx_jobs_active` | `WHERE status IN ('pending', 'running')` | Active jobs |

### 5.5 GIN Indexes for JSONB

| Table | Index | Column | Purpose |
|-------|-------|--------|---------|
| `audits` | `idx_audits_sub_scores_gin` | `sub_scores` | JSONB queries |
| `audits` | `idx_audits_insights_gin` | `insights` | JSONB queries |
| `contents` | `idx_contents_entities_gin` | `entities` | Entity search |

---

## 6. Row Level Security Policies

### 6.1 Overview

All tables have RLS enabled. Policies follow these patterns:

1. **Direct Ownership**: User owns the record directly (profiles, jobs)
2. **Site Ownership**: User owns the parent site (audits, brand_voices, etc.)
3. **Team Access**: User has team membership for the site

### 6.2 Policy Definitions

#### profiles

```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### sites

```sql
-- Users can view sites they own or are team members of
CREATE POLICY "Users can view own sites"
  ON public.sites FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.site_id = sites.id
      AND team_members.user_id = auth.uid()
      AND team_members.accepted_at IS NOT NULL
    )
  );

-- Users can create sites for themselves
CREATE POLICY "Users can create sites"
  ON public.sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sites
CREATE POLICY "Users can update own sites"
  ON public.sites FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sites
CREATE POLICY "Users can delete own sites"
  ON public.sites FOR DELETE
  USING (auth.uid() = user_id);
```

#### audits, brand_voices, simulations, contents, alerts

All follow the site ownership pattern:

```sql
-- SELECT: Access through site ownership or team membership
CREATE POLICY "Users can view {table} for own sites"
  ON public.{table} FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = {table}.site_id
      AND (
        sites.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_members.site_id = sites.id
          AND team_members.user_id = auth.uid()
          AND team_members.accepted_at IS NOT NULL
        )
      )
    )
  );

-- INSERT: Only site owners can create
CREATE POLICY "Users can create {table} for own sites"
  ON public.{table} FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = site_id
      AND sites.user_id = auth.uid()
    )
  );

-- UPDATE: Site owners and team members with appropriate roles
CREATE POLICY "Users can update {table} for own sites"
  ON public.{table} FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = {table}.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- DELETE: Only site owners
CREATE POLICY "Users can delete {table} for own sites"
  ON public.{table} FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = {table}.site_id
      AND sites.user_id = auth.uid()
    )
  );
```

#### recommendations

Access through audit → site ownership:

```sql
CREATE POLICY "Users can view recommendations for own audits"
  ON public.recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.audits
      JOIN public.sites ON sites.id = audits.site_id
      WHERE audits.id = recommendations.audit_id
      AND sites.user_id = auth.uid()
    )
  );
```

#### jobs

Direct user ownership:

```sql
CREATE POLICY "Users can view own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### team_members

```sql
-- Site owners can manage team members
CREATE POLICY "Site owners can manage team"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = team_members.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON public.team_members FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 7. Data Migration Considerations

### 7.1 Initial Setup

1. **Enable Required Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

2. **Create Tables in Order**
   - `profiles` (depends on auth.users)
   - `sites` (depends on profiles)
   - `jobs` (depends on profiles)
   - `audits` (depends on sites, jobs)
   - `brand_voices` (depends on sites)
   - `simulations` (depends on sites, jobs)
   - `recommendations` (depends on audits)
   - `contents` (depends on sites)
   - `alerts` (depends on sites)
   - `team_members` (depends on sites, profiles)

3. **Create Triggers**
   - `handle_new_user` trigger on auth.users
   - `update_updated_at` trigger on tables with `updated_at`

4. **Enable RLS and Create Policies**
   - Enable RLS on all tables
   - Create policies in order of dependency

### 7.2 Schema Evolution Guidelines

1. **Adding Columns**
   - Always provide DEFAULT values for NOT NULL columns
   - Use JSONB for flexible structures that may evolve

2. **Modifying JSONB Structures**
   - JSONB fields are schema-less; document changes in this file
   - Consider backward compatibility in application code

3. **Adding Tables**
   - Follow naming conventions
   - Include standard columns (id, created_at, updated_at)
   - Enable RLS immediately
   - Create appropriate indexes

4. **Removing Columns/Tables**
   - Create migration to remove
   - Update TypeScript types
   - Update RLS policies if affected

### 7.3 Backup and Recovery

1. **Regular Backups**
   - Supabase provides automatic daily backups
   - Consider point-in-time recovery for production

2. **Data Export**
   - Use `pg_dump` for full database exports
   - Export JSONB data as JSON for portability

### 7.4 Performance Monitoring

1. **Query Analysis**
   - Use `EXPLAIN ANALYZE` for slow queries
   - Monitor index usage with `pg_stat_user_indexes`

2. **Table Statistics**
   - Run `ANALYZE` after bulk imports
   - Monitor table bloat with `pg_stat_user_tables`

---

## Appendix: TypeScript Interface Reference

See [`types/database.ts`](../types/database.ts) for complete TypeScript interfaces matching this schema.
