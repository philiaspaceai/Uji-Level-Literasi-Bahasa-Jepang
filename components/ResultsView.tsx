

import React from 'react';
import { TestResult, JlptScore } from '../types';
import { RadarChart } from './RadarChart';

interface ResultsViewProps {
  result: TestResult;
  onRetry: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onRetry }) => {
  const { benchmark, jlptScores } = result;

  const calculatePredictionInterval = (coverage: number) => {
    const lowerBound = Math.floor((coverage * 0.85) / 500) * 500;
    let upperBound = Math.ceil((coverage * 1.15) / 500) * 500;

    // Ensure there's always a range, even for low scores, and they don't overlap.
    if (upperBound <= lowerBound) {
        upperBound = lowerBound + 500;
    }

    return {
        lower: lowerBound.toLocaleString(),
        upper: upperBound.toLocaleString()
    };
  };

  const prediction = calculatePredictionInterval(benchmark.coverageRank);

  const getJlptAnalysis = (scores: JlptScore[]) => {
      const highestMastered = scores.slice().reverse().find(s => s.score > 60 && s.total > 2);
      const lowestChallenge = scores.find(s => s.score < 50 && s.total > 2);

      if (!highestMastered) {
          return "Anda berada di tahap awal perjalanan literasi Anda. Fondasi kosakata dasar adalah kunci untuk membuka pemahaman yang lebih luas. Teruslah berlatih!";
      }
      
      if (highestMastered.level === 'N1') {
          return "Anda telah mencapai puncak penguasaan kosakata JLPT. Kemampuan literasi Anda memungkinkan Anda untuk memahami materi formal dan teknis dengan sangat baik.";
      }

      if (highestMastered && lowestChallenge) {
           return `Kekuatan utama Anda berada di level ${highestMastered.level}, menunjukkan pemahaman yang solid pada tingkat tersebut. Tantangan berikutnya adalah memperkuat kosakata di level ${lowestChallenge.level} untuk kemajuan yang signifikan.`;
      }
      
      return `Anda menunjukkan penguasaan yang baik hingga level ${highestMastered.level}. Ini adalah pencapaian luar biasa yang menjadi dasar kuat untuk terus berkembang ke tingkat selanjutnya.`;
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-center px-4 py-8 animate-fade-in-up">
      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>

        <h2 className="text-slate-400 text-sm uppercase tracking-widest mb-6 relative z-10">Hasil Uji Komprehensif</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-center">
            <div className="relative z-10 order-1">
                <RadarChart data={jlptScores} />
            </div>
            <div className="text-left relative z-10 order-2">
                <div className="mb-8 lg:mb-0">
                    <div className="text-slate-400 text-sm font-medium mb-2">Prediksi Jangkauan Kosakata Optimal</div>
                    <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm">
                        {prediction.lower} - {prediction.upper}
                    </div>
                </div>
            </div>
        </div>


        <div className="text-left mb-12 bg-slate-900/40 p-6 rounded-2xl border border-slate-700/50 relative z-10">
           <h3 className="text-emerald-400 font-bold text-base mb-3 flex items-center tracking-wide">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                Analisis Profil Kosakata
           </h3>
           <p className="text-slate-300 leading-relaxed text-sm md:text-base">{getJlptAnalysis(jlptScores)}</p>
        </div>

        <div className="text-left relative z-10 mb-12">
           <h3 className="text-slate-300 font-semibold mb-6 flex items-center text-sm uppercase tracking-wider">
                <span className="w-2 h-6 bg-slate-600 rounded-full mr-3"></span>
                Peta Kepadatan Pengetahuan
           </h3>
           <div className="space-y-4">
             {benchmark.densityStats.filter(b => b.total > 0).map((band) => (
                <div key={band.bandId}>
                   <div className="flex justify-between items-center text-xs text-slate-400 mb-1 font-mono">
                      <span>RANK {band.startRank.toLocaleString()} - {band.endRank.toLocaleString()}</span>
                       <span className="flex items-center gap-2">
                         <span className="font-bold text-base">{band.density}%</span>
                       </span>
                   </div>
                   <div className="h-4 w-full bg-slate-900 rounded border border-slate-800 p-0.5">
                      <div 
                        className="h-full rounded-sm bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-1000" 
                        style={{ 
                            width: `${band.density}%`,
                            opacity: 0.2 + (band.density/100 * 0.8)
                        }} 
                      />
                   </div>
                </div>
             ))}
           </div>
        </div>

        <button
          onClick={onRetry}
          className="relative z-10 bg-slate-100 hover:bg-white text-slate-900 font-bold py-4 px-12 rounded-full transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-95"
        >
          Ukur Ulang
        </button>
      </div>
    </div>
  );
}