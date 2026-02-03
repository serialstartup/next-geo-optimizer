/**
 * Dashboard Layout
 *
 * Main layout for authenticated dashboard pages.
 * Includes sidebar navigation and main content area.
 * Dark theme matching the GEO Audit design.
 *
 * In production, this would check authentication and redirect
 * unauthenticated users to the login page.
 */

import { Sidebar } from '@/components/dashboard/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // In production, we would fetch user data here:
  // const supabase = await createServerClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) redirect('/login');

  // Placeholder user data for demo
  const user = {
    id: '1',
    email: 'alex@example.com',
    full_name: 'Alex Sterling',
    avatar_url: null,
  };

  return (
    <div className="flex h-screen bg-[#0a0d14] dark">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-[#0f1219]">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
