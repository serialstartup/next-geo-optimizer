import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-primary-foreground"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold">GEO Optimizer</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#product"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Product
          </Link>
          <Link
            href="#solutions"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Solutions
          </Link>
          <Link
            href="#seo-vs-geo"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            SEO vs GEO
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Log In
          </Link>
          <Button asChild>
            <Link href="/signup">Run Audit</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
