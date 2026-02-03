'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ContentEditor, ContentList, ContentTips } from '@/components/dashboard';
import { GeoAssistant } from '@/components/dashboard/GeoAssistant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getMockContentsBySiteId,
  getMockContentsNeedingOptimization,
  getMockAverageGeoScore,
} from '@/lib/mock-data';
import { getMockCurrentSite } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
  FileText,
  ChevronRight,
  Eye,
  History,
  RefreshCw,
  Sparkles,
  Target,
  HelpCircle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import type { Content } from '@/types/database';

export default function ContentWorkspacePage() {
  const site = getMockCurrentSite();
  const allContents = getMockContentsBySiteId(site.id);
  const contentsNeedingOptimization = getMockContentsNeedingOptimization(site.id);
  const averageScore = getMockAverageGeoScore(site.id);

  const [selectedContent, setSelectedContent] = useState<Content | null>(
    allContents[0] || null
  );
  const [appliedTips, setAppliedTips] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'editor' | 'tips'>('editor');

  const handleSelectContent = useCallback((content: Content) => {
    setSelectedContent(content);
    setAppliedTips(new Set());
  }, []);

  const handleSave = useCallback((content: string) => {
    console.log('Saving content:', content);
  }, []);

  const handleApplyTip = useCallback((tipId: string) => {
    setAppliedTips((prev) => new Set([...prev, tipId]));
    console.log('Applied tip:', tipId);
  }, []);

  const handleDismissTip = useCallback((tipId: string) => {
    console.log('Dismissed tip:', tipId);
  }, []);

  const handleAcceptAllTips = useCallback(() => {
    const tipIds = selectedContent?.optimization_tips.map((_, index) => `tip-${index}`) || [];
    setAppliedTips(new Set(tipIds));
    console.log('Accepted all tips');
  }, [selectedContent]);

  const handleDismissAllTips = useCallback(() => {
    console.log('Dismissed all tips');
  }, []);

  const handleAcceptChange = useCallback((changeId: string) => {
    console.log('Accepted change:', changeId);
  }, []);

  const handleRejectChange = useCallback((changeId: string) => {
    console.log('Rejected change:', changeId);
  }, []);

  const handleAcceptOptimization = useCallback(() => {
    console.log('Accepted optimization');
  }, []);

  const handleRejectOptimization = useCallback(() => {
    console.log('Rejected optimization');
  }, []);

  // Generate tips from content
  const tips = selectedContent?.optimization_tips.map((tip, index) => ({
    id: `tip-${index}`,
    category: 'structure' as const,
    title: `Tip ${index + 1}`,
    description: tip,
    applied: appliedTips.has(`tip-${index}`),
  })) || [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{site.name}</span>
        <ChevronRight className="w-4 h-4" />
        <span>Website Content</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">
          Content Improvement Workspace
        </span>
      </div>

      {/* Header */}
      <PageHeader
        title={selectedContent?.title || 'Content Workspace'}
        subtitle="Optimize your content for AI visibility with side-by-side editing and real-time scoring."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              Live Preview
            </Button>
            <Button variant="outline" className="gap-2">
              <History className="w-4 h-4" />
              History
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Re-analyze
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Sparkles className="w-4 h-4" />
              Generate Optimization
            </Button>
          </div>
        }
      />

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Avg. GEO Score
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {averageScore}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Pages
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {allContents.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Needs Optimization
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {contentsNeedingOptimization.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Optimized Pages
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {allContents.length - contentsNeedingOptimization.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('editor')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'editor'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Content Editor
        </button>
        <button
          onClick={() => setActiveTab('tips')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'tips'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Optimization Tips
          {tips.filter(t => !t.applied).length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {tips.filter(t => !t.applied).length}
            </Badge>
          )}
        </button>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content list sidebar */}
        <div className="lg:col-span-1">
          <ContentList
            contents={allContents}
            selectedContentId={selectedContent?.id}
            onSelectContent={handleSelectContent}
          />
        </div>

        {/* Main editor/tips area */}
        <div className="lg:col-span-3">
          {selectedContent ? (
            activeTab === 'editor' ? (
              <ContentEditor
                content={selectedContent}
                onSave={handleSave}
                onAcceptChange={handleAcceptChange}
                onRejectChange={handleRejectChange}
                onAcceptOptimization={handleAcceptOptimization}
                onRejectOptimization={handleRejectOptimization}
              />
            ) : (
              <div className="space-y-6">
                {/* Tips panel */}
                <ContentTips
                  tips={tips}
                  title={`Optimization Tips for "${selectedContent.title}"`}
                  onApplyTip={handleApplyTip}
                  onDismissTip={handleDismissTip}
                  onAcceptAll={handleAcceptAllTips}
                  onDismissAll={handleDismissAllTips}
                />

                {/* Entity suggestions */}
                {selectedContent.entities && selectedContent.entities.length > 0 && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3 border-b border-border">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Entity Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                          <p className="text-2xl font-bold text-emerald-400">
                            {selectedContent.entities.filter(e => e.status === 'detected').length}
                          </p>
                          <p className="text-xs text-muted-foreground">Detected</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-amber-500/10">
                          <p className="text-2xl font-bold text-amber-400">
                            {selectedContent.entities.filter(e => e.status === 'weak').length}
                          </p>
                          <p className="text-xs text-muted-foreground">Weak</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-red-500/10">
                          <p className="text-2xl font-bold text-red-400">
                            {selectedContent.entities.filter(e => e.status === 'missing').length}
                          </p>
                          <p className="text-xs text-muted-foreground">Missing</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {selectedContent.entities.slice(0, 8).map((entity, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-foreground">{entity.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {entity.type}
                              </Badge>
                            </div>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium uppercase',
                                entity.status === 'detected' && 'bg-emerald-500/20 text-emerald-400',
                                entity.status === 'weak' && 'bg-amber-500/20 text-amber-400',
                                entity.status === 'missing' && 'bg-red-500/20 text-red-400'
                              )}
                            >
                              {entity.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button variant="ghost" className="w-full mt-3 text-sm">
                        View all {selectedContent.entities.length} entities →
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Select Content
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a content item from the list to start optimizing
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* GEO Assistant */}
      <GeoAssistant currentPage="content" />
    </div>
  );
}
