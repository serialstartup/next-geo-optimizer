'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  AlignLeft,
  HelpCircle,
  RefreshCw,
  Check,
  X,
  Copy,
  Download,
  Share2,
  Eye,
  History,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Entity, Content } from '@/types/database';

interface Change {
  /** Change unique identifier */
  id: string;
  /** Type of change */
  type: 'addition' | 'modification' | 'deletion' | 'reorganization';
  /** Original text segment */
  originalText?: string;
  /** New text segment */
  newText?: string;
  /** Reason for the change */
  reason: string;
  /** Line number where change occurs */
  lineNumber?: number;
  /** Whether the change has been accepted */
  accepted?: boolean;
  /** Whether the change has been rejected */
  rejected?: boolean;
}

interface ContentEditorProps {
  /** Content object containing all content data */
  content: Content;
  /** Original content text (if not using content object) */
  originalContent?: string;
  /** AI-optimized content (if not using content object) */
  optimizedContent?: string;
  /** Callback when content is saved */
  onSave?: (content: string) => void;
  /** Callback when optimization is accepted */
  onAcceptOptimization?: () => void;
  /** Callback when optimization is rejected */
  onRejectOptimization?: () => void;
  /** Callback when individual change is accepted */
  onAcceptChange?: (changeId: string) => void;
  /** Callback when individual change is rejected */
  onRejectChange?: (changeId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

const entityDensityLabels = {
  low: { label: 'Low', color: 'text-red-400', status: 'Needs improvement' },
  medium: { label: 'Medium', color: 'text-amber-400', status: 'Adequate' },
  high: { label: 'High', color: 'text-emerald-400', status: 'Optimal' },
};

const getScoreColor = (score: number | null): string => {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreBadge = (score: number | null): { label: string; variant: 'default' | 'secondary' | 'destructive' } => {
  if (score === null) return { label: 'N/A', variant: 'secondary' };
  if (score >= 80) return { label: 'Excellent', variant: 'default' };
  if (score >= 60) return { label: 'Good', variant: 'secondary' };
  return { label: 'Needs Work', variant: 'destructive' };
};

export function ContentEditor({
  content,
  originalContent,
  optimizedContent,
  onSave,
  onAcceptOptimization,
  onRejectOptimization,
  onAcceptChange,
  onRejectChange,
  className,
}: ContentEditorProps) {
  const [editedContent, setEditedContent] = useState(
    optimizedContent || content.optimized_content || content.original_content || ''
  );
  const [syncScroll, setSyncScroll] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [showDiff, setShowDiff] = useState(true);

  // Generate mock changes from original to optimized
  const changes: Change[] = [
    {
      id: 'change-1',
      type: 'reorganization',
      originalText: '# API Reference\n\nWelcome to the Acme Tech API documentation...',
      newText: '# API Reference Documentation\n\n**Quick Start:** Authenticate with OAuth 2.0...',
      reason: 'Added summary section for immediate context',
      lineNumber: 1,
    },
    {
      id: 'change-2',
      type: 'addition',
      originalText: 'The Acme Tech API uses API keys...',
      newText: '## Authentication\n\n1. Get your API key from the Dashboard\n2. Include it in the Authorization header\n3. Never expose keys in public repositories',
      reason: 'Expanded authentication section with step-by-step guide',
      lineNumber: 15,
    },
    {
      id: 'change-3',
      type: 'addition',
      originalText: 'The API has rate limits...',
      newText: '## Rate Limits Explained\n\n| Plan | Requests/Minute | Burst Limit |\n|------|-----------------|-------------|\n| Free | 100 | 150 |\n| Standard | 1,000 | 1,500 |\n| Enterprise | 10,000 | 15,000 |',
      reason: 'Added rate limit table for better readability',
      lineNumber: 25,
    },
    {
      id: 'change-4',
      type: 'modification',
      originalText: 'be sure to keep them secure',
      newText: 'keep them secure - never expose keys in client-side code or public repositories',
      reason: 'Clarified security best practices',
      lineNumber: 18,
    },
  ];

  const handleAcceptAll = useCallback(() => {
    changes.forEach((change) => {
      if (onAcceptChange) onAcceptChange(change.id);
    });
    if (onAcceptOptimization) onAcceptOptimization();
  }, [changes, onAcceptChange, onAcceptOptimization]);

  const handleRejectAll = useCallback(() => {
    changes.forEach((change) => {
      if (onRejectChange) onRejectChange(change.id);
    });
    if (onRejectOptimization) onRejectOptimization();
  }, [changes, onRejectChange, onRejectOptimization]);

  const wordCount = (content.original_content || '').split(/\s+/).filter(Boolean).length;
  const optimizedWordCount = editedContent.split(/\s+/).filter(Boolean).length;
  const scoreChange = (content.geo_score || 0) - 65; // Mock baseline score

  const originalLines = (content.original_content || '').split('\n');
  const optimizedLines = editedContent.split('\n');

  const handleScroll = (
    source: 'original' | 'optimized',
    event: React.UIEvent<HTMLTextAreaElement | HTMLDivElement>
  ) => {
    if (!syncScroll) return;
    const target = event.currentTarget;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
    
    const otherElement = source === 'original'
      ? document.getElementById('optimized-content')
      : document.getElementById('original-content');
    
    if (otherElement) {
      otherElement.scrollTop = percentage * (otherElement.scrollHeight - otherElement.clientHeight);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Current GEO Score
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={cn('text-2xl font-bold', getScoreColor(content.geo_score))}>
                    {content.geo_score || 0}%
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  getScoreBadge(content.geo_score).variant === 'default' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                  getScoreBadge(content.geo_score).variant === 'secondary' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                  getScoreBadge(content.geo_score).variant === 'destructive' && 'bg-red-500/20 text-red-400 border-red-500/30'
                )}
              >
                {getScoreBadge(content.geo_score).label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Entity Density
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={cn('text-2xl font-bold', entityDensityLabels[content.entity_density || 'medium'].color)}>
                {entityDensityLabels[content.entity_density || 'medium'].label}
              </span>
              <span className={cn('text-sm', entityDensityLabels[content.entity_density || 'medium'].color)}>
                {entityDensityLabels[content.entity_density || 'medium'].status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Citation Potential
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">
                {content.citation_potential?.toFixed(1) || '0.0'}/10
              </span>
              <span className="text-sm text-amber-400">
                {content.citation_potential && content.citation_potential >= 7 ? 'Excellent' : 'Needs FAQ'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Predicted Score
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">
                +{scoreChange > 0 ? scoreChange : 0}%
              </span>
              <span className="text-sm text-emerald-400">
                after optimization
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="default" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Inject Entity Relationships
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <AlignLeft className="w-4 h-4" />
          Restructure for Answer-First
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          Generate FAQ Snippets
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSyncScroll(!syncScroll)}
          className={cn(syncScroll && 'bg-muted')}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Sync Scroll
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode(viewMode === 'split' ? 'unified' : 'split')}
          className={cn(viewMode === 'unified' && 'bg-muted')}
        >
          {viewMode === 'split' ? 'Unified View' : 'Split View'}
        </Button>
      </div>

      {/* Main editor area - Split view */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel - Original content */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Original Content
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {wordCount} words
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Read-only
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div
                id="original-content"
                className="prose prose-sm prose-invert max-w-none min-h-[400px] max-h-[600px] overflow-y-auto"
                onScroll={(e) => handleScroll('original', e)}
              >
                <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {content.original_content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right panel - Optimized content */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    AI-Optimized Version
                  </CardTitle>
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    IMPROVED
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {optimizedWordCount} words ({optimizedWordCount - wordCount > 0 ? '+' : ''}{optimizedWordCount - wordCount})
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <textarea
                id="optimized-content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onScroll={(e) => handleScroll('optimized', e)}
                className="w-full min-h-[400px] max-h-[600px] bg-transparent text-sm text-foreground leading-relaxed resize-none focus:outline-none"
              />

              {/* GEO Insight */}
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase mb-1">
                      GEO Insight
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Added technical terminology (OAuth 2.0, REST, JSON) and restructured 
                      content for answer-first format. This increases semantic density for 
                      AI ranking models.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Unified view */}
      {viewMode === 'unified' && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Content Comparison
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={showDiff ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowDiff(!showDiff)}
                >
                  {showDiff ? 'Show Diff' : 'Hide Diff'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              {changes.map((change, index) => (
                <div
                  key={change.id}
                  className={cn(
                    'rounded-lg border p-4 transition-all',
                    change.accepted
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : change.rejected
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-muted/50 border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          change.type === 'addition' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                          change.type === 'modification' && 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                          change.type === 'deletion' && 'bg-red-500/20 text-red-400 border-red-500/30',
                          change.type === 'reorganization' && 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        )}
                      >
                        {change.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Line {change.lineNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {change.accepted ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Accepted
                        </span>
                      ) : change.rejected ? (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAcceptChange?.(change.id)}
                            className="h-6 px-2 text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRejectChange?.(change.id)}
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {change.reason}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Original</p>
                      <div className="p-2 rounded bg-muted/50 text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                        {change.originalText || '(empty)'}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Optimized</p>
                      <div className="p-2 rounded bg-emerald-500/10 text-xs text-foreground font-mono whitespace-pre-wrap">
                        {change.newText || '(empty)'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Changes summary */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {changes.filter(c => !c.accepted && !c.rejected).length} pending changes
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-emerald-400">
                  {changes.filter(c => c.accepted).length} accepted
                </span>
                <span className="text-sm text-red-400">
                  {changes.filter(c => c.rejected).length} rejected
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRejectAll}>
                <RotateCcw className="w-4 h-4" />
                Reject All Changes
              </Button>
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handleAcceptAll}>
                <Check className="w-4 h-4" />
                Accept All Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Last updated: {new Date(content.updated_at).toLocaleDateString()}
          </span>
          {content.last_optimized_at && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                Last optimized: {new Date(content.last_optimized_at).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onSave?.(editedContent)}
            className="gap-2"
          >
            Save Changes
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
