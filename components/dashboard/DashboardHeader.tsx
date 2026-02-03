'use client';

/**
 * DashboardHeader Component
 *
 * Top header bar for dashboard pages.
 * Contains mobile menu toggle, search, and quick actions.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
} from 'lucide-react';

interface DashboardHeaderProps {
  /** Callback to toggle mobile sidebar */
  onMenuToggle?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function DashboardHeader({
  onMenuToggle,
  className,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between gap-4',
        'h-16 px-4 lg:px-6 bg-background/95 backdrop-blur',
        'border-b border-border',
        className
      )}
    >
      {/* Left side - Mobile menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div className="relative max-w-md flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search pages, audits, recommendations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-transparent focus:border-border"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
        >
          <Search className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {/* Notification badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
