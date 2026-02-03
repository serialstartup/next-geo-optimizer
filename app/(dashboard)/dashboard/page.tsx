/**
 * Dashboard Overview Page
 *
 * Main dashboard landing page showing quick stats, recent activity,
 * and quick actions for the GEO Optimizer platform.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { QuickStatCard } from '@/components/dashboard/QuickStatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { GeoAssistant } from '@/components/dashboard/GeoAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Lightbulb,
  Bell,
  Play,
  Eye,
  Zap,
  ArrowRight,
} from 'lucide-react';

// Demo data
const quickStats = {
  geoScore: 84,
  scoreChange: 2.1,
  pendingRecommendations: 12,
  activeAlerts: 3,
};

const recentActivities = [
  {
    id: '1',
    type: 'audit' as const,
    title: 'GEO Audit Completed',
    description: 'Full site audit finished with 84% overall score',
    timestamp: '2 hours ago',
    impact: 5,
    user: 'System',
  },
  {
    id: '2',
    type: 'recommendation' as const,
    title: 'Schema Markup Implemented',
    description: 'Organization schema added to homepage',
    timestamp: '5 hours ago',
    impact: 3,
    user: 'Alex Sterling',
  },
  {
    id: '3',
    type: 'alert' as const,
    title: 'Content Decay Detected',
    description: 'Pricing page lost primary source authority',
    timestamp: '1 day ago',
    user: 'System',
  },
  {
    id: '4',
    type: 'content' as const,
    title: 'Content Optimized',
    description: 'Cloud Security Guide updated with entity improvements',
    timestamp: '2 days ago',
    impact: 8,
    user: 'Alex Sterling',
  },
  {
    id: '5',
    type: 'score_change' as const,
    title: 'Score Milestone Reached',
    description: 'GEO score crossed 80% threshold',
    timestamp: '3 days ago',
    impact: 12,
    user: 'System',
  },
];

const trendData = [
  { date: 'Jan 1', value: 72, value2: 68, value3: 65 },
  { date: 'Jan 8', value: 74, value2: 70, value3: 67 },
  { date: 'Jan 15', value: 76, value2: 73, value3: 70 },
  { date: 'Jan 22', value: 79, value2: 75, value3: 72 },
  { date: 'Jan 29', value: 82, value2: 78, value3: 75 },
  { date: 'Feb 1', value: 84, value2: 80, value3: 77 },
];

const activeAlerts = [
  {
    id: '1',
    type: 'content_decay' as const,
    severity: 'high' as const,
    title: 'Content Decay Detected',
    message:
      'Pricing Page content has lost its primary source authority for "Enterprise AI costs" on GPT-4.',
    timestamp: '24 mins ago',
    actionLabel: 'View Mitigation',
  },
  {
    id: '2',
    type: 'interpretation_shift' as const,
    severity: 'info' as const,
    title: 'AI Interpretation Shift',
    message:
      'Brand now perceived as Premium in luxury segment queries on Claude 3.',
    timestamp: '3 hours ago',
    actionLabel: 'Analyze',
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Dashboard Overview"
        subtitle="Monitor your GEO performance and take action on recommendations"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          label="Current GEO Score"
          value={`${quickStats.geoScore}/100`}
          change={quickStats.scoreChange}
          changePeriod="vs last week"
          icon={BarChart3}
          iconColor="primary"
        />
        <QuickStatCard
          label="Weekly Drift"
          value={`+${quickStats.scoreChange}%`}
          changePeriod="Relative change"
          icon={TrendingUp}
          iconColor="success"
        />
        <QuickStatCard
          label="Pending Recommendations"
          value={quickStats.pendingRecommendations}
          icon={Lightbulb}
          iconColor="warning"
        />
        <QuickStatCard
          label="Active Alerts"
          value={quickStats.activeAlerts}
          icon={Bell}
          iconColor="danger"
        />
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <Link href="/dashboard/audit">
                <Play className="w-4 h-4" />
                Run New Audit
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard/recommendations">
                <Lightbulb className="w-4 h-4" />
                View Recommendations
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard/simulation">
                <Eye className="w-4 h-4" />
                Check Simulations
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard/content">
                <Zap className="w-4 h-4" />
                Optimize Content
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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
            height={250}
          />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed
            activities={recentActivities}
            maxItems={5}
            title="Recent Activity"
            showViewAll
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>

      {/* Active Alerts */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Active Alerts
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Live Updates</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              id={alert.id}
              type={alert.type}
              severity={alert.severity}
              title={alert.title}
              message={alert.message}
              timestamp={alert.timestamp}
              actionLabel={alert.actionLabel}
              onAction={() => console.log('Alert action:', alert.id)}
              onDismiss={() => console.log('Dismiss alert:', alert.id)}
            />
          ))}
          {activeAlerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No active alerts
            </div>
          )}
          <Button variant="ghost" className="w-full mt-2 text-muted-foreground">
            Load older alerts...
          </Button>
        </CardContent>
      </Card>

      {/* Top Recommendations Preview */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Top Recommendations
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link href="/dashboard/recommendations">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-semibold">
                  CRITICAL
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    Implement Missing Organization Schema.org Markup
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Est. 15 min • Semantic Structure
                  </p>
                </div>
              </div>
              <Button size="sm">Fix Now</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-xs font-semibold">
                  HIGH
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    Reconcile Inconsistent Brand Name Citations
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Est. 45 min • Citation Health
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-semibold">
                  MEDIUM
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    Add FAQ Section to Product Pages
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Est. 30 min • Content Clarity
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GEO Assistant */}
      <GeoAssistant currentPage="dashboard" currentScore={quickStats.geoScore} />
    </div>
  );
}
