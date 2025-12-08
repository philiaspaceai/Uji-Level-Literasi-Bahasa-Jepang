import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';

interface TestViewProps {
  testQueue: { id: number, bandId: number }[];
  wordMap: Map<number, Word>;
  onComplete: (knownIds: Set<number>) => void;
}

export const TestView: React.FC<TestViewProps> = ({ testQueue, wordMap, onComplete }) => {
  // We maintain a "deck" of 10 active cards.
  const [queueIndex, setQueueIndex] = useState(0);
  const [knownIds] = useState<Set<number>>(new Set());
  const [activeCards, setActiveCards] = useState<{ slotId: number, item: { id: number, bandId: number } | null }[]>([]);
  
  // Total cards to be processed
  const totalItems = testQueue.length;
  
  // Initialize the first 10 cards
  useEffect(() => {
    const initialSlots = [];
    for (let i = 0; i < 10; i++) {
      if (i < testQueue.length) {
        initialSlots.push({ slotId: i, item: testQueue[i] });
      } else {
        initialSlots.push({ slotId: i, item: null });
      }
    }
    setActiveCards(initialSlots);
    setQueueIndex(10);
  }, [testQueue]);

  const handleCardClick = (slotIndex: number, itemId: number) => {
    // 1. Mark as known
    knownIds.add(itemId);

    // 2. Replace this specific card with next in queue
    replaceCard(slotIndex);
  };

  const replaceCard = (slotIndex: number) => {
    let nextItem = null;
    let nextIndex = queueIndex;
    
    if (nextIndex < totalItems) {
      nextItem = testQueue[nextIndex];
      setQueueIndex(nextIndex + 1);
    } 

    setActiveCards(prev => {
      const newCards = [...prev];
      // Updating the item triggers the Card component's useEffect
      newCards[slotIndex] = { 
        slotId: newCards[slotIndex].slotId, 
        item: nextItem 
      };
      return newCards;
    });

    checkCompletion(nextIndex);
  };

  const handleSkipRest = () => {
    // We replace ALL non-null active cards with the next batch.
    // The Card components will detect the prop change and animate FadeOut -> Swap -> FadeIn automatically.
    
    setActiveCards(prev => {
      const newCards = [...prev];
      let currentIndex = queueIndex;
      
      for (let i = 0; i < newCards.length; i++) {
        if (newCards[i].item !== null) {
          // Replace this one
          if (currentIndex < totalItems) {
            newCards[i] = { slotId: newCards[i].slotId, item: testQueue[currentIndex] };
            currentIndex++;
          } else {
            newCards[i] = { slotId: newCards[i].slotId, item: null };
          }
        }
      }
      setQueueIndex(currentIndex);
      checkCompletion(currentIndex);
      return newCards;
    });
  };

  const checkCompletion = (currentQIndex: number) => {
    // Handled by effect
  };

  // Effect to watch completion
  useEffect(() => {
    const allEmpty = activeCards.every(c => c.item === null);
    if (queueIndex >= totalItems && allEmpty) {
      onComplete(knownIds);
    }
  }, [queueIndex, activeCards, totalItems, onComplete, knownIds]);

  const completedCount = queueIndex - activeCards.filter(c => c.item !== null).length;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4">
      
      <ProgressBar current={completedCount} total={totalItems} />

      <div className="w-full text-center mb-6 animate-fade-in-up px-4">
        <h2 className="text-xl md:text-2xl text-slate-200 font-light">
          Pilih semua kata yang <span className="text-emerald-400 font-bold">Anda tahu cara bacanya</span>.
        </h2>
        <div className="text-sm text-slate-500 mt-3 max-w-2xl mx-auto leading-relaxed">
            <p className="bg-slate-800/50 inline-block px-4 py-2 rounded-full border border-slate-700">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-2">Tips:</span>
               Untuk kata majemuk (contoh: <span className="font-jp text-slate-300">飛び込む</span>), pastikan Anda bisa membaca keseluruhan katanya.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full mb-28">
        {activeCards.map((slot, idx) => (
          <div key={slot.slotId} className="aspect-[4/3] w-full relative">
             {slot.item && wordMap.has(slot.item.id) ? (
                <Card 
                  word={wordMap.get(slot.item.id)?.word || "???"}
                  triggerKey={slot.item.id} // Changing this ID triggers the animation sequence in Card
                  onClick={() => handleCardClick(idx, slot.item!.id)}
                />
             ) : (
                <div className="w-full h-full rounded-xl border border-slate-800 bg-slate-900/30 flex items-center justify-center transition-opacity duration-500">
                    {/* Empty Slot Placeholder */}
                </div>
             )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-10 left-0 right-0 px-4 flex justify-center z-10 pointer-events-none">
         <button 
           onClick={handleSkipRest}
           className="pointer-events-auto bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 py-4 px-10 rounded-full font-medium transition-all shadow-2xl backdrop-blur-md transform hover:scale-105 active:scale-95 flex items-center gap-3"
         >
           <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
           Saya Tidak Tahu Sisanya
         </button>
      </div>
    </div>
  );
};