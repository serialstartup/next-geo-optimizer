"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Search, Sparkles } from "lucide-react";

export function HeroSection() {
  const [domain, setDomain] = useState("");

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="container relative">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>The future of search is generative</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              AI systems are{" "}
              <span className="text-primary">already speaking</span> for your
              brand.
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground max-w-xl">
              Traditional SEO is no longer enough. Optimize your presence for the
              generative era and control how AI models like ChatGPT and Claude
              recommend your business.
            </p>

            {/* CTA Form */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter your domain (e.g. brand.com)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="lg" className="whitespace-nowrap">
                Run your GEO Audit
              </Button>
            </div>

            {/* Trust indicators */}
            <p className="text-sm text-muted-foreground">
              ✓ No credit card required. Private & enterprise-ready.
            </p>
          </div>

          {/* Right visual */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative flex items-center gap-4">
              {/* Old World Card */}
              <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Old World (SEO)
                </span>
                <div className="h-1.5 w-24 rounded-full bg-muted" />
              </div>

              {/* Connection dots */}
              <div className="flex flex-col gap-2">
                <div className="h-2 w-2 rounded-full bg-primary/30" />
                <div className="h-2 w-2 rounded-full bg-primary/50" />
                <div className="h-2 w-2 rounded-full bg-primary/70" />
              </div>

              {/* New World Card */}
              <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-6 backdrop-blur shadow-lg shadow-primary/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  New World (GEO)
                </span>
                <div className="h-1.5 w-24 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
