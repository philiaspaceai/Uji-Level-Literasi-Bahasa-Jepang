import React from 'react';

interface CardProps {
  word: string;
  onClick: () => void;
}

export const Card: React.FC<CardProps> = ({ word, onClick }) => {

  const getFontSizeClass = (text: string) => {
    if (text.length > 8) return 'text-lg md:text-xl';
    if (text.length > 5) return 'text-xl md:text-2xl';
    return 'text-2xl md:text-3xl';
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center justify-center p-4 h-full w-full
        bg-slate-800 
        border border-slate-700
        rounded-xl shadow-lg
        transition-all duration-200 ease-in-out
        hover:bg-slate-700 hover:border-emerald-500 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer
        animate-card-in
      `}
    >
      <span className={`${getFontSizeClass(word)} font-jp font-medium text-slate-100 select-none text-center break-words w-full leading-tight`}>
        {word}
      </span>
      
      <div className={`
        absolute top-3 right-3 w-2 h-2 rounded-full bg-slate-600/50
      `}></div>
    </button>
  );
};