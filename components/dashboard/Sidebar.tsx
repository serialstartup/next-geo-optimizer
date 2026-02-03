'use client';

/**
 * Sidebar Component
 *
 * Main navigation sidebar for the dashboard.
 * Features logo, navigation items, settings, and user profile.
 * Matches the GEO Audit Dashboard design.
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  GitCompare,
  Wand2,
  History,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import type { Profile } from '@/types/database';

interface SidebarProps {
  /** User profile data */
  user?: Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'>;
  /** Additional CSS classes */
  className?: string;
}

const navItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    href: '/dashboard/audit', 
    icon: LayoutDashboard 
  },
  { 
    id: 'model-comparison', 
    label: 'Model Comparison', 
    href: '/dashboard/simulation', 
    icon: GitCompare 
  },
  { 
    id: 'content-optimizer', 
    label: 'Content Optimizer', 
    href: '/dashboard/content', 
    icon: Wand2 
  },
  { 
    id: 'audit-history', 
    label: 'Audit History', 
    href: '/dashboard/progress', 
    icon: History 
  },
];

export function Sidebar({
  user,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard/audit') {
      return pathname === '/dashboard/audit' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1a1f2e] border border-[#2a3142]"
      >
        <Menu className="w-5 h-5 text-gray-300" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50',
          'flex flex-col bg-[#0f1219] border-r border-[#1e2433]',
          'transition-all duration-300',
          isCollapsed ? 'w-[72px]' : 'w-56',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Header with logo */}
        <div className="flex items-center justify-between p-4 h-16">
          <Link href="/dashboard/audit" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-white text-lg">
                GEO Audit
              </span>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-[#1e2433]"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Desktop collapse button - hidden for now to match design */}
          {/* <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1 rounded hover:bg-[#1e2433]"
          >
            <ChevronLeft
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
          </button> */}
        </div>

        {/* Main navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'text-sm font-medium',
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-[#1e2433] hover:text-gray-200'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-white' : 'text-gray-400')} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-3 py-2 border-t border-[#1e2433]">
          <Link
            href="/dashboard/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              'text-sm font-medium text-gray-400 hover:bg-[#1e2433] hover:text-gray-200'
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>

        {/* User profile */}
        <div className="p-3 border-t border-[#1e2433]">
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg',
              'hover:bg-[#1e2433] transition-colors cursor-pointer'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-amber-400">
                  {user?.full_name?.[0] || user?.email?.[0] || 'A'}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.full_name || 'Alex Sterling'}
                </p>
                <p className="text-xs text-gray-500 truncate uppercase tracking-wide">
                  Enterprise Plan
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
