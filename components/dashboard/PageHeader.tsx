/**
 * PageHeader Component
 *
 * Page header with title, optional timestamp, and action buttons.
 * Used at the top of dashboard pages.
 * Matches the GEO Audit Dashboard design.
 */

import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional timestamp (e.g., "Last audit: October 24, 2025") */
  timestamp?: string;
  /** Action buttons or elements */
  actions?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  timestamp,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8',
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-gray-400 mt-1">{subtitle}</p>
        )}
        {timestamp && (
          <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {timestamp}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
