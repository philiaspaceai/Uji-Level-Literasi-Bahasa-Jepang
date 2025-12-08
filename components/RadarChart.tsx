import React from 'react';
import { RadarStats } from '../types';

interface RadarChartProps {
  stats: RadarStats;
}

export const RadarChart: React.FC<RadarChartProps> = ({ stats }) => {
  // Config
  const size = 300;
  const center = size / 2;
  const radius = 80; // Reduced from 100 to 80 to prevent label clipping
  const levels = 4; // Number of grid rings

  // Labels and Values
  const axes = [
    { label: 'Survival', value: stats.survival },
    { label: 'Formal', value: stats.formal },
    { label: 'Culture', value: stats.culture },
    { label: 'Literary', value: stats.literary },
    { label: 'Complexity', value: stats.complexity },
  ];

  // Helper to calculate coordinates
  const getCoordinates = (value: number, index: number, maxRadius: number) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    // Map value 0-100 to radius. Ensure a tiny minimum visual (5) so it's not invisible.
    const r = (Math.max(5, value) / 100) * maxRadius;
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    return { x, y };
  };

  // Generate Grid Points (The concentric pentagons)
  const gridPoints = Array.from({ length: levels }).map((_, levelIndex) => {
    const levelRadius = (radius / levels) * (levelIndex + 1);
    return axes.map((_, i) => {
      const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
      const x = center + Math.cos(angle) * levelRadius;
      const y = center + Math.sin(angle) * levelRadius;
      return `${x},${y}`;
    }).join(' ');
  });

  // Generate User Data Points
  const userPoints = axes.map((axis, i) => {
    const { x, y } = getCoordinates(axis.value, i, radius);
    return `${x},${y}`;
  }).join(' ');

  // Generate Axis Lines
  const axisLines = axes.map((_, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    return (
      <line
        key={i}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#334155" // slate-700
        strokeWidth="1"
      />
    );
  });

  // Generate Labels with specific offsets
  const labels = axes.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    const labelRadius = radius + 25; // Push label out slightly
    const x = center + Math.cos(angle) * labelRadius;
    const y = center + Math.sin(angle) * labelRadius;
    
    // Adjust text anchor based on position to ensure perfect centering
    let anchor = 'middle';
    let baseline = 'middle';
    
    // Top (Survival)
    if (i === 0) {
        anchor = 'middle';
        baseline = 'auto'; // push up
    }
    // Right Side (Formal, Culture)
    else if (i === 1 || i === 2) {
        anchor = 'start';
    }
    // Left Side (Literary, Complexity)
    else if (i === 3 || i === 4) {
        anchor = 'end';
    }

    // Fine tuning vertical alignment for bottom labels
    if (i === 2 || i === 3) {
        baseline = 'hanging'; // push down
    }

    return (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor={anchor}
        alignmentBaseline={baseline}
        className="text-[10px] fill-slate-400 font-bold uppercase tracking-wider"
        style={{ fontSize: '10px' }} // Explicit size for consistency
      >
        {axis.label}
      </text>
    );
  });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[280px] mx-auto aspect-square">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background Grid (Concentric Pentagons) */}
        {gridPoints.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill={i === levels - 1 ? "rgba(30, 41, 59, 0.5)" : "none"} // Fill only the outer shape slightly
            stroke="#1e293b" // slate-800
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines */}
        {axisLines}

        {/* Data Area */}
        <polygon
          points={userPoints}
          fill="rgba(16, 185, 129, 0.2)" // emerald-500 with opacity
          stroke="#10b981" // emerald-500
          strokeWidth="2"
          className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out"
        />

        {/* Data Points (Dots) */}
        {axes.map((axis, i) => {
           const { x, y } = getCoordinates(axis.value, i, radius);
           return (
             <circle
               key={i}
               cx={x}
               cy={y}
               r="3"
               fill="#34d399" // emerald-400
               className="animate-pulse"
             />
           );
        })}

        {/* Labels */}
        {labels}
      </svg>
    </div>
  );
};