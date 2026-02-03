'use client';

/**
 * Recommendations Page
 *
 * Displays actionable fixes and recommendations for improving GEO scores.
 * Features priority filtering, progress tracking, and detailed recommendation cards.
 */

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { RecommendationFilters } from '@/components/dashboard/RecommendationFilters';
import { QuickStatCard } from '@/components/dashboard/QuickStatCard';
import { GeoAssistant } from '@/components/dashboard/GeoAssistant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMockRecommendations } from '@/lib/mock-data';
import type {
  PriorityLevel,
  RecommendationStatus,
  RecommendationType,
} from '@/types/database';
import {
  RefreshCw,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react';

// Get mock data
const allRecommendations = getMockRecommendations();

const priorityFilters = [
  { id: 'all' as const, label: 'All', count: allRecommendations.length },
  { id: 'critical' as const, label: 'Critical', count: allRecommendations.filter(r => r.priority === 'critical').length },
  { id: 'high' as const, label: 'High Impact', count: allRecommendations.filter(r => r.priority === 'high').length },
  { id: 'medium' as const, label: 'Medium', count: allRecommendations.filter(r => r.priority === 'medium').length },
  { id: 'low' as const, label: 'Optional', count: allRecommendations.filter(r => r.priority === 'low').length },
];

const typeFilters = [
  { id: 'all' as const, label: 'All Categories' },
  { id: 'semantic_structure' as const, label: 'Semantic Structure' },
  { id: 'citation_health' as const, label: 'Citation Health' },
  { id: 'entity_definition' as const, label: 'Entity Definition' },
  { id: 'answer_first' as const, label: 'Answer-First' },
  { id: 'schema_markup' as const, label: 'Schema Markup' },
  { id: 'content_clarity' as const, label: 'Content Clarity' },
];

type Recommendation = typeof allRecommendations[number];

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(allRecommendations);
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RecommendationType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const completedCount = recommendations.filter(r => r.status === 'completed').length;
  const totalCount = recommendations.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const criticalCount = recommendations.filter(
    r => r.priority === 'critical' && r.status !== 'completed' && r.status !== 'dismissed'
  ).length;

  // Calculate growth potential based on pending critical/high recommendations
  const pendingCritical = recommendations.filter(
    r => (r.priority === 'critical' || r.priority === 'high') && r.status !== 'completed'
  ).length;
  const growthPotential = `+${pendingCritical * 8}%`;

  const handleStatusChange = useCallback((id: string, status: RecommendationStatus) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status } : rec))
    );
  }, []);

  const handleFixNow = useCallback((id: string) => {
    console.log('Fix now clicked for:', id);
    // In a real app, this would navigate to a detailed fix page or open a modal
  }, []);

  const handleClearFilters = useCallback(() => {
    setPriorityFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  }, []);

  // Filter recommendations
  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesPriority = priorityFilter === 'all' || rec.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || rec.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Actionable Fixes"
        subtitle="Prioritized checklist of structural and content optimizations to improve your brand's AI perception."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              Export Report
            </Button>
            <Button className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Analysis
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          label="Actions Completed"
          value={`${completionPercentage}%`}
          icon={CheckCircle}
          iconColor="success"
        />
        <QuickStatCard
          label="Growth Potential"
          value={growthPotential}
          change={pendingCritical > 0 ? pendingCritical * 2 : 0}
          changePeriod="when completed"
          icon={TrendingUp}
          iconColor="success"
        />
        <QuickStatCard
          label="AI Visibility Score"
          value="72/100"
          icon={BarChart3}
          iconColor="primary"
        />
        <QuickStatCard
          label="Critical Issues"
          value={criticalCount}
          icon={Zap}
          iconColor={criticalCount > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Filters */}
      <RecommendationFilters
        priorityFilters={priorityFilters}
        typeFilters={typeFilters}
        selectedPriority={priorityFilter}
        selectedType={typeFilter}
        selectedStatus={statusFilter}
        searchQuery={searchQuery}
        onPriorityChange={setPriorityFilter}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onClearFilters={handleClearFilters}
      />

      {/* Progress bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Next Milestone: Semantic Clarity (80%)
            </span>
            <span className="text-sm font-medium text-foreground">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recommendations list */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No recommendations match your filters.
              </p>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              id={recommendation.id}
              type={recommendation.type}
              priority={recommendation.priority}
              title={recommendation.title}
              description={recommendation.description || undefined}
              whyMatters={recommendation.why_matters || undefined}
              action={recommendation.action || undefined}
              estimatedImpact={recommendation.estimated_impact || undefined}
              estimatedTime={recommendation.estimated_time || undefined}
              codeSnippet={recommendation.code_snippet || undefined}
              executionSteps={recommendation.execution_steps}
              status={recommendation.status}
              onStatusChange={handleStatusChange}
              onFixNow={handleFixNow}
            />
          ))
        )}
      </div>

      {/* GEO Assistant */}
      <GeoAssistant currentPage="recommendations" />
    </div>
  );
}
