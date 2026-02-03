/**
 * AlertCard Component
 *
 * Displays an alert notification with severity indicator,
 * message, timestamp, and action buttons.
 */

'use client';

import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Info,
  AlertCircle,
  X,
  ChevronRight,
  Circle,
} from 'lucide-react';
import type { AlertSeverity, AlertType } from '@/types/database';

interface AlertCardProps {
  /** Alert unique identifier */
  id: string;
  /** Alert type */
  type: AlertType;
  /** Severity level */
  severity: AlertSeverity;
  /** Alert title */
  title: string;
  /** Alert message/description */
  message: string;
  /** When the alert was triggered */
  timestamp: string;
  /** Action button label */
  actionLabel?: string;
  /** Callback when action button is clicked */
  onAction?: () => void;
  /** Callback when dismiss button is clicked */
  onDismiss?: () => void;
  /** Whether the alert has been read */
  isRead?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const severityConfig = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-400',
  },
  high: {
    icon: AlertCircle,
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    iconColor: 'text-orange-400',
    badgeBg: 'bg-orange-500/20',
    badgeText: 'text-orange-400',
  },
  critical: {
    icon: AlertTriangle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    iconColor: 'text-red-400',
    badgeBg: 'bg-red-500/20',
    badgeText: 'text-red-400',
  },
};

const severityLabels: Record<AlertSeverity, string> = {
  info: 'INFO',
  warning: 'WARNING',
  high: 'HIGH',
  critical: 'CRITICAL',
};

const typeLabels: Record<AlertType, string> = {
  content_decay: 'Content Decay',
  interpretation_shift: 'Interpretation Shift',
  visibility_drop: 'Visibility Drop',
  score_change: 'Score Change',
  competitor_mention: 'Competitor',
  system: 'System',
};

export function AlertCard({
  id,
  type,
  severity,
  title,
  message,
  timestamp,
  actionLabel,
  onAction,
  onDismiss,
  isRead = true,
  className,
}: AlertCardProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-all',
        config.bgColor,
        config.borderColor,
        !isRead && 'ring-1 ring-primary/30',
        className
      )}
    >
      {/* Unread indicator */}
      {!isRead && (
        <div className="flex-shrink-0 mt-1">
          <Circle className="w-2 h-2 fill-primary text-primary" />
        </div>
      )}

      {/* Icon */}
      <div className={cn('p-2 rounded-lg flex-shrink-0', config.bgColor)}>
        <Icon className={cn('w-5 h-5', config.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="font-medium text-foreground">{title}</h4>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium uppercase',
                config.badgeBg,
                config.badgeText
              )}
            >
              {severityLabels[severity]}
            </span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded">
              {typeLabels[type]}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{message}</p>
      </div>

      {/* Timestamp and actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {timestamp}
        </span>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={cn(
              'text-sm font-medium flex items-center gap-1 hover:underline',
              config.badgeText
            )}
          >
            {actionLabel}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
