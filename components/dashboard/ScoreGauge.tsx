'use client';

/**
 * ScoreGauge Component
 *
 * Circular donut gauge visualization for displaying GEO visibility scores.
 * Features animated progress ring with gradient and score label.
 * Matches the GEO Audit Dashboard design.
 */

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  /** Score value (0-100) */
  score: number;
  /** Size of the gauge in pixels */
  size?: number;
  /** Stroke width of the progress ring */
  strokeWidth?: number;
  /** Label text below the score */
  label?: string;
  /** Score change from previous audit */
  change?: number;
  /** Additional CSS classes */
  className?: string;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#3b82f6'; // blue
  if (score >= 40) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export function ScoreGauge({
  score,
  size = 220,
  strokeWidth = 16,
  label,
  change,
  className,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score on mount
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Start from top (270 degrees) and go clockwise
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      {/* Change badge */}
      {change !== undefined && change !== 0 && (
        <div className="absolute -top-2 right-0 z-10">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
              change > 0
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            )}
          >
            <svg
              className={cn('w-3 h-3', change < 0 && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            {change > 0 ? '+' : ''}{change}% vs last week
          </span>
        </div>
      )}

      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e2433"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${scoreColor}40)`,
          }}
        />
      </svg>

      {/* Score display in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline">
          <span 
            className="text-6xl font-bold"
            style={{ color: scoreColor }}
          >
            {animatedScore}
          </span>
          <span className="text-2xl text-gray-500 ml-1">/100</span>
        </div>
        <span 
          className="text-sm font-semibold tracking-wider mt-1"
          style={{ color: scoreColor }}
        >
          {scoreLabel}
        </span>
      </div>

      {/* Label below gauge */}
      {label && (
        <p className="text-sm text-gray-400 mt-4 text-center max-w-[200px] leading-relaxed">
          {label}
        </p>
      )}
    </div>
  );
}
