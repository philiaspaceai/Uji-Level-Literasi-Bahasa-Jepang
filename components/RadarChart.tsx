
import React from 'react';
import { JlptScore } from '../types';

interface RadarChartProps {
  data: JlptScore[];
}

// A score is only considered statistically significant if based on at least this many questions.
const MIN_SAMPLES_FOR_VALID_SCORE = 3;

export const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const size = 300;
  const center = size / 2;
  const numLevels = 5; // N5 to N1
  const radius = size * 0.4;

  const points = data.map((item, i) => {
    const angle = (Math.PI / 2) - (2 * Math.PI * i) / numLevels;
    // For the filled area, only use scores that are statistically significant. Otherwise, treat as 0.
    const score = item.total >= MIN_SAMPLES_FOR_VALID_SCORE ? item.score / 100 : 0;
    const x = center + radius * score * Math.cos(angle);
    const y = center - radius * score * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const levelPoints = (level: number) => {
    return Array.from({ length: numLevels }).map((_, i) => {
      const angle = (Math.PI / 2) - (2 * Math.PI * i) / numLevels;
      const x = center + radius * level * Math.cos(angle);
      const y = center - radius * level * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const axisPoints = data.map((_, i) => {
    const angle = (Math.PI / 2) - (2 * Math.PI * i) / numLevels;
    const x = center + radius * 1.15 * Math.cos(angle);
    const y = center - radius * 1.15 * Math.sin(angle);
    return { x, y, label: data[i].level };
  });

  const validDataExists = data.some(d => d.total > 0);

  if (!validDataExists) {
    return (
        <div className="w-full aspect-square flex flex-col items-center justify-center bg-slate-900/40 rounded-2xl border border-slate-700/50 p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <h4 className="font-semibold text-slate-300">Data JLPT Tidak Cukup</h4>
            <p className="text-sm text-slate-400 mt-1">Tidak ada kata bertanda JLPT yang muncul selama tes Anda untuk membuat analisis ini.</p>
        </div>
    );
  }

  return (
    <div className="relative w-full max-w-xs mx-auto aspect-square">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            <g className="grid-lines">
                {[0.25, 0.5, 0.75, 1.0].map(level => (
                    <polygon
                        key={level}
                        points={levelPoints(level)}
                        className="fill-none stroke-slate-700"
                        strokeWidth="1"
                    />
                ))}
            </g>
            <g className="axes">
                {axisPoints.map((p, i) => (
                    <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={p.x}
                        y2={p.y}
                        className="stroke-slate-600"
                        strokeWidth="1"
                    />
                ))}
            </g>
            <g className="labels">
                {axisPoints.map((p, i) => (
                    <text
                        key={i}
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        dy="0.3em"
                        className="fill-slate-400 font-bold text-[10px]"
                    >
                        {p.label}
                    </text>
                ))}
            </g>
             <g className="score-area">
                <polygon points={points} className="fill-emerald-500/30 stroke-emerald-400" strokeWidth="2" />
            </g>
            <g className="score-points">
                {data.map((item, i) => {
                  const angle = (Math.PI / 2) - (2 * Math.PI * i) / numLevels;
                  // The point's position is always based on the actual score.
                  const score = item.score / 100;
                  const x = center + radius * score * Math.cos(angle);
                  const y = center - radius * score * Math.sin(angle);
                  
                  if (item.total === 0) return null;

                  if (item.total >= MIN_SAMPLES_FOR_VALID_SCORE) {
                    // Statistically significant: Solid point
                    return <circle key={i} cx={x} cy={y} r="3" className="fill-white" />;
                  } else {
                    // Data exists but is not significant: Hollow point
                    return <circle key={i} cx={x} cy={y} r="3" className="fill-none stroke-white/50" strokeWidth="1.5" />;
                  }
                })}
            </g>
        </svg>
    </div>
  );
};
