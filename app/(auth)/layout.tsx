/**
 * Auth Layout
 *
 * Minimal layout for authentication pages (login, signup, forgot-password).
 * Centers content and provides a clean, focused experience.
 */

import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white hover:opacity-80 transition-opacity"
        >
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          GEO Optimizer
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} GEO Optimizer. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
