'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SimulationForm } from '@/components/dashboard/SimulationForm';
import { SimulationResult } from '@/components/dashboard/SimulationResult';
import { EngineComparison } from '@/components/dashboard/EngineComparison';
import {
  Bot,
  History,
  Share2,
  Download,
  Layers,
  Play,
} from 'lucide-react';
import type { AIEngine, Simulation } from '@/types/database';
import {
  getMockSimulations,
  getMockSimulationsBySiteId,
  getMockRecentSimulationsBySiteId,
  mockAcmeGptSimulation,
  mockAcmeClaudeSimulation,
  mockAcmePerplexitySimulation,
  mockAcmeGeminiSimulation,
} from '@/lib/mock-data';

// Mock query history
const defaultQueryHistory = [
  { query: 'Best enterprise API platforms for large-scale data integration', timestamp: '2 hours ago', brandMentioned: true },
  { query: 'Which cloud integration platforms have the best security certifications?', timestamp: '1 day ago', brandMentioned: true },
  { query: 'What developer tools are trending for API development in 2026?', timestamp: '2 days ago', brandMentioned: true },
  { query: 'What are affordable API solutions for startups?', timestamp: '3 days ago', brandMentioned: false },
  { query: 'Where can I buy organic produce with home delivery?', timestamp: '5 days ago', brandMentioned: true },
];

// Simulate different responses based on engine and query
function generateSimulationResponse(
  query: string,
  engine: AIEngine
): Simulation {
  const baseSimulations = {
    'gpt-4o': mockAcmeGptSimulation,
    'claude-3': mockAcmeClaudeSimulation,
    'perplexity': mockAcmePerplexitySimulation,
    'gemini': mockAcmeGeminiSimulation,
  };

  const base = baseSimulations[engine] || mockAcmeGptSimulation;

  return {
    ...base,
    id: `${base.id}-${Date.now()}`,
    query,
    engine,
    created_at: new Date().toISOString(),
  };
}

export default function SimulationPage() {
  const [query, setQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<AIEngine>('gpt-4o');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null);
  const [comparisonSimulations, setComparisonSimulations] = useState<Simulation[]>([]);
  const [queryHistory, setQueryHistory] = useState(defaultQueryHistory);
  const [showComparison, setShowComparison] = useState(false);

  const handleSimulate = async () => {
    if (!query.trim()) return;

    setIsSimulating(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate simulation result for selected engine
    const result = generateSimulationResponse(query, selectedEngine);
    setCurrentSimulation(result);

    // Also generate results for all engines for comparison
    const allResults: Simulation[] = [
      generateSimulationResponse(query, 'gpt-4o'),
      generateSimulationResponse(query, 'claude-3'),
      generateSimulationResponse(query, 'perplexity'),
      generateSimulationResponse(query, 'gemini'),
    ];
    setComparisonSimulations(allResults);

    setIsSimulating(false);

    // Add to history
    setQueryHistory((prev) => [
      { query, timestamp: 'Just now', brandMentioned: result.brand_mentioned || false },
      ...prev.slice(0, 9),
    ]);
  };

  const handleCompareAllEngines = async () => {
    if (!query.trim()) return;

    setIsSimulating(true);
    setShowComparison(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate results for all engines
    const allResults: Simulation[] = [
      generateSimulationResponse(query, 'gpt-4o'),
      generateSimulationResponse(query, 'claude-3'),
      generateSimulationResponse(query, 'perplexity'),
      generateSimulationResponse(query, 'gemini'),
    ];
    setComparisonSimulations(allResults);
    setCurrentSimulation(allResults[0]);

    setIsSimulating(false);

    // Add to history
    setQueryHistory((prev) => [
      { query, timestamp: 'Just now', brandMentioned: allResults.some((s) => s.brand_mentioned) || false },
      ...prev.slice(0, 9),
    ]);
  };

  const handleHistoryItemClick = (item: { query: string }) => {
    setQuery(item.query);
  };

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="AI Recommendation Simulation"
        subtitle="See how AI engines respond to queries about your brand"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => { setCurrentSimulation(null); setShowComparison(false); }}>
              <Play className="w-4 h-4 mr-2" />
              New Simulation
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Simulation Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Engine Selection & Query Input */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Query Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimulationForm
                query={query}
                setQuery={setQuery}
                selectedEngine={selectedEngine}
                setSelectedEngine={setSelectedEngine}
                isSimulating={isSimulating}
                onSimulate={handleSimulate}
                queryHistory={queryHistory}
              />

              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCompareAllEngines}
                  disabled={isSimulating || !query.trim()}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Compare All Engines
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Simulation Result */}
          <SimulationResult
            simulation={currentSimulation}
            isLoading={isSimulating}
          />
        </div>

        {/* Right Column - Comparison & History */}
        <div className="space-y-6">
          {/* Engine Comparison */}
          {showComparison && (
            <EngineComparison
              simulations={comparisonSimulations}
              currentQuery={query}
              isLoading={isSimulating}
            />
          )}

          {/* Query History */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                Recent Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {queryHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryItemClick(item)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Bot className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate group-hover:text-primary">
                        {item.query}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {item.brandMentioned ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-400 text-xs"
                        >
                          Mentioned
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-muted-foreground/30 text-muted-foreground text-xs"
                        >
                          Not mentioned
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.timestamp}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/5">
                <div className="p-1.5 rounded bg-emerald-500/10">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-400">75% Brand Mention Rate</p>
                  <p className="text-xs text-muted-foreground">Across all simulated queries</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/5">
                <div className="p-1.5 rounded bg-blue-500/10">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-400">GPT-4o Performs Best</p>
                  <p className="text-xs text-muted-foreground">Highest brand mention rate</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/5">
                <div className="p-1.5 rounded bg-amber-500/10">
                  <History className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-400">Enterprise Queries Work Best</p>
                  <p className="text-xs text-muted-foreground">Technical content gets more visibility</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
