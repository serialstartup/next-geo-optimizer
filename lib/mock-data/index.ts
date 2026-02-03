/**
 * Mock Data System - Main Export File
 *
 * This module provides comprehensive mock data for the GEO Optimizer application.
 * Use this data for development and testing until the real Supabase database is connected.
 *
 * @example
 * ```typescript
 * import { getMockCurrentUser, getMockSiteById, mockAudits } from '@/lib/mock-data';
 *
 * // Get current user
 * const user = getMockCurrentUser();
 *
 * // Get site by ID
 * const site = getMockSiteById('660e8400-e29b-41d4-a716-446655440001');
 *
 * // Access raw data arrays
 * const allAudits = mockAudits;
 * ```
 */

// ============================================================================
// RE-EXPORTS FROM ALL MOCK DATA MODULES
// ============================================================================

// Users/Profiles
export {
  MOCK_USER_IDS,
  mockFreeUser,
  mockProUser,
  mockProfiles,
  getMockCurrentUser,
  getMockProfileById,
  getMockProfileByEmail,
  getMockProfiles,
  getMockProfilesByPlan,
} from './users';

// Sites
export {
  MOCK_SITE_IDS,
  mockAcmeTechSite,
  mockGreenleafSite,
  mockSites,
  getMockCurrentSite,
  getMockSiteById,
  getMockSiteByDomain,
  getMockSitesByUserId,
  getMockSites,
  getDefaultCrawlConfig,
} from './sites';

// Audits
export {
  MOCK_AUDIT_IDS,
  mockAcmeLatestAudit,
  mockAcmePreviousAudit,
  mockGreenleafAudit,
  mockAcmePendingAudit,
  mockAudits,
  getMockLatestAudit,
  getMockAuditById,
  getMockAuditsBySiteId,
  getMockCompletedAuditsBySiteId,
  getMockAudits,
  getMockAuditsByStatus,
} from './audits';

// Brand Voice
export {
  MOCK_BRAND_VOICE_IDS,
  mockAcmeTechBrandVoice,
  mockGreenleafBrandVoice,
  mockBrandVoices,
  getMockCurrentBrandVoice,
  getMockBrandVoiceById,
  getMockBrandVoiceBySiteId,
  getMockBrandVoices,
  getMockBrandVoicesByPositioning,
  createEmptyBrandVoice,
} from './brand-voice';

// Simulations
export {
  MOCK_SIMULATION_IDS,
  mockAcmeGptSimulation,
  mockAcmeClaudeSimulation,
  mockAcmePerplexitySimulation,
  mockAcmeGeminiSimulation,
  mockGreenleafGptSimulation,
  mockGreenleafClaudeSimulation,
  mockSimulations,
  getMockSimulationById,
  getMockSimulationsBySiteId,
  getMockSimulationsByEngine,
  getMockSimulationsWithBrandMention,
  getMockSimulationsWithoutBrandMention,
  getMockSimulations,
  getMockRecentSimulationsBySiteId,
  getMockBrandMentionRate,
  getMockAverageToneMatch,
} from './simulations';

// Recommendations
export {
  MOCK_RECOMMENDATION_IDS,
  mockSemanticStructureRec,
  mockAnswerFirstRec,
  mockEntityDefinitionRec,
  mockSchemaMarkupRec,
  mockCitationHealthRec,
  mockContentClarityRec,
  mockGreenleafSchemaRec,
  mockGreenleafEntityRec,
  mockRecommendations,
  getMockRecommendationById,
  getMockRecommendationsByAuditId,
  getMockRecommendationsByType,
  getMockRecommendationsByPriority,
  getMockRecommendationsByStatus,
  getMockPendingRecommendationsByAuditId,
  getMockRecommendations,
  getMockRecommendationCountsByPriority,
} from './recommendations';

// Contents
export {
  MOCK_CONTENT_IDS,
  mockAcmeApiDocs,
  mockAcmeGettingStarted,
  mockAcmePricing,
  mockAcmeBlogPost,
  mockGreenleafProduct,
  mockGreenleafAbout,
  mockContents,
  getMockContentById,
  getMockContentsBySiteId,
  getMockContentByUrl,
  getMockContentsByEntityDensity,
  getMockContentsNeedingOptimization,
  getMockContentsByGeoScore,
  getMockContents,
  getMockAverageGeoScore,
  getMockEntityStats,
} from './contents';

// Alerts
export {
  MOCK_ALERT_IDS,
  mockContentDecayAlert,
  mockVisibilityDropAlert,
  mockScoreChangePositiveAlert,
  mockScoreChangeNegativeAlert,
  mockInterpretationShiftAlert,
  mockCompetitorMentionAlert,
  mockSystemInfoAlert,
  mockGreenleafVisibilityAlert,
  mockAlerts,
  getMockAlertById,
  getMockAlertsBySiteId,
  getMockAlertsByType,
  getMockAlertsBySeverity,
  getMockUnreadAlertsBySiteId,
  getMockActiveAlertsBySiteId,
  getMockAlerts,
  getMockRecentAlertsBySiteId,
  getMockAlertCountsBySeverity,
  getMockUnreadAlertCount,
  hasMockCriticalAlerts,
} from './alerts';

// Jobs
export {
  MOCK_JOB_IDS,
  mockCompletedCrawlJob,
  mockRunningCrawlJob,
  mockFailedAnalyzeJob,
  mockPendingSimulateJob,
  mockCompletedOptimizeJob,
  mockCompletedExportJob,
  mockJobs,
  getMockJobById,
  getMockJobsByUserId,
  getMockJobsByStatus,
  getMockJobsByType,
  getMockActiveJobsByUserId,
  getMockJobs,
  getMockRecentJobs,
} from './jobs';

// ============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON USE CASES
// ============================================================================

import {
  getMockCurrentUser,
  mockProfiles,
} from './users';
import {
  getMockCurrentSite,
  getMockSiteById,
  mockSites,
} from './sites';
import {
  getMockLatestAudit,
  getMockAuditsBySiteId,
  getMockAuditById,
  mockAudits,
} from './audits';
import {
  getMockBrandVoiceBySiteId,
  mockBrandVoices,
} from './brand-voice';
import {
  getMockSimulationsBySiteId,
  mockSimulations,
} from './simulations';
import {
  getMockRecommendationsByAuditId,
  mockRecommendations,
} from './recommendations';
import {
  getMockContentsBySiteId,
  mockContents,
} from './contents';
import {
  getMockActiveAlertsBySiteId,
  getMockUnreadAlertCount,
  mockAlerts,
} from './alerts';
import {
  getMockActiveJobsByUserId,
  mockJobs,
} from './jobs';

import type {
  Profile,
  Site,
  Audit,
  BrandVoice,
  Simulation,
  Recommendation,
  Content,
  Alert,
  Job,
} from '@/types/database';

/**
 * Dashboard data bundle for the current site
 * Provides all data needed for the main dashboard view
 */
export interface DashboardData {
  user: Profile;
  site: Site;
  latestAudit: Audit | null;
  brandVoice: BrandVoice | null;
  recentSimulations: Simulation[];
  pendingRecommendations: Recommendation[];
  activeAlerts: Alert[];
  unreadAlertCount: number;
  activeJobs: Job[];
}

/**
 * Get all dashboard data for the current user and site
 */
export function getMockDashboardData(): DashboardData {
  const user = getMockCurrentUser();
  const site = getMockCurrentSite();
  const latestAudit = getMockLatestAudit();
  const brandVoice = getMockBrandVoiceBySiteId(site.id) || null;
  const recentSimulations = getMockSimulationsBySiteId(site.id).slice(0, 5);
  const pendingRecommendations = latestAudit
    ? getMockRecommendationsByAuditId(latestAudit.id).filter(
        (r) => r.status === 'pending'
      )
    : [];
  const activeAlerts = getMockActiveAlertsBySiteId(site.id);
  const unreadAlertCount = getMockUnreadAlertCount(site.id);
  const activeJobs = getMockActiveJobsByUserId(user.id);

  return {
    user,
    site,
    latestAudit,
    brandVoice,
    recentSimulations,
    pendingRecommendations,
    activeAlerts,
    unreadAlertCount,
    activeJobs,
  };
}

/**
 * Site data bundle with all related data
 */
export interface SiteData {
  site: Site;
  audits: Audit[];
  brandVoice: BrandVoice | null;
  simulations: Simulation[];
  contents: Content[];
  alerts: Alert[];
}

/**
 * Get all data for a specific site
 */
export function getMockSiteData(siteId: string): SiteData | null {
  const site = getMockSiteById(siteId);
  if (!site) return null;

  return {
    site,
    audits: getMockAuditsBySiteId(siteId),
    brandVoice: getMockBrandVoiceBySiteId(siteId) || null,
    simulations: getMockSimulationsBySiteId(siteId),
    contents: getMockContentsBySiteId(siteId),
    alerts: getMockActiveAlertsBySiteId(siteId),
  };
}

/**
 * Audit data bundle with recommendations
 */
export interface AuditData {
  audit: Audit;
  recommendations: Recommendation[];
  site: Site | null;
}

/**
 * Get audit with all related data
 */
export function getMockAuditData(auditId: string): AuditData | null {
  const audit = getMockAuditById(auditId);
  if (!audit) return null;

  return {
    audit,
    recommendations: getMockRecommendationsByAuditId(auditId),
    site: getMockSiteById(audit.site_id) || null,
  };
}

// ============================================================================
// MOCK DATA STATISTICS
// ============================================================================

/**
 * Get statistics about the mock data
 * Useful for debugging and understanding data coverage
 */
export function getMockDataStats(): {
  users: number;
  sites: number;
  audits: number;
  brandVoices: number;
  simulations: number;
  recommendations: number;
  contents: number;
  alerts: number;
  jobs: number;
} {
  return {
    users: mockProfiles.length,
    sites: mockSites.length,
    audits: mockAudits.length,
    brandVoices: mockBrandVoices.length,
    simulations: mockSimulations.length,
    recommendations: mockRecommendations.length,
    contents: mockContents.length,
    alerts: mockAlerts.length,
    jobs: mockJobs.length,
  };
}
