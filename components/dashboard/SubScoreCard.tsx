'use client';

/**
 * SubScoreCard Component
 *
 * Displays an individual sub-score with wave pattern progress visualization,
 * status indicator, and description. Used in the GEO Audit dashboard.
 * Matches the GEO Audit Dashboard design.
 */

import { cn } from '@/lib/utils';
import type { ScoreStatus } from '@/types/database';
import {
  FileText,
  Sparkles,
  MessageSquare,
  Bot,
  type LucideIcon,
} from 'lucide-react';

interface SubScoreCardProps {
  /** Score name/title */
  title: string;
  /** Score value (0-100) */
  score: number;
  /** Status classification */
  status: ScoreStatus;
  /** Description of what this score measures */
  description: string;
  /** Icon type for the card */
  icon?: 'content' | 'entity' | 'answer' | 'readability';
  /** Additional CSS classes */
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  content: FileText,
  entity: Sparkles,
  answer: MessageSquare,
  readability: Bot,
};

const iconColorMap: Record<string, string> = {
  content: 'text-amber-400 bg-amber-400/10',
  entity: 'text-purple-400 bg-purple-400/10',
  answer: 'text-amber-400 bg-amber-400/10',
  readability: 'text-emerald-400 bg-emerald-400/10',
};

const statusConfig: Record<ScoreStatus, { label: string; color: string }> = {
  excellent: { label: 'EXCELLENT', color: '#22c55e' },
  optimal: { label: 'OPTIMAL', color: '#3b82f6' },
  improving: { label: 'IMPROVING', color: '#f59e0b' },
  needs_focus: { label: 'NEEDS FOCUS', color: '#ef4444' },
};

function getScoreColor(score: number): string {
  if (score >= 85) return '#22c55e'; // green
  if (score >= 70) return '#3b82f6'; // blue
  if (score >= 50) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

// SVG wave pattern for progress bar
function WaveProgress({ score, color }: { score: number; color: string }) {
  const width = 100;
  const height = 24;
  const waveHeight = 4;
  const waveCount = 8;
  
  // Generate wave path
  const generateWavePath = () => {
    const segmentWidth = width / waveCount;
    let path = `M 0 ${height / 2}`;
    
    for (let i = 0; i < waveCount; i++) {
      const x1 = i * segmentWidth + segmentWidth / 4;
      const x2 = i * segmentWidth + segmentWidth / 2;
      const x3 = i * segmentWidth + (3 * segmentWidth) / 4;
      const x4 = (i + 1) * segmentWidth;
      
      const y1 = height / 2 - waveHeight;
      const y2 = height / 2 + waveHeight;
      
      path += ` Q ${x1} ${y1}, ${x2} ${height / 2}`;
      path += ` Q ${x3} ${y2}, ${x4} ${height / 2}`;
    }
    
    return path;
  };

  return (
    <div className="relative w-full h-6 mt-3 overflow-hidden rounded">
      {/* Background */}
      <div className="absolute inset-0 bg-[#1a1f2e] rounded" />
      
      {/* Wave progress */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id={`wave-clip-${score}`}>
            <rect x="0" y="0" width={score} height={height} />
          </clipPath>
        </defs>
        
        {/* Wave path with clip */}
        <path
          d={generateWavePath()}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          clipPath={`url(#wave-clip-${score})`}
          style={{
            filter: `drop-shadow(0 0 4px ${color}60)`,
          }}
        />
      </svg>
    </div>
  );
}

export function SubScoreCard({
  title,
  score,
  status,
  description,
  icon = 'content',
  className,
}: SubScoreCardProps) {
  const Icon = iconMap[icon] || FileText;
  const iconColors = iconColorMap[icon] || iconColorMap.content;
  const scoreColor = getScoreColor(score);
  const statusInfo = statusConfig[status];

  return (
    <div className={cn(
      'bg-[#151922] border border-[#1e2433] rounded-xl p-5',
      className
    )}>
      {/* Header with icon and score */}
      <div className="flex items-start justify-between mb-2">
        <div className={cn('p-2 rounded-lg', iconColors.split(' ')[1])}>
          <Icon className={cn('w-5 h-5', iconColors.split(' ')[0])} />
        </div>
        <div className="text-right">
          <span 
            className="text-2xl font-bold"
            style={{ color: scoreColor }}
          >
            {score}%
          </span>
          <div 
            className="text-xs font-semibold tracking-wider mt-0.5"
            style={{ color: statusInfo.color }}
          >
            {statusInfo.label}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-white text-base mb-1">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed mb-1">
        {description}
      </p>

      {/* Wave progress bar */}
      <WaveProgress score={score} color={scoreColor} />
    </div>
  );
}
