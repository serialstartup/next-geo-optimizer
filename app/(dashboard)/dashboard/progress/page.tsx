'use client';

/**
 * Progress & History Page
 *
 * Shows score timeline, change history, and impact summaries.
 * Allows users to track their GEO optimization progress over time.
 */

import { useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { QuickStatCard } from '@/components/dashboard/QuickStatCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { GeoAssistant } from '@/components/dashboard/GeoAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ChevronDown,
  CheckCircle,
  FileEdit,
  RefreshCw,
  AlertTriangle,
  User,
  Filter,
} from 'lucide-react';

// Demo data
const trendData = [
  { date: 'Oct 1', value: 62, value2: 58, value3: 55 },
  { date: 'Oct 8', value: 65, value2: 61, value3: 58 },
  { date: 'Oct 15', value: 68, value2: 64, value3: 61 },
  { date: 'Oct 22', value: 72, value2: 68, value3: 65 },
  { date: 'Oct 29', value: 76, value2: 72, value3: 69 },
  { date: 'Nov 5', value: 79, value2: 75, value3: 72 },
  { date: 'Nov 12', value: 82, value2: 78, value3: 75 },
  { date: 'Nov 19', value: 84, value2: 80, value3: 77 },
];

const changeHistory = [
  {
    id: '1',
    date: 'Nov 19, 2025',
    time: '2:34 PM',
    type: 'recommendation' as const,
    title: 'Implemented Organization Schema Markup',
    description: 'Added JSON-LD structured data to homepage',
    impact: 3,
    user: 'Alex Sterling',
    details: 'Schema markup now includes organization name, logo, and social profiles.',
  },
  {
    id: '2',
    date: 'Nov 18, 2025',
    time: '11:20 AM',
    type: 'content' as const,
    title: 'Optimized Cloud Security Guide',
    description: 'Applied AI-suggested improvements to technical documentation',
    impact: 5,
    user: 'Alex Sterling',
    details: 'Added entity definitions, restructured for answer-first format.',
  },
  {
    id: '3',
    date: 'Nov 17, 2025',
    time: '4:15 PM',
    type: 'audit' as const,
    title: 'Full Site Audit Completed',
    description: 'Comprehensive GEO audit across all pages',
    impact: 0,
    user: 'System',
    details: 'Identified 12 new recommendations, 3 critical issues.',
  },
  {
    id: '4',
    date: 'Nov 15, 2025',
    time: '9:45 AM',
    type: 'recommendation' as const,
    title: 'Fixed Brand Name Inconsistencies',
    description: 'Updated citations on 5 industry directories',
    impact: 4,
    user: 'Alex Sterling',
    details: 'Corrected legacy brand name references across third-party sites.',
  },
  {
    id: '5',
    date: 'Nov 12, 2025',
    time: '3:30 PM',
    type: 'alert' as const,
    title: 'Content Decay Alert Resolved',
    description: 'Pricing page authority restored',
    impact: 2,
    user: 'Alex Sterling',
    details: 'Updated pricing content with current market data and comparisons.',
  },
  {
    id: '6',
    date: 'Nov 10, 2025',
    time: '10:00 AM',
    type: 'content' as const,
    title: 'FAQ Section Added to Product Pages',
    description: 'Implemented answer-first FAQ format',
    impact: 6,
    user: 'Alex Sterling',
    details: 'Added 15 FAQ entries across 5 product pages.',
  },
];

const impactSummary = {
  totalImprovement: 22,
  areasImproved: [
    { name: 'Content Clarity', improvement: 8 },
    { name: 'Entity Coverage', improvement: 6 },
    { name: 'Schema Markup', improvement: 5 },
    { name: 'Citation Health', improvement: 3 },
  ],
  remainingOpportunities: [
    { name: 'Answer-First Structure', potential: 8 },
    { name: 'Technical Documentation', potential: 5 },
    { name: 'Blog Optimization', potential: 4 },
  ],
};

const typeIcons = {
  recommendation: CheckCircle,
  content: FileEdit,
  audit: RefreshCw,
  alert: AlertTriangle,
};

const typeColors = {
  recommendation: 'text-emerald-400 bg-emerald-400/10',
  content: 'text-purple-400 bg-purple-400/10',
  audit: 'text-blue-400 bg-blue-400/10',
  alert: 'text-amber-400 bg-amber-400/10',
};

export default function ProgressPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filters = [
    { id: 'all', label: 'All Changes' },
    { id: 'recommendation', label: 'Recommendations' },
    { id: 'content', label: 'Content' },
    { id: 'audit', label: 'Audits' },
    { id: 'alert', label: 'Alerts' },
  ];

  const filteredHistory =
    selectedFilter === 'all'
      ? changeHistory
      : changeHistory.filter((item) => item.type === selectedFilter);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Progress & History"
        subtitle="Track your GEO optimization journey and measure impact over time."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Last 30 Days
              <ChevronDown className="w-4 h-4" />
            </Button>
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
          label="Starting Score"
          value="62/100"
          icon={TrendingUp}
          iconColor="info"
        />
        <QuickStatCard
          label="Current Score"
          value="84/100"
          change={35}
          changePeriod="total improvement"
          icon={TrendingUp}
          iconColor="success"
        />
        <QuickStatCard
          label="Changes Made"
          value={changeHistory.length}
          icon={CheckCircle}
          iconColor="primary"
        />
        <QuickStatCard
          label="Avg. Impact per Change"
          value="+3.3 pts"
          icon={TrendingUp}
          iconColor="success"
        />
      </div>

      {/* Score Timeline Chart */}
      <TrendChart
        title="Score Timeline"
        data={trendData}
        series={[
          { name: 'GPT-4', color: '#3b82f6' },
          { name: 'Claude 3', color: '#f59e0b' },
          { name: 'Gemini', color: '#8b5cf6' },
        ]}
        height={300}
      />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Change History */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Change History
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </div>
              </div>
              {/* Filter tabs */}
              <div className="flex items-center gap-1 mt-4 p-1 bg-muted rounded-lg w-fit">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      selectedFilter === filter.id
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredHistory.map((item) => {
                  const Icon = typeIcons[item.type];
                  const colorClass = typeColors[item.type];
                  const isExpanded = expandedItem === item.id;

                  return (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedItem(isExpanded ? null : item.id)
                        }
                        className="w-full text-left p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={cn('p-2 rounded-lg', colorClass)}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-foreground">
                                {item.title}
                              </p>
                              {item.impact !== 0 && (
                                <span
                                  className={cn(
                                    'flex items-center text-sm font-medium',
                                    item.impact > 0
                                      ? 'text-emerald-400'
                                      : 'text-red-400'
                                  )}
                                >
                                  {item.impact > 0 ? (
                                    <TrendingUp className="w-3 h-3 mr-0.5" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3 mr-0.5" />
                                  )}
                                  {item.impact > 0 ? '+' : ''}
                                  {item.impact} pts
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>
                                {item.date} at {item.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {item.user}
                              </span>
                            </div>
                          </div>

                          {/* Expand indicator */}
                          <ChevronDown
                            className={cn(
                              'w-5 h-5 text-muted-foreground transition-transform',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="ml-14 p-3 rounded-lg bg-muted/50 border border-border">
                            <p className="text-sm text-foreground/80">
                              {item.details}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No changes found for this filter.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Summary */}
        <div className="space-y-6">
          {/* Total Improvement */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                Impact Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="text-5xl font-bold text-emerald-400">
                  +{impactSummary.totalImprovement}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Points Gained
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Areas Improved
                  </p>
                  {impactSummary.areasImproved.map((area) => (
                    <div
                      key={area.name}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-foreground">{area.name}</span>
                      <span className="text-sm font-medium text-emerald-400">
                        +{area.improvement} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remaining Opportunities */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                Remaining Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {impactSummary.remainingOpportunities.map((opp) => (
                  <div
                    key={opp.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <span className="text-sm text-foreground">{opp.name}</span>
                    <span className="text-sm font-medium text-primary">
                      +{opp.potential} pts potential
                    </span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Recommendations
              </Button>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                Export Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="w-4 h-4" />
                Download PDF Report
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="w-4 h-4" />
                Export CSV Data
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="w-4 h-4" />
                Share Progress Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* GEO Assistant */}
      <GeoAssistant currentPage="progress" />
    </div>
  );
}
