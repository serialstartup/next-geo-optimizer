/**
 * StatusBadge Component
 *
 * Displays a status indicator badge with color coding based on status level.
 * Used throughout the dashboard to show score statuses and alert levels.
 */

import { cn } from '@/lib/utils';
import type { ScoreStatus } from '@/types/database';

interface StatusBadgeProps {
  /** Status level to display */
  status: ScoreStatus | 'good' | 'warning' | 'critical';
  /** Optional label text (defaults to status name) */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const statusConfig = {
  excellent: {
    label: 'Excellent',
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  optimal: {
    label: 'Optimal',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    dotColor: 'bg-blue-400',
  },
  improving: {
    label: 'Improving',
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    dotColor: 'bg-amber-400',
  },
  needs_focus: {
    label: 'Needs Focus',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    dotColor: 'bg-red-400',
  },
  good: {
    label: 'Good',
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  warning: {
    label: 'Warning',
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    dotColor: 'bg-amber-400',
  },
  critical: {
    label: 'Critical',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    dotColor: 'bg-red-400',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    dot: 'w-2 h-2',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    dot: 'w-2.5 h-2.5',
  },
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bgColor,
        config.textColor,
        sizeStyles.padding,
        sizeStyles.text,
        className
      )}
    >
      <span className={cn('rounded-full', config.dotColor, sizeStyles.dot)} />
      {label || config.label}
    </span>
  );
}
