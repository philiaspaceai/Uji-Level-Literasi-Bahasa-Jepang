import React, { useState } from 'react';
import { AppState, TestResult, Word } from './types';
import { prepareTestSession, calculateTestResult } from './services/vocabService';
import { TestView } from './components/TestView';
import { ResultsView } from './components/ResultsView';
import { ModeSelection } from './components/ModeSelection';
import { TOTAL_QUESTIONS_DEFAULT } from './constants';

export default function App() {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [testQueue, setTestQueue] = useState<{ id: number, bandId: number }[]>([]);
  const [wordMap, setWordMap] = useState<Map<number, Word>>(new Map());
  const [result, setResult] = useState<TestResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('Memuat data...');
  const [selectedTotalQuestions, setSelectedTotalQuestions] = useState(TOTAL_QUESTIONS_DEFAULT);
  
  // Transition State Management
  const [isTransitioning, setIsTransitioning] = useState(false);
  const TRANSITION_DURATION = 500; // ms

  // Helper to smooth transition between states
  const switchState = (newState: AppState, callback?: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAppState(newState);
      if (callback) callback();
      // Wait a tiny bit for the new DOM to mount before fading in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, TRANSITION_DURATION);
  };

  const handleStartClick = () => {
    switchState('MODE_SELECT');
  };

  const handleModeSelect = async (totalQuestions: number) => {
    setSelectedTotalQuestions(totalQuestions);
    
    // 1. Transition to Loading
    setIsTransitioning(true);
    
    setTimeout(async () => {
      setAppState('LOADING');
      setLoadingMsg('Menyiapkan soal tes...');
      setIsTransitioning(false);

      try {
        // 2. Prepare Session (Generate Candidates -> Fetch -> Filter Jukugo -> Finalize Queue)
        // Artificial delay for UX perception
        await new Promise(r => setTimeout(r, 500));
        setLoadingMsg('Menyaring kosakata Kanji...');
        
        const { queue, map } = await prepareTestSession(totalQuestions);
        
        setTestQueue(queue);
        setWordMap(map);
        
        // 3. Transition to Test
        switchState('TEST');

      } catch (error) {
        console.error(error);
        setLoadingMsg('Terjadi kesalahan koneksi.');
        setTimeout(() => switchState('WELCOME'), 2000);
      }
    }, TRANSITION_DURATION);
  };

  const handleTestComplete = (knownIds: Set<number>) => {
    // Transition to Results
    setIsTransitioning(true);
    
    // Calculate result while fading out
    // Pass selectedTotalQuestions AND wordMap to enable Volatility Damping and Jukugo Analysis
    const res = calculateTestResult(knownIds, testQueue, selectedTotalQuestions, wordMap);
    setResult(res);

    setTimeout(() => {
      setAppState('RESULTS');
      setTimeout(() => setIsTransitioning(false), 50);
    }, TRANSITION_DURATION);
  };

  const handleRetry = () => {
    switchState('WELCOME', () => {
        setResult(null);
        setTestQueue([]);
        setWordMap(new Map());
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-950 font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* Header / Logo - Only visible when in WELCOME mode */}
      <div className={`absolute top-6 left-6 flex items-center gap-2 transition-opacity duration-500 ${appState !== 'WELCOME' ? 'opacity-0 pointer-events-none' : 'opacity-70'}`}>
        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
        <div className="text-slate-300 font-bold tracking-widest text-xs uppercase">
            JP Kanji Literacy Test
        </div>
      </div>

      {/* Main Content Container with Transitions */}
      <main 
        className={`
          w-full flex flex-col items-center transition-all ease-in-out
          ${isTransitioning 
            ? 'opacity-0 scale-95 blur-sm duration-500' 
            : 'opacity-100 scale-100 blur-0 duration-500'
          }
        `}
      >
        {appState === 'WELCOME' && (
          <div className="text-center max-w-2xl p-6">
            <div className="inline-block px-4 py-1 mb-6 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold tracking-wider uppercase shadow-lg">
              Edisi Kemampuan Membaca
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
              Uji Level <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-400 to-indigo-400 animate-gradient-x filter drop-shadow-sm pb-2">
                Literasi Jepang
              </span>
            </h1>

            {/* Link to Philia Space */}
            <a 
              href="https://philiaspace.my.id/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors duration-300 mb-10 group font-medium text-sm md:text-base"
            >
              <span>Dibuat oleh Philia Space Community</span>
              <svg className="w-4 h-4 transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>

            <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed max-w-lg mx-auto">
              Metode statistik untuk mengukur seberapa banyak kata bahasa Jepang yang bisa 
              <span className="text-slate-200 font-semibold mx-1">Anda baca</span>. 
              Sistem Jukugo Filter menjamin akurasi tinggi dengan meminimalisir tebakan.
            </p>
            
            <button
              onClick={handleStartClick}
              className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-emerald-600 rounded-2xl focus:outline-none hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-95 active:bg-emerald-700"
            >
              <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
              <span className="text-lg relative z-10">Mulai</span>
              <svg className="w-6 h-6 ml-3 -mr-1 transition-transform duration-300 group-hover:translate-x-1 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </button>
            
            <div className="mt-12 text-slate-600 text-sm font-medium">
              3 Mode Tes Tersedia • Jukugo Filter • Guillotine Scoring
            </div>
          </div>
        )}

        {appState === 'MODE_SELECT' && (
          <ModeSelection 
            onSelect={handleModeSelect} 
            onBack={() => switchState('WELCOME')}
          />
        )}

        {appState === 'LOADING' && (
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
               <div className="absolute inset-3 border-b-4 border-teal-700 border-solid rounded-full animate-spin-reverse opacity-50"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-emerald-500 text-xs font-bold animate-pulse">JP</span>
               </div>
            </div>
            <p className="text-emerald-100/80 font-mono text-sm animate-pulse tracking-wide uppercase">{loadingMsg}</p>
          </div>
        )}

        {appState === 'TEST' && (
          <TestView 
            testQueue={testQueue}
            wordMap={wordMap}
            onComplete={handleTestComplete}
          />
        )}

        {appState === 'RESULTS' && result && (
          <ResultsView 
            result={result}
            onRetry={handleRetry}
          />
        )}
      </main>

    </div>
  );
}