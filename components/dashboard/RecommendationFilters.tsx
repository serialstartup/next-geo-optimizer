'use client';

/**
 * RecommendationFilters Component
 *
 * Provides filtering UI for recommendations by priority, type, and status.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Filter,
  Search,
  X,
} from 'lucide-react';
import type { PriorityLevel, RecommendationType, RecommendationStatus } from '@/types/database';

interface PriorityFilter {
  id: PriorityLevel | 'all';
  label: string;
  count: number;
}

interface TypeFilter {
  id: RecommendationType | 'all';
  label: string;
}

interface StatusFilter {
  id: RecommendationStatus | 'all';
  label: string;
}

interface RecommendationFiltersProps {
  /** Priority filter options */
  priorityFilters: PriorityFilter[];
  /** Type filter options */
  typeFilters: TypeFilter[];
  /** Status filter options */
  statusFilters?: StatusFilter[];
  /** Current priority filter */
  selectedPriority: PriorityLevel | 'all';
  /** Current type filter */
  selectedType: RecommendationType | 'all';
  /** Current status filter */
  selectedStatus: RecommendationStatus | 'all';
  /** Search query */
  searchQuery: string;
  /** Callback when priority filter changes */
  onPriorityChange: (priority: PriorityLevel | 'all') => void;
  /** Callback when type filter changes */
  onTypeChange: (type: RecommendationType | 'all') => void;
  /** Callback when status filter changes */
  onStatusChange: (status: RecommendationStatus | 'all') => void;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Callback when filters are cleared */
  onClearFilters: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function RecommendationFilters({
  priorityFilters,
  typeFilters,
  statusFilters = [
    { id: 'all', label: 'All Status' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'dismissed', label: 'Dismissed' },
  ],
  selectedPriority,
  selectedType,
  selectedStatus,
  searchQuery,
  onPriorityChange,
  onTypeChange,
  onStatusChange,
  onSearchChange,
  onClearFilters,
  className,
}: RecommendationFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    selectedPriority !== 'all' ||
    selectedType !== 'all' ||
    selectedStatus !== 'all' ||
    searchQuery !== '';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main filters row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Priority tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
          {priorityFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onPriorityChange(filter.id)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                selectedPriority === filter.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {filter.label}
              <span className="ml-1.5 text-xs opacity-60">({filter.count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search fixes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>

        {/* Advanced filters toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          {showAdvanced ? 'Hide Filters' : 'More Filters'}
        </Button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
          {/* Type filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Category
            </label>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value as RecommendationType | 'all')}
              className="px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {typeFilters.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value as RecommendationStatus | 'all')}
              className="px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {statusFilters.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
