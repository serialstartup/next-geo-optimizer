'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import type { AIEngine } from '@/types/database';

interface SimulationFormProps {
  query: string;
  setQuery: (query: string) => void;
  selectedEngine: AIEngine;
  setSelectedEngine: (engine: AIEngine) => void;
  isSimulating: boolean;
  onSimulate: () => void;
  queryHistory?: { query: string; timestamp: string; brandMentioned: boolean }[];
}

const aiEngines = [
  { value: 'gpt-4o' as AIEngine, label: 'GPT-4o', provider: 'OpenAI', color: 'text-emerald-400' },
  { value: 'claude-3' as AIEngine, label: 'Claude 3.5', provider: 'Anthropic', color: 'text-orange-400' },
  { value: 'gemini' as AIEngine, label: 'Gemini Pro', provider: 'Google', color: 'text-blue-400' },
  { value: 'perplexity' as AIEngine, label: 'Perplexity AI', provider: 'Perplexity', color: 'text-purple-400' },
];

export function SimulationForm({
  query,
  setQuery,
  selectedEngine,
  setSelectedEngine,
  isSimulating,
  onSimulate,
  queryHistory = [],
}: SimulationFormProps) {
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const selectedEngineData = aiEngines.find((e) => e.value === selectedEngine);

  const handleHistorySelect = (item: { query: string }) => {
    setQuery(item.query);
    setIsHistoryOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Engine Selector */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <button
            onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <Bot className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Engine</span>
            <span className={`font-medium ${selectedEngineData?.color}`}>
              {selectedEngineData?.label}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {isEngineDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsEngineDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 z-50 w-56 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                {aiEngines.map((engine) => (
                  <button
                    key={engine.value}
                    onClick={() => {
                      setSelectedEngine(engine.value);
                      setIsEngineDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted transition-colors text-left ${
                      selectedEngine === engine.value ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${engine.color}`}>{engine.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{engine.provider}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {selectedEngine === 'perplexity' && (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Deep Research
          </Badge>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="text-muted-foreground"
          >
            History
          </Button>
        </div>
      </div>

      {/* Query Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your brand..."
            onKeyDown={(e) => e.key === 'Enter' && onSimulate()}
            className="pr-24"
          />
          {isHistoryOpen && queryHistory.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsHistoryOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                {queryHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistorySelect(item)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-sm text-foreground truncate flex-1">
                      {item.query}
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      {item.brandMentioned ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.timestamp}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <Button
          onClick={onSimulate}
          disabled={isSimulating || !query.trim()}
          className="min-w-28"
        >
          {isSimulating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Simulating...
            </>
          ) : (
            <>
              Simulate
              <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Quick Query Suggestions */}
      {!query && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {[
            'Best enterprise API platforms',
            'Most secure cloud integration',
            'Affordable CRM alternatives',
            'Developer tools trending 2026',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
