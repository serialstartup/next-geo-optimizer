'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import type { Simulation, AIEngine } from '@/types/database';

interface EngineComparisonProps {
  simulations: Simulation[];
  currentQuery: string;
  isLoading?: boolean;
}

const engines = [
  { value: 'gpt-4o' as AIEngine, label: 'GPT-4o', provider: 'OpenAI', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
  { value: 'claude-3' as AIEngine, label: 'Claude 3.5', provider: 'Anthropic', color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
  { value: 'gemini' as AIEngine, label: 'Gemini Pro', provider: 'Google', color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  { value: 'perplexity' as AIEngine, label: 'Perplexity AI', provider: 'Perplexity', color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
];

function getToneMatchColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

function getToneTrendIcon(score: number) {
  if (score >= 80) return TrendingUp;
  if (score >= 60) return Minus;
  return TrendingDown;
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

function truncateResponse(response: string | null, maxLength: number = 200): string {
  if (!response) return 'No response';
  if (response.length <= maxLength) return response;
  return response.substring(0, maxLength) + '...';
}

export function EngineComparison({ simulations, currentQuery, isLoading }: EngineComparisonProps) {
  const [expandedEngine, setExpandedEngine] = useState<AIEngine | null>(null);

  const mentionedCount = simulations.filter((s) => s.brand_mentioned).length;
  const avgToneMatch = Math.round(
    simulations.reduce((sum, s) => sum + (s.tone_match || 0), 0) / simulations.length
  );

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Engine Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <Bot className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-muted-foreground">
                Comparing all engines...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Engine Comparison
          </CardTitle>
          <Badge variant="secondary" className="bg-muted">
            {simulations.length} engines
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-muted/30">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Brand Mentions</p>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-lg font-bold ${mentionedCount > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                {mentionedCount}/{simulations.length}
              </span>
              {mentionedCount > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg. Tone Match</p>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-lg font-bold ${getToneMatchColor(avgToneMatch)}`}>
                {avgToneMatch}%
              </span>
              {avgToneMatch >= 80 && (
                <TrendingUp className={`w-4 h-4 ${getToneMatchColor(avgToneMatch)}`} />
              )}
              {avgToneMatch >= 60 && avgToneMatch < 80 && (
                <Minus className={`w-4 h-4 ${getToneMatchColor(avgToneMatch)}`} />
              )}
              {avgToneMatch < 60 && (
                <TrendingDown className={`w-4 h-4 ${getToneMatchColor(avgToneMatch)}`} />
              )}
            </div>
          </div>
        </div>

        {/* Engine Cards */}
        <div className="space-y-3">
          {engines.map((engine) => {
            const sim = simulations.find((s) => s.engine === engine.value);
            const isExpanded = expandedEngine === engine.value;
            const TrendIcon = sim ? getToneTrendIcon(sim.tone_match || 0) : Minus;

            return (
              <div
                key={engine.value}
                className={`rounded-lg border overflow-hidden transition-colors ${
                  isExpanded
                    ? 'bg-muted/30 border-primary/30'
                    : 'bg-muted/10 border-border hover:bg-muted/20'
                }`}
              >
                {/* Engine Header */}
                <button
                  onClick={() => setExpandedEngine(isExpanded ? null : engine.value)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${engine.bgColor}`}>
                      <Bot className={`w-4 h-4 ${engine.color}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${engine.color}`}>{engine.label}</p>
                      <p className="text-xs text-muted-foreground">{engine.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sim ? (
                      <>
                        {sim.brand_mentioned ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          >
                            Mentioned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-muted-foreground/30">
                            Not mentioned
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-medium ${getToneMatchColor(sim.tone_match || 0)}`}>
                            {sim.tone_match}%
                          </span>
                          <TrendIcon className={`w-4 h-4 ${getToneMatchColor(sim.tone_match || 0)}`} />
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">No data</span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && sim && (
                  <div className="p-3 pt-0 border-t border-border/50">
                    <div className="mt-3 space-y-3">
                      {/* AI Response Preview */}
                      <div className="p-3 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Response:</p>
                        <p className="text-sm text-foreground">
                          {truncateResponse(sim.ai_response, 300)}
                        </p>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-muted/30 text-center">
                          <p className="text-xs text-muted-foreground">Tone Match</p>
                          <p className={`text-sm font-medium ${getToneMatchColor(sim.tone_match || 0)}`}>
                            {sim.tone_match}%
                          </p>
                        </div>
                        <div className="p-2 rounded bg-muted/30 text-center">
                          <p className="text-xs text-muted-foreground">Reasoning Steps</p>
                          <p className="text-sm font-medium text-foreground">
                            {sim.reasoning_path?.length || 0}
                          </p>
                        </div>
                      </div>

                      {/* GEO Tip */}
                      {sim.geo_tip && (
                        <div className="p-2 rounded bg-primary/5 border border-primary/10">
                          <p className="text-xs text-primary font-medium mb-1">GEO Tip</p>
                          <p className="text-xs text-muted-foreground">
                            {sim.geo_tip}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Perplexity Deep Research Badge */}
        {simulations.some((s) => s.engine === 'perplexity') && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-purple-300/80">
              Perplexity AI performed deep research with additional source citations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
