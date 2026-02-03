'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  CheckCircle2,
  XCircle,
  Search,
  Database,
  GitBranch,
  Target,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { Simulation, ReasoningStep } from '@/types/database';

interface SimulationResultProps {
  simulation: Simulation | null;
  isLoading?: boolean;
}

const stepIcons = [Search, Database, GitBranch, Target];
const stepColors = [
  'text-blue-400',
  'text-amber-400',
  'text-purple-400',
  'text-emerald-400',
];
const stepBgColors = [
  'bg-blue-400/10',
  'bg-amber-400/10',
  'bg-purple-400/10',
  'bg-emerald-400/10',
];

function getToneMatchColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

function getToneMatchIcon(score: number) {
  if (score >= 80) return TrendingUp;
  if (score >= 60) return Minus;
  return TrendingDown;
}

function getEngineColor(engine: string): string {
  switch (engine) {
    case 'gpt-4o':
      return 'text-emerald-400';
    case 'claude-3':
      return 'text-orange-400';
    case 'gemini':
      return 'text-blue-400';
    case 'perplexity':
      return 'text-purple-400';
    default:
      return 'text-muted-foreground';
  }
}

function formatEngineName(engine: string): string {
  switch (engine) {
    case 'gpt-4o':
      return 'GPT-4o';
    case 'claude-3':
      return 'Claude 3.5';
    case 'gemini':
      return 'Gemini Pro';
    case 'perplexity':
      return 'Perplexity AI';
    default:
      return engine;
  }
}

export function SimulationResult({ simulation, isLoading }: SimulationResultProps) {
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Simulation Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  <Bot className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Simulating response with AI...
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!simulation) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Simulation Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <Bot className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Enter a query and click Simulate to see how AI engines respond to your brand.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Query Display */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Query:</p>
            <p className="text-foreground font-medium">{simulation.query}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(simulation.created_at).toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Response */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-muted-foreground">
              AI Response
            </CardTitle>
            <Badge
              variant="secondary"
              className={`${getEngineColor(simulation.engine)} bg-current/10`}
            >
              {formatEngineName(simulation.engine)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 p-4 rounded-lg bg-muted/50">
              <p className="text-foreground whitespace-pre-line leading-relaxed">
                {simulation.ai_response}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-right mt-2">
            Simulated in ~1.2s
          </p>
        </CardContent>
      </Card>

      {/* Impact Analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Mentioned & Tone Match */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Brand Mentioned?</p>
              <div className="flex items-center justify-center gap-2">
                {simulation.brand_mentioned ? (
                  <>
                    <span className="text-xl font-bold text-emerald-400">YES</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </>
                ) : (
                  <>
                    <span className="text-xl font-bold text-red-400">NO</span>
                    <XCircle className="w-5 h-5 text-red-400" />
                  </>
                )}
              </div>
              {simulation.brand_mentioned && (
                <p className="text-xs text-emerald-400/80 mt-1">
                  Your brand was mentioned
                </p>
              )}
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Tone Match</p>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-xl font-bold ${getToneMatchColor(simulation.tone_match || 0)}`}>
                  {simulation.tone_match}%
                </span>
                {simulation.tone_match && simulation.tone_match >= 80 && (
                  <TrendingUp className={`w-5 h-5 ${getToneMatchColor(simulation.tone_match)}`} />
                )}
                {simulation.tone_match && simulation.tone_match < 60 && simulation.tone_match >= 40 && (
                  <Minus className={`w-5 h-5 ${getToneMatchColor(simulation.tone_match)}`} />
                )}
                {simulation.tone_match && simulation.tone_match < 40 && (
                  <TrendingDown className={`w-5 h-5 ${getToneMatchColor(simulation.tone_match)}`} />
                )}
              </div>
            </div>
          </div>

          {/* Reasoning Path */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Reasoning Path</h4>
              <span className="text-xs text-muted-foreground">
                {simulation.reasoning_path?.length || 0} steps
              </span>
            </div>
            <div className="space-y-3">
              {simulation.reasoning_path?.map((step: ReasoningStep, index: number) => {
                const Icon = stepIcons[index] || Search;
                const colorClass = stepColors[index] || stepColors[0];
                const bgClass = stepBgColors[index] || stepBgColors[0];

                return (
                  <div key={index} className="flex gap-3">
                    <div className={`p-1.5 rounded ${bgClass} h-fit mt-0.5`}>
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${colorClass}`}>
                        {step.step.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GEO Tip */}
          {simulation.geo_tip && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">GEO Tip</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {simulation.geo_tip}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
