/**
 * ActivityFeed Component
 *
 * Displays a list of recent activities with timestamps,
 * icons, and optional score impact indicators.
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  AlertTriangle,
  FileEdit,
  RefreshCw,
  Zap,
  TrendingUp,
  TrendingDown,
  LucideIcon,
} from 'lucide-react';

interface Activity {
  /** Activity unique identifier */
  id: string;
  /** Activity type for icon selection */
  type: 'audit' | 'recommendation' | 'content' | 'alert' | 'score_change' | 'optimization';
  /** Activity title */
  title: string;
  /** Activity description */
  description?: string;
  /** When the activity occurred */
  timestamp: string;
  /** Score impact (positive or negative) */
  impact?: number;
  /** User who performed the action */
  user?: string;
}

interface ActivityFeedProps {
  /** List of activities to display */
  activities: Activity[];
  /** Maximum number of activities to show */
  maxItems?: number;
  /** Card title */
  title?: string;
  /** Show "View all" link */
  showViewAll?: boolean;
  /** Callback when "View all" is clicked */
  onViewAll?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const activityConfig: Record<
  Activity['type'],
  { icon: LucideIcon; color: string; bgColor: string }
> = {
  audit: {
    icon: RefreshCw,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  recommendation: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
  },
  content: {
    icon: FileEdit,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
  alert: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
  },
  score_change: {
    icon: Zap,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
  },
  optimization: {
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
};

export function ActivityFeed({
  activities,
  maxItems = 5,
  title = 'Recent Activity',
  showViewAll = true,
  onViewAll,
  className,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {showViewAll && activities.length > maxItems && (
            <button
              onClick={onViewAll}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              return (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-start gap-3',
                    index !== displayedActivities.length - 1 &&
                      'pb-4 border-b border-border'
                  )}
                >
                  {/* Icon */}
                  <div className={cn('p-2 rounded-lg', config.bgColor)}>
                    <Icon className={cn('w-4 h-4', config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm">
                        {activity.title}
                      </p>
                      {activity.impact !== undefined && (
                        <span
                          className={cn(
                            'flex items-center text-xs font-medium',
                            activity.impact >= 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          )}
                        >
                          {activity.impact >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-0.5" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-0.5" />
                          )}
                          {activity.impact >= 0 ? '+' : ''}
                          {activity.impact} pts
                        </span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                      {activity.user && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {activity.user}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
