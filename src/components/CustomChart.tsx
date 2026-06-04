import { useState, useRef } from 'react';
import { ChartDataPoint } from '../types';

interface CustomChartProps {
  data: ChartDataPoint[];
  type: 'rating' | 'reviews' | 'downloads';
  strokeColor?: string;
  fillColor?: string;
}

export default function CustomChart({ data, type, strokeColor = '#10b981', fillColor = 'rgba(16, 185, 129, 0.12)' }: CustomChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) return null;

  // Chart Dimensions & Padding
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values) * 0.98; // add buffer
  const maxVal = Math.max(...values) * 1.02; // add buffer
  const valRange = maxVal - minVal || 1;

  // Calculate coordinates points
  const points = data.map((item, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((item.value - minVal) / valRange) * (height - paddingY * 2);
    return { x, y, value: item.value, date: item.date };
  });

  // SVG Line path builder
  let pathD = '';
  points.forEach((pt, idx) => {
    if (idx === 0) {
      pathD += `M ${pt.x} ${pt.y}`;
    } else {
      // Add subtle curve
      const prev = points[idx - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }
  });

  // SVG Fill path builder (closed polygon under curve)
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const fillD = `${pathD} L ${lastPt.x} ${height - paddingY} L ${firstPt.x} ${height - paddingY} Z`;

  // Dynamic axis ticks
  const midVal = minVal + valRange / 2;
  const yTicks = [minVal, midVal, maxVal];

  const formatTick = (val: number) => {
    if (type === 'rating') return val.toFixed(1);
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toLocaleString();
  };

  return (
    <div className="w-full" ref={containerRef} id={`chart-${type}`}>
      {/* Metrics Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            {type === 'rating' ? 'Interactive Average Rating Track' : type === 'reviews' ? 'Review Submission Adoption Curve' : 'Download Growth Track'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-display font-medium text-zinc-100">
              {hoveredIdx !== null ? formatTick(points[hoveredIdx].value) : formatTick(points[points.length - 1].value)}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              +{(12 + points.length).toFixed(1)}% YoY
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-zinc-400">
            {hoveredIdx !== null ? points[hoveredIdx].date : 'Current Segment'}
          </span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative bg-zinc-950/60 rounded-xl p-3 border border-emerald-500/10 backdrop-blur-sm">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Gradients declarations */}
          <defs>
            <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id={`lineGrad-${type}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={`${strokeColor}cc`} />
              <stop offset="100%" stopColor={strokeColor} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(16, 185, 129, 0.04)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(16, 185, 129, 0.04)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(16, 185, 129, 0.08)" />

          {/* Y-Axis Labels */}
          {yTicks.map((tick, i) => {
            const y = height - paddingY - ((tick - minVal) / valRange) * (height - paddingY * 2);
            return (
              <text
                key={i}
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-zinc-500 font-mono text-[9px] font-medium"
              >
                {formatTick(tick)}
              </text>
            );
          })}

          {/* Area under line */}
          <path d={fillD} fill={`url(#grad-${type})`} />

          {/* Core Curve */}
          <path
            d={pathD}
            fill="none"
            stroke={`url(#lineGrad-${type})`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactives grid lines on point hover */}
          {hoveredIdx !== null && (
            <g>
              <line
                x1={points[hoveredIdx].x}
                y1={paddingY}
                x2={points[hoveredIdx].x}
                y2={height - paddingY}
                stroke="rgba(16, 185, 129, 0.25)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <circle
                cx={points[hoveredIdx].x}
                cy={points[hoveredIdx].y}
                r="6"
                fill="#030d0a"
                stroke={strokeColor}
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Bottom X-Axis Ticks (Dates) */}
          {points.map((pt, idx) => {
            // output every second label to avoid visual crowding
            const isLabelVisible = idx % 2 === 0 || idx === points.length - 1;
            if (!isLabelVisible) return null;
            return (
              <g key={idx}>
                <text
                  x={pt.x}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-zinc-400 font-display text-[9px] font-medium"
                >
                  {pt.date}
                </text>
                <line
                  x1={pt.x}
                  y1={height - paddingY}
                  x2={pt.x}
                  y2={height - paddingY + 3}
                  stroke="rgba(16, 185, 129, 0.2)"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Hover tracker overlays */}
          {points.map((pt, idx) => {
            const cellWidth = (width - paddingX * 2) / (points.length - 1);
            const triggerX = pt.x - cellWidth / 2;
            return (
              <rect
                key={idx}
                x={triggerX}
                y={paddingY - 5}
                width={cellWidth}
                height={height - paddingY * 2 + 10}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
