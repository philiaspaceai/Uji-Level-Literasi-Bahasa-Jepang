import React from 'react';
import { TEST_MODES } from '../constants';

interface ModeSelectionProps {
  onSelect: (total: number) => void;
  onBack: () => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelect, onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 animate-fade-in-up">
      <div className="text-center mb-10">
        <button 
          onClick={onBack}
          className="mb-6 text-slate-500 hover:text-emerald-400 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Kembali ke Menu Utama
        </button>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pilih Mode Tes</h2>
        <p className="text-slate-400">Pilih durasi dan akurasi yang sesuai dengan waktu luang Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEST_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.totalQuestions)}
            className="group relative flex flex-col items-center p-8 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-center shadow-xl hover:shadow-emerald-900/20"
          >
            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md">
              {mode.icon}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              {mode.label}
            </h3>
            
            <div className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
              {mode.totalQuestions} Kata • {mode.estimatedTime}
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed">
              {mode.description}
            </p>

            <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-500/20 rounded-2xl transition-all duration-300"></div>
          </button>
        ))}
      </div>
    </div>
  );
};