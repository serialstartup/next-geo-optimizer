'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Content, EntityDensity } from '@/types/database';
import {
  FileText,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface ContentListProps {
  /** List of content items */
  contents: Content[];
  /** Currently selected content ID */
  selectedContentId?: string;
  /** Callback when a content item is selected */
  onSelectContent: (content: Content) => void;
  /** Additional CSS classes */
  className?: string;
}

/** Sort options for content list */
type SortOption = 'score_asc' | 'score_desc' | 'date_asc' | 'date_desc' | 'title';

const getScoreColor = (score: number | null): string => {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
};

const getStatusBadge = (content: Content) => {
  if (content.optimized_content) {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
        Optimized
      </Badge>
    );
  }
  if (content.geo_score && content.geo_score < 60) {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
        Needs Work
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
      Pending
    </Badge>
  );
};

const getDensityLabel = (density: EntityDensity | null): string => {
  if (!density) return 'Unknown';
  const labels: Record<EntityDensity, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };
  return labels[density];
};

const getDensityColor = (density: EntityDensity | null): string => {
  if (!density) return 'text-muted-foreground';
  const colors: Record<EntityDensity, string> = {
    low: 'text-red-400',
    medium: 'text-amber-400',
    high: 'text-emerald-400',
  };
  return colors[density];
};

const getTrendIcon = (score: number | null, previousScore: number | null) => {
  if (previousScore === null || score === null) {
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  }
  const diff = score - previousScore;
  if (diff > 0) {
    return <TrendingUp className="w-3 h-3 text-emerald-400" />;
  }
  if (diff < 0) {
    return <TrendingDown className="w-3 h-3 text-red-400" />;
  }
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

export function ContentList({
  contents,
  selectedContentId,
  onSelectContent,
  className,
}: ContentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('score_desc');
  const [densityFilter, setDensityFilter] = useState<EntityDensity | 'all'>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');

  // Filter and sort contents
  const filteredContents = useMemo(() => {
    let result = [...contents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (content) =>
          content.title?.toLowerCase().includes(query) ||
          content.url.toLowerCase().includes(query)
      );
    }

    // Entity density filter
    if (densityFilter !== 'all') {
      result = result.filter((content) => content.entity_density === densityFilter);
    }

    // Score range filter
    if (scoreFilter !== 'all') {
      const [min, max] = scoreFilter.split('-').map(Number);
      if (max) {
        result = result.filter(
          (content) =>
            content.geo_score !== null &&
            content.geo_score >= min &&
            content.geo_score <= max
        );
      } else {
        result = result.filter(
          (content) => content.geo_score !== null && content.geo_score >= min
        );
      }
    }

    // Sort
    switch (sortBy) {
      case 'score_asc':
        result.sort((a, b) => (a.geo_score || 0) - (b.geo_score || 0));
        break;
      case 'score_desc':
        result.sort((a, b) => (b.geo_score || 0) - (a.geo_score || 0));
        break;
      case 'date_asc':
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'date_desc':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'title':
        result.sort((a, b) =>
          (a.title || '').localeCompare(b.title || '')
        );
        break;
    }

    return result;
  }, [contents, searchQuery, sortBy, densityFilter, scoreFilter]);

  return (
    <Card className={cn('bg-card border-border h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Content Items
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {filteredContents.length} / {contents.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={densityFilter}
            onValueChange={(value) => setDensityFilter(value as EntityDensity | 'all')}
          >
            <SelectTrigger className="flex-1 min-w-[100px] bg-muted border-border h-8">
              <SelectValue placeholder="Density" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Density</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={scoreFilter}
            onValueChange={setScoreFilter}
          >
            <SelectTrigger className="flex-1 min-w-[100px] bg-muted border-border h-8">
              <SelectValue placeholder="Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="80-100">80-100 (Good)</SelectItem>
              <SelectItem value="60-79">60-79 (Fair)</SelectItem>
              <SelectItem value="0-59">0-59 (Poor)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="flex-1 bg-muted border-border h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score_desc">Score (High to Low)</SelectItem>
              <SelectItem value="score_asc">Score (Low to High)</SelectItem>
              <SelectItem value="date_desc">Date (Newest)</SelectItem>
              <SelectItem value="date_asc">Date (Oldest)</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredContents.map((content) => (
            <button
              key={content.id}
              onClick={() => onSelectContent(content)}
              className={cn(
                'w-full text-left p-3 rounded-lg transition-all border',
                selectedContentId === content.id
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-muted/50 hover:bg-muted border-transparent hover:border-border'
              )}
            >
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground text-sm truncate">
                      {content.title}
                    </p>
                    {getStatusBadge(content)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {content.url}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        getScoreColor(content.geo_score)
                      )}
                    >
                      {content.geo_score !== null ? `${content.geo_score}%` : 'N/A'}
                    </span>
                    {getTrendIcon(content.geo_score, content.geo_score ? content.geo_score - 5 : null)}
                    <span
                      className={cn('text-xs', getDensityColor(content.entity_density))}
                    >
                      {getDensityLabel(content.entity_density)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filteredContents.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No content found
              </p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>

        {/* Add content button */}
        <Button variant="ghost" className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add Content
        </Button>
      </CardContent>
    </Card>
  );
}
