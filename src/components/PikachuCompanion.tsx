import React from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface PikachuCompanionProps {
  promptText: string;
  voiceKey?: string;
  emotion?: 'idle' | 'pointing' | 'happy' | 'cheer';
  onPromptClick?: () => void;
  className?: string;
}

export const PikachuCompanion: React.FC<PikachuCompanionProps> = ({
  promptText,
  voiceKey,
  emotion = 'idle',
  onPromptClick,
  className = ''
}) => {
  const handlePikachuClick = () => {
    soundManager.playCry(25); // Pikachu cry
    if (voiceKey) {
      soundManager.playVoice(voiceKey, promptText);
    } else {
      soundManager.playVoice('cheer_super');
    }
  };

  return (
    <div
      className={`flex items-end gap-2 sm:gap-3 pointer-events-auto select-none ${className}`}
    >
      {/* Pikachu Avatar with Animations */}
      <div
        onClick={handlePikachuClick}
        className="relative group cursor-pointer shrink-0 transition-transform active:scale-95 hover:scale-105"
        title="Tippe auf Pikachu!"
      >
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-amber-300 to-yellow-400 rounded-full p-1 border-3 border-amber-200 shadow-[0_0_20px_rgba(250,204,21,0.6)] flex items-center justify-center overflow-hidden">
          <img
            src="/images/pokemon/25.webp"
            alt="Pikachu Begleiter"
            className={`w-full h-full object-contain filter drop-shadow ${
              emotion === 'happy' || emotion === 'cheer'
                ? 'animate-bounce'
                : 'animate-pulse'
            }`}
          />
        </div>

        {/* Small Pokeball indicator badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
        </div>
      </div>

      {/* Speech Bubble */}
      <div
        onClick={onPromptClick || handlePikachuClick}
        className="relative max-w-xs sm:max-w-md bg-white/95 text-slate-900 px-4 py-2.5 rounded-2xl rounded-bl-sm border-2 border-amber-300 shadow-xl flex items-center gap-2.5 cursor-pointer hover:bg-yellow-50 transition-colors"
      >
        {/* Tail triangle */}
        <div className="absolute -left-2 bottom-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white/95 border-b-8 border-b-transparent" />

        <p className="font-extrabold text-sm sm:text-base leading-snug tracking-wide text-slate-800">
          {promptText}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePikachuClick();
          }}
          className="shrink-0 p-1.5 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 shadow transition-transform active:scale-90"
          title="Vorlesen"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
