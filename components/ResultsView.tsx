import React, { useState } from 'react';
import { TestResult, JlptScore } from '../types';
import { RadarChart } from './RadarChart';
import { ExplanationModal } from './ExplanationModal';

interface ResultsViewProps {
  result: TestResult;
  onRetry: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onRetry }) => {
  const { benchmark, jlptScores } = result;
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          return "Anda sedang membangun fondasi literasi Anda. Menguatkan pengenalan kosakata dasar akan membuka kemampuan membaca yang jauh lebih luas. Teruslah berlatih!";
      }
      
      if (highestMastered.level === 'N1') {
          return "Kemampuan membaca Anda sangat tinggi, mencakup sebagian besar kosakata yang diuji dalam JLPT hingga level N1. Ini menandakan Anda dapat mengenali kata-kata dalam materi formal dan teknis dengan sangat baik.";
      }

      if (highestMastered && lowestChallenge) {
           return `Kekuatan utama Anda dalam mengenali kosakata berada di level ${highestMastered.level}. Tantangan berikutnya untuk memperluas jangkauan bacaan Anda adalah memperkuat kosakata di level ${lowestChallenge.level}.`;
      }
      
      return `Anda menunjukkan kemampuan membaca yang solid hingga level ${highestMastered.level}. Ini adalah dasar yang kuat untuk terus memperluas jangkauan bacaan Anda ke tingkat selanjutnya.`;
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto text-center px-4 py-8 animate-fade-in-up">
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>

          <h2 className="text-slate-400 text-sm uppercase tracking-widest mb-6 relative z-10">Hasil Uji Komprehensif</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-center">
              <div className="relative z-10 order-1">
                  <RadarChart data={jlptScores} />
              </div>
              <div className="flex flex-col gap-6 order-2">
                  <div className="text-left relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-slate-400 text-sm font-medium">Prediksi Jangkauan Kosakata Optimal</div>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="w-7 h-7 rounded-full bg-slate-700/70 hover:bg-emerald-500 flex items-center justify-center transition-all duration-300 group animate-pulse-subtle"
                          aria-label="Apa arti skor ini?"
                          title="Apa arti skor ini?"
                        >
                          <svg className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                      </div>
                      <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm">
                          {prediction.lower} - {prediction.upper}
                      </div>
                  </div>
                  
                  <div className="text-left bg-slate-900/40 p-6 rounded-2xl border border-slate-700/50 relative z-10">
                     <h3 className="text-emerald-400 font-bold text-base mb-3 flex items-center tracking-wide">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                          Analisis Profil Kosakata
                     </h3>
                     <p className="text-slate-300 leading-relaxed text-sm md:text-base">{getJlptAnalysis(jlptScores)}</p>
                  </div>
              </div>
          </div>

          <div className="text-left relative z-10 mb-12">
             <h3 className="text-slate-300 font-semibold mb-6 flex items-center text-sm uppercase tracking-wider">
                  <span className="w-2 h-6 bg-slate-600 rounded-full mr-3"></span>
                  Peta Kepadatan Pengetahuan
             </h3>
             <div className="space-y-4">
               {benchmark.densityStats.filter(b => b.total > 0).map((band, index) => (
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
                              opacity: 0.2 + (band.density/100 * 0.8),
                              transitionDelay: `${index * 100}ms`
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
      
      {isModalOpen && <ExplanationModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}