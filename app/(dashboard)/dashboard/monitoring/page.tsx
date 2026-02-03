'use client';

/**
 * Monitoring & Alerts Page
 *
 * Real-time AI sentiment and visibility tracking across major LLMs.
 * Shows score trends, alerts, and sentiment drift analysis.
 */

import { useState, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { QuickStatCard } from '@/components/dashboard/QuickStatCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { AlertList } from '@/components/dashboard/AlertList';
import { GeoAssistant } from '@/components/dashboard/GeoAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Bell,
  Download,
  Calendar,
  ChevronDown,
  Settings,
  RefreshCw,
  Eye,
  AlertTriangle,
  Target,
} from 'lucide-react';
import {
  getMockCurrentSite,
  getMockLatestAudit,
  getMockAlertCountsBySeverity,
  getMockActiveAlertsBySiteId,
} from '@/lib/mock-data';
import type { Alert } from '@/types/database';

// ============================================================================
// MOCK DATA FOR DEMONSTRATION
// ============================================================================

// Score timeline data for different AI engines
const trendData = [
  { date: 'JAN 06', value: 72, value2: 68, value3: 65 },
  { date: 'JAN 13', value: 74, value2: 70, value3: 67 },
  { date: 'JAN 20', value: 73, value2: 72, value3: 69 },
  { date: 'JAN 27', value: 76, value2: 74, value3: 71 },
  { date: 'FEB 03', value: 80, value2: 77, value3: 74 },
  { date: 'FEB 10', value: 84, value2: 80, value3: 77 },
  { date: 'FEB 17', value: 82, value2: 79, value3: 76 },
  { date: 'FEB 24', value: 85, value2: 82, value3: 78 },
];

// Sentiment drift data
const sentimentDrift = [
  {
    label: 'Perceived Premium',
    value: 85,
    change: 18,
    color: 'bg-emerald-400',
    trend: 'up',
  },
  {
    label: 'Innovation Leader',
    value: 72,
    change: 4,
    color: 'bg-blue-400',
    trend: 'up',
  },
  {
    label: 'Customer Support',
    value: 45,
    change: -12,
    color: 'bg-red-400',
    trend: 'down',
  },
  {
    label: 'Ease of Use',
    value: 68,
    change: -3,
    color: 'bg-amber-400',
    trend: 'down',
  },
];

// Monitoring metrics data
const monitoringMetrics = [
  {
    label: 'GPT-4',
    score: 85,
    change: 4.2,
    trend: 'up',
  },
  {
    label: 'Claude 3',
    score: 82,
    change: 3.1,
    trend: 'up',
  },
  {
    label: 'Gemini',
    score: 78,
    change: 0.8,
    trend: 'up',
  },
  {
    label: 'Perplexity',
    score: 71,
    change: -1.2,
    trend: 'down',
  },
];

// Content decay indicators
const contentDecayData = [
  { label: 'Pricing Page', status: 'critical', position: 5 },
  { label: 'API Documentation', status: 'warning', position: 3 },
  { label: 'Blog Posts', status: 'stable', position: 0 },
  { label: 'Landing Pages', status: 'stable', position: 0 },
];

// AI interpretation shifts
const interpretationShifts = [
  { label: 'Brand Tone', from: 'Budget', to: 'Premium' },
  { label: 'Market Position', from: 'Challenger', to: 'Leader' },
  { label: 'Use Case', from: 'SMB', to: 'Enterprise' },
  { label: 'Tech Stack', from: 'Stable', to: 'Stable' },
];

// Time range options
const timeRanges = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'custom', label: 'Custom Range' },
];

// Alert configuration options
const alertConfigOptions = [
  {
    id: 'content_decay',
    label: 'Content Decay Alerts',
    description: 'Notify when content loses source authority',
    enabled: true,
    threshold: 10,
  },
  {
    id: 'score_change',
    label: 'Score Change Alerts',
    description: 'Notify on significant score changes',
    enabled: true,
    threshold: 5,
  },
  {
    id: 'visibility_drop',
    label: 'Visibility Drop Alerts',
    description: 'Notify when ranking position drops',
    enabled: true,
    threshold: 3,
  },
  {
    id: 'interpretation_shift',
    label: 'Interpretation Shift Alerts',
    description: 'Notify on brand perception changes',
    enabled: false,
    threshold: 15,
  },
  {
    id: 'competitor_mention',
    label: 'Competitor Mention Alerts',
    description: 'Notify when competitors are mentioned',
    enabled: true,
    threshold: 1,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function MonitoringPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showSettings, setShowSettings] = useState(false);
  const [alertConfigs, setAlertConfigs] = useState(alertConfigOptions);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    critical: 0,
    high: 0,
    currentScore: 0,
    scoreChange: 0,
  });

  // Load alerts data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const site = getMockCurrentSite();
        const latestAudit = getMockLatestAudit();

        // Load alerts for the site
        const siteAlerts = getMockActiveAlertsBySiteId(site.id);
        setAlerts(siteAlerts);

        // Calculate stats
        const unreadCount = siteAlerts.filter((a) => !a.read).length;
        const counts = getMockAlertCountsBySeverity(site.id);

        setStats({
          total: siteAlerts.length,
          unread: unreadCount,
          critical: counts.critical,
          high: counts.high,
          currentScore: latestAudit?.overall_score || 0,
          scoreChange: latestAudit?.score_change || 0,
        });
      } catch (error) {
        console.error('Error loading monitoring data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle toggle alert config
  const handleToggleAlert = (id: string) => {
    setAlertConfigs((prev) =>
      prev.map((config) =>
        config.id === id ? { ...config, enabled: !config.enabled } : config
      )
    );
  };

  // Handle mark alert as read (mock)
  const handleMarkAsRead = useCallback(async (alertId: string) => {
    // In a real app, this would call a server action
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  }, []);

  // Handle dismiss alert (mock)
  const handleDismissAlert = useCallback(async (alertId: string) => {
    // In a real app, this would call a server action
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, dismissed: true, read: true } : alert
      )
    );
  }, []);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    setAlerts((prev) =>
      prev.map((alert) => ({ ...alert, read: true }))
    );
  }, []);

  // Format status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; label: string }> = {
      critical: {
        class: 'bg-red-500/20 text-red-400',
        label: 'Critical',
      },
      warning: {
        class: 'bg-amber-500/20 text-amber-400',
        label: 'At Risk',
      },
      stable: {
        class: 'bg-emerald-500/20 text-emerald-400',
        label: 'Stable',
      },
    };
    const { class: className, label } = config[status] || config.stable;
    return (
      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', className)}>
        {label}
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Monitoring & Alerts"
        subtitle="Real-time AI sentiment and visibility tracking across major LLMs."
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                {timeRanges.find((t) => t.id === selectedTimeRange)?.label}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          label="Aggregate GEO Score"
          value={stats.currentScore > 0 ? `${stats.currentScore}/100` : '--'}
          change={stats.scoreChange}
          changePeriod="vs last audit"
          icon={Target}
          iconColor="primary"
        />
        <QuickStatCard
          label="Weekly Drift"
          value="+3.8%"
          change={3.8}
          changePeriod="Relative change"
          icon={TrendingUp}
          iconColor="success"
        />
        <QuickStatCard
          label="Active Alerts"
          value={stats.total}
          icon={Bell}
          iconColor={stats.unread > 0 ? 'warning' : 'info'}
        />
        <QuickStatCard
          label="Critical/High"
          value={stats.critical + stats.high}
          icon={AlertTriangle}
          iconColor={stats.critical > 0 ? 'danger' : 'warning'}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2">
          <TrendChart
            title="GEO Score Over Time"
            data={trendData}
            series={[
              { name: 'GPT-4', color: '#3b82f6' },
              { name: 'Claude 3', color: '#f59e0b' },
              { name: 'Gemini', color: '#8b5cf6' },
            ]}
            height={320}
          />
        </div>

        {/* Sentiment Drift */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              Weekly AI Sentiment Drift
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sentimentDrift.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium flex items-center gap-1',
                        item.trend === 'up'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      )}
                    >
                      {item.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {item.change >= 0 ? '+' : ''}
                      {item.change}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', item.color)}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Drift Insight */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Drift Insight
              </p>
              <p className="text-sm text-foreground/80">
                Your brand is being cited more frequently in high-end comparison
                threads on GPT-4, shifting your overall perception from Budget
                to Premium tier.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts Feed */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Real-time Alerts Feed
            </CardTitle>
            <div className="flex items-center gap-3">
              {stats.unread > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    {stats.unread} unread
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AlertList
            alerts={alerts}
            onMarkAsRead={handleMarkAsRead}
            onDismiss={handleDismissAlert}
            onMarkAllAsRead={handleMarkAllAsRead}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      {showSettings && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Alert Configuration
              </CardTitle>
              <Button variant="ghost" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reset to Defaults
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertConfigs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-foreground">
                        {config.label}
                      </p>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          config.enabled
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Threshold</p>
                      <p className="text-sm font-medium text-foreground">
                        {config.threshold}%
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleAlert(config.id)}
                      className={cn(
                        'relative w-12 h-6 rounded-full transition-colors cursor-pointer',
                        config.enabled ? 'bg-primary' : 'bg-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                          config.enabled ? 'left-7' : 'left-1'
                        )}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Changes */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Score Changes (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monitoringMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {metric.score}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium flex items-center gap-1',
                        metric.trend === 'up'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      )}
                    >
                      {metric.trend === 'up' ? '+' : ''}
                      {metric.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Decay Indicators */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Content Decay Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentDecayData.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-foreground">{item.label}</span>
                  {getStatusBadge(item.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Interpretation Shifts */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              AI Interpretation Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interpretationShifts.map((shift) => (
                <div
                  key={shift.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-foreground">{shift.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {shift.from} → {shift.to}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GEO Assistant */}
      <GeoAssistant currentPage="monitoring" />
    </div>
  );
}
