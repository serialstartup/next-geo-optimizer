'use client';

/**
 * SiteSelector Component
 *
 * Dropdown selector for switching between user's sites.
 * Used in the dashboard sidebar for site context switching.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Globe, Plus, Check } from 'lucide-react';
import type { Site } from '@/types/database';

interface SiteSelectorProps {
  /** List of user's sites */
  sites: Pick<Site, 'id' | 'domain' | 'name'>[];
  /** Currently selected site ID */
  selectedSiteId?: string;
  /** Callback when site is selected */
  onSiteChange?: (siteId: string) => void;
  /** Callback when "Add Site" is clicked */
  onAddSite?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function SiteSelector({
  sites,
  selectedSiteId,
  onSiteChange,
  onAddSite,
  className,
}: SiteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedSite = sites.find((site) => site.id === selectedSiteId) || sites[0];

  const handleSelect = (siteId: string) => {
    onSiteChange?.(siteId);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
          'bg-muted/50 hover:bg-muted transition-colors',
          'text-left'
        )}
      >
        <div className="p-1.5 rounded-md bg-primary/10">
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {selectedSite?.name || selectedSite?.domain || 'Select a site'}
          </p>
          {selectedSite?.domain && selectedSite?.name && (
            <p className="text-xs text-muted-foreground truncate">
              {selectedSite.domain}
            </p>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="py-1 max-h-64 overflow-y-auto">
              {sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => handleSelect(site.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2',
                    'hover:bg-muted transition-colors text-left',
                    site.id === selectedSiteId && 'bg-muted'
                  )}
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {site.name || site.domain}
                    </p>
                    {site.name && (
                      <p className="text-xs text-muted-foreground truncate">
                        {site.domain}
                      </p>
                    )}
                  </div>
                  {site.id === selectedSiteId && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* Add site button */}
            <div className="border-t border-border">
              <button
                onClick={() => {
                  onAddSite?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
              >
                <Plus className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Add new site
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
