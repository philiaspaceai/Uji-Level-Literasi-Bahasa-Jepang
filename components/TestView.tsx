import React from 'react';
import { Word } from '../types';
import { Card } from './Card';

interface TestViewProps {
  displayQueue: { id: number, bandId: number }[];
  wordMap: Map<number, Word>;
  onAnswer: (itemId: number) => void;
  onRefresh: () => void;
  wordsAnsweredCount: number;
  isRefreshing: boolean;
  networkStatusMessage: string;
}

export const TestView: React.FC<TestViewProps> = ({ displayQueue, wordMap, onAnswer, onRefresh, wordsAnsweredCount, isRefreshing, networkStatusMessage }) => {

  const handleCardClick = (itemId: number) => {
    onAnswer(itemId);
  };
  
  const activeItems = displayQueue.filter(item => wordMap.has(item.id));

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4">
      
      <div className="w-full max-w-3xl mx-auto mb-6 text-center">
        <div className="text-sm text-slate-400 font-medium">
            Kosakata Ditemukan
        </div>
        <div className="text-5xl font-bold text-emerald-400 font-mono mt-1 tracking-wider">
            {wordsAnsweredCount}
        </div>
      </div>

      <div className="w-full text-center mb-6 animate-fade-in-up px-4">
        <h2 className="text-xl md:text-2xl text-slate-200 font-light">
          Pilih semua kata yang <span className="text-emerald-400 font-bold">Anda tahu cara bacanya</span>.
        </h2>
        <p className="text-sm text-slate-500 mt-2">Jika tidak ada lagi yang diketahui, tekan 'Refresh'.</p>
      </div>

      {/* CRITICAL CHANGE: added will-change-transform to isolate rendering layer */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full mb-32 will-change-transform">
        {Array.from({ length: 10 }).map((_, idx) => {
           const item = activeItems[idx];
           const word = item ? wordMap.get(item.id) : null;
           return (
             <div key={item?.id || `placeholder-${idx}`} className="aspect-[4/3] w-full relative">
                {(item && word) ? (
                   <Card 
                     word={word.word}
                     // CRITICAL CHANGE: removed triggerKey prop
                     onClick={() => handleCardClick(item.id)}
                   />
                ) : (
                   <div className="w-full h-full rounded-xl border border-slate-800 bg-slate-900/30 flex items-center justify-center transition-opacity duration-500">
                      {isRefreshing && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>}
                   </div>
                )}
             </div>
           );
        })}
      </div>
      
      <div className="fixed bottom-24 left-0 right-0 px-4 flex justify-center items-center z-20 text-center pointer-events-none">
          {networkStatusMessage && (
              <div className="pointer-events-auto bg-slate-900/70 text-emerald-300 border border-slate-700 py-2 px-4 rounded-full text-xs font-mono backdrop-blur-sm transition-all animate-fade-in-up">
                  {networkStatusMessage}
              </div>
          )}
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center items-center z-10 will-change-transform">
         <button 
           onClick={onRefresh}
           disabled={isRefreshing}
           className="pointer-events-auto bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600 hover:border-emerald-500 py-4 px-12 rounded-full font-bold text-lg transition-all shadow-2xl backdrop-blur-md transform hover:scale-105 active:scale-95 disabled:cursor-wait disabled:bg-slate-800 disabled:scale-100"
           title="Ganti semua kata yang tidak diketahui"
         >
           {isRefreshing ? (
             <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memuat...
             </div>
           ) : (
            'Refresh'
           )}
         </button>
      </div>
    </div>
  );
};