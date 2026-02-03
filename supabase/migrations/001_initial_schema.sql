-- ============================================================================
-- GEO Optimizer - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates all core tables, indexes, triggers, and RLS policies
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- User subscription plans
CREATE TYPE public.user_plan AS ENUM ('free', 'pro', 'enterprise');

-- Audit status
CREATE TYPE public.audit_status AS ENUM ('pending', 'crawling', 'analyzing', 'completed', 'failed');

-- Sub-score status
CREATE TYPE public.score_status AS ENUM ('excellent', 'optimal', 'improving', 'needs_focus');

-- Brand positioning
CREATE TYPE public.brand_positioning AS ENUM ('budget', 'premium', 'niche', 'expert');

-- AI engine types
CREATE TYPE public.ai_engine AS ENUM ('gpt-4o', 'claude-3', 'gemini', 'perplexity');

-- Recommendation types
CREATE TYPE public.recommendation_type AS ENUM (
  'semantic_structure',
  'citation_health',
  'entity_definition',
  'answer_first',
  'schema_markup',
  'content_clarity',
  'other'
);

-- Priority levels
CREATE TYPE public.priority_level AS ENUM ('critical', 'high', 'medium', 'low');

-- Recommendation status
CREATE TYPE public.recommendation_status AS ENUM ('pending', 'in_progress', 'completed', 'dismissed');

-- Entity density levels
CREATE TYPE public.entity_density AS ENUM ('low', 'medium', 'high');

-- Job types
CREATE TYPE public.job_type AS ENUM ('crawl', 'analyze', 'simulate', 'optimize', 'export');

-- Job status
CREATE TYPE public.job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- Alert types
CREATE TYPE public.alert_type AS ENUM (
  'content_decay',
  'interpretation_shift',
  'visibility_drop',
  'score_change',
  'competitor_mention',
  'system'
);

-- Alert severity
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'high', 'critical');

-- Team member roles
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: User profiles linked to auth.users
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan public.user_plan DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase Auth users with app-specific data';
COMMENT ON COLUMN public.profiles.id IS 'User ID from auth.users';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.full_name IS 'User display name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Profile picture URL';
COMMENT ON COLUMN public.profiles.plan IS 'Subscription plan: free, pro, enterprise';

-- ----------------------------------------------------------------------------
-- sites: Websites being analyzed
-- ----------------------------------------------------------------------------
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  name TEXT,
  crawl_config JSONB DEFAULT '{
    "max_pages": 50,
    "include_patterns": [],
    "exclude_patterns": [],
    "respect_robots": true
  }'::jsonb NOT NULL,
  last_crawl_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT sites_user_domain_unique UNIQUE(user_id, domain)
);

COMMENT ON TABLE public.sites IS 'Websites being analyzed for GEO optimization';
COMMENT ON COLUMN public.sites.domain IS 'Website domain (e.g., example.com)';
COMMENT ON COLUMN public.sites.name IS 'Friendly name for the site';
COMMENT ON COLUMN public.sites.crawl_config IS 'Crawl configuration: max_pages, include/exclude patterns, respect_robots';
COMMENT ON COLUMN public.sites.last_crawl_at IS 'Timestamp of last successful crawl';

-- ----------------------------------------------------------------------------
-- jobs: Long-running job tracking
-- ----------------------------------------------------------------------------
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.job_type NOT NULL,
  status public.job_status DEFAULT 'pending' NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  progress_message TEXT,
  payload JSONB DEFAULT '{}'::jsonb NOT NULL,
  result JSONB,
  error TEXT,
  error_details JSONB,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  max_retries INTEGER DEFAULT 3 NOT NULL,
  external_id TEXT,
  external_service TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.jobs IS 'Long-running job tracking for crawls, analysis, simulations, etc.';
COMMENT ON COLUMN public.jobs.type IS 'Job type: crawl, analyze, simulate, optimize, export';
COMMENT ON COLUMN public.jobs.status IS 'Job status: pending, running, completed, failed, cancelled';
COMMENT ON COLUMN public.jobs.progress IS 'Progress percentage (0-100)';
COMMENT ON COLUMN public.jobs.progress_message IS 'Human-readable status message';
COMMENT ON COLUMN public.jobs.payload IS 'Input parameters for the job';
COMMENT ON COLUMN public.jobs.result IS 'Output data when completed';
COMMENT ON COLUMN public.jobs.external_id IS 'External service reference (e.g., Apify run ID)';
COMMENT ON COLUMN public.jobs.external_service IS 'External service name (e.g., apify)';

-- ----------------------------------------------------------------------------
-- audits: GEO audit results with scores
-- ----------------------------------------------------------------------------
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  status public.audit_status DEFAULT 'pending' NOT NULL,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  score_change INTEGER,
  sub_scores JSONB DEFAULT '{}'::jsonb NOT NULL,
  insights JSONB DEFAULT '[]'::jsonb NOT NULL,
  perception_tags JSONB DEFAULT '{}'::jsonb NOT NULL,
  ai_keywords TEXT[] DEFAULT '{}',
  crawl_data_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.audits IS 'GEO audit results with scores and insights';
COMMENT ON COLUMN public.audits.overall_score IS 'GEO Visibility Score (0-100)';
COMMENT ON COLUMN public.audits.score_change IS 'Score change vs previous audit';
COMMENT ON COLUMN public.audits.sub_scores IS 'Detailed sub-scores: content_clarity, entity_coverage, answer_first, ai_readability';
COMMENT ON COLUMN public.audits.insights IS 'AI-generated insights array';
COMMENT ON COLUMN public.audits.perception_tags IS 'AI perception analysis tags with confidence scores';
COMMENT ON COLUMN public.audits.ai_keywords IS 'Common AI keywords array';
COMMENT ON COLUMN public.audits.crawl_data_url IS 'Reference to stored crawl data';

-- Partial unique index: only one active audit per site
CREATE UNIQUE INDEX idx_audits_one_active_per_site 
  ON public.audits (site_id) 
  WHERE status IN ('pending', 'crawling', 'analyzing');

-- ----------------------------------------------------------------------------
-- brand_voices: Brand voice configurations
-- ----------------------------------------------------------------------------
CREATE TABLE public.brand_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  positioning public.brand_positioning,
  positioning_description TEXT,
  audience JSONB DEFAULT '{}'::jsonb NOT NULL,
  differentiators TEXT[] DEFAULT '{}',
  guardrails JSONB DEFAULT '[]'::jsonb NOT NULL,
  machine_profile JSONB DEFAULT '{}'::jsonb NOT NULL,
  alignment_score INTEGER CHECK (alignment_score >= 0 AND alignment_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT brand_voices_site_unique UNIQUE(site_id)
);

COMMENT ON TABLE public.brand_voices IS 'Brand voice configurations for AI optimization';
COMMENT ON COLUMN public.brand_voices.positioning IS 'Market positioning: budget, premium, niche, expert';
COMMENT ON COLUMN public.brand_voices.positioning_description IS 'Detailed positioning description';
COMMENT ON COLUMN public.brand_voices.audience IS 'Target audience: demographic_context, intent_signals, decision_factors';
COMMENT ON COLUMN public.brand_voices.differentiators IS 'Unique selling points array';
COMMENT ON COLUMN public.brand_voices.guardrails IS 'AI content guardrails: avoid, reason pairs';
COMMENT ON COLUMN public.brand_voices.machine_profile IS 'AI-generated machine-readable profile';
COMMENT ON COLUMN public.brand_voices.alignment_score IS 'Brand alignment score (0-100)';

-- ----------------------------------------------------------------------------
-- simulations: AI recommendation simulations
-- ----------------------------------------------------------------------------
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  engine public.ai_engine DEFAULT 'gpt-4o' NOT NULL,
  ai_response TEXT,
  brand_mentioned BOOLEAN,
  tone_match INTEGER CHECK (tone_match >= 0 AND tone_match <= 100),
  reasoning_path JSONB DEFAULT '[]'::jsonb NOT NULL,
  geo_tip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.simulations IS 'AI recommendation simulation results';
COMMENT ON COLUMN public.simulations.query IS 'User query being simulated';
COMMENT ON COLUMN public.simulations.engine IS 'AI engine: gpt-4o, claude-3, gemini, perplexity';
COMMENT ON COLUMN public.simulations.ai_response IS 'Generated AI response';
COMMENT ON COLUMN public.simulations.brand_mentioned IS 'Whether brand was mentioned in response';
COMMENT ON COLUMN public.simulations.tone_match IS 'Tone alignment score (0-100)';
COMMENT ON COLUMN public.simulations.reasoning_path IS 'AI reasoning steps array';
COMMENT ON COLUMN public.simulations.geo_tip IS 'GEO optimization tip';

-- ----------------------------------------------------------------------------
-- recommendations: Actionable recommendations
-- ----------------------------------------------------------------------------
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  type public.recommendation_type NOT NULL,
  priority public.priority_level NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  why_matters TEXT,
  action TEXT,
  estimated_impact TEXT,
  estimated_time TEXT,
  execution_steps JSONB DEFAULT '[]'::jsonb NOT NULL,
  code_snippet TEXT,
  status public.recommendation_status DEFAULT 'pending' NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.recommendations IS 'Actionable recommendations from audits';
COMMENT ON COLUMN public.recommendations.type IS 'Category: semantic_structure, citation_health, entity_definition, etc.';
COMMENT ON COLUMN public.recommendations.priority IS 'Priority: critical, high, medium, low';
COMMENT ON COLUMN public.recommendations.why_matters IS 'Why this matters for AI';
COMMENT ON COLUMN public.recommendations.action IS 'Recommended action to take';
COMMENT ON COLUMN public.recommendations.estimated_impact IS 'Expected impact (e.g., "+12% Citation Reliability")';
COMMENT ON COLUMN public.recommendations.estimated_time IS 'Time estimate (e.g., "15 min")';
COMMENT ON COLUMN public.recommendations.execution_steps IS 'Step-by-step execution guide';
COMMENT ON COLUMN public.recommendations.code_snippet IS 'Code example if applicable';

-- ----------------------------------------------------------------------------
-- contents: Content items for optimization
-- ----------------------------------------------------------------------------
CREATE TABLE public.contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  original_content TEXT,
  optimized_content TEXT,
  geo_score INTEGER CHECK (geo_score >= 0 AND geo_score <= 100),
  entity_density public.entity_density,
  citation_potential NUMERIC(3,1) CHECK (citation_potential >= 0 AND citation_potential <= 10),
  entities JSONB DEFAULT '[]'::jsonb NOT NULL,
  optimization_tips JSONB DEFAULT '[]'::jsonb NOT NULL,
  last_optimized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT contents_site_url_unique UNIQUE(site_id, url)
);

COMMENT ON TABLE public.contents IS 'Content items for optimization';
COMMENT ON COLUMN public.contents.url IS 'Page URL';
COMMENT ON COLUMN public.contents.original_content IS 'Original content text';
COMMENT ON COLUMN public.contents.optimized_content IS 'AI-optimized content';
COMMENT ON COLUMN public.contents.geo_score IS 'Content GEO score (0-100)';
COMMENT ON COLUMN public.contents.entity_density IS 'Entity density: low, medium, high';
COMMENT ON COLUMN public.contents.citation_potential IS 'Citation potential (0.0-10.0)';
COMMENT ON COLUMN public.contents.entities IS 'Detected entities array';
COMMENT ON COLUMN public.contents.optimization_tips IS 'Optimization suggestions array';

-- ----------------------------------------------------------------------------
-- alerts: Monitoring alerts
-- ----------------------------------------------------------------------------
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  type public.alert_type NOT NULL,
  severity public.alert_severity NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb NOT NULL,
  action_url TEXT,
  action_label TEXT,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  dismissed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.alerts IS 'Monitoring alerts';
COMMENT ON COLUMN public.alerts.type IS 'Alert type: content_decay, interpretation_shift, visibility_drop, etc.';
COMMENT ON COLUMN public.alerts.severity IS 'Severity: info, warning, high, critical';
COMMENT ON COLUMN public.alerts.data IS 'Additional alert-specific data';
COMMENT ON COLUMN public.alerts.action_url IS 'URL for action button';
COMMENT ON COLUMN public.alerts.action_label IS 'Action button label';

-- ----------------------------------------------------------------------------
-- team_members: Multi-user site access
-- ----------------------------------------------------------------------------
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.team_role NOT NULL,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,
  
  CONSTRAINT team_members_site_user_unique UNIQUE(site_id, user_id)
);

COMMENT ON TABLE public.team_members IS 'Multi-user site access';
COMMENT ON COLUMN public.team_members.role IS 'Role: owner, admin, member, viewer';
COMMENT ON COLUMN public.team_members.invited_by IS 'User who sent the invitation';
COMMENT ON COLUMN public.team_members.accepted_at IS 'When invitation was accepted (NULL if pending)';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- sites indexes
CREATE INDEX idx_sites_user_id ON public.sites(user_id);
CREATE INDEX idx_sites_domain ON public.sites(domain);

-- jobs indexes
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_type ON public.jobs(type);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_active ON public.jobs(status) WHERE status IN ('pending', 'running');

-- audits indexes
CREATE INDEX idx_audits_site_id ON public.audits(site_id);
CREATE INDEX idx_audits_status ON public.audits(status);
CREATE INDEX idx_audits_created_at ON public.audits(created_at DESC);
CREATE INDEX idx_audits_sub_scores_gin ON public.audits USING GIN (sub_scores);
CREATE INDEX idx_audits_insights_gin ON public.audits USING GIN (insights);

-- brand_voices indexes
CREATE INDEX idx_brand_voices_site_id ON public.brand_voices(site_id);

-- simulations indexes
CREATE INDEX idx_simulations_site_id ON public.simulations(site_id);
CREATE INDEX idx_simulations_created_at ON public.simulations(created_at DESC);

-- recommendations indexes
CREATE INDEX idx_recommendations_audit_id ON public.recommendations(audit_id);
CREATE INDEX idx_recommendations_priority ON public.recommendations(priority);
CREATE INDEX idx_recommendations_status ON public.recommendations(status);
CREATE INDEX idx_recommendations_type ON public.recommendations(type);

-- contents indexes
CREATE INDEX idx_contents_site_id ON public.contents(site_id);
CREATE INDEX idx_contents_geo_score ON public.contents(geo_score);
CREATE INDEX idx_contents_entities_gin ON public.contents USING GIN (entities);

-- alerts indexes
CREATE INDEX idx_alerts_site_id ON public.alerts(site_id);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX idx_alerts_unread ON public.alerts(site_id) WHERE read = FALSE;
CREATE INDEX idx_alerts_active ON public.alerts(site_id) WHERE dismissed = FALSE;

-- team_members indexes
CREATE INDEX idx_team_members_site_id ON public.team_members(site_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers to update updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_voices_updated_at
  BEFORE UPDATE ON public.brand_voices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contents_updated_at
  BEFORE UPDATE ON public.contents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- profiles policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- sites policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own sites and team sites"
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

CREATE POLICY "Users can create sites"
  ON public.sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites"
  ON public.sites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites"
  ON public.sites FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- jobs policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- audits policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view audits for accessible sites"
  ON public.audits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = audits.site_id
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

CREATE POLICY "Users can create audits for own sites"
  ON public.audits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update audits for own sites"
  ON public.audits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = audits.site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete audits for own sites"
  ON public.audits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = audits.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- brand_voices policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view brand voices for accessible sites"
  ON public.brand_voices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = brand_voices.site_id
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

CREATE POLICY "Users can create brand voices for own sites"
  ON public.brand_voices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update brand voices for own sites"
  ON public.brand_voices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = brand_voices.site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete brand voices for own sites"
  ON public.brand_voices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = brand_voices.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- simulations policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view simulations for accessible sites"
  ON public.simulations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = simulations.site_id
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

CREATE POLICY "Users can create simulations for own sites"
  ON public.simulations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete simulations for own sites"
  ON public.simulations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = simulations.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- recommendations policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view recommendations for accessible audits"
  ON public.recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.audits
      JOIN public.sites ON sites.id = audits.site_id
      WHERE audits.id = recommendations.audit_id
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

CREATE POLICY "Users can create recommendations for own audits"
  ON public.recommendations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.audits
      JOIN public.sites ON sites.id = audits.site_id
      WHERE audits.id = audit_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update recommendations for own audits"
  ON public.recommendations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.audits
      JOIN public.sites ON sites.id = audits.site_id
      WHERE audits.id = recommendations.audit_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete recommendations for own audits"
  ON public.recommendations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.audits
      JOIN public.sites ON sites.id = audits.site_id
      WHERE audits.id = recommendations.audit_id
      AND sites.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- contents policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view contents for accessible sites"
  ON public.contents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = contents.site_id
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

CREATE POLICY "Users can create contents for own sites"
  ON public.contents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update contents for own sites"
  ON public.contents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = contents.site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete contents for own sites"
  ON public.contents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = contents.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- alerts policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view alerts for accessible sites"
  ON public.alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = alerts.site_id
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

CREATE POLICY "Users can create alerts for own sites"
  ON public.alerts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update alerts for own sites"
  ON public.alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = alerts.site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete alerts for own sites"
  ON public.alerts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = alerts.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- team_members policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Site owners can manage team members"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = team_members.site_id
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own team memberships"
  ON public.team_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own team memberships"
  ON public.team_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant access to sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
