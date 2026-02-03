/**
 * AlertFilters Component
 *
 * Filter controls for alerts list including type, severity,
 * read/unread status, and search functionality.
 */

'use client';

import { useState, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { AlertSeverity, AlertType } from '@/types/database';

interface AlertFiltersProps {
  /** Current filter values */
  filters: {
    type: AlertType | 'all';
    severity: AlertSeverity | 'all';
    readStatus: 'all' | 'unread' | 'read';
    search: string;
  };
  /** Callback when filters change */
  onFiltersChange: (filters: AlertFiltersProps['filters']) => void;
  /** Callback to clear all filters */
  onClearFilters: () => void;
  /** Number of active filters */
  activeFilterCount: number;
  /** Disable the component */
  disabled?: boolean;
}

const alertTypes: { value: AlertType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'content_decay', label: 'Content Decay' },
  { value: 'interpretation_shift', label: 'Interpretation Shift' },
  { value: 'visibility_drop', label: 'Visibility Drop' },
  { value: 'score_change', label: 'Score Change' },
  { value: 'competitor_mention', label: 'Competitor Mention' },
  { value: 'system', label: 'System' },
];

const severityLevels: { value: AlertSeverity | 'all'; label: string }[] = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

export function AlertFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  disabled = false,
}: AlertFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = useCallback(
    <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFilterChange('search', e.target.value);
    },
    [handleFilterChange]
  );

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.severity !== 'all' ||
    filters.readStatus !== 'all' ||
    filters.search !== '';

  return (
    <div className="space-y-4">
      {/* Search and filter toggle row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={filters.search}
            onChange={handleSearchChange}
            disabled={disabled}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn('gap-2', isExpanded && 'bg-muted')}
          disabled={disabled}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            disabled={disabled}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded filter options */}
      {isExpanded && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type:</span>
            <Select
              value={filters.type}
              onValueChange={(value) =>
                handleFilterChange('type', value as AlertType | 'all')
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {alertTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Severity:</span>
            <Select
              value={filters.severity}
              onValueChange={(value) =>
                handleFilterChange('severity', value as AlertSeverity | 'all')
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map((severity) => (
                  <SelectItem key={severity.value} value={severity.value}>
                    {severity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Read status filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select
              value={filters.readStatus}
              onValueChange={(value) =>
                handleFilterChange(
                  'readStatus',
                  value as 'all' | 'unread' | 'read'
                )
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
