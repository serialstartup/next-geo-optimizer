'use client';

/**
 * TrendChart Component
 *
 * A simple line chart for displaying score trends over time.
 * Uses SVG for lightweight rendering without external chart libraries.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataPoint {
  /** Date label */
  date: string;
  /** Score value */
  value: number;
  /** Optional secondary value for comparison */
  value2?: number;
  /** Optional tertiary value */
  value3?: number;
}

interface TrendChartProps {
  /** Chart title */
  title: string;
  /** Data points to display */
  data: DataPoint[];
  /** Series labels for legend */
  series?: { name: string; color: string }[];
  /** Height of the chart area */
  height?: number;
  /** Additional CSS classes */
  className?: string;
}

export function TrendChart({
  title,
  data,
  series = [
    { name: 'GPT-4', color: '#3b82f6' },
    { name: 'Claude 3', color: '#f59e0b' },
    { name: 'Gemini', color: '#8b5cf6' },
  ],
  height = 200,
  className,
}: TrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className={cn('bg-card border-border', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate chart dimensions
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Find min/max values
  const allValues = data.flatMap((d) => [d.value, d.value2, d.value3].filter((v): v is number => v !== undefined));
  const minValue = Math.min(...allValues) * 0.95;
  const maxValue = Math.max(...allValues) * 1.05;

  // Scale functions
  const xScale = (index: number) => padding.left + (index / (data.length - 1)) * innerWidth;
  const yScale = (value: number) =>
    padding.top + innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight;

  // Generate path for a series
  const generatePath = (values: (number | undefined)[]) => {
    const validPoints = values
      .map((v, i) => (v !== undefined ? { x: xScale(i), y: yScale(v) } : null))
      .filter((p): p is { x: number; y: number } => p !== null);

    if (validPoints.length === 0) return '';

    return validPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  };

  const path1 = generatePath(data.map((d) => d.value));
  const path2 = generatePath(data.map((d) => d.value2));
  const path3 = generatePath(data.map((d) => d.value3));

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-4">
            {series.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs text-muted-foreground">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ height }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerHeight * (1 - ratio);
            const value = minValue + (maxValue - minValue) * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {Math.round(value)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={d.date}
              x={xScale(i)}
              y={chartHeight - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {d.date}
            </text>
          ))}

          {/* Line paths */}
          {path1 && (
            <path
              d={path1}
              fill="none"
              stroke={series[0]?.color || '#3b82f6'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {path2 && (
            <path
              d={path2}
              fill="none"
              stroke={series[1]?.color || '#f59e0b'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {path3 && (
            <path
              d={path3}
              fill="none"
              stroke={series[2]?.color || '#8b5cf6'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={xScale(i)}
                cy={yScale(d.value)}
                r={3}
                fill={series[0]?.color || '#3b82f6'}
              />
              {d.value2 !== undefined && (
                <circle
                  cx={xScale(i)}
                  cy={yScale(d.value2)}
                  r={3}
                  fill={series[1]?.color || '#f59e0b'}
                />
              )}
              {d.value3 !== undefined && (
                <circle
                  cx={xScale(i)}
                  cy={yScale(d.value3)}
                  r={3}
                  fill={series[2]?.color || '#8b5cf6'}
                />
              )}
            </g>
          ))}
        </svg>
      </CardContent>
    </Card>
  );
}
