'use client';

/**
 * Site Setup Page
 *
 * Allows users to add a new site for GEO analysis.
 * Includes domain input, crawl configuration, and explanation of GEO metrics.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/dashboard/PageHeader';
import {
  Globe,
  Search,
  FileText,
  Target,
  MessageSquare,
  Bot,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [siteName, setSiteName] = useState('');
  const [maxPages, setMaxPages] = useState('50');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!domain) {
      setError('Please enter a domain');
      return;
    }

    // Validate domain format
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    if (!domainRegex.test(cleanDomain)) {
      setError('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    // In production, this would be a Server Action
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Redirect to audit page after setup
    router.push('/dashboard/audit');
  };

  const geoMetrics = [
    {
      icon: FileText,
      title: 'Content Clarity',
      description: 'How easily LLMs can parse and understand your core message and semantic structure.',
    },
    {
      icon: Target,
      title: 'Entity Coverage',
      description: 'Breadth of brand-related keywords and linked entities identified by AI systems.',
    },
    {
      icon: MessageSquare,
      title: 'Answer-First Structure',
      description: 'Probability of your content being used in direct AI answers and recommendations.',
    },
    {
      icon: Bot,
      title: 'AI Readability',
      description: 'Structured data primitives and tokenization efficiency for AI models.',
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Add New Site"
        subtitle="Set up a new site for GEO analysis and optimization"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Setup Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Site Configuration
            </CardTitle>
            <CardDescription>
              Enter your website details to begin the GEO audit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Domain Input */}
              <div className="space-y-2">
                <Label htmlFor="domain">Website Domain *</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="domain"
                    type="text"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your domain without http:// or https://
                </p>
              </div>

              {/* Site Name */}
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name (Optional)</Label>
                <Input
                  id="siteName"
                  type="text"
                  placeholder="My Company"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A friendly name to identify this site
                </p>
              </div>

              {/* Crawl Configuration */}
              <div className="space-y-2">
                <Label htmlFor="maxPages">Maximum Pages to Crawl</Label>
                <Input
                  id="maxPages"
                  type="number"
                  min="10"
                  max="500"
                  value={maxPages}
                  onChange={(e) => setMaxPages(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  More pages provide better analysis but take longer (10-500)
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up site...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Start GEO Audit
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* What GEO Measures */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">What GEO Measures</CardTitle>
              <CardDescription>
                Understanding how AI systems perceive and recommend your brand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {geoMetrics.map((metric) => (
                <div key={metric.title} className="flex gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 h-fit">
                    <metric.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{metric.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {metric.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">What Happens Next</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {[
                  'We crawl your website to extract content',
                  'AI analyzes your content structure and entities',
                  'We simulate how LLMs perceive your brand',
                  'You receive actionable optimization recommendations',
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
