import React, { useState, useEffect, useRef } from 'react';

interface CardProps {
  word: string;
  onClick: () => void;
  triggerKey: string | number;
}

export const Card: React.FC<CardProps> = ({ word, onClick, triggerKey }) => {
  const [visible, setVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState(word);
  const isMounted = useRef(false);

  // Animation duration matches Tailwind duration-300 (300ms)
  const ANIMATION_DURATION = 300;

  useEffect(() => {
    // Initial mount: just show the word
    if (!isMounted.current) {
      setCurrentWord(word);
      // Small delay to ensure the browser paints the initial state (opacity-0) before transitioning
      setTimeout(() => setVisible(true), 50);
      isMounted.current = true;
      return;
    }

    // Logic for when props change (New Word Arrives):
    // If we are currently visible, we must Fade Out -> Swap -> Fade In
    if (visible) {
      setVisible(false);
      const timer = setTimeout(() => {
        setCurrentWord(word);
        setVisible(true);
      }, ANIMATION_DURATION);
      return () => clearTimeout(timer);
    } else {
      // If we are already invisible (e.g. from handlePress), just Swap -> Fade In
      setCurrentWord(word);
      // Short delay to allow the text swap to render in the DOM while hidden
      const timer = setTimeout(() => {
        setVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [triggerKey, word]); // Dependency on triggerKey ensures this runs when the slot gets a new item

  const handlePress = () => {
    // Prevent double clicking while animating
    if (!visible) return;

    // 1. Animate Out
    setVisible(false);
    
    // 2. Notify Parent after animation finishes
    // This gives the visual effect of the card disappearing before the data update happens
    setTimeout(() => {
      onClick();
    }, ANIMATION_DURATION);
  };

  // Dynamic Font Sizing for Compound Words
  const getFontSizeClass = (text: string) => {
    if (text.length > 8) return 'text-lg md:text-xl';
    if (text.length > 5) return 'text-xl md:text-2xl';
    return 'text-2xl md:text-3xl';
  };

  return (
    <button
      onClick={handlePress}
      disabled={!visible}
      className={`
        relative flex items-center justify-center p-4 h-32 w-full
        bg-slate-800 
        border border-slate-700
        rounded-xl shadow-lg
        transition-all duration-300 ease-in-out
        ${visible 
          ? 'opacity-100 scale-100 translate-y-0 hover:bg-slate-700 hover:border-emerald-500 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer' 
          : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }
      `}
    >
      <span className={`${getFontSizeClass(currentWord)} font-jp font-medium text-slate-100 select-none text-center break-words w-full leading-tight`}>
        {currentWord}
      </span>
      
      {/* Decoration: Small indicator dot */}
      <div className={`
        absolute top-3 right-3 w-2 h-2 rounded-full transition-colors duration-300
        ${visible ? 'bg-slate-600/50' : 'bg-transparent'}
      `}></div>
    </button>
  );
};