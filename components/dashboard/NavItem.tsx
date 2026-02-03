'use client';

/**
 * NavItem Component
 *
 * Navigation item for the dashboard sidebar.
 * Supports active state styling and icons.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface NavItemProps {
  /** Navigation label */
  label: string;
  /** Route path */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Whether this is a settings/secondary item */
  isSecondary?: boolean;
  /** Badge count (optional) */
  badge?: number;
  /** Additional CSS classes */
  className?: string;
}

export function NavItem({
  label,
  href,
  icon: Icon,
  isSecondary = false,
  badge,
  className,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
        'text-sm font-medium',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        isSecondary && !isActive && 'text-muted-foreground/70',
        className
      )}
    >
      <Icon className={cn('w-5 h-5', isActive ? 'text-primary-foreground' : '')} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'px-2 py-0.5 text-xs font-semibold rounded-full',
            isActive
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-primary/10 text-primary'
          )}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
