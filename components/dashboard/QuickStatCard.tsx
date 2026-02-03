/**
 * QuickStatCard Component
 *
 * A compact card for displaying key metrics on the dashboard overview.
 * Shows a label, value, optional change indicator, and icon.
 */

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface QuickStatCardProps {
  /** Label for the stat */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Optional change value (positive or negative) */
  change?: number;
  /** Change period description */
  changePeriod?: string;
  /** Icon to display */
  icon?: LucideIcon;
  /** Icon color variant */
  iconColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Additional CSS classes */
  className?: string;
}

const iconColorConfig = {
  primary: 'text-primary bg-primary/10',
  success: 'text-emerald-400 bg-emerald-400/10',
  warning: 'text-amber-400 bg-amber-400/10',
  danger: 'text-red-400 bg-red-400/10',
  info: 'text-blue-400 bg-blue-400/10',
};

export function QuickStatCard({
  label,
  value,
  change,
  changePeriod = 'vs last week',
  icon: Icon = BarChart3,
  iconColor = 'primary',
  className,
}: QuickStatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined;

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {value}
              </span>
              {hasChange && (
                <span
                  className={cn(
                    'flex items-center text-sm font-medium',
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-0.5" />
                  )}
                  {isPositive ? '+' : ''}
                  {change}%
                </span>
              )}
            </div>
            {hasChange && (
              <p className="text-xs text-muted-foreground">{changePeriod}</p>
            )}
          </div>
          <div
            className={cn(
              'p-3 rounded-lg',
              iconColorConfig[iconColor]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
