"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CTASection() {
  const [domain, setDomain] = useState("");

  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-muted/50 via-muted/30 to-background border border-border/50 p-8 md:p-16">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          
          <div className="relative flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
            {/* Headline */}
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to see what AI thinks of you?
            </h2>

            {/* Description */}
            <p className="text-lg text-muted-foreground">
              Get your free GEO Audit today. Our models will scan major LLMs to
              provide a baseline for your generative engine visibility.
            </p>

            {/* CTA Form */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-4">
              <Input
                type="text"
                placeholder="your-business.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex-1 h-12 bg-background/50"
              />
              <Button size="lg" className="h-12 px-8 whitespace-nowrap">
                Get Free Report
              </Button>
            </div>

            {/* Trust logos */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-8 pt-8 border-t border-border/50 w-full">
              <span className="text-sm font-medium text-muted-foreground/60 tracking-wider">
                TECH CORP
              </span>
              <span className="text-sm font-medium text-muted-foreground/60 tracking-wider">
                NEXUS AI
              </span>
              <span className="text-sm font-medium text-muted-foreground/60 tracking-wider">
                QUANTUM
              </span>
              <span className="text-sm font-medium text-muted-foreground/60 tracking-wider">
                MODERN SaaS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
