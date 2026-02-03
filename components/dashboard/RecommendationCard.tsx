'use client';

/**
 * RecommendationCard Component
 *
 * Displays a recommendation with priority badge, description,
 * why it matters, action to take, and status controls.
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  Check,
  X,
  Lightbulb,
  Zap,
  Code,
} from 'lucide-react';
import type {
  PriorityLevel,
  RecommendationStatus,
  RecommendationType,
  ExecutionStep,
} from '@/types/database';

interface RecommendationCardProps {
  /** Recommendation unique identifier */
  id: string;
  /** Recommendation type/category */
  type: RecommendationType;
  /** Priority level */
  priority: PriorityLevel;
  /** Recommendation title */
  title: string;
  /** Detailed description */
  description?: string;
  /** Why this matters for AI */
  whyMatters?: string;
  /** Recommended action */
  action?: string;
  /** Expected impact */
  estimatedImpact?: string;
  /** Time estimate */
  estimatedTime?: string;
  /** Code snippet if applicable */
  codeSnippet?: string;
  /** Execution steps */
  executionSteps?: ExecutionStep[];
  /** Current status */
  status: RecommendationStatus;
  /** Callback when status changes */
  onStatusChange?: (id: string, status: RecommendationStatus) => void;
  /** Callback when "Fix Now" is clicked */
  onFixNow?: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
}

const priorityConfig = {
  critical: {
    label: 'CRITICAL IMPACT',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
  },
  high: {
    label: 'HIGH IMPACT',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
  },
  medium: {
    label: 'MEDIUM IMPACT',
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
  },
  low: {
    label: 'LOW IMPACT',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
  },
};

const typeLabels: Record<RecommendationType, string> = {
  semantic_structure: 'Semantic Structure',
  citation_health: 'Citation Health',
  entity_definition: 'Entity Definition',
  answer_first: 'Answer-First',
  schema_markup: 'Schema Markup',
  content_clarity: 'Content Clarity',
  other: 'Other',
};

const typeIcons: Record<RecommendationType, React.ReactNode> = {
  semantic_structure: <Code className="w-4 h-4" />,
  citation_health: <Lightbulb className="w-4 h-4" />,
  entity_definition: <Zap className="w-4 h-4" />,
  answer_first: <Lightbulb className="w-4 h-4" />,
  schema_markup: <Code className="w-4 h-4" />,
  content_clarity: <Lightbulb className="w-4 h-4" />,
  other: <Lightbulb className="w-4 h-4" />,
};

export function RecommendationCard({
  id,
  type,
  priority,
  title,
  description,
  whyMatters,
  action,
  estimatedImpact,
  estimatedTime,
  codeSnippet,
  executionSteps,
  status,
  onStatusChange,
  onFixNow,
  className,
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = priorityConfig[priority];

  const handleStart = () => {
    onStatusChange?.(id, 'in_progress');
  };

  const handleComplete = () => {
    onStatusChange?.(id, 'completed');
  };

  const handleDismiss = () => {
    onStatusChange?.(id, 'dismissed');
  };

  const isCompleted = status === 'completed';
  const isDismissed = status === 'dismissed';
  const isInProgress = status === 'in_progress';

  return (
    <Card
      className={cn(
        'bg-card border-border transition-all',
        isCompleted && 'opacity-60',
        isDismissed && 'opacity-40',
        className
      )}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Priority and Type badges */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={cn(
                  'px-2 py-1 rounded text-xs font-semibold uppercase',
                  config.bgColor,
                  config.textColor
                )}
              >
                {config.label}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
                {typeIcons[type]}
                {typeLabels[type]}
              </span>
            </div>

            {/* Title */}
            <h3
              className={cn(
                'text-lg font-semibold text-foreground',
                isCompleted && 'line-through'
              )}
            >
              {title}
            </h3>
          </div>

          {/* Time estimate and action */}
          <div className="flex flex-col items-end gap-2">
            {estimatedTime && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Est. Time</span>
                <span className="font-semibold text-foreground">
                  {estimatedTime}
                </span>
              </div>
            )}
            {!isCompleted && !isDismissed && (
              <Button
                onClick={() => onFixNow?.(id)}
                variant={priority === 'critical' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  priority === 'critical' && 'bg-primary hover:bg-primary/90'
                )}
              >
                {isInProgress ? 'Continue' : 'Fix Now'}
              </Button>
            )}
          </div>
        </div>

        {/* Why this matters and Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {whyMatters && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Why This Matters for AI
              </h4>
              <p className="text-sm text-foreground/80">{whyMatters}</p>
            </div>
          )}
          {action && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Action to Take
              </h4>
              <p className="text-sm text-foreground/80">{action}</p>
            </div>
          )}
        </div>

        {/* Expandable section */}
        {(codeSnippet || description || estimatedImpact || executionSteps) && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 mt-4 text-sm text-primary hover:underline"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  View details
                </>
              )}
            </button>

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                {description && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-foreground/80">{description}</p>
                  </div>
                )}

                {estimatedImpact && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <Zap className="w-5 h-5 text-primary" />
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase">
                        Impact Prediction
                      </span>
                      <p className="text-sm text-foreground">
                        {estimatedImpact}
                      </p>
                    </div>
                  </div>
                )}

                {codeSnippet && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Code Snippet
                    </h4>
                    <pre className="p-3 rounded-lg bg-muted text-sm overflow-x-auto">
                      <code className="text-foreground/90">{codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {executionSteps && executionSteps.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      What to Change
                    </h4>
                    <ol className="space-y-2">
                      {executionSteps.map((step) => (
                        <li key={step.order} className="flex gap-3 text-sm">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
                            {step.order}
                          </span>
                          <div>
                            <span className="font-medium text-foreground">{step.action}</span>
                            {step.details && (
                              <p className="text-muted-foreground mt-0.5">{step.details}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Status actions */}
        {!isCompleted && !isDismissed && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            {!isInProgress && (
              <Button
                onClick={handleStart}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            )}
            <Button
              onClick={handleComplete}
              variant="ghost"
              size="sm"
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Dismiss
            </Button>
          </div>
        )}

        {/* Completed/Dismissed status */}
        {(isCompleted || isDismissed) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <span
              className={cn(
                'flex items-center gap-1 text-sm',
                isCompleted ? 'text-emerald-400' : 'text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <>
                  <Check className="w-4 h-4" />
                  Completed
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Dismissed
                </>
              )}
            </span>
            <Button
              onClick={() => onStatusChange?.(id, 'pending')}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground ml-auto"
            >
              Reopen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
