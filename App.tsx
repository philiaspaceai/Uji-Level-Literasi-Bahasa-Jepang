import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, TestResult, Word } from './types';
import { fetchStagedBatchWithRetry, calculateTestResult } from './services/vocabService';
import { TestView } from './components/TestView';
import { ResultsView } from './components/ResultsView';
import { STAGE_PARAMS, BANDS, getWordsPerBandToAdvance, getMaxRefreshesPerBand } from './constants';

const DISPLAY_SIZE = STAGE_PARAMS.BATCH_SIZE;
const BUFFER_SIZE = STAGE_PARAMS.BATCH_SIZE;

const LOADING_MESSAGES = [
  'Menganalisis frekuensi kata...',
  'Menyiapkan pertanyaan tes...',
  'Mengkalibrasi tingkat kesulitan...',
  'Hampir selesai...',
];

export default function App() {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  
  // --- Smart Queue State ---
  const [displayQueue, setDisplayQueue] = useState<{ id: number, bandId: number }[]>([]);
  const [prefetchQueue, setPrefetchQueue] = useState<{ id: number, bandId: number }[]>([]);
  
  const [wordMap, setWordMap] = useState<Map<number, Word>>(new Map());
  const [answersHistory, setAnswersHistory] = useState<{ id: number, bandId: number, isKnown: boolean }[]>([]);
  
  const [currentBandId, setCurrentBandId] = useState(1);
  const [refreshCounts, setRefreshCounts] = useState<Record<number, number>>({});
  const [wordsAnsweredInBand, setWordsAnsweredInBand] = useState<Record<number, number>>({});

  const [result, setResult] = useState<TestResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [networkStatusMessage, setNetworkStatusMessage] = useState<string>('');
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const shownIdsRef = useRef<Set<number>>(new Set());
  const isFetchingRef = useRef(false);

  const TRANSITION_DURATION = 500;

  useEffect(() => {
    if (appState === 'LOADING') {
      const interval = setInterval(() => {
        setLoadingMsg(prevMsg => {
          const currentIndex = LOADING_MESSAGES.indexOf(prevMsg);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const switchState = (newState: AppState, callback?: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAppState(newState);
      if (callback) callback();
      setTimeout(() => setIsTransitioning(false), 50);
    }, TRANSITION_DURATION);
  };

  const finishTest = useCallback(() => {
    if (appState === 'RESULTS' || appState === 'CALCULATING') return;

    // Immediately switch to the calculating view to provide feedback.
    setAppState('CALCULATING');

    // Use a short timeout to allow the UI to re-render to the 'CALCULATING' state
    // before starting the potentially blocking calculation.
    setTimeout(() => {
        const finalUnanswered = displayQueue.map(item => ({...item, isKnown: false }));
        const finalHistory = [...answersHistory, ...finalUnanswered];
        const res = calculateTestResult(finalHistory, wordMap);
        
        setAnswersHistory(finalHistory);
        setResult(res);
        switchState('RESULTS'); // Now, transition smoothly to the results page.
    }, 50);
  }, [appState, displayQueue, wordMap, answersHistory]);

  const refillPrefetchQueue = useCallback(async (bandId: number) => {
    try {
        const { queue: newWords, map: newWordMap } = await fetchStagedBatchWithRetry(
          bandId, 
          shownIdsRef.current, 
          1 // only fetch one for the buffer
        );
        if (newWords.length > 0) {
            setPrefetchQueue(prev => [...prev, ...newWords]);
            setWordMap(prev => new Map([...prev, ...newWordMap]));
        } else {
            console.warn("Buffer refill failed: No more words available from this band onwards.");
        }
    } catch (e) {
        console.error("Error refilling prefetch queue:", e);
    }
  }, []);

  const loadInitialQueues = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setAppState('LOADING');

    try {
        const totalToFetch = DISPLAY_SIZE + BUFFER_SIZE;
        const { queue, map } = await fetchStagedBatchWithRetry(
            1, 
            shownIdsRef.current, 
            totalToFetch,
            (attempt, max) => setNetworkStatusMessage(`Koneksi lambat. Mencoba lagi... (${attempt}/${max})`)
        );
        setNetworkStatusMessage('');
        
        if (queue.length < DISPLAY_SIZE) { // Check if we at least have enough for display
            setLoadingMsg('Kosakata tidak cukup untuk memulai tes.');
            setTimeout(() => switchState('WELCOME'), 2000);
            return;
        }

        setDisplayQueue(queue.slice(0, DISPLAY_SIZE));
        setPrefetchQueue(queue.slice(DISPLAY_SIZE));
        setWordMap(prev => new Map([...prev, ...map]));
        setCurrentBandId(1);
        switchState('TEST');
    } catch (error) {
        console.error(error);
        setNetworkStatusMessage('');
        setLoadingMsg('Gagal memuat. Coba lagi.');
        setTimeout(() => switchState('WELCOME'), 2000);
    } finally {
        isFetchingRef.current = false;
    }
  }

  const handleStart = () => {
    shownIdsRef.current.clear();
    setAnswersHistory([]);
    setWordMap(new Map());
    setRefreshCounts({});
    setWordsAnsweredInBand({});
    loadInitialQueues();
  };

  const handleAnswer = (itemId: number) => {
    const itemInQueue = displayQueue.find(q => q.id === itemId);
    if (!itemInQueue) return;

    // 1. Process the answer immediately
    setAnswersHistory(prev => [...prev, { ...itemInQueue, isKnown: true }]);
    
    // 2. Check if prefetch buffer has a replacement
    if (prefetchQueue.length === 0) {
        console.warn("Prefetch queue is empty. Ending test.");
        finishTest();
        return;
    }
    
    // 3. Instant replacement from buffer
    const nextWord = prefetchQueue[0];
    setPrefetchQueue(prev => prev.slice(1));
    setDisplayQueue(prev => {
        const index = prev.findIndex(q => q.id === itemId);
        const newQueue = [...prev];
        if (index !== -1) newQueue[index] = nextWord;
        return newQueue;
    });

    // 4. Determine which band to fetch from for the buffer refill
    const newCount = (wordsAnsweredInBand[currentBandId] || 0) + 1;
    setWordsAnsweredInBand(prev => ({ ...prev, [currentBandId]: newCount }));
    
    let bandToFetchFrom = currentBandId;
    if (newCount >= getWordsPerBandToAdvance(currentBandId) && currentBandId < BANDS.length) {
        const nextBandId = currentBandId + 1;
        setCurrentBandId(nextBandId);
        bandToFetchFrom = nextBandId;
    }
    
    // 5. Trigger buffer refill in the background
    refillPrefetchQueue(bandToFetchFrom);
  };
  
  const handleRefreshBatch = async () => {
    if (isRefreshing) return;

    // Mark all visible words as unknown before refreshing
    const unansweredOnScreen = displayQueue.map(item => ({ ...item, isKnown: false }));
    setAnswersHistory(prev => [...prev, ...unansweredOnScreen]);

    const newCounts = { ...refreshCounts };
    const currentCount = (newCounts[currentBandId] || 0) + 1;
    newCounts[currentBandId] = currentCount;
    setRefreshCounts(newCounts);

    if (currentCount >= getMaxRefreshesPerBand(currentBandId)) {
      finishTest();
    } else {
      setIsRefreshing(true);
      try {
        const totalToFetch = DISPLAY_SIZE + BUFFER_SIZE;
        const { queue, map } = await fetchStagedBatchWithRetry(
            currentBandId, 
            shownIdsRef.current, 
            totalToFetch,
            (attempt, max) => setNetworkStatusMessage(`Koneksi lambat. Mencoba lagi... (${attempt}/${max})`)
        );
        setNetworkStatusMessage('');
        
        if (queue.length < DISPLAY_SIZE) {
            console.warn(`Could not fetch a full refresh batch. Ending test.`);
            finishTest();
        } else {
            setDisplayQueue(queue.slice(0, DISPLAY_SIZE));
            setPrefetchQueue(queue.slice(DISPLAY_SIZE));
            setWordMap(prev => new Map([...prev, ...map]));
        }
      } catch (e) {
        console.error("Failed to refresh batch", e);
        setNetworkStatusMessage('');
        finishTest();
      } finally {
        // Defer setting isRefreshing to false to the next event loop cycle.
        // This ensures the DOM has a chance to update with the new words
        // before the loading state is removed, preventing the UI from getting "stuck".
        setTimeout(() => setIsRefreshing(false), 0);
      }
    }
  };

  const handleRetry = () => {
    switchState('WELCOME', () => {
        setResult(null);
        setDisplayQueue([]);
        setPrefetchQueue([]);
        setWordMap(new Map());
        setAnswersHistory([]);
        setRefreshCounts({});
        setWordsAnsweredInBand({});
        shownIdsRef.current.clear();
    });
  };

  const knownWordsCount = answersHistory.filter(a => a.isKnown).length;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-950 font-sans selection:bg-emerald-500/30 overflow-hidden">
      
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
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-2xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-400 to-indigo-400 animate-gradient-x filter drop-shadow-sm pb-2">
                Tes Frekuensi Kosakata Jepang
              </span>
            </h1>
            <p className="text-sm text-slate-400 italic mb-8">
              Dibuat dengan frekuensi dari database BCCWJ (Balanced Corpus of Contemporary Written Japanese)
            </p>
            <a href="https://philiaspace.my.id/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors duration-300 mb-10 group font-medium text-sm md:text-base">
              <span>Philia Space Community</span>
              <svg className="w-4 h-4 transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
            <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed max-w-lg mx-auto">
              Ukur jangkauan kosakata Anda level demi level, dari 70.000 kata tersering dalam bahasa Jepang modern. Sistem akan mengukur batas kemampuan Anda secara otomatis.
            </p>
            <button
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-emerald-300 via-cyan-400 to-indigo-400 animate-gradient-x rounded-2xl focus:outline-none hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-95"
            >
              <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
              <span className="text-lg relative z-10">Mulai Tes</span>
              <svg className="w-6 h-6 ml-3 -mr-1 transition-transform duration-300 group-hover:translate-x-1 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </button>
          </div>
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
            <p className="text-emerald-100/80 font-mono text-sm tracking-wide uppercase transition-opacity duration-500">{loadingMsg}</p>
            {networkStatusMessage && <p className="text-emerald-300/60 font-mono text-xs mt-4">{networkStatusMessage}</p>}
          </div>
        )}

        {appState === 'CALCULATING' && (
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
               <div className="absolute inset-3 border-b-4 border-teal-700 border-solid rounded-full animate-spin-reverse opacity-50"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-emerald-500 text-xs font-bold animate-pulse">JP</span>
               </div>
            </div>
            <p className="text-emerald-100/80 font-mono text-sm tracking-wide uppercase">Menganalisis Hasil Anda...</p>
          </div>
        )}

        {appState === 'TEST' && (
          <TestView 
            displayQueue={displayQueue}
            wordMap={wordMap}
            onAnswer={handleAnswer}
            onRefresh={handleRefreshBatch}
            wordsAnsweredCount={knownWordsCount}
            isRefreshing={isRefreshing}
            networkStatusMessage={networkStatusMessage}
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