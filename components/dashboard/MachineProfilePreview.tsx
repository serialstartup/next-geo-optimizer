/**
 * MachineProfilePreview Component
 *
 * Displays the machine-readable brand profile preview with JSON visualization,
 * alignment score, and predicted AI sentiment indicators.
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Eye,
  Award,
  Shield,
  Zap,
  FileCode,
} from 'lucide-react';
import type { MachineProfile, BrandPositioning, Guardrail } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

interface MachineProfilePreviewProps {
  positioning: BrandPositioning | null;
  demographicContext: string;
  differentiators: string[];
  guardrails: Guardrail[];
  alignmentScore: number;
  isLive?: boolean;
}

interface SentimentIndicator {
  icon: React.ReactNode;
  label: string;
  color: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate machine profile from form data
 */
function generateMachineProfile(
  positioning: BrandPositioning | null,
  demographicContext: string,
  differentiators: string[],
  guardrails: Guardrail[]
): MachineProfile {
  // Generate intent based on positioning
  const intentMap: Record<BrandPositioning, string> = {
    budget: 'value_focused_provider',
    premium: 'premium_market_leader',
    niche: 'specialized_solution_provider',
    expert: 'industry_expert_authority',
  };

  // Generate audience cluster from demographic context
  const audienceCluster: string[] = [];
  const contextLower = demographicContext.toLowerCase();
  
  if (contextLower.includes('enterprise') || contextLower.includes('cto') || contextLower.includes('executive')) {
    audienceCluster.push('enterprise_decision_makers');
  }
  if (contextLower.includes('technical') || contextLower.includes('developer') || contextLower.includes('engineer')) {
    audienceCluster.push('technical_executives');
  }
  if (contextLower.includes('startup') || contextLower.includes('founder')) {
    audienceCluster.push('startup_founders');
  }
  if (contextLower.includes('consumer') || contextLower.includes('customer')) {
    audienceCluster.push('end_consumers');
  }
  
  // Default if no matches
  if (audienceCluster.length === 0) {
    audienceCluster.push('general_audience');
  }

  // Generate narrative weights based on positioning
  const narrativeWeight: Record<string, number> = {};
  
  if (positioning === 'premium') {
    narrativeWeight.reliability = 0.95;
    narrativeWeight.innovation = 0.82;
    narrativeWeight.cost_efficiency = 0.15;
  } else if (positioning === 'budget') {
    narrativeWeight.cost_efficiency = 0.95;
    narrativeWeight.value = 0.85;
    narrativeWeight.reliability = 0.60;
  } else if (positioning === 'niche') {
    narrativeWeight.specialization = 0.95;
    narrativeWeight.expertise = 0.85;
    narrativeWeight.customization = 0.80;
  } else if (positioning === 'expert') {
    narrativeWeight.authority = 0.95;
    narrativeWeight.expertise = 0.90;
    narrativeWeight.innovation = 0.75;
  } else {
    narrativeWeight.reliability = 0.70;
    narrativeWeight.value = 0.70;
  }

  // Generate forbidden tokens from guardrails
  const forbiddenTokens: string[] = [];
  guardrails.forEach((g) => {
    // Extract key terms from avoid text
    const avoidLower = g.avoid.toLowerCase();
    if (avoidLower.includes('discount')) forbiddenTokens.push('cheap');
    if (avoidLower.includes('budget')) forbiddenTokens.push('basic');
    if (avoidLower.includes('out-of-the-box')) forbiddenTokens.push('generic');
    if (avoidLower.includes('simple')) forbiddenTokens.push('simple');
  });
  
  // Add default forbidden tokens based on positioning
  if (positioning === 'premium') {
    if (!forbiddenTokens.includes('cheap')) forbiddenTokens.push('cheap');
    if (!forbiddenTokens.includes('basic')) forbiddenTokens.push('basic');
    if (!forbiddenTokens.includes('generic')) forbiddenTokens.push('generic');
  }

  return {
    intent: positioning ? intentMap[positioning] : 'general_provider',
    audience_cluster: audienceCluster,
    narrative_weight: narrativeWeight,
    forbidden_tokens: forbiddenTokens.length > 0 ? forbiddenTokens : ['n/a'],
  };
}

/**
 * Get sentiment indicators based on positioning
 */
function getSentimentIndicators(positioning: BrandPositioning | null): SentimentIndicator[] {
  const indicators: SentimentIndicator[] = [];

  if (positioning === 'premium' || positioning === 'expert') {
    indicators.push({
      icon: <Award className="w-5 h-5" />,
      label: 'High Value',
      color: 'text-blue-400 bg-blue-500/10',
    });
    indicators.push({
      icon: <Shield className="w-5 h-5" />,
      label: 'Trustworthy',
      color: 'text-emerald-400 bg-emerald-500/10',
    });
    indicators.push({
      icon: <Zap className="w-5 h-5" />,
      label: 'Advanced',
      color: 'text-amber-400 bg-amber-500/10',
    });
  } else if (positioning === 'budget') {
    indicators.push({
      icon: <Award className="w-5 h-5" />,
      label: 'Value',
      color: 'text-green-400 bg-green-500/10',
    });
    indicators.push({
      icon: <Shield className="w-5 h-5" />,
      label: 'Accessible',
      color: 'text-blue-400 bg-blue-500/10',
    });
    indicators.push({
      icon: <Zap className="w-5 h-5" />,
      label: 'Practical',
      color: 'text-purple-400 bg-purple-500/10',
    });
  } else if (positioning === 'niche') {
    indicators.push({
      icon: <Award className="w-5 h-5" />,
      label: 'Specialized',
      color: 'text-purple-400 bg-purple-500/10',
    });
    indicators.push({
      icon: <Shield className="w-5 h-5" />,
      label: 'Expert',
      color: 'text-blue-400 bg-blue-500/10',
    });
    indicators.push({
      icon: <Zap className="w-5 h-5" />,
      label: 'Focused',
      color: 'text-amber-400 bg-amber-500/10',
    });
  } else {
    indicators.push({
      icon: <Award className="w-5 h-5" />,
      label: 'Balanced',
      color: 'text-gray-400 bg-gray-500/10',
    });
    indicators.push({
      icon: <Shield className="w-5 h-5" />,
      label: 'Neutral',
      color: 'text-gray-400 bg-gray-500/10',
    });
    indicators.push({
      icon: <Zap className="w-5 h-5" />,
      label: 'Standard',
      color: 'text-gray-400 bg-gray-500/10',
    });
  }

  return indicators;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MachineProfilePreview({
  positioning,
  demographicContext,
  differentiators,
  guardrails,
  alignmentScore,
  isLive = true,
}: MachineProfilePreviewProps) {
  const machineProfile = generateMachineProfile(
    positioning,
    demographicContext,
    differentiators,
    guardrails
  );

  const sentimentIndicators = getSentimentIndicators(positioning);

  // Format JSON for display with syntax highlighting
  const formatJsonValue = (key: string, value: unknown): React.ReactNode => {
    if (typeof value === 'string') {
      return (
        <span>
          <span className="text-blue-400">&quot;{key}&quot;</span>
          <span className="text-gray-400">: </span>
          <span className="text-emerald-400">&quot;{value}&quot;</span>
        </span>
      );
    }
    if (Array.isArray(value)) {
      return (
        <div>
          <span className="text-blue-400">&quot;{key}&quot;</span>
          <span className="text-gray-400">: [</span>
          <div className="pl-4">
            {value.map((item, i) => (
              <div key={i}>
                <span className="text-emerald-400">&quot;{item}&quot;</span>
                {i < value.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            ))}
          </div>
          <span className="text-gray-400">],</span>
        </div>
      );
    }
    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value);
      return (
        <div>
          <span className="text-blue-400">&quot;{key}&quot;</span>
          <span className="text-gray-400">: {'{'}</span>
          <div className="pl-4">
            {entries.map(([k, v], i) => (
              <div key={k}>
                <span className="text-blue-400">&quot;{k}&quot;</span>
                <span className="text-gray-400">: </span>
                <span className="text-amber-400">{String(v)}</span>
                {i < entries.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            ))}
          </div>
          <span className="text-gray-400">{'}'},</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Machine-Readable Profile */}
      <Card className="bg-[#1a1f2e] border-[#2a3142]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Machine-Readable Profile
            </CardTitle>
            {isLive && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <Eye className="w-3 h-3 mr-1" />
                LIVE VIEW
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Engine Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-400 font-medium">ENGINE STATUS</span>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              OPTIMIZED
            </Badge>
          </div>

          {/* Alignment Score Progress */}
          <div className="space-y-2">
            <div className="h-1.5 bg-[#0f1219] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${alignmentScore}%` }}
              />
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-400">{alignmentScore}% Alignment Score</span>
            </div>
          </div>

          {/* JSON Preview */}
          <div className="p-4 rounded-lg bg-[#0f1219] border border-[#2a3142] font-mono text-xs overflow-x-auto">
            <div className="space-y-1">
              {formatJsonValue('intent', machineProfile.intent)}
              <div className="h-2" />
              {formatJsonValue('audience_cluster', machineProfile.audience_cluster)}
              <div className="h-2" />
              {formatJsonValue('narrative_weight', machineProfile.narrative_weight)}
              <div className="h-2" />
              {formatJsonValue('forbidden_tokens', machineProfile.forbidden_tokens)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicted AI Sentiment */}
      <Card className="bg-[#1a1f2e] border-[#2a3142]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Predicted AI Sentiment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {sentimentIndicators.map((indicator, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 rounded-lg bg-[#0f1219] border border-[#2a3142]"
              >
                <div className={`p-2 rounded-full mb-2 ${indicator.color}`}>
                  {indicator.icon}
                </div>
                <span className="text-xs text-gray-400">{indicator.label}</span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent border-[#2a3142] text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30"
          >
            <FileCode className="w-4 h-4 mr-2" />
            View AI Map
          </Button>

          <p className="text-xs text-gray-500 text-center">
            These parameters will update across 14 LLM clusters, including GPT-4o, Claude 3.5, and Gemini Pro within 15 minutes.
          </p>
        </CardContent>
      </Card>

      {/* AI Status Indicator */}
      <Card className="bg-[#1a1f2e] border-[#2a3142]">
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-blue-400">AI STATUS</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-gray-400">Syncing with LLMs</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
