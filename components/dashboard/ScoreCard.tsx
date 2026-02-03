'use client';

/**
 * ScoreCard Component
 *
 * A larger card component for displaying the main GEO visibility score
 * with gauge visualization and contextual information.
 * Matches the GEO Audit Dashboard design.
 */

import { cn } from '@/lib/utils';
import { ScoreGauge } from './ScoreGauge';
import { Download, Share2, History } from 'lucide-react';

interface ScoreCardProps {
  /** Overall GEO visibility score (0-100) */
  score: number;
  /** Score change from previous audit */
  change?: number;
  /** Title for the card */
  title?: string;
  /** Description text */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

export function ScoreCard({
  score,
  change,
  title = 'OVERALL GEO VISIBILITY',
  description = 'Your brand is significantly recognized by major LLMs. Optimizing Answer-First Structure could push you into the Top 5% tier.',
  className,
}: ScoreCardProps) {
  return (
    <div className={cn(
      'bg-[#151922] border border-[#1e2433] rounded-xl p-6',
      className
    )}>
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
          {title}
        </h2>
      </div>

      {/* Score Gauge */}
      <div className="flex justify-center">
        <ScoreGauge
          score={score}
          change={change}
          size={200}
          strokeWidth={14}
        />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 text-center mt-6 leading-relaxed max-w-[280px] mx-auto">
        {description.split('Answer-First Structure').map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <span className="font-semibold text-white">Answer-First Structure</span>
            )}
          </span>
        ))}
      </p>

      {/* Quick action icons */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          className="p-2.5 rounded-lg bg-[#1a1f2e] hover:bg-[#252b3b] transition-colors"
          title="Download Report"
        >
          <Download className="w-4 h-4 text-gray-400" />
        </button>
        <button
          className="p-2.5 rounded-lg bg-[#1a1f2e] hover:bg-[#252b3b] transition-colors"
          title="Share Results"
        >
          <Share2 className="w-4 h-4 text-gray-400" />
        </button>
        <button
          className="p-2.5 rounded-lg bg-[#1a1f2e] hover:bg-[#252b3b] transition-colors"
          title="View History"
        >
          <History className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
