import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(100, (current / total) * 100);
  
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex justify-between text-sm text-slate-400 mb-2 font-medium">
        <span>Progress Tes</span>
        <span>{current} / {total}</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};