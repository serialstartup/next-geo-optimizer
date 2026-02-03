/**
 * GEO Audit Dashboard Page
 *
 * Main dashboard showing overall GEO visibility score,
 * sub-scores, AI insights, and perception tags.
 * Matches the GEO Audit Dashboard design reference.
 */

import { Button } from '@/components/ui/button';
import {
  PageHeader,
  ScoreCard,
  SubScoreCard,
} from '@/components/dashboard';
import {
  Download,
  RefreshCw,
  Info,
} from 'lucide-react';
import type { ScoreStatus } from '@/types/database';

// Audit data matching the design
const auditData = {
  overallScore: 72,
  scoreChange: 4,
  lastAuditDate: 'October 24, 2023 • 14:32 UTC',
  subScores: {
    contentClarity: {
      score: 85,
      status: 'optimal' as ScoreStatus,
      description: 'How easily LLMs parse your core message and semantic intent.',
    },
    entityCoverage: {
      score: 64,
      status: 'improving' as ScoreStatus,
      description: 'Breadth of brand-related keywords and linked entities identified.',
    },
    answerFirst: {
      score: 42,
      status: 'needs_focus' as ScoreStatus,
      description: 'Probability of your content being used in direct AI snippets.',
    },
    aiReadability: {
      score: 91,
      status: 'excellent' as ScoreStatus,
      description: 'Structural optimization and tokenization efficiency for AI models.',
    },
  },
  insights: [
    {
      type: 'brand_association',
      title: 'Primary Brand Association',
      description: 'AI models consistently associate your brand with "Enterprise B2B SaaS" and "High-Security Infrastructure". 94% consensus across OpenAI and Anthropic models.',
      color: 'blue',
    },
    {
      type: 'knowledge_graph',
      title: 'Knowledge Graph Status',
      description: 'Identified as a "Category Leader." Strong connection detected to ISO 27001 Compliance and Cloud Governance nodes.',
      color: 'blue',
    },
    {
      type: 'content_fragmentation',
      title: 'Content Fragmentation Warning',
      description: 'Google Gemini reports confusion regarding your Pricing Structure. Content clarity in "Plans" section is rated as "Medium" (6.2/10).',
      color: 'amber',
    },
  ],
  perceptionTags: [
    { name: 'AUTHORITATIVE', score: 92 },
    { name: 'INNOVATIVE', score: 78 },
    { name: 'TECHNICAL', score: 85 },
    { name: 'APPROACHABLE', score: 34 },
  ],
  aiKeywords: ['Scaleable', 'Compliant', 'Integration-Ready', 'High-Value', 'Legacy Support'],
};

// Insight card component
function InsightCard({ 
  title, 
  description, 
  color 
}: { 
  title: string; 
  description: string; 
  color: 'blue' | 'amber' | 'red' | 'green';
}) {
  const dotColors = {
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    green: 'bg-emerald-500',
  };

  // Parse description to highlight quoted text
  const parseDescription = (text: string) => {
    const parts = text.split(/(".*?")/g);
    return parts.map((part, i) => {
      if (part.startsWith('"') && part.endsWith('"')) {
        return (
          <span key={i} className="text-blue-400 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-[#1a1f2e] rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dotColors[color]}`} />
        <div>
          <h4 className="font-semibold text-white mb-1">{title}</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {parseDescription(description)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Perception tag progress bar
function PerceptionTagBar({ name, score }: { name: string; score: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return '#3b82f6'; // blue
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#3b82f6'; // blue
    return '#3b82f6'; // blue (all blue in design)
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400 text-xs tracking-wider">{name}</span>
        <span className="font-medium text-white">{score}%</span>
      </div>
      <div className="h-1.5 bg-[#1a1f2e] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${score}%`,
            backgroundColor: getColor(score),
          }}
        />
      </div>
    </div>
  );
}

export default function AuditPage() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <PageHeader
        title="Visibility Overview"
        timestamp={`Last full audit: ${auditData.lastAuditDate}`}
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-[#1a1f2e] border-[#2a3142] text-gray-300 hover:bg-[#252b3b] hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Fresh Audit
            </Button>
          </>
        }
      />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Score */}
        <div className="lg:col-span-1">
          <ScoreCard
            score={auditData.overallScore}
            change={auditData.scoreChange}
          />
        </div>

        {/* Right Column - Sub-scores */}
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <SubScoreCard
            title="Content Clarity"
            score={auditData.subScores.contentClarity.score}
            status={auditData.subScores.contentClarity.status}
            description={auditData.subScores.contentClarity.description}
            icon="content"
          />
          <SubScoreCard
            title="Entity Coverage"
            score={auditData.subScores.entityCoverage.score}
            status={auditData.subScores.entityCoverage.status}
            description={auditData.subScores.entityCoverage.description}
            icon="entity"
          />
          <SubScoreCard
            title="Answer-First Structure"
            score={auditData.subScores.answerFirst.score}
            status={auditData.subScores.answerFirst.status}
            description={auditData.subScores.answerFirst.description}
            icon="answer"
          />
          <SubScoreCard
            title="AI Readability"
            score={auditData.subScores.aiReadability.score}
            status={auditData.subScores.aiReadability.status}
            description={auditData.subScores.aiReadability.description}
            icon="readability"
          />
        </div>
      </div>

      {/* Bottom Section - Insights and Perception */}
      <div className="grid gap-6 lg:grid-cols-5 mt-6">
        {/* AI Insights - Takes 3 columns */}
        <div className="lg:col-span-3 bg-[#151922] border border-[#1e2433] rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">Top AI Insights</h3>
            <button className="p-1 rounded hover:bg-[#1e2433] transition-colors">
              <Info className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            How major models currently interpret your brand
          </p>
          <div className="space-y-3">
            {auditData.insights.map((insight, index) => (
              <InsightCard
                key={index}
                title={insight.title}
                description={insight.description}
                color={insight.color as 'blue' | 'amber'}
              />
            ))}
          </div>
        </div>

        {/* AI Perception Tags - Takes 2 columns */}
        <div className="lg:col-span-2 bg-[#151922] border border-[#1e2433] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-1">AI Perception Tags</h3>
          <p className="text-sm text-gray-500 mb-5">
            Sentiment and personality clusters
          </p>
          
          <div className="space-y-4">
            {auditData.perceptionTags.map((tag) => (
              <PerceptionTagBar key={tag.name} name={tag.name} score={tag.score} />
            ))}
          </div>

          {/* Common AI Keywords */}
          <div className="mt-6 pt-5 border-t border-[#1e2433]">
            <h4 className="text-xs font-medium text-gray-500 tracking-wider mb-3 uppercase">
              Common AI Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {auditData.aiKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1.5 bg-[#1a1f2e] text-gray-300 text-sm rounded-md border border-[#2a3142]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-[#1e2433]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2023 GEO Audit Analytics Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">System Status</a>
            <a href="#" className="hover:text-gray-300 transition-colors">API Documentation</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
