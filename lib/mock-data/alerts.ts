/**
 * Mock Alerts Data
 *
 * Contains mock monitoring alerts for different alert types and severities.
 * Includes action URLs and labels for user interaction.
 */

import type {
  Alert,
  AlertType,
  AlertSeverity,
  AlertData,
  ContentDecayAlertData,
  ScoreChangeAlertData,
  VisibilityDropAlertData,
} from '@/types/database';
import { MOCK_SITE_IDS } from './sites';

// ============================================================================
// MOCK ALERT IDS (hardcoded UUIDs for consistency)
// ============================================================================

export const MOCK_ALERT_IDS = {
  CONTENT_DECAY: 'ee0e8400-e29b-41d4-a716-446655440001',
  VISIBILITY_DROP: 'ee0e8400-e29b-41d4-a716-446655440002',
  SCORE_CHANGE_POSITIVE: 'ee0e8400-e29b-41d4-a716-446655440003',
  SCORE_CHANGE_NEGATIVE: 'ee0e8400-e29b-41d4-a716-446655440004',
  INTERPRETATION_SHIFT: 'ee0e8400-e29b-41d4-a716-446655440005',
  COMPETITOR_MENTION: 'ee0e8400-e29b-41d4-a716-446655440006',
  SYSTEM_INFO: 'ee0e8400-e29b-41d4-a716-446655440007',
  GREENLEAF_VISIBILITY: 'ee0e8400-e29b-41d4-a716-446655440008',
} as const;

// ============================================================================
// MOCK ALERT DATA
// ============================================================================

const contentDecayData: ContentDecayAlertData = {
  page_url: 'https://acme-tech.com/docs/api-reference',
  previous_authority: 'primary',
  current_authority: 'secondary',
  affected_query: 'enterprise API documentation best practices',
};

const visibilityDropData: VisibilityDropAlertData = {
  query: 'best cloud integration platform',
  previous_position: 2,
  current_position: 5,
  competitor_gained: 'CloudConnect Pro',
};

const scoreChangePositiveData: ScoreChangeAlertData = {
  previous_score: 72,
  current_score: 78,
  change_percentage: 8.3,
  affected_metrics: ['content_clarity', 'ai_readability'],
};

const scoreChangeNegativeData: ScoreChangeAlertData = {
  previous_score: 65,
  current_score: 58,
  change_percentage: -10.8,
  affected_metrics: ['entity_coverage', 'answer_first'],
};

const interpretationShiftData: AlertData = {
  query: 'what is Acme Tech',
  previous_interpretation: 'Enterprise API platform provider',
  current_interpretation: 'General technology company',
  confidence_change: -15,
};

const competitorMentionData: AlertData = {
  competitor: 'CloudConnect Pro',
  query: 'enterprise data integration solutions',
  mention_type: 'recommendation',
  ai_engine: 'gpt-4o',
};

const systemInfoData: AlertData = {
  feature: 'AI Simulation',
  update_type: 'new_engine',
  details: 'Claude 3.5 Sonnet now available for simulations',
};

const greenleafVisibilityData: VisibilityDropAlertData = {
  query: 'organic food delivery near me',
  previous_position: 3,
  current_position: 8,
  competitor_gained: 'FreshDirect Organic',
};

// ============================================================================
// MOCK ALERTS
// ============================================================================

/**
 * Content Decay Alert - High severity
 * Page losing authority status
 */
export const mockContentDecayAlert: Alert = {
  id: MOCK_ALERT_IDS.CONTENT_DECAY,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  type: 'content_decay',
  severity: 'high',
  title: 'API Reference Page Losing Authority',
  message:
    'Your API Reference documentation has dropped from primary to secondary source status for "enterprise API documentation best practices" queries. This may reduce citation frequency.',
  data: contentDecayData,
  action_url: '/dashboard/content?id=dd0e8400-e29b-41d4-a716-446655440001',
  action_label: 'Review Content',
  read: false,
  dismissed: false,
  created_at: '2026-02-02T08:30:00.000Z',
};

/**
 * Visibility Drop Alert - Critical severity
 * Significant position loss
 */
export const mockVisibilityDropAlert: Alert = {
  id: MOCK_ALERT_IDS.VISIBILITY_DROP,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  type: 'visibility_drop',
  severity: 'critical',
  title: 'Visibility Drop: Cloud Integration Query',
  message:
    'Your visibility for "best cloud integration platform" dropped from position 2 to 5. CloudConnect Pro has gained the top position. Immediate action recommended.',
  data: visibilityDropData,
  action_url: '/dashboard/simulation?query=best+cloud+integration+platform',
  action_label: 'Run Simulation',
  read: false,
  dismissed: false,
  created_at: '2026-02-02T07:15:00.000Z',
};

/**
 * Score Change Alert - Positive (Info)
 * GEO score improvement
 */
export const mockScoreChangePositiveAlert: Alert = {
  id: MOCK_ALERT_IDS.SCORE_CHANGE_POSITIVE,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  type: 'score_change',
  severity: 'info',
  title: 'GEO Score Improved by 8.3%',
  message:
    'Great news! Your overall GEO score increased from 72 to 78. Improvements in content clarity and AI readability contributed to this gain.',
  data: scoreChangePositiveData,
  action_url: '/dashboard/audit',
  action_label: 'View Audit',
  read: true,
  dismissed: false,
  created_at: '2026-02-01T06:20:00.000Z',
};

/**
 * Score Change Alert - Negative (Warning)
 * GEO score decline
 */
export const mockScoreChangeNegativeAlert: Alert = {
  id: MOCK_ALERT_IDS.SCORE_CHANGE_NEGATIVE,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  type: 'score_change',
  severity: 'warning',
  title: 'Entity Coverage Score Declined',
  message:
    'Your entity coverage score dropped by 10.8%. Recent content changes may have removed important entity definitions. Review affected pages.',
  data: scoreChangeNegativeData,
  action_url: '/dashboard/recommendations',
  action_label: 'View Recommendations',
  read: false,
  dismissed: false,
  created_at: '2026-01-30T14:00:00.000Z',
};

/**
 * Interpretation Shift Alert - Warning
 * AI understanding changed
 */
export const mockInterpretationShiftAlert: Alert = {
  id: MOCK_ALERT_IDS.INTERPRETATION_SHIFT,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  type: 'interpretation_shift',
  severity: 'warning',
  title: 'Brand Interpretation Shift Detected',
  message:
    'AI models are now interpreting "Acme Tech" as a general technology company rather than an enterprise API platform. This may affect brand positioning in AI responses.',
  data: interpretationShiftData,
  action_url: '/dashboard/brand-voice',
  action_label: 'Review Brand Voice',
  read: false,
  dismissed: false,
  created_at: '2026-01-28T11:30:00.000Z',
};

/**
 * Competitor Mention Alert - Info
 * Competitor appearing in AI responses
 */
export const mockCompetitorMentionAlert: Alert = {
  id: MOCK_ALERT_IDS.COMPETITOR_MENTION,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  type: 'competitor_mention',
  severity: 'info',
  title: 'Competitor Mentioned in AI Response',
  message:
    'CloudConnect Pro was recommended by GPT-4o for "enterprise data integration solutions" query. Consider running a competitive simulation to understand positioning.',
  data: competitorMentionData,
  action_url: '/dashboard/simulation',
  action_label: 'Run Competitive Analysis',
  read: true,
  dismissed: false,
  created_at: '2026-01-25T16:45:00.000Z',
};

/**
 * System Alert - Info
 * Platform update notification
 */
export const mockSystemInfoAlert: Alert = {
  id: MOCK_ALERT_IDS.SYSTEM_INFO,
  site_id: MOCK_SITE_IDS.ACME_TECH,
  type: 'system',
  severity: 'info',
  title: 'New AI Engine Available',
  message:
    'Claude 3.5 Sonnet is now available for AI simulations. This model offers improved reasoning capabilities for technical queries.',
  data: systemInfoData,
  action_url: '/dashboard/simulation',
  action_label: 'Try New Engine',
  read: true,
  dismissed: true,
  created_at: '2026-01-20T09:00:00.000Z',
};

/**
 * Greenleaf Visibility Alert - High
 * Organic food visibility drop
 */
export const mockGreenleafVisibilityAlert: Alert = {
  id: MOCK_ALERT_IDS.GREENLEAF_VISIBILITY,
  site_id: MOCK_SITE_IDS.GREENLEAF_ORGANIC,
  type: 'visibility_drop',
  severity: 'high',
  title: 'Local Search Visibility Dropped',
  message:
    'Your visibility for "organic food delivery near me" dropped from position 3 to 8. FreshDirect Organic has gained prominence. Consider adding more location-specific content.',
  data: greenleafVisibilityData,
  action_url: '/dashboard/recommendations',
  action_label: 'View Recommendations',
  read: false,
  dismissed: false,
  created_at: '2026-01-29T10:00:00.000Z',
};

// ============================================================================
// MOCK ALERTS ARRAY
// ============================================================================

export const mockAlerts: Alert[] = [
  mockContentDecayAlert,
  mockVisibilityDropAlert,
  mockScoreChangePositiveAlert,
  mockScoreChangeNegativeAlert,
  mockInterpretationShiftAlert,
  mockCompetitorMentionAlert,
  mockSystemInfoAlert,
  mockGreenleafVisibilityAlert,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a mock alert by ID
 */
export function getMockAlertById(id: string): Alert | undefined {
  return mockAlerts.find((alert) => alert.id === id);
}

/**
 * Get all mock alerts for a site
 */
export function getMockAlertsBySiteId(siteId: string): Alert[] {
  return mockAlerts.filter((alert) => alert.site_id === siteId);
}

/**
 * Get mock alerts by type
 */
export function getMockAlertsByType(type: AlertType): Alert[] {
  return mockAlerts.filter((alert) => alert.type === type);
}

/**
 * Get mock alerts by severity
 */
export function getMockAlertsBySeverity(severity: AlertSeverity): Alert[] {
  return mockAlerts.filter((alert) => alert.severity === severity);
}

/**
 * Get unread alerts for a site
 */
export function getMockUnreadAlertsBySiteId(siteId: string): Alert[] {
  return mockAlerts.filter(
    (alert) => alert.site_id === siteId && !alert.read
  );
}

/**
 * Get active (not dismissed) alerts for a site
 */
export function getMockActiveAlertsBySiteId(siteId: string): Alert[] {
  return mockAlerts.filter(
    (alert) => alert.site_id === siteId && !alert.dismissed
  );
}

/**
 * Get all mock alerts
 */
export function getMockAlerts(): Alert[] {
  return mockAlerts;
}

/**
 * Get recent alerts for a site (sorted by date, newest first)
 */
export function getMockRecentAlertsBySiteId(
  siteId: string,
  limit: number = 10
): Alert[] {
  return mockAlerts
    .filter((alert) => alert.site_id === siteId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);
}

/**
 * Count alerts by severity for a site
 */
export function getMockAlertCountsBySeverity(
  siteId: string
): Record<AlertSeverity, number> {
  const siteAlerts = mockAlerts.filter(
    (alert) => alert.site_id === siteId && !alert.dismissed
  );
  return {
    critical: siteAlerts.filter((a) => a.severity === 'critical').length,
    high: siteAlerts.filter((a) => a.severity === 'high').length,
    warning: siteAlerts.filter((a) => a.severity === 'warning').length,
    info: siteAlerts.filter((a) => a.severity === 'info').length,
  };
}

/**
 * Get unread alert count for a site
 */
export function getMockUnreadAlertCount(siteId: string): number {
  return mockAlerts.filter(
    (alert) => alert.site_id === siteId && !alert.read && !alert.dismissed
  ).length;
}

/**
 * Check if there are any critical alerts for a site
 */
export function hasMockCriticalAlerts(siteId: string): boolean {
  return mockAlerts.some(
    (alert) =>
      alert.site_id === siteId &&
      alert.severity === 'critical' &&
      !alert.dismissed
  );
}
