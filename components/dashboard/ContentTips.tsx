'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  AlignLeft,
  HelpCircle,
  FileQuestion,
  Search,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Zap,
} from 'lucide-react';

interface Tip {
  /** Tip unique identifier */
  id: string;
  /** Tip category */
  category: 'entity' | 'answer_first' | 'faq' | 'snippet' | 'structure' | 'clarity';
  /** Tip title */
  title: string;
  /** Detailed description */
  description: string;
  /** Example or code snippet */
  example?: string;
  /** Expected impact score */
  impact?: number;
  /** Whether the tip has been applied */
  applied?: boolean;
}

interface ContentTipsProps {
  /** List of optimization tips */
  tips: Tip[];
  /** Title of the tips section */
  title?: string;
  /** Callback when a tip is applied */
  onApplyTip?: (tipId: string) => void;
  /** Callback when a tip is dismissed */
  onDismissTip?: (tipId: string) => void;
  /** Callback when all tips are accepted */
  onAcceptAll?: () => void;
  /** Callback when all tips are dismissed */
  onDismissAll?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const categoryConfig = {
  entity: {
    icon: Sparkles,
    label: 'Entity',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  answer_first: {
    icon: Target,
    label: 'Answer-First',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  faq: {
    icon: HelpCircle,
    label: 'FAQ',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  snippet: {
    icon: FileQuestion,
    label: 'Snippet',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  structure: {
    icon: AlignLeft,
    label: 'Structure',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  clarity: {
    icon: Lightbulb,
    label: 'Clarity',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
};

export function ContentTips({
  tips,
  title = 'Optimization Tips',
  onApplyTip,
  onDismissTip,
  onAcceptAll,
  onDismissAll,
  className,
}: ContentTipsProps) {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayedTips = showAll ? tips : tips.slice(0, 5);
  const appliedCount = tips.filter((t) => t.applied).length;
  const pendingTips = tips.filter((t) => !t.applied);

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {pendingTips.length} pending
            </Badge>
          </div>
          {pendingTips.length > 0 && (
            <div className="flex items-center gap-2">
              {onAcceptAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAcceptAll}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Accept All
                </Button>
              )}
              {onDismissAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismissAll}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Dismiss All
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Applied tips summary */}
        {appliedCount > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">
              {appliedCount} tip{appliedCount > 1 ? 's' : ''} applied
            </span>
          </div>
        )}

        {/* Tips list */}
        {displayedTips.map((tip) => {
          const config = categoryConfig[tip.category];
          const Icon = config.icon;
          const isApplied = tip.applied;
          const isExpanded = expandedTip === tip.id;

          return (
            <div
              key={tip.id}
              className={cn(
                'rounded-lg border transition-all',
                isApplied
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-muted/50 border-border hover:border-primary/30'
              )}
            >
              <button
                onClick={() =>
                  setExpandedTip(isExpanded ? null : tip.id)
                }
                className="w-full p-3 text-left"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      config.bgColor
                    )}
                  >
                    <Icon className={cn('w-4 h-4', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {tip.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            config.bgColor,
                            config.color,
                            config.borderColor
                          )}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      {tip.impact !== undefined && (
                        <span
                          className={cn(
                            'text-xs font-medium',
                            tip.impact >= 8
                              ? 'text-emerald-400'
                              : tip.impact >= 5
                              ? 'text-amber-400'
                              : 'text-muted-foreground'
                          )}
                        >
                          +{tip.impact} pts
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {tip.description}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-0 ml-11 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {tip.description}
                  </p>

                  {tip.example && (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Example:
                      </p>
                      <code className="text-xs text-foreground whitespace-pre-wrap">
                        {tip.example}
                      </code>
                    </div>
                  )}

                  {!isApplied && (
                    <div className="flex items-center gap-2">
                      {onApplyTip && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplyTip(tip.id);
                          }}
                          className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-xs"
                        >
                          <Check className="w-3 h-3" />
                          Apply
                        </Button>
                      )}
                      {onDismissTip && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDismissTip(tip.id);
                          }}
                          className="gap-1 text-xs"
                        >
                          <X className="w-3 h-3" />
                          Dismiss
                        </Button>
                      )}
                    </div>
                  )}

                  {isApplied && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Applied successfully</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Show more/less */}
        {tips.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show {tips.length - 5} more tips
              </>
            )}
          </Button>
        )}

        {tips.length === 0 && (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No optimization tips available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your content is already well optimized!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to generate tips from content analysis
export function generateTipsFromContent(content: {
  geoScore: number | null;
  entityDensity: string | null;
  entities: Array<{ status: string }>;
  optimizationTips: string[];
}): Tip[] {
  const tips: Tip[] = [];

  // Add entity-related tips
  const missingEntities = content.entities.filter(
    (e) => e.status === 'missing'
  );
  const weakEntities = content.entities.filter((e) => e.status === 'weak');

  if (missingEntities.length > 0) {
    tips.push({
      id: 'missing-entities',
      category: 'entity',
      title: 'Add Missing Entities',
      description: `Found ${missingEntities.length} important entities that are not mentioned. Adding them will improve entity coverage.`,
      impact: 5,
    });
  }

  if (weakEntities.length > 0) {
    tips.push({
      id: 'weak-entities',
      category: 'entity',
      title: 'Strengthen Entity Definitions',
      description: `${weakEntities.length} entities need stronger context. Add more detailed explanations.`,
      impact: 3,
    });
  }

  // Score-based tips
  if (content.geoScore !== null && content.geoScore < 70) {
    tips.push({
      id: 'answer-first',
      category: 'answer_first',
      title: 'Restructure for Answer-First',
      description:
        'Lead with direct answers before detailed explanations. AI models prioritize concise, direct responses.',
      impact: 8,
      example:
        '## What is X?\n\n**X is a [brief definition].**\n\nDetailed explanation follows...',
    });

    tips.push({
      id: 'add-faq',
      category: 'faq',
      title: 'Add FAQ Section',
      description:
        'FAQ sections are highly valued by AI systems. Include 3-5 common questions and direct answers.',
      impact: 6,
      example:
        '## FAQ\n\n**Q: What is X?**\nA: X is...\n\n**Q: How do I use X?**\nA: To use X...',
    });
  }

  // Entity density tips
  if (content.entityDensity === 'low') {
    tips.push({
      id: 'increase-entity-density',
      category: 'structure',
      title: 'Increase Entity Density',
      description:
        'Add more relevant entities and technical terms to improve semantic richness.',
      impact: 4,
    });
  }

  // Add tips from optimization_tips array
  content.optimizationTips.forEach((tip, index) => {
    tips.push({
      id: `opt-tip-${index}`,
      category: 'structure',
      title: 'Optimization Suggestion',
      description: tip,
      impact: 2,
    });
  });

  return tips;
}
