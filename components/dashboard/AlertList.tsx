/**
 * AlertList Component
 *
 * Displays a list of alerts with filtering, pagination,
 * and bulk actions support.
 */

'use client';

import { useState, useMemo } from 'react';
import { AlertCard } from './AlertCard';
import { AlertFilters } from './AlertFilters';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCheck, Bell, ArchiveX } from 'lucide-react';
import type { Alert, AlertSeverity, AlertType } from '@/types/database';

interface AlertListProps {
  /** List of alerts to display */
  alerts: Alert[];
  /** Callback when an alert is marked as read */
  onMarkAsRead?: (alertId: string) => Promise<void>;
  /** Callback when an alert is dismissed */
  onDismiss?: (alertId: string) => Promise<void>;
  /** Callback when all alerts are marked as read */
  onMarkAllAsRead?: () => Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Site ID for filtering */
  siteId?: string;
}

interface FilterState {
  type: AlertType | 'all';
  severity: AlertSeverity | 'all';
  readStatus: 'all' | 'unread' | 'read';
  search: string;
}

export function AlertList({
  alerts,
  onMarkAsRead,
  onDismiss,
  onMarkAllAsRead,
  isLoading = false,
  siteId,
}: AlertListProps) {
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    severity: 'all',
    readStatus: 'all',
    search: '',
  });
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Type filter
      if (filters.type !== 'all' && alert.type !== filters.type) {
        return false;
      }

      // Severity filter
      if (filters.severity !== 'all' && alert.severity !== filters.severity) {
        return false;
      }

      // Read status filter
      if (filters.readStatus === 'unread' && alert.read) {
        return false;
      }
      if (filters.readStatus === 'read' && !alert.read) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(searchLower);
        const matchesMessage = alert.message.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesMessage) {
          return false;
        }
      }

      return true;
    });
  }, [alerts, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = alerts.length;
    const unread = alerts.filter((a) => !a.read).length;
    const critical = alerts.filter((a) => a.severity === 'critical').length;
    const high = alerts.filter((a) => a.severity === 'high').length;
    const filteredUnread = filteredAlerts.filter((a) => !a.read).length;

    return { total, unread, critical, high, filteredUnread };
  }, [alerts, filteredAlerts]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.severity !== 'all') count++;
    if (filters.readStatus !== 'all') count++;
    if (filters.search !== '') count++;
    return count;
  }, [filters]);

  const handleAction = async (alertId: string, action: 'read' | 'dismiss') => {
    setProcessingIds((prev) => new Set(prev).add(alertId));
    try {
      if (action === 'read' && onMarkAsRead) {
        await onMarkAsRead(alertId);
      } else if (action === 'dismiss' && onDismiss) {
        await onDismiss(alertId);
      }
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }
  };

  const handleClearFilters = () => {
    setFilters({
      type: 'all',
      severity: 'all',
      readStatus: 'all',
      search: '',
    });
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Bell className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No Alerts</h3>
        <p className="text-sm text-muted-foreground">
          Your monitoring queue is empty. We will notify you when there are
          updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics and bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{stats.total}</span>{' '}
            Total alerts
          </span>
          {stats.unread > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="font-medium">{stats.unread}</span> Unread
            </span>
          )}
          {(stats.critical > 0 || stats.high > 0) && (
            <span className="flex items-center gap-1 text-red-400">
              <span className="font-medium">{stats.critical + stats.high}</span>{' '}
              Critical/High
            </span>
          )}
        </div>
        {stats.unread > 0 && onMarkAllAsRead && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={isLoading}
            className="gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <AlertFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
        disabled={isLoading}
      />

      {/* Alerts list */}
      {filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <ArchiveX className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No matching alerts
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'transition-opacity',
                processingIds.has(alert.id) && 'opacity-50'
              )}
            >
              <AlertCard
                id={alert.id}
                type={alert.type}
                severity={alert.severity}
                title={alert.title}
                message={alert.message}
                timestamp={formatTimestamp(alert.created_at)}
                actionLabel={alert.action_label || undefined}
                onAction={
                  alert.action_url
                    ? () => {
                        window.location.href = alert.action_url!;
                      }
                    : undefined
                }
                onDismiss={
                  !alert.dismissed && onDismiss
                    ? () => handleAction(alert.id, 'dismiss')
                    : undefined
                }
                isRead={alert.read}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
